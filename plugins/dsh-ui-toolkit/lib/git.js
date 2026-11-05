/**
 * Git probing and branch switching for the host half.
 *
 * Everything here runs a real git process: no shell, no worktree guessing, no
 * writes beyond what git switch itself performs. The module is deliberately
 * independent of the DSH SDK so it can be exercised against scratch repositories
 * in the offline test suite.
 *
 * @module @local/dsh-git-branch/git
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { StringDecoder } from 'node:string_decoder'

/** Output allowance for a single Git command. Branch lists are the largest read. */
const MAX_OUTPUT_BYTES = 1024 * 1024
/** git status can be long in a large repository; past this many entries only the count matters. */
const MAX_DIRTY_ENTRIES = 999
/** Default wall clock for a read-only command; a stuck Git process must not hold a request. */
const READ_TIMEOUT_MS = 5000
/** A checkout writes files and may run hooks, so it gets more room than a read. */
const SWITCH_TIMEOUT_MS = 20000

/** Failure carrying a stable code the route and the client can localize. */
export class GitError extends Error {
  /**
   * @param code - stable lower-kebab-case classification.
   * @param message - diagnostic text; the route also exposes the raw Git stderr.
   * @param detail - optional raw detail safe to show in a panel.
   */
  constructor(code, message, detail) {
    super(message)
    this.name = 'GitError'
    this.code = code
    this.detail = detail
  }
}

/** The environment Git gets: no terminal prompts, stable diagnostics. */
function gitEnvironment(overrides) {
  return {
    ...process.env,
    GIT_TERMINAL_PROMPT: '0',
    GIT_PAGER: 'cat',
    LANG: 'C',
    LC_ALL: 'C',
    ...overrides
  }
}

/**
 * Run one Git argv without a shell and collect bounded output.
 *
 * A missing executable is reported through error (usually ENOENT), a timeout
 * through timedOut; killing the process still resolves the promise so callers
 * can distinguish "git said no" from "we could not ask git".
 *
 * @param command - executable or command name resolved through PATH.
 * @param args - literal arguments.
 * @param options - cwd, timeout, output cap, environment overrides, cancellation.
 * @returns exit status, decoded output, and the timeout/truncation flags.
 */
export function runGit(command, args, options = {}) {
  const {
    cwd,
    timeoutMs = READ_TIMEOUT_MS,
    maxBytes = MAX_OUTPUT_BYTES,
    env = {},
    signal
  } = options

  return new Promise((resolve) => {
    let stdout = ''
    let stderr = ''
    let stdoutBytes = 0
    let stderrBytes = 0
    let truncated = false
    let timedOut = false
    let settled = false
    let timer
    let child

    const stdoutDecoder = new StringDecoder('utf8')
    const stderrDecoder = new StringDecoder('utf8')

    const finish = (result) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      const flushedStdout = stdoutDecoder.end()
      const flushedStderr = stderrDecoder.end()
      if (flushedStdout && stdoutBytes < maxBytes) stdout += flushedStdout
      if (flushedStderr && stderrBytes < maxBytes) stderr += flushedStderr
      resolve({
        code: result.code,
        signal: result.signal,
        stdout,
        stderr,
        error: result.error ?? null,
        timedOut,
        truncated
      })
    }

    try {
      child = spawn(command, args, {
        cwd,
        env: gitEnvironment(env),
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        signal
      })
    } catch (error) {
      finish({ code: null, signal: null, error })
      return
    }

    timer = setTimeout(() => {
      timedOut = true
      try {
        child.kill('SIGKILL')
      } catch {
        // the process may have exited between the timer firing and the kill
      }
    }, timeoutMs)

    child.stdout.on('data', (chunk) => {
      if (stdoutBytes >= maxBytes) {
        truncated = true
        return
      }
      const room = maxBytes - stdoutBytes
      stdoutBytes += Math.min(chunk.length, room)
      stdout += stdoutDecoder.write(chunk.subarray(0, room))
      if (chunk.length > room) truncated = true
    })
    child.stderr.on('data', (chunk) => {
      if (stderrBytes >= maxBytes) {
        truncated = true
        return
      }
      const room = maxBytes - stderrBytes
      stderrBytes += Math.min(chunk.length, room)
      stderr += stderrDecoder.write(chunk.subarray(0, room))
      if (chunk.length > room) truncated = true
    })
    child.on('error', (error) => {
      finish({ code: null, signal: null, error })
    })
    child.on('close', (code, closeSignal) => {
      finish({ code, signal: closeSignal, error: null })
    })
  })
}

