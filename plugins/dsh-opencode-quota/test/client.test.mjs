import test from "node:test";
import assert from "node:assert/strict";

/**
 * client.js is a browser bundle: it hands its factory to window.__ModuleLoader__
 * and only touches the DOM when it renders. Stubbing those seams lets the pure
 * formatting and threshold helpers run — and stay testable — under node.
 */
const captured = [];
globalThis.document = {
  documentElement: { lang: "zh-CN" },
  querySelector: () => ({}),
  createElement: () => ({ dataset: {}, textContent: "" }),
  head: { appendChild() {} }
};
globalThis.window = { __ModuleLoader__: { load: (entry) => captured.push(entry) } };

await import("../lib/client.js");
assert.equal(captured.length, 1, "bundle registers exactly one factory");

const React = { createElement: () => null, useMemo: (fn) => fn(), useState: (value) => [value, () => {}], useRef: () => ({ current: null }), useEffect: () => {} };
const mod = captured[0].factory((id) => {
  if (id === "react") return React;
  if (id === "react-dom") return { createPortal: (node) => node };
  return { useAnchoredPosition: () => null, useDismissOnOutsidePointer: () => {} };
});
const { formatPercent, levelFor, levelSuffix, headlineWindow, formatCountdown } = mod.__internals;

const tr = (key, values) => (values === undefined ? key : key + JSON.stringify(values));

test("formats whole percents, keeps precision under 10, never shows a sliver as 0", () => {
  assert.equal(formatPercent(100), "100");
  assert.equal(formatPercent(96.4), "96");
  assert.equal(formatPercent(12.5), "13");
  assert.equal(formatPercent(9.94), "9.9");
  assert.equal(formatPercent(0.4), "<1");
  assert.equal(formatPercent(0), "0");
});

test("escalates from amber to red only near or at the limit", () => {
  assert.equal(levelFor(100), "ok");
  assert.equal(levelFor(20.1), "ok");
  assert.equal(levelFor(20), "warn");
  assert.equal(levelFor(5.1), "warn");
  assert.equal(levelFor(5), "critical");
  assert.equal(levelFor(0.4), "critical");
  assert.equal(levelFor(0), "exhausted");
});

test("severity is also spoken, not colour-only", () => {
  assert.equal(levelSuffix("ok", tr), "");
  assert.equal(levelSuffix("critical", tr), "quota.suffix.critical");
});

test("the headline is the window that actually binds", () => {
  const windows = [
    { kind: "session", remainingPercent: 100 },
    { kind: "weekly", remainingPercent: 41 },
    { kind: "monthly", remainingPercent: 4 }
  ];
  assert.equal(headlineWindow(windows).kind, "monthly");
});

test("ties fall back to the stable preference order", () => {
  const windows = [
    { kind: "session", remainingPercent: 50 },
    { kind: "weekly", remainingPercent: 50 },
    { kind: "monthly", remainingPercent: 50 }
  ];
  assert.equal(headlineWindow(windows).kind, "monthly");
});

test("countdown degrades from minutes to days", () => {
  const now = Date.now();
  const iso = (minutes) => new Date(now + minutes * 60000).toISOString();
  assert.equal(formatCountdown(iso(30), tr), "quota.inMinutes" + JSON.stringify({ minutes: 30 }));
  assert.equal(formatCountdown(iso(180), tr), "quota.inHours" + JSON.stringify({ hours: 3 }));
  assert.equal(formatCountdown(iso(60 * 30), tr), "quota.inDaysHours" + JSON.stringify({ days: 1, hours: 6 }));
  assert.equal(formatCountdown(undefined, tr), null);
});