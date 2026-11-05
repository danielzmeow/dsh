/**
 * Host half of the OpenCode quota plugin.
 *
 * Registers one loopback-only, read-only endpoint:
 *   GET /api/opencode-quota          — cached quota snapshot
 *   GET /api/opencode-quota?refresh=1 — bypass the short cache
 *
 * The snapshot comes from OpenCode's own console usage endpoint for the
 * current `OPENCODE_GO_API_KEY` (or the older `OPENCODE_API_KEY` alias). The
 * key is resolved through the Harness credentials seam at request time and is
 * never sent to the browser, logged, or cached; the endpoint exposes only
 * normalized window percentages and reset instants.
 *
 * @module @local/dsh-opencode-quota
 */

/** Stable Cordis plugin name. */
export const name = "opencode-quota";

/** Services required before this plugin activates. */
export const inject = ["webServer", "credentials"];

const QUOTA_PATH = "/api/opencode-quota";
/** Newer console route first; the legacy alias is only retried on 404/405. */
const USAGE_URLS = [
	"https://opencode.ai/inference/go/v1/usage",
	"https://opencode.ai/zen/go/v1/usage"
];
/** Credential refs in priority order: the DSH profile's key, then the alias. */
const KEY_REFS = ["OPENCODE_GO_API_KEY", "OPENCODE_API_KEY"];
const UPSTREAM_TIMEOUT_MS = 15000;
/** Short cache so an open page polling each minute does not re-hit upstream. */
const CACHE_TTL_MS = 20000;
/** Window order and their stable identities. */
const WINDOW_KEYS = [
	["rolling", "session"],
	["weekly", "weekly"],
	["monthly", "monthly"]
];

/** @param {number} value */
function clampPercent(value) {
	return Math.max(0, Math.min(100, value));
}

/** @param {unknown} value @returns {number | null} */
function numberOrNull(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim() !== "") {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return null;
}

/** @param {number} value */
function round1(value) {
	return Math.round(value * 10) / 10;
}

/** @param {unknown} value @returns {string | null} */
function isoOrNull(value) {
	if (typeof value !== "string" || value.trim() === "") return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Normalize the upstream body into stable window rows. The live service returns
 * `{ usage: { rolling|weekly|monthly: { status, percent, resetsAt } } }`; every
 * field is read defensively so a shape change costs facts, not the whole card.
 * @param {unknown} body
 * @returns {Array<{ kind: string, usedPercent: number, remainingPercent: number, resetsAt?: string }>}
 */
export function parseUsage(body) {
	const usage = body !== null && typeof body === "object" && "usage" in body ? body.usage : body;
	if (usage === null || typeof usage !== "object") return [];
	const windows = [];
	for (const [key, kind] of WINDOW_KEYS) {
		const entry = usage[key];
		if (entry === null || typeof entry !== "object") continue;
		let used = numberOrNull(entry.percent);
		if (used === null) used = numberOrNull(entry.usagePercent);
		if (used === null) used = numberOrNull(entry.usedPercent);
		if (used === null) {
			const consumed = numberOrNull(entry.used);
			const limit = numberOrNull(entry.limit);
			if (consumed !== null && limit !== null && limit > 0) used = (consumed / limit) * 100;
		}
		if (used === null) continue;
		const usedPercent = round1(clampPercent(used));
		const resetsAt = isoOrNull(entry.resetsAt) ?? isoOrNull(entry.resetAt) ?? isoOrNull(entry.nextReset);
		windows.push({
			kind,
			usedPercent,
			remainingPercent: round1(100 - usedPercent),
			...(resetsAt === null ? {} : { resetsAt })
		});
	}
	return windows;
}

/** Refuse non-loopback peers. The socket address decides; Host is an extra check. */
function isLoopbackAddress(address) {
	if (typeof address !== "string") return false;
	const value = address.toLowerCase();
	if (value === "::1") return true;
	const ipv4 = value.startsWith("::ffff:") ? value.slice(7) : value;
	const octets = ipv4.split(".");
	return octets.length === 4
		&& octets[0] === "127"
		&& octets.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}

/** @param {{ headers: Record<string, string | string[] | undefined> }} req */
function isLoopbackHostHeader(req) {
	const host = typeof req.headers.host === "string" ? req.headers.host.trim().toLowerCase() : "";
	const name = host.startsWith("[")
		? host.slice(1, host.indexOf("]"))
		: host.replace(/:\d+$/, "");
	return name === "localhost" || isLoopbackAddress(name);
}

/** @param {import("node:http").ServerResponse} res */
function json(res, status, value) {
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-store"
	});
	res.end(JSON.stringify(value));
}