/** Candidate executables, in the order a desktop app without a login shell would find them. */
function gitCandidates() {
  const values = [
    process.env.DSH_GIT_PATH,
    process.env.GIT,
    'git',
    '/usr/bin/git',
    '/opt/homebrew/bin/git',
    '/usr/local/bin/git',
    'C:\\Program Files\\Git\\cmd\\git.exe',
    'C:\\Program Files (x86)\\Git\\cmd\\git.exe'
  ]
  return [...new Set(values.filter((value) => typeof value === 'string' && value.length > 0))]
}

let resolvedGit
let resolvedAt = 0
const GIT_RECHECK_MS = 30000

/**
 * Find a working Git executable once and remember it.
 *
 * A failed lookup is retried after a short delay rather than cached forever:
 * the user can install Git while DSH stays open.
 *
 * @param options - cancellation for the probe.
 * @returns the executable or command name that answered git --version.
 * @throws {GitError} when no candidate can be started.
 */
export async function resolveGit(options = {}) {
  if (resolvedGit !== undefined && Date.now() - resolvedAt < GIT_RECHECK_MS) return resolvedGit
  for (const candidate of gitCandidates()) {
    const result = await runGit(candidate, ['--version'], { timeoutMs: 3000, signal: options.signal })
    if (result.code === 0 && result.stdout.startsWith('git version')) {
      resolvedGit = candidate
      resolvedAt = Date.now()
      return candidate
    }
  }
  throw new GitError('git-unavailable', 'no usable git executable was found')
}

/** Forget the cached executable (tests and a user-installed Git). */
export function resetGitCache() {
  resolvedGit = undefined
  resolvedAt = 0
}

/**
 * Parse %(upstream:track) into machine-readable counts.
 * @param text - examples: empty, [ahead 1], [behind 2], [ahead 1, behind 2], [gone].
 * @returns ahead/behind counts and the gone flag.
 */
export function parseTrack(text) {
  const raw = typeof text === 'string' ? text : ''
  const ahead = /ahead\s+(\d+)/u.exec(raw)
  const behind = /behind\s+(\d+)/u.exec(raw)
  return {
    ahead: ahead === null ? 0 : Number(ahead[1]),
    behind: behind === null ? 0 : Number(behind[1]),
    gone: /\[gone\]/u.test(raw)
  }
}

/**
 * Parse the tab-separated output of the branch for-each-ref format.
 *
 * The subject is last so an embedded tab stays part of the subject instead of
 * shifting the numeric fields. Branch refs cannot contain tabs themselves.
 *
 * @param stdout - one branch per line.
 * @returns branch rows ordered as Git printed them.
 */
export function parseBranches(stdout) {
  const branches = []
  for (const line of String(stdout).split('\n')) {
    if (line === '') continue
    const fields = line.split('\t')
    if (fields.length < 5) continue
    const [name, headMark, upstream, track, commitUnix] = fields
    if (name === '') continue
    const parsed = parseTrack(track)
    const date = Number(commitUnix)
    branches.push({
      name,
      current: headMark.trim() === '*',
      upstream: upstream === '' ? null : upstream,
      ahead: parsed.ahead,
      behind: parsed.behind,
      gone: parsed.gone,
      commit: Number.isFinite(date) && date > 0 ? new Date(date * 1000).toISOString() : null,
      subject: fields.slice(5).join('\t')
    })
  }
  return branches
}

/** Count changed paths in git status --porcelain, stopping at the display cap. */
function countDirty(statusOutput) {
  let count = 0
  for (const line of String(statusOutput).split('\n')) {
    if (line === '') continue
    count += 1
    if (count >= MAX_DIRTY_ENTRIES) return MAX_DIRTY_ENTRIES
  }
  return count
}

