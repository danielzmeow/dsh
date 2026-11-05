/**
 * Host half of the Git branch control.
 *
 * Two authenticated Fetch routes sit on the DSH connection channel:
 *
 *   POST /api/git-branch/status  { sessionId }
 *   POST /api/git-branch/switch  { sessionId, branch }
 *
 * Authentication, the Host/Origin fence, and cookie handling belong to
 * ctx.connection.fetch; this module only validates the session, resolves its
 * current directory, and runs Git. The route never accepts a path from the
 * browser: the repository is always the one the session already works in.
 *
 * Part of the merged UI toolkit: the Git routes are always mounted so the
 * client-side Git branch feature can be toggled at runtime without a Host
 * restart. When the feature is off the routes are simply unused.
 *
 * @module @local/dsh-ui-toolkit
 */
import fs from 'node:fs/promises'
import { GitError, readRepoStatus, resolveGit, switchBranch } from './git.js'

/** Stable Cordis plugin name. */
export const name = 'ui-toolkit'

/** The Host half discovers Connection lazily, so a terminal profile still loads. */
export const inject = []

export const STATUS_PATH = '/api/git-branch/status'
export const SWITCH_PATH = '/api/git-branch/switch'

/** Session ids are UUIDs with an optional session- prefix, as on disk. */
const SESSION_ID_RE = /^(session-)?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu
const MAX_BODY_BYTES = 8192
const MAX_BRANCH_CHARS = 255
/** Reuse a read for this long so several tabs or polls do not stampede Git. */
const STATUS_CACHE_MS = 1200

/** A request-level failure with an HTTP shape. */
class HttpError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

/** JSON responses are never cached: a branch can change between two reads. */
function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  })
}

/** The raw uuid and the session- prefixed spelling are both used by services. */
export function idVariants(sessionId) {
  const out = new Set([sessionId])
  if (sessionId.startsWith('session-')) out.add(sessionId.slice('session-'.length))
  else out.add('session-' + sessionId)
  return [...out]
}

/** Read and validate the small JSON body these routes accept. */
async function readJson(request) {
  const text = await request.text()
  if (text.length > MAX_BODY_BYTES) throw new HttpError(413, 'body-too-large', 'request body is too large')
  let value
  try {
    value = JSON.parse(text)
  } catch {
    throw new HttpError(400, 'invalid-json', 'malformed JSON body')
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'invalid-json', 'body must be a JSON object')
  }
  return value
}

/** Validate the one identity the routes accept. */
function readSessionId(body) {
  const value = typeof body.sessionId === 'string' ? body.sessionId.trim() : ''
  if (value === '') throw new HttpError(400, 'session-required', 'sessionId is required')
  if (!SESSION_ID_RE.test(value)) throw new HttpError(400, 'invalid-session', 'invalid session id')
  return value
}

/**
 * Find the session's current directory.
 *
 * The live Session projection is authoritative because the working directory
 * tool can move a session into a worktree. When the session is cold, the
 * persisted header still names the project it was opened in.
 *
 * @param ctx - host plugin context.
 * @param sessionId - validated session id.
 * @returns an absolute directory, or undefined when no session record can name one.
 */
