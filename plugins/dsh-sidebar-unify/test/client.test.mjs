import test from "node:test";
import assert from "node:assert/strict";

/**
 * client.js is a browser bundle: it hands its factory to
 * window.__ModuleLoader__ and only touches the DOM when applied. Stubbing
 * those seams lets the roster rules and the side effects run under node.
 */
const captured = [];
globalThis.window = { __ModuleLoader__: { load: (entry) => captured.push(entry) } };

await import("../lib/client.js");
assert.equal(captured.length, 1, "bundle registers exactly one factory");

const mod = captured[0].factory(() => ({}));
const {
  OFFICIAL_PANEL_IDS,
  MORE_FLAG,
  PANEL_SLOT,
  css,
  hasPluginPanels,
  panelId,
  readPanelEntries,
  syncMore
} = mod.__internals;

const entries = (...ids) => ids.map((id) => ({ options: { id } }));

test("panelId accepts both registration shapes", () => {
  assert.equal(panelId({ options: { id: "plugins" } }), "plugins");
  assert.equal(panelId({ id: "schedules" }), "schedules");
  assert.equal(panelId({ options: { label: "no id" } }), null);
  assert.equal(panelId(null), null);
  assert.equal(panelId(undefined), null);
});

test("only a panel outside the shipped roster counts as a plugin panel", () => {
  assert.deepEqual([...OFFICIAL_PANEL_IDS], ["plugins", "schedules"]);
  assert.equal(hasPluginPanels([]), false);
  assert.equal(hasPluginPanels(undefined), false);
  assert.equal(hasPluginPanels(entries("plugins")), false);
  assert.equal(hasPluginPanels(entries("plugins", "schedules")), false);
  assert.equal(hasPluginPanels(entries("plugins", "my-plugin-panel")), true);
});

test("syncMore publishes the switch on the root element", () => {
  const root = { dataset: {} };
  assert.equal(syncMore(root, entries("plugins", "schedules")), false);
  assert.equal(root.dataset[MORE_FLAG], "false");
  assert.equal(syncMore(root, entries("plugins", "my-plugin-panel")), true);
  assert.equal(root.dataset[MORE_FLAG], "true");
  assert.doesNotThrow(() => syncMore(undefined, entries("my-plugin-panel")));
});

test("readPanelEntries falls back to entries() and tolerates a missing registry", () => {
  const viaOfSlot = { slots: { entriesOfSlot: () => entries("a") } };
  const viaEntries = { slots: { entries: () => entries("b") } };
  const broken = { slots: { entriesOfSlot: () => { throw new Error("unloaded"); } } };
  assert.deepEqual(readPanelEntries(viaOfSlot).map(panelId), ["a"]);
  assert.deepEqual(readPanelEntries(viaEntries).map(panelId), ["b"]);
  assert.deepEqual(readPanelEntries(broken), []);
  assert.deepEqual(readPanelEntries({ slots: {} }), []);
});

test("the stylesheet unifies New Session, removes the HARNESS badge, and gates More", () => {
  assert.match(css, /button\[class\*="newSession"\]/);
  assert.match(css, /background:transparent!important/);
  assert.match(css, /height:36px!important/);
  assert.match(css, /justify-content:flex-start!important/);
  assert.match(css, /svg>rect\{display:none!important/);
  assert.match(css, /clip-path\*="badge"/);
  assert.match(css, /html\[data-dsu-has-plugin-panels="false"\]/);
  assert.match(css, /aria-haspopup="menu"/);
});

test("apply installs the style, syncs the roster, and clears the flag on unload", () => {
  const previous = globalThis.document;
  const root = { dataset: {} };
  const styles = [];
  const subscriptions = [];
  const cleanups = [];
  globalThis.document = {
    documentElement: root,
    createElement: () => ({ dataset: {}, textContent: "", remove: () => {} }),
    head: { appendChild: (tag) => styles.push(tag) }
  };
  const roster = entries("plugins", "schedules");
  const ctx = {
    effect: (fn) => {
      const cleanup = fn();
      if (typeof cleanup === "function") cleanups.push(cleanup);
      return () => {};
    },
    slots: {
      entriesOfSlot: () => roster,
      subscribe: (slot, callback) => {
        subscriptions.push({ slot, callback });
        return () => {};
      }
    }
  };
  try {
    mod.apply(ctx);
  } finally {
    globalThis.document = previous;
  }

  assert.equal(styles.length, 1);
  assert.equal(styles[0].dataset.plugin, "@local/dsh-sidebar-unify");
  assert.match(styles[0].textContent, /newSession/);
  assert.equal(root.dataset[MORE_FLAG], "false");
  assert.deepEqual(subscriptions.map(({ slot }) => slot), [PANEL_SLOT]);

  roster.push({ options: { id: "my-plugin-panel" } });
  subscriptions[0].callback();
  assert.equal(root.dataset[MORE_FLAG], "true");

  for (const cleanup of cleanups.reverse()) cleanup();
  assert.equal(MORE_FLAG in root.dataset, false);
});

test("apply stays inert without a document", () => {
  const previous = globalThis.document;
  delete globalThis.document;
  try {
    assert.doesNotThrow(() => mod.apply({ effect: () => {}, slots: {} }));
  } finally {
    globalThis.document = previous;
  }
});
