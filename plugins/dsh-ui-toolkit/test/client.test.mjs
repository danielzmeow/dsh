import test from "node:test";
import assert from "node:assert/strict";

/** Browser bundle seams. */
const captured = [];
const fakeWindow = {
	__ModuleLoader__: { load: (entry) => captured.push(entry) },
	localStorage: undefined
};
globalThis.window = fakeWindow;

await import("../lib/client.js");
assert.equal(captured.length, 1, "registers exactly one factory");

function Dummy() {
	return null;
}
const React = {
	createElement: (type, props, ...children) => ({ type, props, children }),
	Fragment: "fragment",
	Component: class {
		constructor(props) {
			this.props = props;
			this.state = {};
		}
	},
	useState: (value) => [value, () => {}],
	useEffect: () => {},
	useLayoutEffect: () => {},
	useRef: (value) => ({ current: value }),
	useCallback: (fn) => fn,
	useMemo: (fn) => fn(),
	useContext: () => ({}),
	createContext: () => ({ Provider: Dummy }),
	forwardRef: (fn) => fn,
	memo: (fn) => fn,
	useSyncExternalStore: (_subscribe, getSnapshot) => getSnapshot()
};
const jsxRuntime = {
	jsx: (type, props) => ({ type, props }),
	jsxs: (type, props) => ({ type, props }),
	Fragment: "fragment"
};
const primitives = new Proxy(
	{ isDarwinDesktop: () => false, Menu: Dummy, Tooltip: ({ children }) => children, ShortcutKeys: Dummy },
	{
		get(target, property) {
			if (property in target) return target[property];
			return Dummy;
		}
	}
);
const requireStub = (id) => {
	if (id === "react") return React;
	if (id === "react-dom") return { createPortal: (node) => node };
	if (id === "react/jsx-runtime") return jsxRuntime;
	if (id === "@deepseek-ai/dsh-client-ui-primitives") return primitives;
	throw new Error("unexpected require: " + id);
};

const mod = captured[0].factory(requireStub);
const {
	FEATURES,
	FEATURE_IDS,
	DEFAULT_FLAGS,
	STORAGE_KEY,
	normalizeFlags,
	loadFlags,
	saveFlags,
	createFlagsStore,
	createFeatureRunner,
	css
} = mod.__internals;

function memoryStorage(initial) {
	const data = new Map(Object.entries(initial ?? {}));
	return {
		getItem: (key) => (data.has(key) ? data.get(key) : null),
		setItem: (key, value) => data.set(key, String(value)),
		removeItem: (key) => data.delete(key),
		dump: () => Object.fromEntries(data)
	};
}

test("the merged registry exposes all interface features", () => {
	assert.deepEqual(FEATURE_IDS, ["sidebar", "hero", "motion", "composerHud", "gitBranch", "modelEffort", "viewMenu", "modelContext", "autoLoad"]);
	for (const id of FEATURE_IDS) assert.equal(DEFAULT_FLAGS[id], true);
	assert.match(css, /uit_switch/);
});

test("every feature creator yields a mountable module with its own inject list", () => {
	const expected = {
		sidebar: ["slots"],
		hero: [],
		motion: [],
		composerHud: ["slots", "locale"],
		gitBranch: ["slots", "locale"],
		modelEffort: ["slots", "modelDirectories", "sessions", "remote", "remote.session"],
		viewMenu: ["slots", "locale"],
		modelContext: ["slots", "locale", "modelDirectories"],
		autoLoad: []
	};
	for (const feature of FEATURES) {
		const module = feature.creator(requireStub);
		assert.equal(typeof module.apply, "function", feature.id + " has apply");
		assert.deepEqual(module.inject, expected[feature.id], feature.id + " inject list");
	}
});

test("normalizeFlags keeps defaults and ignores corrupt entries", () => {
	assert.deepEqual(normalizeFlags(null), DEFAULT_FLAGS);
	assert.deepEqual(normalizeFlags([]), DEFAULT_FLAGS);
	assert.deepEqual(normalizeFlags({ sidebar: false, extra: false }), { ...DEFAULT_FLAGS, sidebar: false });
	assert.deepEqual(normalizeFlags({ sidebar: "no", composerHud: 0 }), DEFAULT_FLAGS);
});

test("flags persist through a storage implementation", () => {
	const storage = memoryStorage();
	assert.deepEqual(loadFlags(storage), DEFAULT_FLAGS);
	saveFlags(storage, { ...DEFAULT_FLAGS, gitBranch: false });
	assert.deepEqual(loadFlags(storage), { ...DEFAULT_FLAGS, gitBranch: false });
	assert.deepEqual(JSON.parse(storage.dump()[STORAGE_KEY]).gitBranch, false);
	assert.deepEqual(loadFlags(memoryStorage({ [STORAGE_KEY]: "{not json" })), DEFAULT_FLAGS);
});