export async function resolveSessionCwd(ctx, sessionId) {
  const variants = idVariants(sessionId)
  const working = ctx.get('workingDirectory')
  const sessions = ctx.get('sessions')

  for (const variant of variants) {
    try {
      const live = sessions !== undefined && typeof sessions.get === 'function' ? sessions.get(variant) : undefined
      if (live === undefined || live === null) continue
      if (working !== undefined && typeof working.get === 'function') {
        try {
          const current = working.get(live)
          if (typeof current === 'string' && current !== '') return current
        } catch {
          // the projection may not be readable yet; fall back to the header
        }
      }
      const fromHeader = live.header !== undefined && typeof live.header.cwd === 'string' ? live.header.cwd : ''
      if (fromHeader !== '') return fromHeader
    } catch {
      // keep looking
    }
  }

  const agents = ctx.get('agents')
  for (const variant of variants) {
    try {
      const agent = agents !== undefined && typeof agents.get === 'function' ? agents.get(variant) : undefined
      if (agent === undefined || agent === null) continue
      const session = agent.session
      if (working !== undefined && typeof working.get === 'function' && session !== undefined) {
        try {
          const current = working.get(session)
          if (typeof current === 'string' && current !== '') return current
        } catch {
          // keep looking
        }
      }
      const fromHeader = session !== undefined && session.header !== undefined && typeof session.header.cwd === 'string' ? session.header.cwd : ''
      if (fromHeader !== '') return fromHeader
    } catch {
      // keep looking
    }
  }

  const persistence = ctx.get('sessionPersistence')
  if (persistence !== undefined && typeof persistence.stat === 'function') {
    for (const variant of variants) {
      try {
        const snapshot = await persistence.stat(variant)
        const header = snapshot !== null && typeof snapshot === 'object' && snapshot.header !== undefined ? snapshot.header : snapshot
        const cwd = header !== null && typeof header === 'object' && typeof header.cwd === 'string' ? header.cwd : ''
        if (cwd !== '') return cwd
      } catch {
        // try the other spelling, then the query fallback
      }
    }
  }

  const query = ctx.get('sessionQuery')
  if (query !== undefined && typeof query.listSessions === 'function') {
    try {
      const records = await query.listSessions()
      for (const record of records) {
        const header = record !== null && typeof record === 'object' ? record.header : undefined
        if (header === undefined || typeof header !== 'object') continue
        const id = typeof header.id === 'string' ? header.id : ''
        if (!variants.includes(id)) continue
        if (typeof header.cwd === 'string' && header.cwd !== '') return header.cwd
      }
    } catch {
      // no service can name a directory on this host
    }
  }

  return undefined
}

/** Cached reads, keyed by the session directory. */
const statusCache = new Map()

/**
 * Read Git status through the short-lived cache.
 * Concurrent callers share one promise; a failed read is never cached.
 * @param ctx - host plugin context.
 * @param cwd - resolved session directory.
 * @param signal - request cancellation.
 * @returns the status shape from readRepoStatus.
 */
export async function readCachedStatus(ctx, cwd, signal) {
  const now = Date.now()
  const hit = statusCache.get(cwd)
  if (hit !== undefined) {
    if (hit.value !== undefined && now - hit.at < STATUS_CACHE_MS) return hit.value
    if (hit.promise !== undefined) return hit.promise
  }
  const promise = (async () => {
    const git = await resolveGit({ signal })
    return readRepoStatus(git, cwd, { signal })
  })()
  statusCache.set(cwd, { at: now, promise })
  try {
    const value = await promise
    statusCache.set(cwd, { at: Date.now(), value })
    return value
  } catch (error) {
    statusCache.delete(cwd)
    throw error
  }
}

/** One switch per repository at a time; a second click waits instead of racing Git. */
const switchLocks = new Map()

/**
 * Serialize switches by repository root.
 * @param key - repository root.
 * @param task - operation to run once the previous switch settles.
 * @returns the task's result.
 */
export function serializeSwitch(key, task) {
  const previous = switchLocks.get(key) ?? Promise.resolve()
  const run = previous.then(task, task)
  const settled = run.then(() => undefined, () => undefined)
  switchLocks.set(key, settled)
  settled.then(() => {
    if (switchLocks.get(key) === settled) switchLocks.delete(key)
  })
  return run
}

/** Validate the branch string before Git sees it. */
function readBranch(body) {
  const value = typeof body.branch === 'string' ? body.branch : ''
  if (value === '') throw new HttpError(400, 'branch-required', 'branch is required')
  if (value.length > MAX_BRANCH_CHARS) throw new HttpError(400, 'branch-too-long', 'branch name is too long')
  if (/[\u0000-\u001f\u007f]/u.test(value)) throw new HttpError(400, 'invalid-branch', 'branch name contains control characters')
  return value
}

/** A stable error body for both routes. */
function failure(status, code, error, detail) {
  return json(status, {
    ok: false,
    code,
    error: error ?? code,
    ...(detail === undefined || detail === '' ? {} : { detail })
  })
}

/**
 * Status handler.
 * @param ctx - host plugin context.
 * @param request - authenticated Fetch request.
 * @returns a JSON response.
 */
