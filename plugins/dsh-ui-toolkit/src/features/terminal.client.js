window.__ModuleLoader__.load({
	id: "@local/dsh-ui-toolkit",
	factory: () => {
		var module = { exports: {} };
		var exports = module.exports;

		//#region terminal panel
		const NS = "ui-toolkit-terminal";
		const STORAGE_OPEN = "dsh-ui-toolkit.terminal.open.v1";
		const STORAGE_HEIGHT = "dsh-ui-toolkit.terminal.height.v1";
		const STORAGE_STARTED = "dsh-ui-toolkit.terminal.started.v1.";
		const VIEW_KEY = "bottom";
		const COLLAPSED_HEIGHT = 28;
		const DEFAULT_HEIGHT = 280;
		const MIN_HEIGHT = 140;
		const MAX_RATIO = 0.7;
		const XTERM_CSS_ID = "ui-toolkit-terminal-xterm";
		const PANEL_CSS_ID = "ui-toolkit-terminal-panel";

		const zh = {
			"title": "终端",
			"toggle": "展开或收起终端",
			"resize": "拖动调整高度，双击恢复默认高度",
			"start": "启动终端",
			"startTitle": "还没有运行中的终端",
			"startHint": "在当前会话的工作目录里启动一个 shell；收起面板不会结束进程。",
			"starting": "正在启动…",
			"connecting": "连接中…",
			"disconnected": "连接已断开",
			"reconnect": "重新连接",
			"exited": "已退出（{code}）",
			"failed": "终端错误：{message}",
			"unavailable": "终端不可用",
			"missing": "这个终端已经不存在了",
			"closed": "终端已结束",
			"new": "新建终端",
			"clear": "清屏",
			"restart": "重启终端",
			"kill": "结束终端并收起",
			"readOnly": "只读（另一个窗口持有输入）",
			"takeControl": "接管",
			"limit": "终端数量已达上限",
			"noXterm": "终端组件未能加载，请刷新页面"
		};

		const en = {
			"title": "Terminal",
			"toggle": "Toggle terminal",
			"resize": "Drag to resize, double-click to reset",
			"start": "Start terminal",
			"startTitle": "No terminal is running",
			"startHint": "Run a shell in this session's working directory. Collapsing the panel keeps the process alive.",
			"starting": "Starting…",
			"connecting": "Connecting…",
			"disconnected": "Disconnected",
			"reconnect": "Reconnect",
			"exited": "Exited ({code})",
			"failed": "Terminal error: {message}",
			"unavailable": "Terminal unavailable",
			"missing": "This terminal no longer exists",
			"closed": "Terminal closed",
			"new": "New terminal",
			"clear": "Clear",
			"restart": "Restart terminal",
			"kill": "Kill terminal and collapse",
			"readOnly": "Read-only (another window owns input)",
			"takeControl": "Take control",
			"limit": "The terminal limit has been reached",
			"noXterm": "The terminal renderer failed to load; reload the page"
		};

		const ICONS = {
			chevron: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4l4 4-4 4"/></svg>',
			terminal: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="1.6" y="2.6" width="12.8" height="10.8" rx="2.4"/><path d="M4.5 6.2l1.9 1.9-1.9 1.9M8.4 10h3.1"/></svg>',
			terminalLarge: '<svg viewBox="0 0 28 28" width="30" height="30" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="22" height="19" rx="4"/><path d="M7.5 10.5l3.4 3.4-3.4 3.4M14 17.5h6"/></svg>',
			clear: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5h10M6.2 4.5V3.2h3.6v1.3M4.6 4.5l.6 8.1h5.6l.6-8.1"/></svg>',
			restart: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.8V5.6h-2.8"/></svg>',
			kill: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4.2 4.2l7.6 7.6M11.8 4.2l-7.6 7.6"/></svg>'
		};

		const css = [
			".uit-term{--uit-term-header:28px;position:relative;box-sizing:border-box;display:flex;flex-direction:column;flex:0 0 auto;align-self:flex-end;width:100%;min-height:0;overflow:hidden;border-top:.5px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}",
			".uit-term[data-open=closed]{width:min(300px,calc(100% - 24px));margin-right:12px;border:.5px solid var(--dsw-alias-border-l3);border-bottom:0;border-radius:10px 10px 0 0;box-shadow:0 -6px 18px rgba(0,0,0,.08)}",
			".uit-term__grip{position:absolute;z-index:3;top:-3px;left:0;right:0;height:6px;cursor:row-resize}",
			".uit-term[data-open=closed] .uit-term__grip{display:none}",
			".uit-term__grip:hover:after{content:'';position:absolute;top:2px;left:50%;width:36px;height:2px;margin-left:-18px;border-radius:2px;background:var(--dsw-alias-border-l3)}",
			".uit-term__bar{display:flex;align-items:center;height:var(--uit-term-header);flex:none;padding:0 4px 0 6px;gap:4px;background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base))}",
			".uit-term__toggle{display:flex;align-items:center;gap:7px;min-width:0;flex:1;height:24px;padding:0 4px;border:0;border-radius:6px;background:transparent;color:inherit;font:inherit;cursor:pointer;text-align:left}",
			".uit-term__toggle:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".uit-term__toggle:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-1px}",
			".uit-term__chevron{display:grid;place-items:center;color:var(--dsw-alias-label-tertiary);transition:transform .15s ease}",
			".uit-term[data-open=open] .uit-term__chevron{transform:rotate(90deg)}",
			".uit-term__icon{display:grid;place-items:center;color:var(--dsw-alias-label-secondary)}",
			".uit-term__title{font-size:12px;font-weight:500;white-space:nowrap}",
			".uit-term__status{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;color:var(--dsw-alias-label-tertiary)}",
			".uit-term__hint{margin-left:auto;flex:none;font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--dsw-alias-label-caption,var(--dsw-alias-label-tertiary));opacity:.8}",
			".uit-term__actions{display:flex;align-items:center;gap:2px;flex:none;margin-left:auto}",
			".uit-term[data-open=closed] .uit-term__actions{display:none}",
			".uit-term__action{display:grid;place-items:center;width:24px;height:24px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer}",
			".uit-term__action:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".uit-term__action:disabled{opacity:.35;cursor:default}",
			".uit-term__action:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-1px}",
			".uit-term__body{position:relative;display:flex;flex:1;min-height:0;flex-direction:column}",
			".uit-term[data-open=closed] .uit-term__body{display:none}",
			".uit-term__screen{flex:1;min-height:0;position:relative;padding:2px 6px 6px 10px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);overflow:hidden}",
			".uit-term__screen[hidden]{display:none}",
			".uit-term__screen .xterm{height:100%}",
			".uit-term__screen .xterm-viewport{background:transparent!important}",
			".uit-term__start{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:16px;text-align:center;background:var(--dsw-alias-bg-base)}",
			".uit-term__start[hidden]{display:none}",
			".uit-term__startIcon{display:grid;place-items:center;color:var(--dsw-alias-label-tertiary)}",
			".uit-term__startTitle{margin:0;font-size:13px;font-weight:500;color:var(--dsw-alias-label-primary)}",
			".uit-term__startHint{margin:0;max-width:440px;font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}",
			".uit-term__startButton{margin-top:4px;height:28px;padding:0 14px;border:0;border-radius:7px;background:var(--dsw-alias-state-business-primary,#3b6ce7);color:#fff;font-size:12px;font-weight:500;cursor:pointer}",
			".uit-term__startButton:hover{filter:brightness(1.06)}",
			".uit-term__startButton:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}"
		].join("");

		/** Lazily loaded package-local xterm chunk. */
		let xtermLib;
		let xtermPromise;

		/** Load the xterm renderer chunk once; the panel starts without it. */
		function loadXterm() {
			if (xtermLib !== undefined) return Promise.resolve(xtermLib);
			if (xtermPromise !== undefined) return xtermPromise;
			if (typeof require === "undefined" || typeof require.async !== "function") {
				return Promise.reject(new Error("client chunk loader unavailable"));
			}
			xtermPromise = require.async("./client.terminal.js").then(
				(loaded) => {
					xtermLib = loaded;
					globalThis.__DSH_UI_TOOLKIT_XTERM__ = loaded;
					return loaded;
				},
				(error) => {
					xtermPromise = undefined;
					throw error;
				}
			);
			return xtermPromise;
		}

		/** @param {string} key @param {unknown} fallback */
		function readJSON(key, fallback) {
			try {
				const raw = globalThis.localStorage?.getItem(key);
				if (raw === null || raw === undefined) return fallback;
				return JSON.parse(raw);
			} catch (_error) {
				return fallback;
			}
		}

		/** @param {string} key @param {unknown} value */
		function writeJSON(key, value) {
			try {
				globalThis.localStorage?.setItem(key, JSON.stringify(value));
			} catch (_error) {
				// Storage may be unavailable; the panel still works for this page.
			}
		}

		function readBoolean(key, fallback) {
			const value = readJSON(key, fallback);
			return typeof value === "boolean" ? value : fallback;
		}

		function readNumber(key, fallback) {
			const value = readJSON(key, fallback);
			return typeof value === "number" && Number.isFinite(value) ? value : fallback;
		}

		function startedKey(sessionId) {
			return STORAGE_STARTED + sessionId;
		}

		function hasStarted(sessionId) {
			try {
				return globalThis.localStorage?.getItem(startedKey(sessionId)) === "1";
			} catch (_error) {
				return false;
			}
		}

		function markStarted(sessionId, value) {
			try {
				if (value) globalThis.localStorage?.setItem(startedKey(sessionId), "1");
				else globalThis.localStorage?.removeItem(startedKey(sessionId));
			} catch (_error) {
				// Best effort.
			}
		}

		function contentIdFor(sessionId) {
			return "ui-toolkit.terminal:" + sessionId;
		}

		function shortcutLabel() {
			const platform = document.documentElement.getAttribute("data-platform");
			const mac = platform === "darwin" || /Mac/i.test(navigator.platform);
			return mac ? "\u2318\u21e7`" : "Ctrl+Shift+`";
		}

		/** @param {string} tag @param {string} [className] @param {Record<string, string>} [attributes] */
		function createElement(tag, className, attributes) {
			const node = document.createElement(tag);
			if (className) node.className = className;
			if (attributes !== undefined) {
				for (const [key, value] of Object.entries(attributes)) {
					if (value === undefined) continue;
					node.setAttribute(key, value);
				}
			}
			return node;
		}

		function insertStyleTag(id, text) {
			if (document.querySelector('style[data-plugin-css="' + id + '"]') !== null) return null;
			const tag = document.createElement("style");
			tag.dataset.plugin = "@local/dsh-ui-toolkit";
			tag.dataset.pluginCss = id;
			tag.textContent = text;
			document.head.appendChild(tag);
			return tag;
		}

		/**
		 * Build the terminal panel and wire it to the built-in terminal controller.
		 * @param {any} ctx - Client context with webTerminals, locale and shortcuts.
		 * @param {(key: string, params?: Record<string, string>) => string} t - Bound translator.
		 */
		function createTerminalPanel(ctx, t) {
			const terminals = ctx.webTerminals;
			if (terminals === undefined || terminals === null) return { mount: () => () => {} };

			let open = readBoolean(STORAGE_OPEN, false);
			let height = readNumber(STORAGE_HEIGHT, DEFAULT_HEIGHT);
			let sessionId;
			let root;
			let center;
			let panel;
			let bar;
			let toggle;
			let titleNode;
			let statusNode;
			let hintNode;
			let actions;
			let clearButton;
			let restartButton;
			let killButton;
			let body;
			let screen;
			let start;
			let startSignature = "";
			let frame = 0;
			let disposed = false;

			/** @type {any} */
			let view;
			/** @type {string | undefined} */
			let viewSessionId;
			/** @type {(() => void) | undefined} */
			let unsubscribeView;
			/** @type {(() => void) | undefined} */
			let detachHandle;
			/** @type {any} */
			let terminal;
			/** @type {any} */
			let fit;
			/** @type {any} */
			let input;
			/** @type {ResizeObserver | undefined} */
			let screenObserver;
			/** @type {MutationObserver | undefined} */
			let themeObserver;
			let lastRevision = 0;

			/** @type {Map<string, { sessionId: string, contentId: string, tabId: string }>} */
			const holds = new Map();
			let baseTabs = [];
			let retainTabsOriginal;
			let retainTabsBound;

			const observer = new MutationObserver(scheduleSync);
			const onWindowResize = () => {
				if (!open || panel === undefined) return;
				const next = clampHeight(height);
				if (next !== height) {
					height = next;
					panel.style.height = next + "px";
				}
			};
			window.addEventListener("resize", onWindowResize);

			function maxHeight() {
				const available = center !== undefined && center.isConnected ? center.clientHeight : window.innerHeight;
				return Math.max(MIN_HEIGHT, Math.floor(available * MAX_RATIO));
			}

			/** @param {number} value */
			function clampHeight(value) {
				const numeric = Number.isFinite(value) ? value : DEFAULT_HEIGHT;
				return Math.min(Math.max(Math.round(numeric), MIN_HEIGHT), maxHeight());
			}

			function scheduleSync() {
				if (disposed || frame !== 0) return;
				frame = requestAnimationFrame(() => {
					frame = 0;
					sync();
				});
			}

			function buildPanel() {
				panel = createElement("section", "uit-term", { "data-ui-toolkit-terminal": "", "aria-label": t("title") });
				panel.style.flex = "0 0 auto";
				panel.style.minHeight = "0";

				const grip = createElement("div", "uit-term__grip", { role: "separator", "aria-orientation": "horizontal", title: t("resize") });
				grip.addEventListener("pointerdown", beginDrag);
				grip.addEventListener("dblclick", (event) => {
					event.preventDefault();
					height = clampHeight(DEFAULT_HEIGHT);
					panel.style.height = height + "px";
					writeJSON(STORAGE_HEIGHT, height);
					anchorScroll();
				});

				bar = createElement("div", "uit-term__bar");
				toggle = createElement("button", "uit-term__toggle", { type: "button", "aria-expanded": String(open) });
				const chevron = createElement("span", "uit-term__chevron");
				chevron.innerHTML = ICONS.chevron;
				const icon = createElement("span", "uit-term__icon");
				icon.innerHTML = ICONS.terminal;
				titleNode = createElement("span", "uit-term__title");
				titleNode.textContent = t("title");
				statusNode = createElement("span", "uit-term__status", { role: "status" });
				hintNode = createElement("kbd", "uit-term__hint");
				hintNode.textContent = shortcutLabel();
				toggle.append(chevron, icon, titleNode, statusNode, hintNode);
				toggle.addEventListener("click", () => setOpen(!open));

				actions = createElement("div", "uit-term__actions");
				clearButton = actionButton("clear", ICONS.clear, t("clear"), () => {
					if (terminal === undefined) return;
					if (view !== undefined && view.state.getSnapshot().writable) view.write("\u000c");
					else terminal.clear();
					focusTerminal();
				});
				restartButton = actionButton("restart", ICONS.restart, t("restart"), () => restart());
				killButton = actionButton("kill", ICONS.kill, t("kill"), () => kill());
				actions.append(clearButton, restartButton, killButton);

				bar.append(toggle, actions);

				body = createElement("div", "uit-term__body");
				screen = createElement("div", "uit-term__screen");
				screen.addEventListener("pointerdown", () => focusTerminal());
				start = createElement("div", "uit-term__start");
				body.append(screen, start);

				panel.append(grip, bar, body);
				updateChrome();
			}

			/** @param {string} action @param {string} icon @param {string} label @param {() => void} run */
			function actionButton(action, icon, label, run) {
				const button = createElement("button", "uit-term__action", { type: "button", "data-action": action, title: label, "aria-label": label });
				button.innerHTML = icon;
				button.addEventListener("click", (event) => {
					event.stopPropagation();
					run();
				});
				return button;
			}

			function updateChrome() {
				if (panel === undefined) return;
				panel.dataset.open = open ? "open" : "closed";
				panel.style.height = (open ? height : COLLAPSED_HEIGHT) + "px";
				toggle.setAttribute("aria-expanded", String(open));
				toggle.title = t("toggle");
				updateHint();
				if (clearButton !== undefined) clearButton.disabled = terminal === undefined;
				if (killButton !== undefined) killButton.disabled = view === undefined;
			}

			function updateHint() {
				if (hintNode === undefined) return;
				hintNode.hidden = open || statusNode.textContent !== "";
			}

			function setOpen(next) {
				if (open === next) {
					if (next && view === undefined && sessionId !== undefined && hasStarted(sessionId)) ensureView();
					return;
				}
				open = next;
				writeJSON(STORAGE_OPEN, open);
				updateChrome();
				if (open) {
					if (view === undefined && sessionId !== undefined) {
						if (hasStarted(sessionId)) ensureView();
						else renderStart(undefined);
					}
					attachTransport();
					renderState();
					anchorScroll();
					setTimeout(focusTerminal, 80);
				} else {
					detachTransport();
				}
				anchorScroll();
			}

			function sync() {
				if (disposed) return;
				if (document.querySelector('[role="dialog"][aria-modal="true"]') !== null) {
					hidePanel();
					return;
				}
				const anchor = document.querySelector('[data-slot="main.conversation"]');
				if (anchor === null) {
					hidePanel();
					return;
				}
				const main = anchor.closest('[data-slot="main"]');
				const centerEl = main === null ? undefined : main.parentElement;
				const rootEl = anchor.firstElementChild;
				if (centerEl === undefined || centerEl === null || rootEl === null) {
					hidePanel();
					return;
				}
				const sessionNode = rootEl.querySelector("[data-conversation-session]") ?? anchor.querySelector("[data-conversation-session]");
				const nextSession = sessionNode === null ? undefined : sessionNode.getAttribute("data-conversation-session") ?? undefined;
				if (nextSession === undefined) {
					hidePanel();
					return;
				}
				if (panel === undefined) buildPanel();
				if (panel.parentElement !== centerEl) centerEl.appendChild(panel);
				if (center !== centerEl) center = centerEl;
				if (root !== rootEl) {
					restoreRoot();
					root = rootEl;
					root.style.flex = "1 1 0";
					root.style.minHeight = "0";
				}
				if (sessionId !== nextSession) {
					detachTransport();
					dropView();
					sessionId = nextSession;
					if (hasStarted(sessionId)) ensureView();
					else renderStart(undefined);
				} else if (open && view === undefined && hasStarted(sessionId)) {
					ensureView();
				}
				updateChrome();
				updateStatus(view === undefined ? undefined : view.state.getSnapshot());
				if (open) {
					attachTransport();
					renderState();
				}
			}

			function hidePanel() {
				detachTransport();
				if (panel !== undefined && panel.parentElement !== null) panel.remove();
				restoreRoot();
				center = undefined;
			}

			function restoreRoot() {
				if (root === undefined) return;
				root.style.removeProperty("flex");
				root.style.removeProperty("min-height");
				root = undefined;
			}

			function ensureView() {
				if (sessionId === undefined || !hasStarted(sessionId)) return undefined;
				if (view !== undefined && viewSessionId === sessionId) return view;
				dropView();
				const contentId = contentIdFor(sessionId);
				try {
					view = terminals.view(sessionId, VIEW_KEY, contentId);
				} catch (error) {
					renderStart({ phase: "failed", error: error instanceof Error ? error.message : String(error) });
					return undefined;
				}
				viewSessionId = sessionId;
				addHold(sessionId, contentId);
				markStarted(sessionId, true);
				subscribeView();
				if (open) attachTransport();
				return view;
			}

			function subscribeView() {
				if (unsubscribeView !== undefined) {
					unsubscribeView();
					unsubscribeView = undefined;
				}
				if (view === undefined) return;
				unsubscribeView = view.state.subscribe(renderState);
			}

			function dropView() {
				if (unsubscribeView !== undefined) {
					unsubscribeView();
					unsubscribeView = undefined;
				}
				detachTransport();
				view = undefined;
				viewSessionId = undefined;
				lastRevision = 0;
				updateChrome();
			}

			function closeCurrent() {
				const closing = view;
				const closingSession = viewSessionId ?? sessionId;
				dropView();
				if (closingSession === undefined) return;
				removeHold(closingSession);
				markStarted(closingSession, false);
				if (closing === undefined) return;
				try {
					terminals.close(closingSession, VIEW_KEY, contentIdFor(closingSession), closing.id);
				} catch (_error) {
					// The controller keeps a retryable cleanup request.
				}
			}

			function startFresh() {
				if (sessionId === undefined) return;
				if (view !== undefined) closeCurrent();
				if (!hasStarted(sessionId)) markStarted(sessionId, true);
				ensureView();
				if (!open) {
					open = true;
					writeJSON(STORAGE_OPEN, open);
				}
				updateChrome();
				attachTransport();
				renderState();
				anchorScroll();
				setTimeout(focusTerminal, 80);
			}

			function restart() {
				if (sessionId === undefined) return;
				startFresh();
			}

			function kill() {
				closeCurrent();
				if (open) {
					open = false;
					writeJSON(STORAGE_OPEN, open);
				}
				updateChrome();
				anchorScroll();
			}

			function attachTransport() {
				if (!open || view === undefined || detachHandle !== undefined) return;
				try {
					detachHandle = view.mount();
				} catch (error) {
					console.warn("ui-toolkit: terminal attach failed", error);
				}
			}

			function detachTransport() {
				destroyTerminal();
				if (detachHandle !== undefined) {
					const detach = detachHandle;
					detachHandle = undefined;
					try {
						detach();
					} catch (_error) {
						// Detaching only releases browser work.
					}
				}
			}

			function renderState() {
				if (disposed || view === undefined) {
					if (open) renderStart(undefined);
					return;
				}
				const snapshot = view.state.getSnapshot();
				updateStatus(snapshot);
				if (!open) {
					updateChrome();
					return;
				}
				if (snapshot.info === undefined) {
					destroyTerminal();
					renderStart(snapshot);
					return;
				}
				start.hidden = true;
				screen.hidden = false;
				ensureTerminal(snapshot);
				applySnapshot(snapshot);
				updateChrome();
			}

			function updateStatus(snapshot) {
				if (statusNode === undefined) return;
				let text = "";
				if (snapshot === undefined) text = "";
				else if (snapshot.issue === "missingTerminal") text = t("missing");
				else if (snapshot.issue === "terminalLimit") text = t("limit");
				else if (snapshot.phase === "loading" || snapshot.phase === "idle") text = t("starting");
				else if (snapshot.phase === "creating") text = t("starting");
				else if (snapshot.phase === "connecting") text = t("connecting");
				else if (snapshot.phase === "disconnected") text = t("disconnected");
				else if (snapshot.phase === "failed") text = t("unavailable");
				else if (snapshot.info !== undefined && snapshot.info.state === "exited") text = t("exited", { code: String(snapshot.info.exitCode ?? "\u2014") });
				else if (snapshot.info !== undefined && snapshot.info.state === "failed") text = t("unavailable");
				else if (snapshot.info !== undefined && snapshot.info.state === "running" && !snapshot.writable) text = t("readOnly");
				statusNode.textContent = text;
				updateHint();
			}

			function renderStart(snapshot) {
				if (start === undefined) return;
				screen.hidden = true;
				start.hidden = false;
				let title = t("startTitle");
				let hint = t("startHint");
				let action = t("start");
				if (snapshot !== undefined) {
					if (snapshot.issue === "missingTerminal") {
						title = t("missing");
						hint = "";
						action = t("new");
					} else if (snapshot.issue === "terminalLimit") {
						title = t("limit");
						hint = "";
						action = t("new");
					} else if (snapshot.phase === "failed") {
						title = t("unavailable");
						hint = snapshot.error === undefined ? "" : t("failed", { message: String(snapshot.error) });
						action = t("new");
					} else if (snapshot.phase === "closed") {
						title = t("closed");
						hint = "";
						action = t("new");
					} else {
						title = t("starting");
						hint = "";
						action = "";
					}
				}
				const signature = title + "\u0000" + hint + "\u0000" + action;
				if (signature === startSignature) return;
				startSignature = signature;
				start.replaceChildren();
				if (action === "") {
					start.append(createElement("p", "uit-term__startTitle"));
					start.lastElementChild.textContent = title;
					return;
				}
				const icon = createElement("div", "uit-term__startIcon");
				icon.innerHTML = ICONS.terminalLarge;
				const heading = createElement("p", "uit-term__startTitle");
				heading.textContent = title;
				start.append(icon, heading);
				if (hint !== "") {
					const detail = createElement("p", "uit-term__startHint");
					detail.textContent = hint;
					start.append(detail);
				}
				const button = createElement("button", "uit-term__startButton", { type: "button" });
				button.textContent = action;
				button.addEventListener("click", () => startFresh());
				start.append(button);
			}

			function ensureTerminal(snapshot) {
				if (terminal !== undefined) return;
				const lib = xtermLib ?? globalThis.__DSH_UI_TOOLKIT_XTERM__;
				if (lib === undefined) {
					renderStart({ phase: "loading" });
					loadXterm().then(
						() => {
							if (!disposed) renderState();
						},
						(error) => {
							if (!disposed) renderStart({ phase: "failed", error: error instanceof Error ? error.message : t("noXterm") });
						}
					);
					return;
				}
				if (lib.css !== undefined) insertStyleTag(XTERM_CSS_ID, lib.css);
				const theme = readTheme();
				const environment = snapshot.environment;
				terminal = new lib.Terminal({
					cursorBlink: true,
					minimumContrastRatio: 4.5,
					fontSize: readFontSize(),
					fontFamily: readFontFamily(),
					scrollback: environment === undefined ? 1000 : environment.scrollback,
					theme
				});
				fit = new lib.FitAddon();
				terminal.loadAddon(fit);
				terminal.open(screen);
				terminal.textarea?.setAttribute("aria-label", t("title"));
				input = terminal.onData((data) => {
					if (view !== undefined) view.write(data);
				});
				screenObserver = new ResizeObserver(() => fitTerminal());
				screenObserver.observe(screen);
				lastRevision = 0;
				themeObserver = new MutationObserver(() => {
					if (terminal !== undefined) terminal.options.theme = readTheme();
				});
				themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-ds-dark-theme", "data-theme"] });
				themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class", "style", "data-ds-dark-theme"] });
			}

			function destroyTerminal() {
				if (themeObserver !== undefined) {
					themeObserver.disconnect();
					themeObserver = undefined;
				}
				if (screenObserver !== undefined) {
					screenObserver.disconnect();
					screenObserver = undefined;
				}
				if (input !== undefined) {
					input.dispose();
					input = undefined;
				}
				if (terminal !== undefined) {
					terminal.dispose();
					terminal = undefined;
				}
				fit = undefined;
				lastRevision = 0;
			}

			function applySnapshot(snapshot) {
				if (terminal === undefined || view === undefined) return;
				const render = snapshot.render;
				if (render !== undefined && render.revision > lastRevision) {
					lastRevision = render.revision;
					const frameData = render.frame;
					if (frameData.type === "snapshot") {
						terminal.reset();
						terminal.resize(frameData.info.cols, frameData.info.rows);
					}
					terminal.write(frameData.type === "snapshot" ? frameData.screen : frameData.data, () => {
						view?.acknowledge(render.revision);
					});
				}
				terminal.options.disableStdin = !snapshot.writable;
				if (snapshot.writable) fitTerminal();
			}

			function fitTerminal() {
				if (terminal === undefined || fit === undefined || view === undefined || !open) return;
				const snapshot = view.state.getSnapshot();
				const environment = snapshot.environment;
				if (environment === undefined || !snapshot.writable) return;
				const dimensions = fit.proposeDimensions();
				if (dimensions === undefined) return;
				const cols = Math.min(dimensions.cols, environment.maxCols);
				const rows = Math.min(dimensions.rows, environment.maxRows);
				if (cols < 2 || rows < 1) return;
				if (snapshot.info !== undefined && snapshot.info.cols === cols && snapshot.info.rows === rows) return;
				terminal.resize(cols, rows);
				view.resize(cols, rows);
			}

			function focusTerminal() {
				if (!open || terminal === undefined || view === undefined) return;
				const snapshot = view.state.getSnapshot();
				if (snapshot.writable) terminal.focus();
			}

			function readFontSize() {
				const raw = getComputedStyle(document.body).getPropertyValue("--dsh-terminal-font-size");
				const size = Number.parseFloat(raw);
				return Number.isFinite(size) && size > 0 ? size : 12;
			}

			function readFontFamily() {
				const raw = getComputedStyle(document.body).getPropertyValue("--dsh-font-family-terminal").trim();
				const stack = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
				return raw === "" ? stack : raw + ", " + stack;
			}

			function readTheme() {
				const probe = screen === undefined ? document.body : screen;
				const style = getComputedStyle(probe);
				const background = style.backgroundColor === "rgba(0, 0, 0, 0)" ? "#111418" : style.backgroundColor;
				const foreground = style.color === "" ? "#e6e8eb" : style.color;
				return {
					background,
					foreground,
					cursor: foreground,
					selectionBackground: "rgba(90, 130, 255, 0.32)"
				};
			}

			function beginDrag(event) {
				if (!open || panel === undefined) return;
				event.preventDefault();
				const startY = event.clientY;
				const startHeight = panel.offsetHeight;
				panel.dataset.dragging = "true";
				const move = (moveEvent) => {
					const next = Math.min(Math.max(startHeight + (startY - moveEvent.clientY), MIN_HEIGHT), maxHeight());
					height = next;
					panel.style.height = next + "px";
					fitTerminal();
				};
				const end = () => {
					window.removeEventListener("pointermove", move);
					window.removeEventListener("pointerup", end);
					window.removeEventListener("pointercancel", end);
					if (panel !== undefined) delete panel.dataset.dragging;
					writeJSON(STORAGE_HEIGHT, height);
					anchorScroll();
				};
				window.addEventListener("pointermove", move);
				window.addEventListener("pointerup", end);
				window.addEventListener("pointercancel", end);
			}

			function anchorScroll() {
				if (root === undefined) return;
				const scroller = root.querySelector("[data-conversation-scroll]");
				if (scroller === null) return;
				const atBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 40;
				if (!atBottom) return;
				requestAnimationFrame(() => {
					scroller.scrollTop = scroller.scrollHeight;
				});
			}

			function installHolds() {
				if (retainTabsOriginal !== undefined) return;
				const original = terminals.retainTabs;
				if (typeof original !== "function") return;
				retainTabsOriginal = original;
				retainTabsBound = original.bind(terminals);
				baseTabs = Array.isArray(terminals.openTabs) ? [...terminals.openTabs] : [];
				terminals.retainTabs = function (tabs) {
					baseTabs = Array.isArray(tabs) ? [...tabs] : [];
					return retainTabsBound([...baseTabs, ...holds.values()]);
				};
				terminals.retainTabs([...baseTabs]);
			}

			function addHold(holdSession, contentId) {
				holds.set(holdSession, { sessionId: holdSession, contentId, tabId: VIEW_KEY });
				syncHolds();
			}

			function removeHold(holdSession) {
				holds.delete(holdSession);
				syncHolds();
			}

			function syncHolds() {
				if (retainTabsBound === undefined) return;
				try {
					retainTabsBound([...baseTabs, ...holds.values()]);
				} catch (error) {
					console.warn("ui-toolkit: terminal hold sync failed", error);
				}
			}

			function mount() {
				buildPanel();
				installHolds();
				observer.observe(document.body, {
					childList: true,
					subtree: true,
					attributes: true,
					attributeFilter: ["data-conversation-session", "data-phase", "data-content-phase"]
				});
				sync();
				return () => {
					disposed = true;
					observer.disconnect();
					if (frame !== 0) cancelAnimationFrame(frame);
					window.removeEventListener("resize", onWindowResize);
					detachTransport();
					dropView();
					restoreRoot();
					if (panel !== undefined && panel.parentElement !== null) panel.remove();
					holds.clear();
					if (retainTabsOriginal !== undefined) {
						terminals.retainTabs = retainTabsOriginal;
						retainTabsOriginal = undefined;
						retainTabsBound = undefined;
						try {
							terminals.retainTabs(baseTabs);
						} catch (_error) {
							// The sidebar re-establishes its own holds on its next sync.
						}
					}
					document.querySelector('style[data-plugin-css="' + PANEL_CSS_ID + '"]')?.remove();
					document.querySelector('style[data-plugin-css="' + XTERM_CSS_ID + '"]')?.remove();
				};
			}

			return { mount, toggle: () => setOpen(!open), restart, kill, startFresh };
		}

		/**
		 * Register the panel toggle with the shared shortcut service.
		 * @param {any} ctx
		 * @param {{ setOpen: (open: boolean) => void }} panel
		 * @param {(key: string) => string} t
		 */
		function registerShortcut(ctx, panel, t) {
			const defaults = {
				"desktop:macos": { code: "Backquote", modifiers: ["primary", "shift"] },
				"desktop:windows": { code: "Backquote", modifiers: ["primary", "shift"] },
				"desktop:linux": { code: "Backquote", modifiers: ["primary", "shift"] },
				"web:macos": { code: "Backquote", modifiers: ["primary", "shift"] },
				"web:windows": { code: "Backquote", modifiers: ["primary", "shift"] }
			};
			try {
				const dispose = ctx.shortcuts.register({
					id: "ui-toolkit.terminal.toggle",
					label: () => t("toggle"),
					aliases: ["terminal", "bottom terminal"],
					defaults,
					regions: ["page", "editable", "terminal"],
					modals: [],
					resolve: () => ({
						status: "handled",
						run: () => panel.toggle()
					})
				});
				return () => {
					if (typeof dispose === "function") dispose();
					else if (dispose !== undefined && typeof dispose.dispose === "function") dispose.dispose();
				};
			} catch (error) {
				console.warn("ui-toolkit: terminal shortcut unavailable", error);
				return () => {};
			}
		}

		const inject = ["webTerminals", "shortcuts", "locale"];

		/** @param {any} ctx */
		function apply(ctx) {
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "ui-toolkit: terminal dictionaries");
			ctx.effect(() => {
				const tag = insertStyleTag(PANEL_CSS_ID, css);
				return () => {
					if (tag !== null) tag.remove();
				};
			}, "ui-toolkit: terminal styles");
			const panel = createTerminalPanel(ctx, t);
			ctx.effect(() => panel.mount(), "ui-toolkit: terminal panel");
			ctx.effect(() => registerShortcut(ctx, panel, t), "ui-toolkit: terminal shortcut");
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