test("the flags store notifies once per actual change", () => {
	const storage = memoryStorage();
	const store = createFlagsStore(storage);
	let calls = 0;
	const unsubscribe = store.subscribe(() => {
		calls += 1;
	});
	assert.equal(store.set("sidebar", false), true);
	assert.equal(store.set("sidebar", false), false);
	assert.equal(calls, 1);
	assert.equal(store.getSnapshot().sidebar, false);
	assert.deepEqual(loadFlags(storage), { ...DEFAULT_FLAGS, sidebar: false });
	unsubscribe();
	assert.equal(store.set("sidebar", true), true);
	assert.equal(calls, 1, "unsubscribed listener is not called");
});

test("the feature runner starts, stops, and restarts one feature at a time", async () => {
	const started = [];
	const disposed = [];
	const ctx = {
		slots: { inject: () => () => {}, register: () => () => {}, subscribe: () => () => {} },
		locale: { register: () => () => {}, bind: () => (key) => key },
		effect: () => () => {},
		plugin: (plugin) => {
			started.push(plugin.name);
			return {
				dispose: async () => {
					disposed.push(plugin.name);
				}
			};
		}
	};
	const runner = createFeatureRunner(ctx, requireStub);
	runner.sync({ ...DEFAULT_FLAGS, gitBranch: false });
	assert.equal(started.length, 8);
	assert.equal(runner.has("gitBranch"), false);
	assert.equal(runner.has("sidebar"), true);
	assert.equal(runner.has("hero"), true);

	await runner.set("sidebar", false);
	assert.deepEqual(disposed, ["@local/dsh-ui-toolkit/sidebar"]);
	assert.equal(runner.has("sidebar"), false);

	await runner.set("sidebar", true);
	assert.equal(started.length, 9);
	assert.equal(runner.has("sidebar"), true);

	await runner.set("gitBranch", true);
	assert.equal(runner.has("gitBranch"), true);
});

