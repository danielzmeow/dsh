window.__ModuleLoader__.load({
	id: "@local/dsh-ui-toolkit",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		const React = require("react");
		const h = React.createElement;

		//#region vendored xterm
/* @@VENDOR@@ */
		//#endregion

		/**
		 * Shared sidebar-entry store created by apply(). The feature creator reads
		 * it through this closure; keeping it here lets the settings section and
		 * the running feature observe the same snapshot.
		 */
		let sidebarEntriesHost = null;

		//#region merged feature factories
/* @@CREATORS@@ */
		//#endregion

		//#region feature registry
		/**
		 * One row per merged feature. Keep the ids stable: they are the keys in
		 * localStorage, so renaming one forgets the user's choice.
		 */
		const FEATURES = Object.freeze([
			Object.freeze({ id: "sidebar", creator: createSidebarUnify, titleKey: "feature.sidebar.title", hintKey: "feature.sidebar.hint" }),
			Object.freeze({ id: "sidebarEntries", creator: createSidebarEntries, titleKey: "feature.sidebarEntries.title", hintKey: "feature.sidebarEntries.hint" }),
			Object.freeze({ id: "hero", creator: createHeroCleanup, titleKey: "feature.hero.title", hintKey: "feature.hero.hint" }),
			Object.freeze({ id: "motion", creator: createSidebarMotion, titleKey: "feature.motion.title", hintKey: "feature.motion.hint" }),
			Object.freeze({ id: "composerHud", creator: createComposerHud, titleKey: "feature.composerHud.title", hintKey: "feature.composerHud.hint" }),
			Object.freeze({ id: "gitBranch", creator: createGitBranch, titleKey: "feature.gitBranch.title", hintKey: "feature.gitBranch.hint" }),
			Object.freeze({ id: "modelEffort", creator: createModelEffort, titleKey: "feature.modelEffort.title", hintKey: "feature.modelEffort.hint" }),
			Object.freeze({ id: "viewMenu", creator: createViewMenu, titleKey: "feature.viewMenu.title", hintKey: "feature.viewMenu.hint" }),
			Object.freeze({ id: "modelContext", creator: createModelContext, titleKey: "feature.modelContext.title", hintKey: "feature.modelContext.hint" }),
			Object.freeze({ id: "autoLoad", creator: createAutoLoadEarlier, titleKey: "feature.autoLoad.title", hintKey: "feature.autoLoad.hint" }),
			Object.freeze({ id: "terminal", creator: createTerminalPanelFeature, titleKey: "feature.terminal.title", hintKey: "feature.terminal.hint" }),
			Object.freeze({ id: "autoHideScrollbars", creator: createAutoHideScrollbars, titleKey: "feature.autoHideScrollbars.title", hintKey: "feature.autoHideScrollbars.hint" })
		]);
		const FEATURE_IDS = FEATURES.map((feature) => feature.id);
		const FEATURE_BY_ID = new Map(FEATURES.map((feature) => [feature.id, feature]));
		const DEFAULT_FLAGS = Object.freeze(Object.fromEntries(FEATURE_IDS.map((id) => [id, true])));
		const STORAGE_KEY = "dsh-ui-toolkit.features.v1";
		//#endregion

		//#region dictionaries
		const NS = "ui-toolkit";
		const zh = {
			"title": "界面",
			"description": "选择要启用的界面增强。更改会立即生效，并记住在这台机器上。",
			"feature.sidebar.title": "侧边栏",
			"feature.sidebar.hint": "统一 New Session 行，去掉 HARNESS 徽章",
			"feature.sidebarEntries.title": "侧边栏入口",
			"feature.sidebarEntries.hint": "管理全局面板的显示和顺序，「更多」始终隐藏",
			"entries.title": "全局面板",
			"entries.hint": "用箭头调整顺序，或关闭某一项。更改立即生效，并记住在这台机器上。",
			"entries.reset": "恢复默认",
			"entries.empty": "还没有可管理的全局面板。",
			"entries.moveUp": "上移",
			"entries.moveDown": "下移",
			"entries.moreHidden": "「更多」已隐藏，插件市场等入口仍在上方管理。",
			"feature.hero.title": "新会话标题",
			"feature.hero.hint": "去掉「探索未至之境 / Into the Unknown」旁边的 Preview 徽章",
			"feature.motion.title": "侧边栏动画",
			"feature.motion.hint": "左右侧边栏开关时的弹性滑入、淡入和缩放过渡",
			"feature.composerHud.title": "输入框状态环",
			"feature.composerHud.hint": "在输入框工具栏显示上下文圆环和可展开的用量明细",
			"feature.gitBranch.title": "Git 分支",
			"feature.gitBranch.hint": "在输入框左侧显示当前分支，支持搜索和切换本地分支",
			"feature.modelEffort.title": "模型与推理强度",
			"feature.modelEffort.hint": "用可拖动滑块选择模型和 reasoning effort",
			"feature.viewMenu.title": "会话视图菜单",
			"feature.viewMenu.hint": "把 Chat / Trajectory 标签折叠进右上角的 ⋯ 菜单",
			"feature.modelContext.title": "对话成本",
			"feature.modelContext.hint": "在输入框状态栏显示估算费用，点开查看分项明细",
			"feature.autoLoad.title": "自动加载更早",
			"feature.autoLoad.hint": "接近对话顶部时自动加载更早历史，不用再点「加载更早」",
			"feature.terminal.title": "底部终端",
			"feature.terminal.hint": "右下角浮动的 Terminal 按钮，点开后从底边展开；关闭即结束进程（⌘⇧` / Ctrl+Shift+`）",
			"feature.autoHideScrollbars.title": "自动隐藏滚动条",
			"feature.autoHideScrollbars.hint": "只在滚动时显示滚动条，静止后自动淡出"
		};
		const en = {
			"title": "Interface",
			"description": "Choose which interface enhancements to enable. Changes apply immediately and are remembered on this machine.",
			"feature.sidebar.title": "Sidebar",
			"feature.sidebar.hint": "Flatten New Session and remove the HARNESS badge",
			"feature.sidebarEntries.title": "Sidebar entries",
			"feature.sidebarEntries.hint": "Choose which global panels appear and in what order; More is always hidden",
			"entries.title": "Global panels",
			"entries.hint": "Reorder with the arrows or switch a row off. Changes apply immediately and are remembered on this machine.",
			"entries.reset": "Reset",
			"entries.empty": "No global panels are registered yet.",
			"entries.moveUp": "Move up",
			"entries.moveDown": "Move down",
			"entries.moreHidden": "More is hidden. Plugins and the market remain manageable above.",
			"feature.hero.title": "Hero headline",
			"feature.hero.hint": "Remove the Preview badge beside the hero headline",
			"feature.motion.title": "Sidebar motion",
			"feature.motion.hint": "Springy slide, fade, and scale transitions when either sidebar opens or closes",
			"feature.composerHud.title": "Composer status ring",
			"feature.composerHud.hint": "Show the context ring and an expandable usage breakdown in the composer toolbar",
			"feature.gitBranch.title": "Git branch",
			"feature.gitBranch.hint": "Show the current branch at the left of the composer, with searchable local-branch switching",
			"feature.modelEffort.title": "Model & reasoning effort",
			"feature.modelEffort.hint": "Pick the model and reasoning effort with a draggable slider",
			"feature.viewMenu.title": "Conversation view menu",
			"feature.viewMenu.hint": "Fold the Chat / Trajectory tabs into the More (…) menu at the top right",
			"feature.modelContext.title": "Conversation cost",
			"feature.modelContext.hint": "Show the estimated cost in the composer status row, with a click-open breakdown",
			"feature.autoLoad.title": "Auto-load earlier",
			"feature.autoLoad.hint": "Load earlier history automatically as the conversation nears the top",
			"feature.terminal.title": "Bottom terminal",
			"feature.terminal.hint": "A floating Terminal button at the bottom-right that expands from the bottom edge; closing ends the process (⌘⇧` / Ctrl+Shift+`)",
			"feature.autoHideScrollbars.title": "Auto-hide scrollbars",
			"feature.autoHideScrollbars.hint": "Show scrollbars only while scrolling; fade them out when idle"
		};
		//#endregion

		//#region styles
		const css = [
			".uit_section{box-sizing:border-box;width:100%;max-width:720px;flex-direction:column;gap:18px;display:flex}",
			".uit_intro{flex-direction:column;gap:4px;display:flex}",
			".uit_title{color:var(--dsw-alias-label-primary);margin:0;font-size:16px;font-weight:600;line-height:24px}",
			".uit_description{color:var(--dsw-alias-label-secondary);margin:0;font-size:13px;line-height:20px}",
			".uit_list{flex-direction:column;border-top:.5px solid var(--dsw-alias-border-l2);display:flex}",
			".uit_row{align-items:center;gap:24px;padding:12px 0;border-bottom:.5px solid var(--dsw-alias-border-l2);display:flex}",
			".uit_row:last-child{border-bottom:0}",
			".uit_text{flex-direction:column;gap:2px;min-width:0;flex:1;display:flex}",
			".uit_label{color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px}",
			".uit_hint{color:var(--dsw-alias-label-caption);font-size:12px;line-height:18px}",
			".uit_switch{box-sizing:border-box;appearance:none;-webkit-appearance:none;background:var(--dsw-alias-interactive-bg-active);border-radius:999px;flex:none;width:36px;height:20px;margin:0;cursor:pointer;position:relative;transition:background-color .15s var(--ds-ease-in-out)}",
			".uit_switch::after{content:\"\";background:#fff;border-radius:50%;width:16px;height:16px;position:absolute;top:2px;left:2px;transition:transform .15s var(--ds-ease-in-out);box-shadow:0 1px 2px rgba(0,0,0,.2)}",
			".uit_switch:checked{background:var(--dsw-alias-state-business-primary)}",
			".uit_switch:checked::after{transform:translateX(16px)}",
			".uit_switch:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}",
			".uit_switch:disabled{cursor:default;opacity:.5}",
			".uit_row:has(+.uit_subsection){border-bottom:0}",
			".uit_subsection{box-sizing:border-box;padding:2px 0 14px;border-bottom:.5px solid var(--dsw-alias-border-l2);margin-top:-6px}",
			".uit_subhead{align-items:center;gap:12px;display:flex}",
			".uit_sublabel{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;line-height:20px;flex:1}",
			".uit_link{appearance:none;background:none;border:0;color:var(--dsw-alias-state-business-primary);cursor:pointer;font:inherit;font-size:12px;line-height:20px;padding:2px 0}",
			".uit_link:hover{text-decoration:underline}",
			".uit_link:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}",
			".uit_subhint{color:var(--dsw-alias-label-caption);font-size:12px;line-height:18px;margin:2px 0 10px}",
			".uit_entries{flex-direction:column;gap:4px;display:flex}",
			".uit_entryRow{align-items:center;gap:10px;padding:6px 8px;border-radius:var(--dsw-radius-md);display:flex}",
			".uit_entryRow:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".uit_entryRow[data-hidden=\"true\"] .uit_entryName{color:var(--dsw-alias-label-caption)}",
			".uit_order{flex-direction:column;gap:1px;flex:none;display:flex}",
			".uit_orderButton{appearance:none;background:none;border:0;border-radius:var(--dsw-radius-sm);color:var(--dsw-alias-label-secondary);cursor:pointer;width:20px;height:15px;padding:0;justify-content:center;align-items:center;display:flex}",
			".uit_orderButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-active);color:var(--dsw-alias-label-primary)}",
			".uit_orderButton:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-1px}",
			".uit_orderButton:disabled{cursor:default;opacity:.25}",
			".uit_entryText{flex-direction:column;gap:1px;min-width:0;flex:1;display:flex}",
			".uit_entryName{color:var(--dsw-alias-label-primary);font-size:13px;line-height:18px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
			".uit_entryId{color:var(--dsw-alias-label-caption);font-family:var(--ds-font-family-code);font-size:11px;line-height:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
			".uit_empty{color:var(--dsw-alias-label-caption);font-size:12px;line-height:18px;padding:6px 0}",
			".uit_moreNote{color:var(--dsw-alias-label-caption);font-size:11px;line-height:16px;margin-top:8px}"
		].join("");
		const cssTagId = "@local/dsh-ui-toolkit/ui-toolkit.css";
		//#endregion

		//#region flag storage
		/**
		 * Merge a stored object over the defaults, ignoring unknown ids and
		 * non-boolean values (a corrupted entry must not disable a whole feature
		 * set).
		 * @param {any} value
		 * @returns {Record<string, boolean>}
		 */
		function normalizeFlags(value) {
			const flags = { ...DEFAULT_FLAGS };
			if (value === null || typeof value !== "object" || Array.isArray(value)) return flags;
			for (const id of FEATURE_IDS) {
				if (typeof value[id] === "boolean") flags[id] = value[id];
			}
			return flags;
		}

		/** @param {Storage | undefined} storage */
		function loadFlags(storage) {
			if (storage === undefined || storage === null) return { ...DEFAULT_FLAGS };
			try {
				const raw = storage.getItem(STORAGE_KEY);
				if (raw === null || raw === "") return { ...DEFAULT_FLAGS };
				return normalizeFlags(JSON.parse(raw));
			} catch (_error) {
				return { ...DEFAULT_FLAGS };
			}
		}

		/** @param {Storage | undefined} storage @param {Record<string, boolean>} flags */
		function saveFlags(storage, flags) {
			if (storage === undefined || storage === null) return;
			try {
				storage.setItem(STORAGE_KEY, JSON.stringify(flags));
			} catch (_error) {
				// Private mode / quota: the session still works, it just forgets.
			}
		}

		/**
		 * Tiny external store for the settings page.
		 * @param {Storage | undefined} storage
		 */
		function createFlagsStore(storage) {
			let flags = loadFlags(storage);
			const listeners = new Set();
			return {
				getSnapshot: () => flags,
				subscribe: (listener) => {
					listeners.add(listener);
					return () => listeners.delete(listener);
				},
				read: () => flags,
				set: (id, enabled) => {
					if (!FEATURE_BY_ID.has(id) || flags[id] === enabled) return false;
					flags = { ...flags, [id]: enabled };
					saveFlags(storage, flags);
					for (const listener of [...listeners]) {
						try {
							listener();
						} catch (error) {
							console.error("ui-toolkit: flag listener failed", error);
						}
					}
					return true;
				}
			};
		}

		/** @returns {Storage | undefined} */
		function browserStorage() {
			try {
				return typeof window !== "undefined" ? window.localStorage : undefined;
			} catch (_error) {
				return undefined;
			}
		}

		/** Cookie name for the cross-port copy; localStorage is the fallback. */
		const COOKIE_NAME = "dsh_ui_toolkit_features";

		/** @param {string} name */
		function readCookie(name) {
			try {
				if (typeof document === "undefined" || typeof document.cookie !== "string") return null;
				for (const part of document.cookie.split(";")) {
					const index = part.indexOf("=");
					if (index < 0) continue;
					if (part.slice(0, index).trim() !== name) continue;
					return decodeURIComponent(part.slice(index + 1).trim());
				}
			} catch (_error) {
				// Cookie access can be blocked; localStorage still works.
			}
			return null;
		}

		/** @param {string} name @param {string} value */
		function writeCookie(name, value) {
			try {
				if (typeof document === "undefined") return;
				document.cookie = name + "=" + encodeURIComponent(value) + "; Max-Age=31536000; Path=/; SameSite=Lax";
			} catch (_error) {
				// Ignored: the localStorage copy remains authoritative for this port.
			}
		}

		/**
		 * The desktop app can bind a fresh loopback port each launch, and
		 * localStorage is origin-scoped (port included). A cookie is host-scoped,
		 * so it keeps the feature choices across restarts; localStorage remains
		 * the fallback when cookies are unavailable.
		 */
		function createPreferenceStorage(cookieName) {
			const name = cookieName ?? COOKIE_NAME;
			const local = browserStorage();
			return {
				getItem: (key) => {
					const cookie = readCookie(name);
					if (cookie !== null) return cookie;
					try {
						return local === undefined || local === null ? null : local.getItem(key);
					} catch (_error) {
						return null;
					}
				},
				setItem: (key, value) => {
					writeCookie(name, value);
					try {
						if (local !== undefined && local !== null) local.setItem(key, value);
					} catch (_error) {
						// The cookie already carries the value.
					}
				}
			};
		}
		//#endregion

		//#region sidebar entry preferences
		/** Persisted selection for the global panel list. */
		const ENTRY_STORAGE_KEY = "dsh-ui-toolkit.sidebar-entries.v1";
		const ENTRY_COOKIE_NAME = "dsh_ui_toolkit_sidebar_entries";

		/**
		 * Keep only unique string ids; a corrupted value must not break the
		 * settings page or the sidebar.
		 * @param {any} value
		 * @returns {{ hidden: string[], order: string[] }}
		 */
		function normalizeEntryPrefs(value) {
			const hidden = [];
			const order = [];
			const seenHidden = new Set();
			const seenOrder = new Set();
			if (value !== null && typeof value === "object" && !Array.isArray(value)) {
				if (Array.isArray(value.hidden)) {
					for (const id of value.hidden) {
						if (typeof id !== "string" || seenHidden.has(id)) continue;
						seenHidden.add(id);
						hidden.push(id);
					}
				}
				if (Array.isArray(value.order)) {
					for (const id of value.order) {
						if (typeof id !== "string" || seenOrder.has(id)) continue;
						seenOrder.add(id);
						order.push(id);
					}
				}
			}
			return { hidden, order };
		}

		/** @param {Storage | undefined} storage */
		function loadEntryPrefs(storage) {
			if (storage === undefined || storage === null) return { hidden: [], order: [] };
			try {
				const raw = storage.getItem(ENTRY_STORAGE_KEY);
				if (raw === null || raw === "") return { hidden: [], order: [] };
				return normalizeEntryPrefs(JSON.parse(raw));
			} catch (_error) {
				return { hidden: [], order: [] };
			}
		}

		/** @param {Storage | undefined} storage @param {{ hidden: string[], order: string[] }} prefs */
		function saveEntryPrefs(storage, prefs) {
			if (storage === undefined || storage === null) return;
			try {
				storage.setItem(ENTRY_STORAGE_KEY, JSON.stringify(prefs));
			} catch (_error) {
				// Private mode / quota: the manager still works for this session.
			}
		}

		/** @param {any} label @param {string} fallback */
		function resolveEntryLabel(label, fallback) {
			try {
				const value = typeof label === "function" ? label() : label;
				if (typeof value === "string" && value !== "") return value;
			} catch (_error) {
				// A label whose locale service is not ready yet falls back to id.
			}
			return fallback;
		}

		/**
		 * Snapshot the live panel roster. Kept free of DOM access so the host
		 * tests can drive it with a plain slot stub.
		 * @param {any} slots
		 * @returns {ReadonlyArray<{ id: string, label: string, nativeOrder: number }>}
		 */
		function readPanelEntries(slots) {
			let entries = [];
			try {
				if (slots !== null && slots !== undefined && typeof slots.entriesOfSlot === "function") {
					entries = slots.entriesOfSlot("sidebar.panellist") ?? [];
				}
			} catch (_error) {
				// The registry may not be ready yet; the subscription re-syncs.
			}
			const seen = new Set();
			const rows = [];
			let index = 0;
			for (const entry of entries) {
				const options = entry !== null && entry !== undefined ? entry.options : undefined;
				const id = options !== null && options !== undefined && typeof options.id === "string" ? options.id : null;
				if (id === null || seen.has(id)) continue;
				seen.add(id);
				rows.push({
					id,
					label: resolveEntryLabel(options.label, id),
					nativeOrder: typeof options.order === "number" ? options.order : 0,
					index
				});
				index += 1;
			}
			rows.sort((left, right) => left.nativeOrder - right.nativeOrder || left.index - right.index);
			return rows.map(({ id, label, nativeOrder }) => ({ id, label, nativeOrder }));
		}

		/**
		 * @param {ReadonlyArray<any>} entries
		 * @param {ReadonlyArray<string>} order
		 * @returns {ReadonlyArray<any>}
		 */
		function orderPanelEntries(entries, order) {
			const remaining = new Map(entries.map((entry) => [entry.id, entry]));
			const result = [];
			for (const id of order) {
				const entry = remaining.get(id);
				if (entry === undefined) continue;
				result.push(entry);
				remaining.delete(id);
			}
			for (const entry of entries) {
				if (!remaining.has(entry.id)) continue;
				result.push(entry);
				remaining.delete(entry.id);
			}
			return result;
		}

		/**
		 * @param {ReadonlyArray<any>} entries
		 * @param {ReadonlyArray<string>} order
		 * @param {string} id
		 * @param {number} delta
		 * @returns {string[] | null}
		 */
		function shiftPanelOrder(entries, order, id, delta) {
			const ids = orderPanelEntries(entries, order).map((entry) => entry.id);
			const from = ids.indexOf(id);
			if (from < 0) return null;
			const to = from + delta;
			if (to < 0 || to >= ids.length) return null;
			ids.splice(from, 1);
			ids.splice(to, 0, id);
			return ids;
		}

		/**
		 * Shared store for the sidebar entry manager: the live roster plus the
		 * user's order/visibility choices, persisted through the same
		 * host-scoped cookie mechanism as the feature flags.
		 * @param {{ slots: any, locale?: any, storage?: any }} options
		 */
		function createSidebarEntryStore(options) {
			const slots = options.slots;
			const locale = options.locale;
			const storage = options.storage;

			let prefs = loadEntryPrefs(storage);
			let entries = readPanelEntries(slots);
			const listeners = new Set();

			const build = () => {
				const ordered = orderPanelEntries(entries, prefs.order);
				const hiddenSet = new Set(prefs.hidden);
				return {
					entries: ordered,
					hidden: ordered.filter((entry) => hiddenSet.has(entry.id)).map((entry) => entry.id)
				};
			};

			let snapshot = build();

			const signature = (value) => value.entries.map((entry) => entry.id + "\u0000" + entry.label).join("\u0001") + "\u0002" + value.hidden.join("\u0001");

			const publish = () => {
				const next = build();
				if (signature(next) === signature(snapshot)) return;
				snapshot = next;
				for (const listener of [...listeners]) {
					try {
						listener();
					} catch (error) {
						console.error("ui-toolkit: sidebar entry listener failed", error);
					}
				}
			};

			const commit = (next) => {
				prefs = normalizeEntryPrefs(next);
				saveEntryPrefs(storage, prefs);
				publish();
			};

			return {
				getSnapshot: () => snapshot,
				subscribe: (listener) => {
					listeners.add(listener);
					return () => listeners.delete(listener);
				},
				/**
				 * @param {string} id
				 * @param {boolean} hidden
				 */
				setHidden: (id, hidden) => {
					const set = new Set(prefs.hidden);
					if (hidden) set.add(id);
					else set.delete(id);
					commit({ ...prefs, hidden: [...set] });
				},
				/**
				 * @param {string} id
				 * @param {number} delta
				 * @returns {boolean}
				 */
				move: (id, delta) => {
					const order = shiftPanelOrder(entries, prefs.order, id, delta);
					if (order === null) return false;
					commit({ ...prefs, order });
					return true;
				},
				reset: () => {
					commit({ hidden: [], order: [] });
				},
				refreshEntries: () => {
					entries = readPanelEntries(slots);
					publish();
				},
				start: () => {
					const disposers = [];
					try {
						if (slots !== null && slots !== undefined && typeof slots.subscribe === "function") {
							const dispose = slots.subscribe("sidebar.panellist", () => {
								entries = readPanelEntries(slots);
								publish();
							});
							if (typeof dispose === "function") disposers.push(dispose);
						}
					} catch (_error) {
						// No live registry: the initial snapshot is still usable.
					}
					try {
						if (locale !== null && locale !== undefined && typeof locale.subscribe === "function") {
							const dispose = locale.subscribe(() => {
								entries = readPanelEntries(slots);
								publish();
							});
							if (typeof dispose === "function") disposers.push(dispose);
						}
					} catch (_error) {
						// Labels keep their initial language.
					}
					entries = readPanelEntries(slots);
					publish();
					return () => {
						for (const dispose of disposers.splice(0)) {
							try {
								dispose();
							} catch (_error) {
								// Best-effort unsubscription.
							}
						}
					};
				}
			};
		}
		//#endregion

		//#region feature lifecycle
		/**
		 * Fallback for runtimes without ctx.plugin(): wrap the methods features
		 * use to register cleanup so one feature can be stopped independently.
		 * @param {any} ctx
		 * @param {Array<() => void>} bag
		 */
		function createScopedContext(ctx, bag) {
			const record = (value) => {
				if (typeof value === "function") bag.push(value);
				return value;
			};
			const wrap = (target) => {
				if (target === undefined || target === null) return target;
				return new Proxy(target, {
					get(object, property) {
						const value = Reflect.get(object, property, object);
						if (typeof value !== "function") return value;
						return (...args) => record(value.apply(object, args));
					}
				});
			};
			const slots = wrap(ctx.slots);
			const locale = wrap(ctx.locale);
			const effect = (execute, label) => record(ctx.effect(execute, label));
			const reserved = new Set([
				"effect", "slots", "locale", "get", "on", "once", "provide",
				"timeout", "interval", "setTimeout", "setInterval", "throttle",
				"debounce", "then", "toJSON"
			]);
			/** Reach undeclared services through the facade's optional lookup. */
			const readService = (name) => {
				try {
					const service = typeof ctx.get === "function" ? ctx.get(name) : undefined;
					return service === undefined ? undefined : wrap(service);
				} catch (_error) {
					return undefined;
				}
			};
			return new Proxy(ctx, {
				get(target, property, receiver) {
					if (property === "effect") return effect;
					if (property === "slots") return slots;
					if (property === "locale") return locale;
					if (typeof property === "string" && !reserved.has(property)) {
						const service = readService(property);
						if (service !== undefined) return service;
					}
					return Reflect.get(target, property, receiver);
				}
			});
		}

		/**
		 * Start/stop one feature at a time. A child Cordis plugin gives each
		 * feature its own fiber, so disposing it tears down its slots, locale
		 * entries, style tags, and observers without touching its siblings.
		 */
		function createFeatureRunner(ctx, require) {
			const running = new Map();
			const generations = new Map();

			const start = (feature) => {
				if (running.has(feature.id)) return true;
				let featureModule;
				try {
					featureModule = feature.creator(require);
				} catch (error) {
					console.error("ui-toolkit: failed to create " + feature.id, error);
					return false;
				}
				if (featureModule === null || featureModule === undefined || typeof featureModule.apply !== "function") return false;

				let handle;
				let canPlugin = false;
				try {
					canPlugin = typeof ctx.plugin === "function";
				} catch (_error) {
					// The DSH dynamic facade withholds ctx.plugin; use the scoped
					// fallback below, which records each feature's disposers.
					canPlugin = false;
				}
				if (canPlugin) {
					try {
						handle = {
							fiber: ctx.plugin({
								name: "@local/dsh-ui-toolkit/" + feature.id,
								inject: Array.isArray(featureModule.inject) ? featureModule.inject : [],
								apply: (sub) => featureModule.apply(sub)
							})
						};
					} catch (error) {
						console.error("ui-toolkit: failed to start " + feature.id, error);
					}
				}
				if (handle === undefined) {
					const bag = [];
					const scoped = createScopedContext(ctx, bag);
					try {
						featureModule.apply(scoped);
						handle = {
							dispose: () => {
								while (bag.length > 0) {
									const dispose = bag.pop();
									try {
										dispose();
									} catch (error) {
										console.error("ui-toolkit: " + feature.id + " cleanup failed", error);
									}
								}
							}
						};
					} catch (error) {
						console.error("ui-toolkit: failed to apply " + feature.id, error);
						while (bag.length > 0) {
							const dispose = bag.pop();
							try {
								dispose();
							} catch (_cleanupError) {
								// Best-effort rollback of a partially applied feature.
							}
						}
					}
				}
				if (handle === undefined) return false;
				running.set(feature.id, handle);
				return true;
			};

			const stop = async (id) => {
				const handle = running.get(id);
				running.delete(id);
				if (handle === undefined) return;
				try {
					if (handle.fiber !== undefined && typeof handle.fiber.dispose === "function") await handle.fiber.dispose();
					else if (typeof handle.dispose === "function") handle.dispose();
				} catch (error) {
					console.error("ui-toolkit: failed to stop " + id, error);
				}
			};

			return {
				has: (id) => running.has(id),
				start,
				stop,
				/**
				 * Apply a boolean selection. Generation guards make rapid
				 * toggles settle on the last click.
				 */
				set: async (id, enabled) => {
					const feature = FEATURE_BY_ID.get(id);
					if (feature === undefined) return;
					const generation = (generations.get(id) ?? 0) + 1;
					generations.set(id, generation);
					await stop(id);
					if (generations.get(id) !== generation) return;
					if (enabled) start(feature);
				},
				sync: (flags) => {
					for (const feature of FEATURES) {
						if (flags[feature.id] !== false) start(feature);
					}
				}
			};
		}
		//#endregion

		//#region settings UI
		let activeStore = null;
		let activeRunner = null;
		let activeEntryStore = null;
		/** Stable empty snapshot so the section renders before apply() wires the store. */
		const EMPTY_ENTRY_SNAPSHOT = Object.freeze({ entries: Object.freeze([]), hidden: Object.freeze([]) });
		const EMPTY_ENTRY_STORE = Object.freeze({
			subscribe: () => () => {},
			getSnapshot: () => EMPTY_ENTRY_SNAPSHOT
		});

		/** Hooks shim so the section also works if the runtime predates useSyncExternalStore. */
		function useStoreSnapshot(subscribe, getSnapshot) {
			if (typeof React.useSyncExternalStore === "function") return React.useSyncExternalStore(subscribe, getSnapshot);
			const [value, setValue] = React.useState(getSnapshot);
			React.useEffect(() => subscribe(() => setValue(getSnapshot())), [subscribe, getSnapshot]);
			return value;
		}

		function Switch({ checked, label, onChange }) {
			return h("input", {
				type: "checkbox",
				role: "switch",
				className: "uit_switch",
				checked,
				"aria-label": label,
				onChange: (event) => onChange(event.target.checked)
			});
		}

		/** Small chevron used by the order buttons. */
		function Chevron({ up }) {
			return h("svg", { width: 10, height: 10, viewBox: "0 0 16 16", "aria-hidden": "true" },
				h("path", {
					d: up ? "M4 10l4-4 4 4" : "M4 6l4 4 4-4",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: 1.75,
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			);
		}

		/**
		 * Inline manager shown under the Sidebar entries switch. It reads the
		 * shared store so its order matches what the sidebar renders.
		 */
		function SidebarEntriesManager({ store, t }) {
			const snapshot = useStoreSnapshot(store.subscribe, store.getSnapshot);
			const entries = snapshot.entries;
			return h("div", { className: "uit_subsection" },
				h("div", { className: "uit_subhead" },
					h("div", { className: "uit_sublabel" }, t("entries.title")),
					h("button", {
						type: "button",
						className: "uit_link",
						onClick: () => store.reset()
					}, t("entries.reset"))
				),
				h("div", { className: "uit_subhint" }, t("entries.hint")),
				entries.length === 0
					? h("div", { className: "uit_empty" }, t("entries.empty"))
					: h("div", { className: "uit_entries" },
						entries.map((entry, index) => {
							const hidden = snapshot.hidden.indexOf(entry.id) >= 0;
							return h("div", {
								key: entry.id,
								className: "uit_entryRow",
								"data-hidden": hidden ? "true" : "false"
							},
								h("div", { className: "uit_order" },
									h("button", {
										type: "button",
										className: "uit_orderButton",
										"aria-label": t("entries.moveUp"),
										disabled: index === 0,
										onClick: () => store.move(entry.id, -1)
									}, h(Chevron, { up: true })),
									h("button", {
										type: "button",
										className: "uit_orderButton",
										"aria-label": t("entries.moveDown"),
										disabled: index === entries.length - 1,
										onClick: () => store.move(entry.id, 1)
									}, h(Chevron, { up: false }))
								),
								h("div", { className: "uit_entryText" },
									h("div", { className: "uit_entryName" }, entry.label),
									entry.label === entry.id ? null : h("div", { className: "uit_entryId" }, entry.id)
								),
								h(Switch, {
									checked: !hidden,
									label: entry.label,
									onChange: (next) => store.setHidden(entry.id, !next)
								})
							);
						})
					),
				h("div", { className: "uit_moreNote" }, t("entries.moreHidden"))
			);
		}

		function UIToolkitSection(props) {
			const t = props !== null && props !== undefined && typeof props.t === "function" ? props.t : (key) => key;
			if (activeStore === null) return null;
			const flags = useStoreSnapshot(activeStore.subscribe, activeStore.getSnapshot);
			const entryStore = activeEntryStore ?? EMPTY_ENTRY_STORE;
			return h("div", { className: "uit_section" },
				h("div", { className: "uit_intro" },
					h("div", { className: "uit_title" }, t("title")),
					h("div", { className: "uit_description" }, t("description"))
				),
				h("div", { className: "uit_list" },
					FEATURES.flatMap((feature) => {
						const enabled = flags[feature.id] !== false;
						const row = h("div", { key: feature.id, className: "uit_row" },
							h("div", { className: "uit_text" },
								h("div", { className: "uit_label" }, t(feature.titleKey)),
								h("div", { className: "uit_hint" }, t(feature.hintKey))
							),
							h(Switch, {
								checked: enabled,
								label: t(feature.titleKey),
								onChange: (next) => {
									if (activeStore === null) return;
									activeStore.set(feature.id, next);
									if (activeRunner !== null) activeRunner.set(feature.id, next);
								}
							})
						);
						if (feature.id !== "sidebarEntries" || !enabled) return [row];
						return [row, h(SidebarEntriesManager, {
							key: feature.id + "-manager",
							store: entryStore,
							t
						})];
					})
				)
			);
		}
		//#endregion

		//#region plugin body
		const inject = ["slots", "locale"];

		/** @param {any} ctx */
		function apply(ctx) {
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "@local/dsh-ui-toolkit";
				tag.dataset.pluginCss = cssTagId;
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => tag.remove();
			}, "ui-toolkit: styles");

			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "ui-toolkit: dictionaries");
			const translate = typeof ctx.locale.bind === "function" ? ctx.locale.bind(NS) : (key) => key;

			const store = createFlagsStore(createPreferenceStorage());
			const entryStore = createSidebarEntryStore({
				slots: ctx.slots,
				locale: ctx.locale,
				storage: createPreferenceStorage(ENTRY_COOKIE_NAME)
			});
			const runner = createFeatureRunner(ctx, require);
			sidebarEntriesHost = entryStore;
			activeStore = store;
			activeRunner = runner;
			activeEntryStore = entryStore;
			ctx.effect(() => entryStore.start(), "ui-toolkit: sidebar entry catalog");
			runner.sync(store.read());

			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "ui-toolkit",
				order: 90,
				label: () => translate("title"),
				locale: NS
			}, UIToolkitSection));

			ctx.effect(() => () => {
				activeRunner = null;
				activeStore = null;
				activeEntryStore = null;
				sidebarEntriesHost = null;
			}, "ui-toolkit: settings state");
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		exports.UIToolkitSection = UIToolkitSection;
		exports.SidebarEntriesManager = SidebarEntriesManager;
		exports.__internals = {
			FEATURES,
			FEATURE_IDS,
			DEFAULT_FLAGS,
			STORAGE_KEY,
			normalizeFlags,
			loadFlags,
			saveFlags,
			createFlagsStore,
			createPreferenceStorage,
			COOKIE_NAME,
			createScopedContext,
			createFeatureRunner,
			ENTRY_STORAGE_KEY,
			ENTRY_COOKIE_NAME,
			normalizeEntryPrefs,
			loadEntryPrefs,
			saveEntryPrefs,
			readPanelEntries,
			orderPanelEntries,
			shiftPanelOrder,
			createSidebarEntryStore,
			css
		};
		return module.exports;
	}
});
