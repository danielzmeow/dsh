window.__ModuleLoader__.load({
	id: "@local/dsh-view-menu",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		const React = require("react");
		const h = React.createElement;

		//#region styles
		/**
		 * The View strip stays mounted: its buttons are the supported way to
		 * select a View. It is taken out of the layout and made invisible so the
		 * header shrinks to the title row; the native session-header three-dot
		 * menu is the only visible entry point.
		 */
		const css = [
			"header div:has(>[data-conversation-tabs]){position:absolute;top:0;left:0;right:auto;width:8000px;height:0;min-height:0;margin:0;padding:0;overflow:hidden;visibility:hidden}",
			"header:has([data-conversation-tabs]){position:relative;min-height:0!important;padding-bottom:10px!important}"
		].join("");
		const cssTagId = "@local/dsh-view-menu/view-menu.css";
		//#endregion

		//#region dictionaries
		const zh = {
			chat: "对话",
			switchFailed: "无法切换会话视图"
		};
		const en = {
			chat: "Chat",
			switchFailed: "Could not switch the conversation view"
		};
		//#endregion

		//#region helpers
		const VIEW_SLOT = "conversation.view";
		const FIXED_VIEW_ID = "chat";
		const CHECK_ICON = "view-menu.check";
		const BLANK_ICON = "view-menu.blank";

		/**
		 * Resolve a View label option. Owners register either a string or a
		 * locale-bound thunk; a thunk may throw while its package unloads.
		 * @param {unknown} raw - \`label\` from the View registration.
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
		 * this build, and \`aria-selected\` carries the active View.
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
		 * Select a View through its rendered tab button. The tab strip is hidden
		 * with CSS, so the button still exists and still runs the shipped
		 * \`selectView\` path (activation + preference), unlike a synthetic store
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

		/**
		 * Build the actions the native session-header menu renders. The active
		 * View carries a check glyph; every action is backed by a mounted tab so
		 * clicking it reuses the shipped View selection path.
		 * @param {Array<{ id: string, label: string }>} views
		 * @param {{ labels: Set<string>, active: string | null }} tabs
		 * @param {(key: string) => string} tr
		 */
		function buildViewActions(views, tabs, tr) {
			const available = (views ?? []).filter((view) => view !== null && view !== undefined
				&& typeof view.id === "string" && tabs.labels.has(view.label));
			return available.map((view) => ({
				id: "view-" + view.id,
				label: view.label,
				icon: { key: tabs.active === view.label ? CHECK_ICON : BLANK_ICON },
				run: () => {
					if (!clickViewTab(view.label)) throw new Error(tr("switchFailed"));
				}
			}));
		}

		/** 14px check mark matching the native menu's icon column. */
		function CheckIcon() {
			return h("svg", { width: 14, height: 14, viewBox: "0 0 16 16", "aria-hidden": "true" },
				h("path", {
					d: "m3.2 8.3 3 3 6.6-6.7",
					fill: "none",
					stroke: "currentColor",
					"stroke-width": 1.7,
					"stroke-linecap": "round",
					"stroke-linejoin": "round"
				})
			);
		}

		/** Empty icon seat so View rows align with icon-bearing native actions. */
		function BlankIcon() {
			return h("span", { "aria-hidden": "true", style: { display: "inline-block", width: 14, height: 14 } });
		}
		//#endregion

		//#region plugin body
		const NS = "view-menu";
		const inject = ["slots", "locale", "contextMenus"];

		/** @param {any} ctx */
		function apply(ctx) {
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "@local/dsh-view-menu";
				tag.dataset.pluginCss = cssTagId;
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => tag.remove();
			}, "view-menu: styles");
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "view-menu: dictionaries");
			const tr = ctx.locale.bind(NS);

			ctx.slots.inject("contextMenu.icon", function* () {
				yield ctx.slots.register({ name: "contextMenu.icon", key: CHECK_ICON }, CheckIcon);
				yield ctx.slots.register({ name: "contextMenu.icon", key: BLANK_ICON }, BlankIcon);
			});

			// The feature runner's scoped facade may start before the context-menu
			// service finishes applying; wait briefly for the optional lookup.
			ctx.effect(() => {
				let timer;
				let dispose;
				let attempts = 0;
				const attach = () => {
					let menus;
					try {
						menus = ctx.contextMenus ?? (typeof ctx.get === "function" ? ctx.get("contextMenus") : undefined);
					} catch (_error) {
						menus = undefined;
					}
					if (menus === undefined || menus === null) {
						attempts += 1;
						if (attempts <= 50) timer = setTimeout(attach, 100);
						return;
					}
					dispose = menus.register({
						id: "view-menu.views",
						target: "sessionHeader",
						order: 10,
						observe: () => [ctx.locale],
						resolve: () => buildViewActions(readViews(ctx, tr), readTabSnapshot(), tr)
					});
				};
				attach();
				return () => {
					if (timer !== undefined) clearTimeout(timer);
					if (typeof dispose === "function") dispose();
				};
			}, "view-menu: native session header views");
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		exports.__internals = {
			resolveLabel,
			readTabSnapshot,
			readViews,
			buildViewActions,
			clickViewTab
		};
		return module.exports;
	}
});
