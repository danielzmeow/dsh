window.__ModuleLoader__.load({
	id: "@local/dsh-sidebar-unify",
	factory: () => {
		var module = { exports: {} };
		var exports = module.exports;

		//#region constants
		/** Slot whose registrations are the panel rows below New Session. */
		const PANEL_SLOT = "sidebar.panellist";
		/**
		 * Panels shipped by the app itself. Every other registered panel comes
		 * from an installed plugin; only those make the More (pin/manage) row
		 * useful, so More is hidden while this set is the whole roster.
		 */
		const OFFICIAL_PANEL_IDS = new Set(["plugins", "schedules"]);
		/** Root data attribute consumed by the stylesheet as the More switch. */
		const MORE_FLAG = "dsuHasPluginPanels";
		const cssTagId = "@local/dsh-sidebar-unify/sidebar-unify.css";
		//#endregion

		//#region styles
		/**
		 * The shipped New Session button is a raised capsule (border, elevated
		 * fill, centered label). This sheet makes it a peer of the panel rows:
		 * transparent, 36px, left-aligned icon + label, the same hover wash.
		 * Collapsed rail styles are left untouched.
		 */
		const css = [
			// New Session: same geometry and surface as a global panel row.
			"div[class*=\"root\"]:not([class*=\"collapsed\"])>button[class*=\"newSession\"]{box-sizing:border-box!important;width:auto!important;height:auto!important;min-height:36px!important;margin:0 2px 2px!important;padding:7px 8px!important;border:0!important;border-radius:var(--dsw-radius-md)!important;background:transparent!important;color:var(--dsw-alias-label-primary)!important;font-family:inherit!important;font-size:14px!important;font-weight:400!important;font-style:inherit!important;letter-spacing:inherit!important;line-height:22px!important;text-align:left!important;justify-content:flex-start!important;gap:8px!important;overflow:visible!important}",
			"div[class*=\"root\"]:not([class*=\"collapsed\"])>button[class*=\"newSession\"]:hover{background:var(--dsw-alias-interactive-bg-hover)!important}",
			"div[class*=\"root\"]:not([class*=\"collapsed\"])>button[class*=\"newSession\"]:active{background:var(--dsw-alias-interactive-bg-active)!important}",
			"div[class*=\"root\"]:not([class*=\"collapsed\"])>button[class*=\"newSession\"]:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))!important;outline-offset:-2px!important}",
			// Let the label take the row and keep the shortcut hint at the far right.
			"div[class*=\"root\"]:not([class*=\"collapsed\"])>button[class*=\"newSession\"]>[class*=\"newSessionLabelMask\"]{display:flex!important;flex:1 1 auto!important;align-items:center!important;min-width:0!important}",
			"div[class*=\"root\"]:not([class*=\"collapsed\"])>button[class*=\"newSession\"] [class*=\"newSessionContent\"]{justify-content:flex-start!important;gap:8px!important;width:100%!important;min-width:0!important}",
			"div[class*=\"root\"]:not([class*=\"collapsed\"])>button[class*=\"newSession\"] [class*=\"newSessionContent\"]>svg{flex:none!important;width:16px!important;height:16px!important}",
			"div[class*=\"root\"]:not([class*=\"collapsed\"])>button[class*=\"newSession\"] [class*=\"newSessionLabel\"]{max-width:100%!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important}",
			"div[class*=\"root\"]:not([class*=\"collapsed\"])>button[class*=\"newSession\"] [class*=\"newSessionShortcut\"]{flex:none!important;margin-left:auto!important;padding-left:8px!important}",
			// The wordmark SVG carries a dark HARNESS badge after the deepseek
			// text. Hide the badge plate and its glyph group, leaving the
			// deepseek wordmark and the mark beside it untouched.
			"div[class*=\"logoRow\"] [class*=\"brandName\"] svg>rect{display:none!important}",
			"div[class*=\"logoRow\"] [class*=\"brandName\"] svg [clip-path*=\"badge\"]{display:none!important}",
			// More only manages plugin panels. Without one there is nothing to
			// pin or open there, so the row disappears instead of ending the list
			// with a dead control.
			"html[data-dsu-has-plugin-panels=\"false\"] nav[class*=\"panelList\"] button[class*=\"panelRow\"][aria-haspopup=\"menu\"]{display:none!important}",
			"html[data-dsu-has-plugin-panels=\"false\"] nav[class*=\"panelList\"] [class*=\"moreAnchor\"]{display:none!important}"
		].join("");
		//#endregion

		//#region helpers
		/**
		 * Read a panel id from either registration shape: the current
		 * `{ options: { id } }` entry or a bare options object.
		 * @param {any} entry
		 * @returns {string | null}
		 */
		function panelId(entry) {
			if (entry === null || entry === undefined) return null;
			if (typeof entry.id === "string") return entry.id;
			const options = entry.options;
			if (options !== null && options !== undefined && typeof options.id === "string") return options.id;
			return null;
		}

		/**
		 * Whether any registered panel comes from a plugin rather than the app.
		 * @param {Iterable<any> | null | undefined} entries
		 * @returns {boolean}
		 */
		function hasPluginPanels(entries) {
			if (entries === null || entries === undefined) return false;
			for (const entry of entries) {
				const id = panelId(entry);
				if (id !== null && !OFFICIAL_PANEL_IDS.has(id)) return true;
			}
			return false;
		}

		/**
		 * Read the live panel roster without letting a missing registry or an
		 * unloading package take the client down.
		 * @param {any} ctx
		 * @returns {ReadonlyArray<any>}
		 */
		function readPanelEntries(ctx) {
			try {
				if (typeof ctx.slots.entriesOfSlot === "function") return ctx.slots.entriesOfSlot(PANEL_SLOT) ?? [];
				if (typeof ctx.slots.entries === "function") return ctx.slots.entries(PANEL_SLOT) ?? [];
			} catch (_error) {
				// A registry that is not ready yet simply means "no plugin panels";
				// the subscription below re-syncs when registrations arrive.
			}
			return [];
		}

		/**
		 * Publish the More switch on <html>. Kept as a pure function so the
		 * tests can exercise the roster rules without a DOM.
		 * @param {{ dataset: Record<string, string> } | undefined} root
		 * @param {Iterable<any> | null | undefined} entries
		 * @returns {boolean} whether a plugin panel is present.
		 */
		function syncMore(root, entries) {
			const present = hasPluginPanels(entries);
			if (root !== undefined && root !== null && root.dataset !== undefined) {
				root.dataset[MORE_FLAG] = present ? "true" : "false";
			}
			return present;
		}
		//#endregion

		//#region plugin body
		const inject = ["slots"];

		/** @param {any} ctx */
		function apply(ctx) {
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "@local/dsh-sidebar-unify";
				tag.dataset.pluginCss = cssTagId;
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => tag.remove();
			}, "sidebar-unify: styles");

			const root = typeof document !== "undefined" ? document.documentElement : undefined;
			if (root === undefined) return;

			const sync = () => syncMore(root, readPanelEntries(ctx));
			sync();

			if (typeof ctx.slots.subscribe === "function") {
				ctx.effect(() => ctx.slots.subscribe(PANEL_SLOT, sync), "sidebar-unify: panel roster");
			}

			// The attribute is global; clear it when the plugin unloads so the
			// shipped More row returns immediately.
			ctx.effect(() => () => {
				delete root.dataset[MORE_FLAG];
			}, "sidebar-unify: root flag");
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		exports.__internals = {
			OFFICIAL_PANEL_IDS,
			MORE_FLAG,
			PANEL_SLOT,
			css,
			hasPluginPanels,
			panelId,
			readPanelEntries,
			syncMore
		};
		return module.exports;
	}
});