test("apply installs the settings section and starts enabled features", () => {
	const previousDocument = globalThis.document;
	const styles = [];
	const slots = [];
	const localeRegistrations = [];
	const plugins = [];
	const cleanups = [];
	globalThis.document = {
		createElement: () => ({ dataset: {}, textContent: "", remove: () => {} }),
		querySelector: () => null,
		head: { appendChild: (tag) => styles.push(tag) },
		documentElement: { dataset: {} }
	};
	const ctx = {
		effect: (fn, label) => {
			const cleanup = fn();
			if (typeof cleanup === "function") cleanups.push(cleanup);
			return () => {};
		},
		locale: {
			register: (ns, dicts) => {
				localeRegistrations.push({ ns, dicts });
				return () => {};
			},
			bind: () => (key) => key
		},
		slots: {
			inject: (name, callback) => {
				callback();
				return () => {};
			},
			register: (options, component) => {
				slots.push({ options, component });
				return () => {};
			},
			subscribe: () => () => {}
		},
		plugin: (plugin) => {
			plugins.push(plugin);
			return { dispose: async () => {} };
		}
	};
	try {
		mod.apply(ctx);
	} finally {
		globalThis.document = previousDocument;
	}
	assert.equal(styles.length, 1);
	assert.match(styles[0].textContent, /uit_section/);
	assert.equal(localeRegistrations.length, 1);
	assert.equal(localeRegistrations[0].ns, "ui-toolkit");
	assert.equal(slots.length, 1);
	assert.equal(slots[0].options.name, "settings.section");
	assert.equal(slots[0].options.id, "ui-toolkit");
	assert.equal(slots[0].options.order, 90);
	assert.equal(typeof slots[0].component, "function");
	assert.equal(plugins.length, 9);
	for (const plugin of plugins) {
		assert.match(plugin.name, /^@local\/dsh-ui-toolkit\//);
		assert.equal(typeof plugin.apply, "function");
		assert.ok(Array.isArray(plugin.inject));
	}

	const tree = slots[0].component({ t: (key) => key });
	const countSwitches = (node) => {
		if (node === null || typeof node !== "object") return 0;
		if (Array.isArray(node)) return node.reduce((total, child) => total + countSwitches(child), 0);
		if (typeof node.type === "function") return countSwitches(node.type(node.props));
		let count = node.type === "input" && node.props !== undefined && node.props.className === "uit_switch" ? 1 : 0;
		const children = node.children !== undefined ? node.children : node.props?.children;
		return count + countSwitches(children);
	};
	assert.equal(countSwitches(tree), 9, "settings page renders one switch per feature");
	assert.equal(slots[0].component({ t: (key) => key }).type, "div");

	for (const cleanup of cleanups.reverse()) cleanup();
});

test("the runner falls back to a scoped facade when ctx.plugin is withheld", async () => {
	const previousDocument = globalThis.document;
	const cleanups = [];
	let injected = 0;
	let locales = 0;
	const slots = {
		inject: (_name, callback) => {
			callback();
			injected += 1;
			return () => {
				cleanups.push("slot");
			};
		},
		register: () => () => {
			cleanups.push("entry");
		},
		subscribe: () => () => {
			cleanups.push("subscribe");
		},
		entriesOfSlot: () => []
	};
	const locale = {
		register: () => {
			locales += 1;
			return () => {
				cleanups.push("locale");
			};
		},
		bind: () => (key) => key
	};
	const services = {
		modelDirectories: {
			directoryFor: () => ({ load: () => Promise.resolve(), store: { subscribe: () => () => {}, getSnapshot: () => ({}) } })
		}
	};
	const dynamic = new Proxy({}, {
		get(_target, property) {
			if (property === "effect") {
				return (execute) => {
					const dispose = execute();
					if (typeof dispose === "function") cleanups.push("effect");
					return typeof dispose === "function" ? dispose : () => {};
				};
			}
			if (property === "slots") return slots;
			if (property === "locale") return locale;
			if (property === "get") return (name) => services[name];
			throw new Error("dynamic ctx does not expose " + String(property));
		}
	});
	globalThis.document = {
		createElement: () => ({ dataset: {}, textContent: "", remove: () => {} }),
		querySelector: () => null,
		addEventListener: () => {},
		removeEventListener: () => {},
		head: { appendChild: () => {} },
		documentElement: { dataset: {} }
	};
	try {
		const runner = createFeatureRunner(dynamic, requireStub);
		runner.sync(DEFAULT_FLAGS);
		assert.equal(runner.has("sidebar"), true);
		assert.equal(runner.has("modelEffort"), true);
		assert.equal(runner.has("modelContext"), true);
		assert.equal(injected, 5, "five features register a slot; sidebar and hero are style-only");
		assert.ok(locales >= 4);
		assert.ok(cleanups.length > 0);

		const before = cleanups.length;
		await runner.set("modelEffort", false);
		assert.equal(runner.has("modelEffort"), false);
		assert.ok(cleanups.length > before, "disabling a feature runs its recorded disposers");
		await runner.set("modelEffort", true);
		assert.equal(runner.has("modelEffort"), true);
	} finally {
		globalThis.document = previousDocument;
	}
});


test("preference storage prefers the host-scoped cookie", () => {
	const previousDocument = globalThis.document;
	const previousWindow = globalThis.window;
	let cookie = "";
	const local = memoryStorage();
	globalThis.window = { ...fakeWindow, localStorage: local };
	globalThis.document = {
		get cookie() {
			return cookie;
		},
		set cookie(value) {
			cookie = String(value);
		}
	};
	try {
		const storage = mod.__internals.createPreferenceStorage();
		assert.equal(storage.getItem(STORAGE_KEY), null);
		storage.setItem(STORAGE_KEY, JSON.stringify({ sidebar: false }));
		assert.match(cookie, new RegExp("^" + mod.__internals.COOKIE_NAME + "="));
		assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)), { sidebar: false });
		assert.deepEqual(JSON.parse(local.dump()[STORAGE_KEY]), { sidebar: false });
	} finally {
		globalThis.document = previousDocument;
		globalThis.window = previousWindow;
	}
});


test("hero and motion sheets target the hero badge and both sidebars", () => {
	const hero = FEATURES.find((feature) => feature.id === "hero").creator(requireStub);
	const motion = FEATURES.find((feature) => feature.id === "motion").creator(requireStub);
	assert.match(hero.__internals.css, /previewBadge/);
	assert.match(hero.__internals.css, /titleGroup/);
	assert.match(motion.__internals.css, /data-sidebar-right-panel/);
	assert.match(motion.__internals.css, /uit-rail-in/);
	assert.match(motion.__internals.css, /grid-template-columns/);
});