/** @param {any} ctx @returns {Promise<string | null>} */
async function resolveApiKey(ctx) {
	const credentials = ctx.get?.("credentials") ?? ctx.credentials;
	if (credentials === null || credentials === undefined || typeof credentials.resolve !== "function") return null;
	for (const ref of KEY_REFS) {
		try {
			const hit = await credentials.resolve(ref);
			if (typeof hit?.value === "string" && hit.value.trim() !== "") return hit.value.trim();
		} catch {
			/* fall through to the next ref */
		}
	}
	return null;
}

/**
 * Read one upstream usage document.
 * @param {string} apiKey
 * @returns {Promise<{ ok: true, windows: ReturnType<typeof parseUsage> } | { ok: false, status: string }>}
 */
async function readUpstream(apiKey) {
	let status = "unavailable";
	for (const url of USAGE_URLS) {
		let response;
		try {
			response = await fetch(url, {
				headers: { authorization: `Bearer ${apiKey}`, accept: "application/json" },
				signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
			});
		} catch {
			status = "unavailable";
			return { ok: false, status };
		}
		if (!response.ok) {
			status = response.status === 401 || response.status === 403
				? "unauthorized"
				: response.status === 429
					? "rate-limited"
					: "unavailable";
			// Compatibility alias only: never retry rejected or rate-limited credentials.
			if (response.status === 404 || response.status === 405) continue;
			return { ok: false, status };
		}
		let body;
		try {
			body = await response.json();
		} catch {
			return { ok: false, status: "invalid-response" };
		}
		const windows = parseUsage(body);
		if (windows.length === 0) return { ok: false, status: "invalid-response" };
		return { ok: true, windows };
	}
	return { ok: false, status };
}

/** @type {{ at: number, payload: any } | null} */
let cache = null;
/** @type {Promise<any> | null} */
let inflight = null;

/**
 * Build (or reuse) the snapshot this endpoint serves.
 * @param {any} ctx
 * @param {boolean} force
 */
async function snapshot(ctx, force) {
	if (!force && cache !== null && Date.now() - cache.at < CACHE_TTL_MS) return cache.payload;
	if (inflight !== null) return inflight;
	inflight = (async () => {
		try {
			const apiKey = await resolveApiKey(ctx);
			if (apiKey === null) {
				return { ok: false, status: "not-configured", fetchedAt: new Date().toISOString() };
			}
			const result = await readUpstream(apiKey);
			return result.ok
				? {
					ok: true,
					provider: "opencode-go",
					plan: "Go",
					windows: result.windows,
					fetchedAt: new Date().toISOString()
				}
				: { ok: false, status: result.status, fetchedAt: new Date().toISOString() };
		} catch {
			return { ok: false, status: "unavailable", fetchedAt: new Date().toISOString() };
		} finally {
			inflight = null;
		}
	})();
	const payload = await inflight;
	cache = { at: Date.now(), payload };
	return payload;
}

/** @param {any} ctx @param {import("node:http").IncomingMessage} req @param {import("node:http").ServerResponse} res */
async function handle(ctx, req, res) {
	if (req.method !== "GET") {
		json(res, 405, { ok: false, status: "method-not-allowed" });
		return;
	}
	if (!isLoopbackAddress(req.socket?.remoteAddress) || !isLoopbackHostHeader(req)) {
		json(res, 403, { ok: false, status: "forbidden" });
		return;
	}
	const url = new URL(req.url ?? "/", "http://dsh.invalid");
	const force = url.searchParams.get("refresh") === "1";
	json(res, 200, await snapshot(ctx, force));
}

/**
 * Mount the endpoint. The route is exact, so it wins over the connection
 * plugin's `/api` prefix handler and must enforce its own loopback fence.
 * @param {any} ctx
 */
export function apply(ctx) {
	ctx.effect(() => ctx.webServer.register({
		kind: "exact",
		path: QUOTA_PATH,
		handler: (req, res) => {
			handle(ctx, req, res).catch(() => {
				if (!res.headersSent) json(res, 500, { ok: false, status: "unavailable" });
				else res.end();
			});
		}
	}), "opencode-quota: quota route");
}

export const __internals = { parseUsage, readUpstream, resolveApiKey, QUOTA_PATH };
