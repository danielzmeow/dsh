import test from "node:test";
import assert from "node:assert/strict";
import { parseUsage, __internals } from "../lib/index.js";

const readUpstream = __internals.readUpstream;

test("parses the live OpenCode Go body into ordered windows", () => {
  const windows = parseUsage({
    usage: {
      rolling: { status: "ok", percent: 0, resetsAt: "2026-11-02T09:55:57.000Z" },
      weekly: { status: "ok", percent: 12.5, resetsAt: "2026-11-09T00:00:00.000Z" },
      monthly: { status: "ok", percent: 100, resetsAt: "2026-12-02T04:49:56.000Z" }
    }
  });
  assert.deepEqual(windows.map((window) => window.kind), ["session", "weekly", "monthly"]);
  assert.equal(windows[0].remainingPercent, 100);
  assert.equal(windows[1].usedPercent, 12.5);
  assert.equal(windows[1].remainingPercent, 87.5);
  assert.equal(windows[2].remainingPercent, 0);
  assert.equal(windows[0].resetsAt, "2026-11-02T09:55:57.000Z");
});

test("accepts a bare usage object and alternate percent fields", () => {
  const windows = parseUsage({
    rolling: { usagePercent: 40 },
    weekly: { usedPercent: 3.3, nextReset: "2026-11-09T00:00:00Z" }
  });
  assert.equal(windows.length, 2);
  assert.equal(windows[0].usedPercent, 40);
  assert.equal(windows[1].remainingPercent, 96.7);
});

test("derives a percentage from used/limit when percent is absent", () => {
  const windows = parseUsage({ monthly: { used: 25, limit: 200 } });
  assert.equal(windows.length, 1);
  assert.equal(windows[0].usedPercent, 12.5);
});

test("skips windows without a readable percentage and rejects non-objects", () => {
  assert.deepEqual(parseUsage({ usage: { monthly: { status: "ok" } } }), []);
  assert.deepEqual(parseUsage(null), []);
  assert.deepEqual(parseUsage("nope"), []);
  assert.deepEqual(parseUsage({}), []);
});

test("clamps out-of-range percentages", () => {
  const windows = parseUsage({ rolling: { percent: 140 }, weekly: { percent: -5 } });
  assert.equal(windows[0].usedPercent, 100);
  assert.equal(windows[0].remainingPercent, 0);
  assert.equal(windows[1].usedPercent, 0);
  assert.equal(windows[1].remainingPercent, 100);
});

test("readUpstream retries the legacy alias only on 404/405", async () => {
  const calls = [];
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (url) => {
      calls.push(String(url));
      if (calls.length === 1) return new Response("not found", { status: 404 });
      return new Response(JSON.stringify({ usage: { rolling: { percent: 1 } } }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    };
    const result = await readUpstream("key");
    assert.equal(result.ok, true);
    assert.equal(calls.length, 2);
    assert.match(calls[1], /\/zen\/go\/v1\/usage$/);
  } finally {
    globalThis.fetch = original;
  }
});

test("readUpstream never retries a rejected credential", async () => {
  const calls = [];
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (url) => {
      calls.push(String(url));
      return new Response("unauthorized", { status: 401 });
    };
    const result = await readUpstream("key");
    assert.deepEqual(result, { ok: false, status: "unauthorized" });
    assert.equal(calls.length, 1);
  } finally {
    globalThis.fetch = original;
  }
});

test("readUpstream maps rate limiting and invalid JSON", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response("slow down", { status: 429 });
    assert.deepEqual(await readUpstream("key"), { ok: false, status: "rate-limited" });

    globalThis.fetch = async () => new Response("<html>", { status: 200 });
    assert.deepEqual(await readUpstream("key"), { ok: false, status: "invalid-response" });
  } finally {
    globalThis.fetch = original;
  }
});

test("route path is stable", () => {
  assert.equal(__internals.QUOTA_PATH, "/api/opencode-quota");
});