test("auto-load clicks once per approach and waits for the native anchor to settle", () => {
	const feature = FEATURES.find((item) => item.id === "autoLoad");
	const module = feature.creator(requireStub);
	const { findLoadEarlierButton, isScrollTarget, triggerPx, createAutoLoader, css } = module.__internals;
	assert.match(css, /_older/);

	const direct = { disabled: false, isConnected: true, click: () => {} };
	assert.equal(findLoadEarlierButton({ querySelector: () => direct }), direct);
	assert.equal(findLoadEarlierButton({ querySelector: () => null, querySelectorAll: () => [] }), null);
	const textButton = { textContent: "加载更早" };
	assert.equal(findLoadEarlierButton({ querySelector: () => null, querySelectorAll: () => [textButton] }), textButton);
	assert.equal(findLoadEarlierButton(null), null);
	assert.equal(isScrollTarget({ scrollTop: 0 }), false);
	assert.equal(isScrollTarget({ scrollTop: 0, querySelector: () => null }), true);

	assert.equal(triggerPx({ clientHeight: 700 }), 770);
	assert.equal(triggerPx({ clientHeight: 0 }), 660);
	assert.equal(triggerPx({ clientHeight: 2000 }), 900);

	const previousSetTimeout = globalThis.setTimeout;
	const timers = [];
	globalThis.setTimeout = (callback) => {
		timers.push(callback);
		return timers.length;
	};
	try {
		let clicks = 0;
		const button = {
			disabled: false,
			isConnected: true,
			click: () => {
				clicks += 1;
			}
		};
		const scroll = {
			scrollTop: 0,
			clientHeight: 700,
			scrollHeight: 1000,
			isConnected: true,
			querySelector: () => button
		};
		const onScroll = createAutoLoader();

		onScroll({ target: scroll });
		assert.equal(clicks, 0, "the scroll frame settles first");
		assert.equal(timers.length, 1);
		timers.shift()();
		assert.equal(clicks, 1, "loads well before the top");
		assert.equal(timers.length, 1, "watches the native load");

		onScroll({ target: scroll });
		assert.equal(clicks, 1, "a scroll during the load does not click twice");
		assert.equal(timers.length, 1);

		// One page landed and the native anchor moved the reader.
		scroll.scrollHeight = 1600;
		scroll.scrollTop = 900;
		timers.shift()();

		// The next approach loads exactly one more page.
		scroll.scrollTop = 0;
		onScroll({ target: scroll });
		assert.equal(timers.length, 1);
		timers.shift()();
		assert.equal(clicks, 2, "the next approach may load one more page");

		// A slow commit is retried, then the next approach is released.
		timers.shift()();
		assert.equal(clicks, 2);
		scroll.scrollHeight = 2600;
		scroll.scrollTop = 900;
		timers.shift()();
		scroll.scrollTop = 2000;
		onScroll({ target: scroll });
		scroll.scrollTop = 0;
		onScroll({ target: scroll });
		timers.shift()();
		assert.equal(clicks, 3, "leaving the band allows a new approach");
		onScroll.dispose();
	} finally {
		globalThis.setTimeout = previousSetTimeout;
	}
});


test("auto-load captures its own stable anchor and restores it after a fast scroll", () => {
	const feature = FEATURES.find((item) => item.id === "autoLoad");
	const module = feature.creator(requireStub);
	const { findAnchor, restoreAnchor } = module.__internals;

	const viewport = { top: 0, bottom: 700 };
	let rowTop = 120;
	const row = {
		getAttribute: (name) => (name === "data-chat-anchor-key" ? "turn-7" : null),
		getBoundingClientRect: () => ({ top: rowTop, bottom: rowTop + 80 })
	};
	const above = {
		getAttribute: () => "turn-6",
		getBoundingClientRect: () => ({ top: -100, bottom: 0 })
	};
	const below = {
		getAttribute: () => "turn-8",
		getBoundingClientRect: () => ({ top: 700, bottom: 780 })
	};
	const scroll = {
		scrollTop: 300,
		scrollHeight: 1000,
		clientHeight: 700,
		isConnected: true,
		getBoundingClientRect: () => viewport,
		querySelectorAll: () => [above, row, below]
	};

	const anchor = findAnchor(scroll);
	assert.deepEqual(anchor, { key: "turn-7", top: 120 });

	// Native anchoring failed while the reader scrolled fast: the row moved down
	// by exactly the prepended page, but scrollTop did not follow.
	rowTop = 520;
	assert.equal(restoreAnchor(scroll, anchor), true);
	assert.equal(scroll.scrollTop, 700, "scrollTop follows the prepended height");

	// When the native anchor already worked, the measured shift is zero.
	rowTop = 120;
	scroll.scrollTop = 700;
	assert.equal(restoreAnchor(scroll, anchor), true);
	assert.equal(scroll.scrollTop, 700, "an already-correct anchor is untouched");

	assert.equal(restoreAnchor({ ...scroll, querySelectorAll: () => [] }, anchor), false);
});

