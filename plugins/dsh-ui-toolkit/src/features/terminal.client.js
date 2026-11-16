window.__ModuleLoader__.load({
	id: "@local/dsh-ui-toolkit",
	factory: () => {
		var module = { exports: {} };
		var exports = module.exports;

		//#region terminal dock
		const NS = "ui-toolkit-terminal";
		const VIEW_KEY = "bottom";
		const XTERM_CSS_ID = "ui-toolkit-terminal-xterm";
		const PANEL_CSS_ID = "ui-toolkit-terminal-panel";
		const DEFAULT_HEIGHT = 280;
		const MIN_HEIGHT = 140;
		const MAX_RATIO = 0.7;

		const zh = {
			"title": "终端",
			"open": "打开终端",
			"close": "关闭终端",
			"toggle": "展开或收起终端",
			"resize": "拖动调整高度，双击恢复默认高度",
			"starting": "正在启动…",
			"running": "运行中",
			"connecting": "连接中…",
			"disconnected": "连接已断开",
			"exited": "已退出（{code}）",
			"failed": "终端错误：{message}",
			"unavailable": "终端不可用",
			"missing": "这个终端已经不存在了",
			"limit": "终端数量已达上限",
			"clear": "清屏",
			"restart": "重启终端",
			"retry": "重试",
			"readOnly": "只读（另一个窗口持有输入）",
			"noXterm": "终端组件未能加载，请刷新页面"
		};

		const en = {
			"title": "Terminal",
			"open": "Open terminal",
			"close": "Close terminal",
			"toggle": "Toggle terminal",
			"resize": "Drag to resize, double-click to reset",
			"starting": "Starting…",
			"running": "Running",
			"connecting": "Connecting…",
			"disconnected": "Disconnected",
			"exited": "Exited ({code})",
			"failed": "Terminal error: {message}",
			"unavailable": "Terminal unavailable",
			"missing": "This terminal no longer exists",
			"limit": "The terminal limit has been reached",
			"clear": "Clear",
			"restart": "Restart terminal",
			"retry": "Retry",
			"readOnly": "Read-only (another window owns input)",
			"noXterm": "The terminal renderer failed to load; reload the page"
		};

		const ICONS = {
			terminal: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="1.7" y="2.7" width="12.6" height="10.6" rx="2.4"/><path d="M4.6 6.2l1.9 1.9-1.9 1.9M8.5 10h3"/></svg>',
			terminalLarge: '<svg viewBox="0 0 28 28" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="22" height="19" rx="4"/><path d="M7.5 10.5l3.4 3.4-3.4 3.4M14 17.5h6"/></svg>',
			clear: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5h10M6.2 4.5V3.2h3.6v1.3M4.6 4.5l.6 8.1h5.6l.6-8.1"/></svg>',
			restart: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.8V5.6h-2.8"/></svg>',
			close: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4.2 4.2l7.6 7.6M11.8 4.2l-7.6 7.6"/></svg>'
		};

		const css = [
			".uit-term-pill{position:absolute;right:16px;bottom:16px;z-index:12;box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px 0 9px;border:.5px solid var(--dsw-alias-border-l2);border-radius:999px;background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base));box-shadow:0 1px 2px rgba(0,0,0,.04);color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;font-weight:500;white-space:nowrap;cursor:pointer;pointer-events:auto;transform-origin:100% 100%;transition:right .18s ease,bottom .18s ease,transform .16s ease,opacity .16s ease,background .16s ease,color .16s ease}",
			".uit-term-pill:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover);transform:translateY(-1px)}",
			".uit-term-pill:active{transform:scale(.97)}",
			".uit-term-pill:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}",
			".uit-term-pill[data-placement=header]{position:static;height:28px;padding:0 8px;border:0;border-radius:6px;background:transparent;box-shadow:none;margin-right:2px}",
			".uit-term-pill[data-placement=header]:hover{background:var(--dsw-alias-interactive-bg-hover);transform:none}",
			".uit-term-pill[data-visible=false]{opacity:0;transform:translateY(6px) scale(.9);pointer-events:none}",
			".uit-term-pill__icon{display:grid;place-items:center;color:var(--dsw-alias-label-secondary)}",
			".uit-term-panel{position:relative;box-sizing:border-box;display:flex;flex-direction:column;flex:0 0 auto;width:100%;min-height:0;height:0;opacity:0;overflow:hidden;border-top:.5px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);transition:height .26s cubic-bezier(.2,.9,.3,1),opacity .16s ease}",
			".uit-term-panel[data-dragging=true]{transition:none}",
			".uit-term-panel__grip{position:absolute;z-index:3;top:0;left:0;right:0;height:5px;cursor:row-resize}",
			".uit-term-panel__grip:hover:after{content:'';position:absolute;top:1px;left:50%;width:36px;height:2px;margin-left:-18px;border-radius:2px;background:var(--dsw-alias-border-l3)}",
			".uit-term-panel__bar{display:flex;align-items:center;gap:8px;height:34px;flex:none;padding:2px 6px 0 10px;background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base));border-bottom:.5px solid var(--dsw-alias-border-l3)}",
			".uit-term-panel__title{display:flex;align-items:center;gap:6px;min-width:0;font-size:12px;font-weight:500}",
			".uit-term-panel__icon{display:grid;place-items:center;color:var(--dsw-alias-label-secondary)}",
			".uit-term-panel__status{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary);font-size:11px;font-weight:400}",
			".uit-term-panel__actions{margin-left:auto;display:flex;align-items:center;gap:2px;flex:none}",
			".uit-term-panel__action{display:grid;place-items:center;width:24px;height:24px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:background .12s ease,color .12s ease}",
			".uit-term-panel__action:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".uit-term-panel__action:disabled{opacity:.35;cursor:default}",
			".uit-term-panel__action:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:-1px}",
			".uit-term-panel__body{position:relative;display:flex;flex:1;min-height:0;flex-direction:column;background:var(--dsw-alias-bg-base)}",
			".uit-term__screen{flex:1;min-height:0;position:relative;padding:4px 6px 8px 10px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);overflow:hidden}",
			".uit-term__screen[hidden]{display:none}",
			".uit-term__screen .xterm{height:100%}",
			".uit-term__screen .xterm-viewport{background:transparent!important}",
			".uit-term-panel__notice{position:absolute;inset:0;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:14px;text-align:center;background:var(--dsw-alias-bg-base)}",
			".uit-term-panel__notice[hidden]{display:none}",
			".uit-term-panel__noticeIcon{display:grid;place-items:center;color:var(--dsw-alias-label-tertiary)}",
			".uit-term-panel__noticeText{margin:0;max-width:440px;font-size:12px;line-height:17px;color:var(--dsw-alias-label-secondary)}",
			".uit-term-panel__retry{margin-top:2px;height:26px;padding:0 12px;border:0;border-radius:7px;background:var(--dsw-alias-state-business-primary,#3b6ce7);color:#fff;font-size:12px;font-weight:500;cursor:pointer;transition:filter .12s ease,transform .12s ease}",
			".uit-term-panel__retry[hidden]{display:none}",
			".uit-term-panel__retry:hover{filter:brightness(1.06)}",
			".uit-term-panel__retry:active{transform:scale(.97)}",
			".uit-term-panel__retry:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}",
			"@media (prefers-reduced-motion:reduce){.uit-term-pill,.uit-term-panel{transition:none!important}}"
		].join("");

		let xtermLib;
		let xtermPromise;

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

		function shortcutLabel() {
			const platform = document.documentElement.getAttribute("data-platform");
			const mac = platform === "darwin" || /Mac/i.test(navigator.platform);
			return mac ? "\u2318\u21e7`" : "Ctrl+Shift+`";
		}

		/**
		 * A floating Terminal pill plus the docked terminal panel it opens.
		 * The pill is absolutely positioned and never changes layout; the panel
		 * docks under the conversation for the lifetime of one shell.
		 * @param {any} ctx - Client context with webTerminals and locale.
		 * @param {(key: string, params?: Record<string, string>) => string} t - Bound translator.
		 */
		function createTerminalDock(ctx, t) {
			const terminals = ctx.webTerminals;
			if (terminals === undefined || terminals === null) return { mount: () => () => {} };

			let open = false;
			let closing = false;
			let height = DEFAULT_HEIGHT;
			let sessionId;
			let center;
			let pill;
			let panel;
			let statusNode;
			let notice;
			let noticeText;
			let noticeIcon;
			let retryButton;
			let screen;
			let clearButton;
			let restartButton;
			let closeButton;
			let panelAttached = false;
			let rootEl;
			let disposed = false;
			let centerPositionSet = false;
			let seatEl;
			let centerObserver;
			let seatObserver;
			let closeSerial = 0;
			let shouldFocus = false;
			let frame = 0;

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
				updatePillAnchor();
				if (open && panelAttached) {
					const next = clampHeight(height);
					if (next !== height) {
						height = next;
						panel.style.height = next + "px";
					}
				}
				fitTerminal();
			};
			window.addEventListener("resize", onWindowResize);

			function scheduleSync() {
				if (disposed || frame !== 0) return;
				frame = requestAnimationFrame(() => {
					frame = 0;
					sync();
				});
			}

			function maxHeight() {
				const available = center !== undefined && center.isConnected ? center.clientHeight : window.innerHeight;
				return Math.max(MIN_HEIGHT, Math.floor(available * MAX_RATIO));
			}

			function clampHeight(value) {
				const numeric = Number.isFinite(value) ? value : DEFAULT_HEIGHT;
				return Math.min(Math.max(Math.round(numeric), MIN_HEIGHT), maxHeight());
			}

			function buildPill() {
				pill = createElement("button", "uit-term-pill", { type: "button", "data-visible": "false" });
				const icon = createElement("span", "uit-term-pill__icon");
				icon.innerHTML = ICONS.terminal;
				const label = createElement("span");
				label.textContent = t("title");
				pill.append(icon, label);
				pill.title = t("toggle") + " (" + shortcutLabel() + ")";
				pill.setAttribute("aria-label", t("open"));
				pill.addEventListener("click", () => openPanel());
			}

			function buildPanel() {
				panel = createElement("section", "uit-term-panel", { role: "region", "aria-label": t("title"), "data-open": "false" });
				panel.style.height = "0px";
				panel.style.opacity = "0";

				const grip = createElement("div", "uit-term-panel__grip", { role: "separator", "aria-orientation": "horizontal", title: t("resize") });
				grip.addEventListener("pointerdown", beginDrag);
				grip.addEventListener("dblclick", (event) => {
					event.preventDefault();
					if (!open || !panelAttached) return;
					height = clampHeight(DEFAULT_HEIGHT);
					panel.style.height = height + "px";
					fitTerminal();
				});

				const bar = createElement("div", "uit-term-panel__bar");
				const titleCluster = createElement("div", "uit-term-panel__title");
				const icon = createElement("span", "uit-term-panel__icon");
				icon.innerHTML = ICONS.terminal;
				const title = createElement("span");
				title.textContent = t("title");
				statusNode = createElement("span", "uit-term-panel__status", { role: "status" });
				titleCluster.append(icon, title, statusNode);

				const actions = createElement("div", "uit-term-panel__actions");
				clearButton = actionButton("clear", ICONS.clear, t("clear"), () => {
					if (terminal === undefined || view === undefined) return;
					if (view.state.getSnapshot().writable) view.write("\u000c");
					else terminal.clear();
					focusTerminal();
				});
				restartButton = actionButton("restart", ICONS.restart, t("restart"), () => restart());
				closeButton = actionButton("close", ICONS.close, t("close"), () => closePanel());
				actions.append(clearButton, restartButton, closeButton);
				bar.append(titleCluster, actions);

				const body = createElement("div", "uit-term-panel__body");
				notice = createElement("div", "uit-term-panel__notice");
				notice.hidden = true;
				noticeIcon = createElement("div", "uit-term-panel__noticeIcon");
				noticeIcon.innerHTML = ICONS.terminalLarge;
				noticeText = createElement("p", "uit-term-panel__noticeText");
				retryButton = createElement("button", "uit-term-panel__retry", { type: "button" });
				retryButton.textContent = t("retry");
				retryButton.hidden = true;
				retryButton.addEventListener("click", () => restart());
				notice.append(noticeIcon, noticeText, retryButton);
				screen = createElement("div", "uit-term__screen");
				screen.addEventListener("pointerdown", () => focusTerminal());
				body.append(screen, notice);
				panel.append(grip, bar, body);
			}

			/** @param {string} action @param {string} icon @param {string} label @param {() => void} run */
			function actionButton(action, icon, label, run) {
				const button = createElement("button", "uit-term-panel__action", { type: "button", "data-action": action, title: label, "aria-label": label });
				button.innerHTML = icon;
				button.addEventListener("click", (event) => {
					event.stopPropagation();
					run();
				});
				return button;
			}

			function updatePillAnchor() {
				if (pill === undefined) return;
				const card = document.querySelector("[data-composer-card]");
				const corner = document.querySelector("[data-conversation-header-corner]");
				const centerEl = center;
				if (centerEl !== undefined && centerEl.isConnected) {
					const centerRect = centerEl.getBoundingClientRect();
					if (card !== null) {
						const cardRect = card.getBoundingClientRect();
						const width = pill.offsetWidth === 0 ? 92 : pill.offsetWidth;
						const gutter = Math.round(centerRect.right - cardRect.right);
						const inset = Math.max(0, Math.round(centerRect.bottom - cardRect.bottom));
						if (gutter >= width + inset) {
							if (pill.parentElement !== centerEl) centerEl.appendChild(pill);
							pill.dataset.placement = "dock";
							pill.style.right = inset + "px";
							pill.style.bottom = inset + "px";
							return;
						}
					}
				}
				if (corner !== null) {
					if (pill.parentElement !== corner) {
						const toggle = corner.querySelector("[data-sidebar-right-expand],[data-sidebar-right-toggle]");
						corner.insertBefore(pill, toggle ?? corner.firstElementChild);
					}
					pill.dataset.placement = "header";
					pill.style.right = "";
					pill.style.bottom = "";
					return;
				}
				if (centerEl !== undefined && centerEl.isConnected) {
					if (pill.parentElement !== centerEl) centerEl.appendChild(pill);
					pill.dataset.placement = "dock";
					pill.style.right = "16px";
					pill.style.bottom = "16px";
				}
			}

			function setPillVisible(visible) {
				if (pill === undefined) return;
				pill.dataset.visible = visible ? "true" : "false";
				pill.tabIndex = visible ? 0 : -1;
				pill.setAttribute("aria-hidden", String(!visible));
			}

			function ensureCenter(centerEl) {
				if (center === centerEl) return;
				center = centerEl;
				if (getComputedStyle(center).position === "static") {
					center.style.position = "relative";
					centerPositionSet = true;
				}
				if (centerObserver !== undefined) centerObserver.disconnect();
				centerObserver = new ResizeObserver(() => updatePillAnchor());
				centerObserver.observe(center);
			}

			function applyRootFlex() {
				const conversation = document.querySelector('[data-slot="main.conversation"]');
				const root = conversation === null ? null : conversation.firstElementChild;
				if (root === null) return;
				rootEl = root;
				root.style.flex = "1 1 0";
				root.style.minHeight = "0";
			}

			function restoreRoot() {
				if (rootEl === undefined || rootEl === null) return;
				rootEl.style.removeProperty("flex");
				rootEl.style.removeProperty("min-height");
				rootEl = undefined;
			}

			function showPanel() {
				if (panel === undefined || center === undefined) return;
				if (!panelAttached) {
					center.appendChild(panel);
					panelAttached = true;
					panel.dataset.open = "false";
					panel.style.height = "0px";
					panel.style.opacity = "0";
					applyRootFlex();
					void panel.offsetHeight;
				}
				panel.dataset.open = "true";
				panel.setAttribute("aria-hidden", "false");
				panel.style.height = clampHeight(height) + "px";
				panel.style.opacity = "1";
				setPillVisible(false);
				attachTransport();
				renderState();
			}

			function hidePanelDom() {
				if (!panelAttached) {
					restoreRoot();
					return;
				}
				panelAttached = false;
				closing = false;
				if (panel.parentElement !== null) panel.remove();
				restoreRoot();
				detachTransport();
			}

			function openPanel() {
				if (sessionId === undefined || center === undefined) return;
				closeSerial += 1;
				closing = false;
				open = true;
				ensureView();
				showPanel();
				updateChrome();
				shouldFocus = true;
				updatePillAnchor();
				setTimeout(() => {
					if (open) focusTerminal();
				}, 280);
			}

			function closePanel() {
				if (!open && !panelAttached) {
					updatePillAnchor();
					setPillVisible(true);
					return;
				}
				open = false;
				shouldFocus = false;
				closing = true;
				closeCurrent();
				setPillVisible(false);
				updateChrome();
				if (!panelAttached) {
					hidePanelDom();
					closing = false;
					updatePillAnchor();
					setPillVisible(true);
					return;
				}
				panel.dataset.open = "false";
				panel.style.height = "0px";
				panel.style.opacity = "0";
				const serial = ++closeSerial;
				setTimeout(() => {
					if (serial !== closeSerial || open) return;
					hidePanelDom();
					closing = false;
					updatePillAnchor();
					setPillVisible(true);
					const active = document.activeElement;
					if (active instanceof HTMLElement && panel.contains(active)) {
						pill.focus({ preventScroll: true });
					}
				}, 280);
			}

			function toggle() {
				if (open) closePanel();
				else openPanel();
			}

			function sync() {
				if (disposed) return;
				if (pill === undefined) buildPill();
				if (panel === undefined) buildPanel();
				const modal = document.querySelector('[role="dialog"][aria-modal="true"]');
				const anchor = document.querySelector('[data-slot="main.conversation"]');
				if (modal !== null || anchor === null) {
					hidePanelDom();
					setPillVisible(false);
					return;
				}
				const main = anchor.closest('[data-slot="main"]');
				const centerEl = main === null ? undefined : main.parentElement;
				const root = anchor.firstElementChild;
				if (centerEl === undefined || centerEl === null || root === null) {
					hidePanelDom();
					setPillVisible(false);
					return;
				}
				const sessionNode = root.querySelector("[data-conversation-session]") ?? anchor.querySelector("[data-conversation-session]");
				const nextSession = sessionNode === null ? undefined : sessionNode.getAttribute("data-conversation-session") ?? undefined;
				if (nextSession === undefined) {
					hidePanelDom();
					setPillVisible(false);
					return;
				}
				ensureCenter(centerEl);
				if (sessionId !== nextSession) {
					if (open || panelAttached) {
						open = false;
						closing = false;
						closeCurrent();
						hidePanelDom();
					}
					sessionId = nextSession;
				}
				updateChrome();
				if (open) {
					ensureView();
					if (!panelAttached) showPanel();
					else {
						attachTransport();
						renderState();
					}
					setPillVisible(false);
				} else {
					if (panelAttached && !closing) hidePanelDom();
					if (!closing && !panelAttached) {
						updatePillAnchor();
						setPillVisible(true);
					} else {
						setPillVisible(false);
					}
				}
			}

			function ensureView() {
				if (sessionId === undefined) return undefined;
				if (view !== undefined && viewSessionId === sessionId) return view;
				dropView();
				const contentId = "ui-toolkit.terminal:" + sessionId;
				try {
					terminals.close(sessionId, VIEW_KEY, contentId);
				} catch (_error) {
					// A stale binding may still be cleaned up by the controller.
				}
				try {
					view = terminals.view(sessionId, VIEW_KEY, contentId);
				} catch (error) {
					renderNotice({ phase: "failed", error: error instanceof Error ? error.message : String(error) });
					return undefined;
				}
				viewSessionId = sessionId;
				holds.set(sessionId, { sessionId, contentId, tabId: VIEW_KEY });
				syncHolds();
				subscribeView();
				attachTransport();
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
				const closingView = view;
				const closingSession = viewSessionId ?? sessionId;
				dropView();
				if (closingSession === undefined) return;
				holds.delete(closingSession);
				syncHolds();
				if (closingView === undefined) return;
				try {
					terminals.close(closingSession, VIEW_KEY, "ui-toolkit.terminal:" + closingSession, closingView.id);
				} catch (_error) {
					// The controller keeps a retryable cleanup request.
				}
			}

			function restart() {
				if (sessionId === undefined) return;
				closeCurrent();
				open = true;
				closing = false;
				closeSerial += 1;
				ensureView();
				if (!panelAttached) showPanel();
				else {
					panel.style.height = clampHeight(height) + "px";
					panel.style.opacity = "1";
					attachTransport();
					renderState();
				}
				updateChrome();
				shouldFocus = true;
				setTimeout(() => {
					if (open) focusTerminal();
				}, 200);
			}

			function attachTransport() {
				if (view === undefined || !panelAttached || detachHandle !== undefined) return;
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
					renderNotice(undefined);
					return;
				}
				const snapshot = view.state.getSnapshot();
				updateStatus(snapshot);
				if (snapshot.info === undefined) {
					destroyTerminal();
					screen.hidden = true;
					renderNotice(snapshot);
					return;
				}
				if (!notice.hidden) notice.hidden = true;
				if (screen.hidden) screen.hidden = false;
				ensureTerminal(snapshot);
				applySnapshot(snapshot);
				updateChrome();
			}

			function updateChrome() {
				if (panel === undefined) return;
				panel.dataset.open = open ? "true" : "false";
				if (clearButton !== undefined) clearButton.disabled = terminal === undefined;
				if (restartButton !== undefined) restartButton.disabled = sessionId === undefined;
				if (closeButton !== undefined) closeButton.disabled = false;
			}

			function updateStatus(snapshot) {
				if (statusNode === undefined) return;
				let text = "";
				if (snapshot !== undefined) {
					if (snapshot.issue === "missingTerminal") text = t("missing");
					else if (snapshot.issue === "terminalLimit") text = t("limit");
					else if (snapshot.phase === "loading" || snapshot.phase === "idle" || snapshot.phase === "creating") text = t("starting");
					else if (snapshot.phase === "connecting") text = t("connecting");
					else if (snapshot.phase === "disconnected") text = t("disconnected");
					else if (snapshot.phase === "failed") text = t("unavailable");
					else if (snapshot.info !== undefined && snapshot.info.state === "exited") text = t("exited", { code: String(snapshot.info.exitCode ?? "\u2014") });
					else if (snapshot.info !== undefined && snapshot.info.state === "failed") text = t("unavailable");
					else if (snapshot.info !== undefined && snapshot.info.state === "running") text = snapshot.writable ? t("running") : t("readOnly");
				}
				if (statusNode.textContent !== text) statusNode.textContent = text;
			}

			function renderNotice(snapshot) {
				if (notice === undefined) return;
				let text = t("starting");
				let retry = false;
				if (snapshot === undefined) {
					text = t("starting");
				} else if (snapshot.issue === "missingTerminal") {
					text = t("missing");
					retry = true;
				} else if (snapshot.issue === "terminalLimit") {
					text = t("limit");
					retry = true;
				} else if (snapshot.phase === "failed") {
					text = snapshot.error === undefined ? t("unavailable") : t("failed", { message: String(snapshot.error) });
					retry = true;
				} else if (snapshot.phase === "loading" || snapshot.phase === "idle" || snapshot.phase === "creating") {
					text = t("starting");
				} else if (snapshot.phase === "connecting") {
					text = t("connecting");
				} else if (snapshot.phase === "disconnected") {
					text = t("disconnected");
					retry = true;
				}
				if (notice.hidden) notice.hidden = false;
				if (noticeText.textContent !== text) noticeText.textContent = text;
				if (retryButton.hidden !== !retry) retryButton.hidden = !retry;
				if (screen.hidden !== true) screen.hidden = true;
				updateStatus(snapshot);
			}

			function ensureTerminal(snapshot) {
				if (terminal !== undefined) return;
				const lib = xtermLib ?? globalThis.__DSH_UI_TOOLKIT_XTERM__;
				if (lib === undefined) {
					renderNotice({ phase: "loading" });
					loadXterm().then(
						() => {
							if (!disposed) renderState();
						},
						(error) => {
							if (!disposed) renderNotice({ phase: "failed", error: error instanceof Error ? error.message : t("noXterm") });
						}
					);
					return;
				}
				if (lib.css !== undefined) insertStyleTag(XTERM_CSS_ID, lib.css);
				const environment = snapshot.environment;
				terminal = new lib.Terminal({
					cursorBlink: true,
					minimumContrastRatio: 4.5,
					fontSize: readFontSize(),
					fontFamily: readFontFamily(),
					scrollback: environment === undefined ? 1000 : environment.scrollback,
					theme: readTheme()
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
				terminal.options.disableStdin = !snapshot.writable || !open;
				if (snapshot.writable) {
					fitTerminal();
					if (shouldFocus) {
						shouldFocus = false;
						terminal.focus();
					}
				}
			}

			function fitTerminal() {
				if (terminal === undefined || fit === undefined || view === undefined || !panelAttached) return;
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

			function beginDrag(event) {
				if (!open || !panelAttached) return;
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
				};
				window.addEventListener("pointermove", move);
				window.addEventListener("pointerup", end);
				window.addEventListener("pointercancel", end);
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
				return { background, foreground, cursor: foreground, selectionBackground: "rgba(90, 130, 255, 0.32)" };
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

			function syncHolds() {
				if (retainTabsBound === undefined) return;
				try {
					retainTabsBound([...baseTabs, ...holds.values()]);
				} catch (error) {
					console.warn("ui-toolkit: terminal hold sync failed", error);
				}
			}

			function mount() {
				buildPill();
				buildPanel();
				installHolds();
				centerObserver = new ResizeObserver(() => updatePillAnchor());
				seatObserver = new ResizeObserver(() => updatePillAnchor());
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
					if (centerObserver !== undefined) centerObserver.disconnect();
					if (seatObserver !== undefined) seatObserver.disconnect();
					closeCurrent();
					hidePanelDom();
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
					if (pill !== undefined && pill.parentElement !== null) pill.remove();
					if (panel !== undefined && panel.parentElement !== null) panel.remove();
					restoreRoot();
					if (centerPositionSet && center !== undefined) center.style.removeProperty("position");
					document.querySelector('style[data-plugin-css="' + PANEL_CSS_ID + '"]')?.remove();
					document.querySelector('style[data-plugin-css="' + XTERM_CSS_ID + '"]')?.remove();
				};
			}

			return { mount, toggle, open: openPanel, close: closePanel, restart };
		}

		/**
		 * Register the terminal toggle with the shared shortcut service.
		 * @param {any} ctx
		 * @param {{ toggle: () => void }} dock
		 * @param {(key: string) => string} t
		 */
		function registerShortcut(ctx, dock, t) {
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
					aliases: ["terminal", "dock terminal"],
					defaults,
					regions: ["page", "editable", "terminal"],
					modals: [],
					resolve: () => ({ status: "handled", run: () => dock.toggle() })
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
			const dock = createTerminalDock(ctx, t);
			ctx.effect(() => dock.mount(), "ui-toolkit: terminal dock");
			ctx.effect(() => registerShortcut(ctx, dock, t), "ui-toolkit: terminal shortcut");
		}

		exports.apply = apply;
		exports.inject = inject;
		exports.__internals = { loadXterm };
		return module.exports;
	}
});