/** Repository operation markers and the labels the panel can show. */
const OPERATION_MARKERS = [
  ['MERGE_HEAD', 'merge'],
  ['rebase-merge', 'rebase'],
  ['rebase-apply', 'rebase'],
  ['CHERRY_PICK_HEAD', 'cherry-pick'],
  ['REVERT_HEAD', 'revert'],
  ['BISECT_LOG', 'bisect']
]

/**
 * Detect an in-progress merge/rebase/cherry-pick so the panel can explain a
 * refusal before the user tries to switch.
 * @param gitDir - absolute path to the repository's git directory.
 * @returns the operation label or null.
 */
export function detectOperation(gitDir) {
  for (const [marker, label] of OPERATION_MARKERS) {
    try {
      if (fs.existsSync(path.join(gitDir, marker))) return label
    } catch {
      // an unreadable marker cannot block anything we can prove
    }
  }
  return null
}

/**
 * Read one working tree's branch, cleanliness, and local branch list.
 *
 * A directory outside a work tree is a normal answer (repository: null), not
 * an error: the composer simply hides the control there.
 *
 * @param git - executable resolved by resolveGit.
 * @param cwd - a directory inside the working tree (the session's current directory).
 * @param options - cancellation and timeouts.
 * @returns repository, branch, detached, head, unborn, dirty, operation, branches.
 */
export async function readRepoStatus(git, cwd, options = {}) {
  const signal = options.signal
  const readTimeout = options.timeoutMs ?? READ_TIMEOUT_MS
  const inside = await runGit(git, ['rev-parse', '--is-inside-work-tree'], { cwd, timeoutMs: readTimeout, signal })
  if (inside.code !== 0 || inside.stdout.trim() !== 'true') {
    return { repository: null, reason: 'not-a-repository' }
  }
  const rootResult = await runGit(git, ['rev-parse', '--show-toplevel'], { cwd, timeoutMs: readTimeout, signal })
  if (rootResult.code !== 0 || rootResult.stdout.trim() === '') {
    return { repository: null, reason: 'not-a-repository' }
  }
  const root = rootResult.stdout.replace(/\r?\n$/u, '')

  const format = [
    '%(refname:short)',
    '%(HEAD)',
    '%(upstream:short)',
    '%(upstream:track)',
    '%(committerdate:unix)',
    '%(contents:subject)'
  ].join('\t')

  const [branchResult, headResult, statusResult, refsResult, gitDirResult] = await Promise.all([
    runGit(git, ['symbolic-ref', '--short', '-q', 'HEAD'], { cwd, timeoutMs: readTimeout, signal }),
    runGit(git, ['rev-parse', '--short', 'HEAD'], { cwd, timeoutMs: readTimeout, signal }),
    runGit(git, ['status', '--porcelain=v1', '--untracked-files=normal'], {
      cwd,
      timeoutMs: readTimeout,
      signal,
      env: { GIT_OPTIONAL_LOCKS: '0' }
    }),
    runGit(git, ['for-each-ref', '--sort=-committerdate', '--format=' + format, 'refs/heads'], {
      cwd,
      timeoutMs: readTimeout,
      signal
    }),
    runGit(git, ['rev-parse', '--git-dir'], { cwd, timeoutMs: readTimeout, signal })
  ])

  const branch = branchResult.code === 0 && branchResult.stdout.trim() !== '' ? branchResult.stdout.trim() : null
  const head = headResult.code === 0 && headResult.stdout.trim() !== '' ? headResult.stdout.trim() : null
  const unborn = head === null
  const branches = refsResult.code === 0 ? parseBranches(refsResult.stdout) : []

  // A very old Git could omit HEAD from for-each-ref, and an unusual ref layout
  // could leave the current branch outside refs/heads. Keep the trigger honest.
  if (branch !== null && !branches.some((row) => row.name === branch)) {
    branches.unshift({
      name: branch,
      current: true,
      upstream: null,
      ahead: 0,
      behind: 0,
      gone: false,
      commit: null,
      subject: ''
    })
  }
  for (const row of branches) {
    if (branch !== null && row.name === branch) row.current = true
  }
  branches.sort((left, right) => {
    if (left.current !== right.current) return left.current ? -1 : 1
    return 0
  })

  const gitDirRaw = gitDirResult.code === 0 ? gitDirResult.stdout.trim() : ''
  const gitDir = gitDirRaw === '' ? path.join(root, '.git') : (path.isAbsolute(gitDirRaw) ? gitDirRaw : path.resolve(cwd, gitDirRaw))

  return {
    repository: {
      root,
      name: path.basename(root) || 'repository',
      gitDir
    },
    branch,
    detached: branch === null && !unborn,
    head,
    unborn,
    dirty: statusResult.code === 0 ? countDirty(statusResult.stdout) : null,
    operation: detectOperation(gitDir),
    branches
  }
}

