window.__ModuleLoader__.load({
	id: "@local/dsh-sidebar-unify",
	factory: () => {
		var module = { exports: {} };
		var exports = module.exports;

		//#region constants
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
			"div[class*=\"logoRow\"] [class*=\"brandName\"] svg [clip-path*=\"badge\"]{display:none!important}"
		].join("");
		//#endregion

		//#region plugin body
		const inject = [];

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
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		exports.__internals = {
			css
		};
		return module.exports;
	}
});
