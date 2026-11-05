import test from "node:test";
import assert from "node:assert/strict";

/**
 * client.js is a browser bundle: it hands its factory to window.__ModuleLoader__
 * and only touches the DOM when it renders. Stubbing those seams lets the pure
 * menu-composition helpers run under node.
 */
const captured = [];
globalThis.window = { __ModuleLoader__: { load: (entry) => captured.push(entry) } };

await import("../lib/client.js");
assert.equal(captured.length, 1, "bundle registers exactly one factory");

const React = {
  createElement: () => null,
  Fragment: "fragment",
  Component: class {
    constructor(props) {
      this.props = props;
      this.state = {};
    }
  },
  useState: (value) => [value, () => {}],
  useEffect: () => {}
};
const mod = captured[0].factory((id) => {
  if (id === "react") return React;
  return {
    Menu: () => null,
    Tooltip: ({ children }) => children,
    IconEllipsisOutline16: () => null,
    IconDownloadOutline16: () => null
  };
});
const { resolveLabel, readTabSnapshot, buildItems, clickViewTab, claimExportSlot } = mod.__internals;

const CHAT = "对话";
const TRAJECTORY = "轨迹";
const views = [
  { id: "chat", label: CHAT },
  { id: "trajectory", label: TRAJECTORY }
];
const tabsFor = (active) => ({ labels: new Set([CHAT, TRAJECTORY]), active });

test("resolveLabel accepts strings, thunks, and broken thunks", () => {
  assert.equal(resolveLabel("Chat", "fallback"), "Chat");
  assert.equal(resolveLabel(() => "轨迹", "fallback"), "轨迹");
  assert.equal(resolveLabel(() => {
    throw new Error("unloaded");
  }, "fallback"), "fallback");
  assert.equal(resolveLabel("", "fallback"), "fallback");
  assert.equal(resolveLabel(undefined, "fallback"), "fallback");
});

test("buildItems lists the registered Views in order", () => {
  const { items, available } = buildItems(views, tabsFor(CHAT), false);
  assert.deepEqual(items, [
    { id: "chat", label: "对话" },
    { id: "trajectory", label: "轨迹" }
  ]);
  assert.equal(available.length, 2);
});

test("buildItems drops views hidden by a feature flag but keeps Chat", () => {
  const { items, available } = buildItems(views, { labels: new Set([CHAT]), active: CHAT }, false);
  assert.deepEqual(items, [{ id: "chat", label: "对话" }]);
  assert.deepEqual(available, [{ id: "chat", label: "对话" }]);
});

test("buildItems appends the download action behind a separator", () => {
  const { items } = buildItems(views, tabsFor(TRAJECTORY), true);
  assert.deepEqual(items, [
    { id: "chat", label: "对话" },
    { id: "trajectory", label: "轨迹" },
    { type: "separator", id: "separator" },
    { id: "download", label: "", icon: null }
  ]);
});

test("buildItems keeps the download action when no View is readable", () => {
  const { items } = buildItems([], { labels: new Set(), active: null }, true);
  assert.deepEqual(items, [{ id: "download", label: "", icon: null }]);
});

test("readTabSnapshot reads labels and the selected tab", () => {
  const previous = globalThis.document;
  globalThis.document = {
    querySelectorAll: () => [
      { textContent: " 对话 ", getAttribute: () => "false" },
      { textContent: "轨迹", getAttribute: () => "true" }
    ]
  };
  try {
    const snapshot = readTabSnapshot();
    assert.deepEqual([...snapshot.labels], ["对话", "轨迹"]);
    assert.equal(snapshot.active, "轨迹");
  } finally {
    globalThis.document = previous;
  }
});

test("readTabSnapshot tolerates a missing document", () => {
  const previous = globalThis.document;
  delete globalThis.document;
  try {
    const snapshot = readTabSnapshot();
    assert.equal(snapshot.labels.size, 0);
    assert.equal(snapshot.active, null);
    assert.equal(clickViewTab("对话"), false);
  } finally {
    globalThis.document = previous;
  }
});

test("clickViewTab clicks the matching hidden tab", () => {
  const previous = globalThis.document;
  const clicks = [];
  globalThis.document = {
    querySelectorAll: () => [
      { textContent: "对话", click: () => clicks.push("chat") },
      { textContent: "轨迹", click: () => clicks.push("trajectory") }
    ]
  };
  try {
    assert.equal(clickViewTab("轨迹"), true);
    assert.deepEqual(clicks, ["trajectory"]);
    assert.equal(clickViewTab("Missing"), false);
  } finally {
    globalThis.document = previous;
  }
});

test("claimExportSlot reference-counts the export replacement flag", () => {
  const previous = globalThis.document;
  const root = { dataset: {} };
  globalThis.document = { documentElement: root };
  try {
    const releaseFirst = claimExportSlot();
    assert.equal(root.dataset.vwmExport, "replaced");
    const releaseSecond = claimExportSlot();
    releaseFirst();
    assert.equal(root.dataset.vwmExport, "replaced", "one mounted header still needs the flag");
    releaseSecond();
    assert.equal("vwmExport" in root.dataset, false, "the last unmount clears the flag");
  } finally {
    globalThis.document = previous;
  }
});

test("apply registers one header utility and the folding CSS", () => {
  const previous = globalThis.document;
  const styles = [];
  globalThis.document = {
    createElement: () => ({ dataset: {}, textContent: "" }),
    head: { appendChild: (tag) => styles.push(tag) },
    querySelectorAll: () => []
  };
  const registrations = [];
  const ctx = {
    effect: (fn) => {
      fn();
      return () => {};
    },
    get: () => undefined,
    locale: { register: () => () => {} },
    slots: {
      inject: (_name, callback) => callback(),
      register: (options, component) => {
        registrations.push({ options, component });
        return () => {};
      },
      entries: () => [],
      entriesOfSlot: () => []
    }
  };
  try {
    mod.apply(ctx);
  } finally {
    globalThis.document = previous;
  }

  assert.equal(registrations.length, 1, "registers exactly one slot entry");
  const [registration] = registrations;
  assert.equal(registration.options.name, "conversation.session.header.utilities");
  assert.equal(registration.options.id, "view-menu");
  assert.equal(registration.options.order, 1000);
  const injected = registration.options.inject("session-1");
  assert.equal(typeof injected.readViews, "function");
  assert.equal(injected.hasDownload(), false);
  assert.doesNotThrow(() => injected.download());

  assert.equal(styles.length, 1, "installs one style tag");
  assert.match(styles[0].textContent, /visibility:hidden/);
  assert.match(styles[0].textContent, /button\[class\*="_moreButton"\]\{display:none/);
});