/**
 * Map Git's refusal onto a stable code the client can translate.
 * @param stderr - raw Git diagnostics.
 * @returns one of the dirty-conflict, checked-out-elsewhere, ... codes.
 */
export function classifySwitchFailure(stderr) {
  const text = String(stderr).toLowerCase()
  if (/would be overwritten|would be lost|please commit your changes or stash/u.test(text)) return 'dirty-conflict'
  if (/already checked out at|is already used by worktree/u.test(text)) return 'checked-out-elsewhere'
  if (/not a valid branch|no such branch|invalid reference|unknown revision/u.test(text)) return 'invalid-branch'
  if (/cannot switch branch while|rebase in progress|merge in progress|cherry-pick in progress|revert in progress|bisect/u.test(text)) return 'operation-in-progress'
  if (/resolve your current index|unmerged|needs merge/u.test(text)) return 'index-conflict'
  return 'switch-failed'
}

/**
 * Switch one working tree to an existing local branch.
 *
 * The branch is validated twice: by Git's own ref grammar and by proving that
 * refs/heads/<name> exists. That keeps the call to git switch free of
 * option-looking arguments and prevents creating a branch from a remote ref.
 *
 * @param git - executable resolved by resolveGit.
 * @param cwd - working tree root; the session may be in a subdirectory.
 * @param branch - local branch name from the panel.
 * @param options - cancellation and timeout.
 * @returns nothing; the caller re-reads status afterwards.
 * @throws {GitError} for an invalid/missing branch, a Git refusal, or a timeout.
 */
export async function switchBranch(git, cwd, branch, options = {}) {
  const signal = options.signal
  const timeoutMs = options.timeoutMs ?? SWITCH_TIMEOUT_MS
  if (typeof branch !== 'string' || branch === '' || branch.startsWith('-')) {
    throw new GitError('invalid-branch', 'branch name is empty or option-like')
  }
  const formatCheck = await runGit(git, ['check-ref-format', '--branch', branch], { cwd, timeoutMs, signal })
  if (formatCheck.code !== 0) {
    throw new GitError('invalid-branch', 'branch name is not a valid ref', formatCheck.stderr.trim())
  }
  const exists = await runGit(git, ['show-ref', '--verify', '--quiet', 'refs/heads/' + branch], { cwd, timeoutMs, signal })
  if (exists.code !== 0) {
    throw new GitError('invalid-branch', 'branch does not exist locally', exists.stderr.trim())
  }

  let result = await runGit(git, ['switch', '--no-guess', '--', branch], { cwd, timeoutMs, signal })
  // Git < 2.23 has no switch; fall back only for the command/option being
  // unavailable, never for a real checkout refusal.
  if (result.code !== 0 && /not a git command|unknown option|unknown switch/u.test(result.stderr)) {
    result = await runGit(git, ['checkout', '--no-guess', '--', branch], { cwd, timeoutMs, signal })
  }
  if (result.timedOut) {
    throw new GitError('timeout', 'git switch timed out after ' + timeoutMs + 'ms')
  }
  if (result.code !== 0) {
    const detail = (result.stderr || result.stdout).trim()
    throw new GitError(classifySwitchFailure(detail), 'git switch failed (' + String(result.code) + ')', detail)
  }
}

/** Exposed for tests and for the route's diagnostics. */
export const internals = {
  MAX_OUTPUT_BYTES,
  MAX_DIRTY_ENTRIES,
  READ_TIMEOUT_MS,
  SWITCH_TIMEOUT_MS,
  countDirty,
  gitCandidates
}
