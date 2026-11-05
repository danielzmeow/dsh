window.__ModuleLoader__.load({
	id: "@local/dsh-view-menu",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		const React = require("react");
		const primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		const h = React.createElement;

		// The primitives package renamed icons between releases. Resolve the
		// current name first, then fall back to an inline glyph; a moved icon
		// must never take the header down.
		function EllipsisGlyph(props) {
			return h("svg", { viewBox: "0 0 16 16", width: 16, height: 16, "aria-hidden": true, ...props },
				h("path", { d: "M3 9c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1Zm5 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1Zm5 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1Z", fill: "currentColor" })
			);
		}
		function DownloadGlyph(props) {
			return h("svg", { viewBox: "0 0 16 16", width: 16, height: 16, "aria-hidden": true, ...props },
				h("path", { d: "M8 2v7m0 0 2.8-2.8M8 9 5.2 6.2M3 11.5v1.2c0 .7.6 1.3 1.3 1.3h7.4c.7 0 1.3-.6 1.3-1.3v-1.2", fill: "none", stroke: "currentColor", "stroke-width": 1.4, "stroke-linecap": "round", "stroke-linejoin": "round" })
			);
		}
		const IconEllipsis = primitives.IconEllipsisOutline16 ?? primitives.IconEllipsisOutlineRegular ?? EllipsisGlyph;
		const IconDownload = primitives.IconDownloadOutline16 ?? primitives.IconDownloadOutlineRegular ?? DownloadGlyph;
		const Menu = typeof primitives.Menu === "function" ? primitives.Menu : null;
		const Tooltip = typeof primitives.Tooltip === "function" ? primitives.Tooltip : ({ children }) => children;

		//#region styles
		const css = [
			// The View strip stays mounted: its buttons are the supported way to
			// select a View. It is taken out of the layout and made invisible so the
			// header shrinks to the title row.
			"header div:has(>[data-conversation-tabs]){position:absolute;top:0;left:0;right:auto;width:8000px;height:0;min-height:0;margin:0;padding:0;overflow:hidden;visibility:hidden}",
			"header:has([data-conversation-tabs]){position:relative;min-height:0!important;padding-bottom:10px!important}",
			// The session-log-export "More actions" trigger is replaced by this
			// menu. Its dialog stays mounted, so download feedback still works.
			"html[data-vwm-export=replaced] [data-slot=\"conversation.session.header.utilities\"] button[class*=\"_moreButton\"]{display:none!important}",
			".vwm_trigger{box-sizing:border-box;width:28px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:var(--dsw-radius-sm);flex:none;justify-content:center;align-items:center;padding:6px;display:inline-flex}",
			".vwm_trigger svg{width:15px;height:15px}",
			".vwm_trigger:hover,.vwm_trigger[data-open]{background:var(--dsw-alias-interactive-bg-hover)}",
			".vwm_trigger:active{background:var(--dsw-alias-interactive-bg-active)}",
			".vwm_trigger:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}",
			".vwm_menu{box-sizing:border-box;width:min(248px,100vw - 24px)}"
		].join("");
		const cssTagId = "@local/dsh-view-menu/view-menu.css";

		//#region dictionaries
		const zh = {
			menu: "会话视图",
			chat: "对话",
			download: "下载 Session 日志"
		};
		const en = {
			menu: "Conversation views",
			chat: "Chat",
			download: "Download session log"
		};
		//#endregion

		//#region helpers
		const VIEW_SLOT = "conversation.view";
		const FIXED_VIEW_ID = "chat";
		const DOWNLOAD_ID = "download";

		/**
		 * Resolve a View label option. Owners register either a string or a
		 * locale-bound thunk; a thunk may throw while its package unloads.
		 * @param {unknown} raw - `label` from the View registration.
		 * @param {string} fallback - id-based fallback.
		 */
		function resolveLabel(raw, fallback) {
			try {
				const value = typeof raw === "function" ? raw() : raw;
				if (typeof value === "string" && value.trim() !== "") return value;
			} catch (_error) {
				// A View owner without a readable label still gets a usable row.
			}
			return fallback;
		}

		/**
		 * Snapshot the hidden tab strip: its labels decide which Views exist in
		 * this build, and `aria-selected` carries the active View.
		 * @returns {{ labels: Set<string>, active: string | null }}
		 */
		function readTabSnapshot() {
			if (typeof document === "undefined" || typeof document.querySelectorAll !== "function") {
				return { labels: /* @__PURE__ */ new Set(), active: null };
			}
			const labels = /* @__PURE__ */ new Set();
			let active = null;
			for (const button of document.querySelectorAll("[data-conversation-tabs] button")) {
				const text = typeof button.textContent === "string" ? button.textContent.trim() : "";
				if (text === "") continue;
				labels.add(text);
				if (active === null && button.getAttribute("aria-selected") === "true") active = text;
			}
			return { labels, active };
		}

		/**
		 * Read the registered View roster. Registration order matches the header.
		 * @param {any} ctx
		 * @param {(key: string) => string} tr
		 */
		function readViews(ctx, tr) {
			try {
				const list = typeof ctx.slots.entries === "function"
					? ctx.slots.entries(VIEW_SLOT)
					: ctx.slots.entriesOfSlot(VIEW_SLOT);
				const views = [];
				for (const entry of list ?? []) {
					const options = entry !== null && entry !== undefined ? entry.options : undefined;
					if (options === null || options === undefined || typeof options.id !== "string") continue;
					const fallback = options.id === FIXED_VIEW_ID ? tr("chat") : options.id;
					views.push({ id: options.id, label: resolveLabel(options.label, fallback) });
				}
				return views;
			} catch (_error) {
				return [];
			}
		}

		/**
		 * Build the menu rows. `chat` stays available even when a build hides the
		 * tab strip for a single-View conversation; every other row must be backed
		 * by a rendered tab, which also honors feature flags such as Coding Tools.
		 * @param {Array<{ id: string, label: string }>} views
		 * @param {{ labels: Set<string>, active: string | null }} tabs
		 * @param {boolean} hasDownload
		 */
		function buildItems(views, tabs, hasDownload) {
			const available = [];
			for (const view of views ?? []) {
				if (view === null || view === undefined || typeof view.id !== "string") continue;
				if (view.id !== FIXED_VIEW_ID && !tabs.labels.has(view.label)) continue;
				available.push(view);
			}
			const items = available.map((view) => ({ id: view.id, label: view.label }));
			if (hasDownload) {
				if (items.length > 0) items.push({ type: "separator", id: "separator" });
				items.push({ id: DOWNLOAD_ID, label: "", icon: null });
			}
			return { items, available };
		}

		/**
		 * Select a View through its rendered tab button. The tab strip is hidden
		 * with CSS, so the button still exists and still runs the shipped
		 * `selectView` path (activation + preference), unlike a synthetic store
		 * write.
		 * @param {string} label - localized View label.
		 * @returns {boolean} whether a matching tab was found.
		 */
		function clickViewTab(label) {
			if (typeof document === "undefined" || typeof document.querySelectorAll !== "function") return false;
			for (const button of document.querySelectorAll("[data-conversation-tabs] button")) {
				if (typeof button.textContent === "string" && button.textContent.trim() === label) {
					button.click();
					return true;
				}
			}
			return false;
		}
		//#endregion

		//#region export slot
		/** Headers mount more than once in split views; only the last owner clears the flag. */
		let exportOwners = 0;
		/**
		 * Mark the shipped export trigger as replaced by our menu. Its dialog
		 * stays mounted, so download feedback keeps working without the trigger.
		 */
		function claimExportSlot() {
			if (typeof document === "undefined") return () => {};
			exportOwners += 1;
			document.documentElement.dataset.vwmExport = "replaced";
			return () => {
				exportOwners = Math.max(0, exportOwners - 1);
				if (exportOwners === 0) delete document.documentElement.dataset.vwmExport;
			};
		}
		//#endregion

		//#region component
		/**
		 * Top-right header menu that owns every Conversation View plus the Session
		 * log download. It replaces the shipped "More actions" trigger while
		 * keeping that package's dialog mounted.
		 * @param {{ readViews: (tr: (key: string) => string) => Array<{ id: string, label: string }>, hasDownload: () => boolean, download: () => void, t: (key: string) => string }} props
		 */
		function ViewMenuButton({ readViews: read, hasDownload, download, t }) {
			const tr = typeof t === "function" ? t : (key) => key;
			const [open, setOpen] = React.useState(false);
			const views = typeof read === "function" ? read(tr) : [];
			const tabs = readTabSnapshot();
			const canDownload = typeof hasDownload === "function" && hasDownload();
			const { items, available } = buildItems(views, tabs, canDownload);
			const activeView = available.find((view) => tabs.active !== null && view.label === tabs.active);
			const label = tr("menu");
			React.useEffect(() => (canDownload ? claimExportSlot() : undefined), [canDownload]);
			const menuItems = items.map((item) => {
				if (item.type === "separator") return item;
				if (item.id === DOWNLOAD_ID) return { ...item, label: tr("download"), icon: h(IconDownload, { size: 16 }) };
				return item;
			});

			const close = () => setOpen(false);
			const onSelect = (id) => {
				close();
				if (id === DOWNLOAD_ID) {
					if (typeof download === "function") download();
					return;
				}
				const view = available.find((entry) => entry.id === id);
				if (view !== undefined) clickViewTab(view.label);
			};

			const trigger = h("button", {
				type: "button",
				className: "vwm_trigger",
				"data-open": open ? "" : undefined,
				"aria-label": label,
				"aria-haspopup": "menu",
				"aria-expanded": open,
				onClick: () => setOpen((value) => !value)
			}, h(IconEllipsis, { size: 15 }));

			return h(Menu, {
				open,
				onClose: close,
				align: "end",
				side: "bottom",
				dense: true,
				portal: true,
				autoFocus: true,
				selectedId: activeView !== undefined ? activeView.id : undefined,
				items: menuItems,
				listClassName: "vwm_menu",
				onSelect,
				anchor: h(Tooltip, { label, side: "bottom", delayMs: 500, children: trigger })
			});
		}
		//#endregion

		//#region plugin body
		/** Show a render failure instead of silently losing the header menu. */
		class ViewMenuBoundary extends React.Component {
			constructor(props) {
				super(props);
				this.state = { error: null };
			}
			static getDerivedStateFromError(error) {
				return { error };
			}
			componentDidCatch(error) {
				console.error("view-menu: render failed", error);
			}
			render() {
				if (this.state.error === null) return this.props.children;
				return h("span", { style: { color: "var(--dsw-alias-state-error-primary)", fontSize: "11px", padding: "6px" } }, "view-menu error: " + String(this.state.error?.message ?? this.state.error));
			}
		}

		const NS = "view-menu";
		const inject = ["slots", "locale"];

		/** @param {any} ctx */
		function apply(ctx) {
			// Without the Menu primitive there is no safe replacement trigger;
			// stay inert instead of hiding the shipped header controls.
			if (Menu === null) return;
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "@local/dsh-view-menu";
				tag.dataset.pluginCss = cssTagId;
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => tag.remove();
			}, "view-menu: styles");
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "view-menu: dictionaries");

			const downloadService = () => {
				try {
					return typeof ctx.get === "function" ? ctx.get("sessionLogDownload") : undefined;
				} catch (_error) {
					return undefined;
				}
			};

			ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
				name: "conversation.session.header.utilities",
				id: "view-menu",
				order: 1000,
				locale: NS,
				inject: (sessionId) => ({
					readViews: (tr) => readViews(ctx, tr),
					hasDownload: () => downloadService() !== undefined,
					download: () => {
						const service = downloadService();
						if (service !== undefined && typeof service.download === "function") service.download(sessionId);
					}
				})
			}, (props) => h(ViewMenuBoundary, null, h(ViewMenuButton, props))));
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		exports.ViewMenuButton = ViewMenuButton;
		exports.__internals = {
			resolveLabel,
			readTabSnapshot,
			buildItems,
			clickViewTab,
			claimExportSlot
		};
		return module.exports;
	}
});