export async function handleStatus(ctx, request) {
  if (request.method !== 'POST') return failure(405, 'method', 'POST only')
  let body
  try {
    body = await readJson(request)
  } catch (error) {
    if (error instanceof HttpError) return failure(error.status, error.code, error.message)
    throw error
  }
  let sessionId
  try {
    sessionId = readSessionId(body)
  } catch (error) {
    if (error instanceof HttpError) return failure(error.status, error.code, error.message)
    throw error
  }

  const cwd = await resolveSessionCwd(ctx, sessionId)
  if (cwd === undefined) return failure(404, 'no-session-cwd', 'the session has no recorded working directory')

  let status
  try {
    status = await readCachedStatus(ctx, cwd, request.signal)
  } catch (error) {
    if (error instanceof GitError) return failure(error.code === 'git-unavailable' ? 503 : 500, error.code, error.message, error.detail)
    return failure(500, 'status-failed', String(error?.message ?? error))
  }

  return json(200, {
    ok: true,
    sessionId,
    cwd,
    sampledAt: Date.now(),
    ...status
  })
}

/**
 * Switch handler. The repository comes from the session, never from the body.
 * @param ctx - host plugin context.
 * @param request - authenticated Fetch request.
 * @returns a JSON response with the fresh status after a successful switch.
 */
export async function handleSwitch(ctx, request) {
  if (request.method !== 'POST') return failure(405, 'method', 'POST only')
  let body
  try {
    body = await readJson(request)
  } catch (error) {
    if (error instanceof HttpError) return failure(error.status, error.code, error.message)
    throw error
  }
  let sessionId
  let branch
  try {
    sessionId = readSessionId(body)
    branch = readBranch(body)
  } catch (error) {
    if (error instanceof HttpError) return failure(error.status, error.code, error.message)
    throw error
  }

  const cwd = await resolveSessionCwd(ctx, sessionId)
  if (cwd === undefined) return failure(404, 'no-session-cwd', 'the session has no recorded working directory')

  let git
  try {
    git = await resolveGit({ signal: request.signal })
  } catch (error) {
    if (error instanceof GitError) return failure(503, error.code, error.message)
    return failure(500, 'git-unavailable', String(error?.message ?? error))
  }

  let current
  try {
    current = await readRepoStatus(git, cwd, { signal: request.signal })
  } catch (error) {
    return failure(500, 'status-failed', String(error?.message ?? error))
  }
  if (current.repository === null) return failure(409, 'not-a-repository', 'the session directory is not inside a Git work tree')
  if (current.branch === branch && current.detached !== true) {
    return json(200, { ok: true, sessionId, cwd, switched: false, ...current, sampledAt: Date.now() })
  }

  try {
    await serializeSwitch(current.repository.root, () => switchBranch(git, current.repository.root, branch, { signal: request.signal }))
  } catch (error) {
    if (error instanceof GitError) {
      return json(200, {
        ok: false,
        code: error.code,
        error: error.message,
        detail: error.detail ?? '',
        branch,
        sessionId,
        cwd
      })
    }
    return failure(500, 'switch-failed', String(error?.message ?? error))
  }

  // A switch can change branch, cleanliness, and upstream metadata. Drop the
  // read cache so the response and every tab see the new state immediately.
  statusCache.clear()
  try {
    const next = await readRepoStatus(git, current.repository.root, { signal: request.signal })
    return json(200, { ok: true, sessionId, cwd, switched: true, ...next, sampledAt: Date.now() })
  } catch {
    // The switch landed but the follow-up read did not. Report success without
    // stale branch metadata; the client refreshes through the status route.
    return json(200, { ok: true, sessionId, cwd, switched: true, branch, sampledAt: Date.now() })
  }
}

/**
 * Mount both routes on the authenticated Fetch channel.
 * @param ctx - host plugin context.
 */
export function apply(ctx) {
  ctx.inject(['connection'], (sub) => {
    sub.effect(() => sub.connection.fetch.register({
      path: STATUS_PATH,
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: (request) => handleStatus(sub, request)
    }), 'git-branch: status route')
    sub.effect(() => sub.connection.fetch.register({
      path: SWITCH_PATH,
      methods: ['POST'],
      requestBody: 'buffered',
      fetch: (request) => handleSwitch(sub, request)
    }), 'git-branch: switch route')
    // The first status read also warms the executable lookup, so the first
    // click does not pay for finding Git.
    sub.effect(() => {
      resolveGit().catch(() => {})
    }, 'git-branch: git discovery')
  })
}

/** Offline test face. */
export const __internals = {
  STATUS_PATH,
  SWITCH_PATH,
  STATUS_CACHE_MS,
  MAX_BODY_BYTES,
  SESSION_ID_RE,
  statusCache,
  switchLocks,
  readJson,
  readSessionId,
  readBranch,
  failure
}
