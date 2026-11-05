window.__ModuleLoader__.load({
	id: "@local/dsh-ui-motion",
	factory: () => {
		var module = { exports: {} };
		var exports = module.exports;

		//#region styles
		/**
		 * Richer motion for both sidebars. The frame already transitions its grid
		 * tracks; this sheet gives that slide a longer spring, adds a fade/scale to
		 * the right panel and its body, and replaces the left rail's flat slide with
		 * a short spring entrance.
		 */
		const css = [
			// App frame: a slightly longer, springier width change.
			"div[class*=\"frame\"]:has([data-sidebar-right-panel]){transition:grid-template-columns .34s cubic-bezier(.2,.9,.2,1)!important}",
			"div[class*=\"frame\"][data-dragging],div[class*=\"frame\"][data-rightbar-instant]{transition:none!important}",
			// Left rail: replace the stock 49px linear-ish slide with a short spring.
			"[class*=\"sidebarCol\"] [class*=\"railIn\"] [class*=\"iconButton\"],[class*=\"sidebarCol\"] [class*=\"railIn\"] [class*=\"newSession\"],[class*=\"sidebarCol\"] [class*=\"railIn\"] [class*=\"panelList\"],[class*=\"sidebarCol\"] [class*=\"railIn\"] [class*=\"regionArea\"],[class*=\"sidebarCol\"] [class*=\"railIn\"] [class*=\"footArea\"]{animation-name:uit-rail-in!important;animation-duration:.3s!important;animation-timing-function:cubic-bezier(.2,.9,.2,1)!important}",
			// Expanded labels: let the existing fade ride the same spring timing.
			"[class*=\"sidebarCol\"] [class*=\"wide\"]{animation-duration:.26s!important;animation-timing-function:cubic-bezier(.2,.9,.2,1)!important}",
			"@keyframes uit-rail-in{from{opacity:0;transform:translateX(28px) scale(.96)}to{opacity:1;transform:none}}",
			// Right panel: fade + scale while it slides, plus a soft leading edge.
			"[data-sidebar-right-panel]{opacity:0;transform:translate3d(100%,0,0) scale(.985);transform-origin:100% 50%;will-change:transform,opacity;transition:transform .34s cubic-bezier(.2,.9,.2,1),opacity .22s ease,visibility 0s linear .34s!important}",
			"[data-sidebar-right-panel][data-sidebar-right-open]{opacity:1;transform:translate3d(0,0,0) scale(1);transition:transform .34s cubic-bezier(.2,.9,.2,1),opacity .18s ease!important}",
			"[data-sidebar-right-panel]::before{content:\"\";position:absolute;top:0;bottom:0;left:-28px;width:28px;background:linear-gradient(90deg,transparent,var(--dsw-alias-interactive-bg-hover));opacity:0;transition:opacity .22s ease;pointer-events:none}",
			"[data-sidebar-right-panel][data-sidebar-right-open]::before{opacity:1}",
			"[data-sidebar-right-panel] [class*=\"panelBody\"]{opacity:0;transform:translateX(10px);transition:opacity .2s ease,transform .3s cubic-bezier(.2,.9,.2,1)}",
			"[data-sidebar-right-panel][data-sidebar-right-open] [class*=\"panelBody\"]{opacity:1;transform:none;transition-delay:.04s}",
			// Accessibility: keep the state change instant when motion is reduced.
			"@media (prefers-reduced-motion:reduce){div[class*=\"frame\"]:has([data-sidebar-right-panel]),[data-sidebar-right-panel],[data-sidebar-right-panel][data-sidebar-right-open]{transition:none!important}[class*=\"sidebarCol\"] [class*=\"railIn\"] [class*=\"iconButton\"],[class*=\"sidebarCol\"] [class*=\"railIn\"] [class*=\"newSession\"],[class*=\"sidebarCol\"] [class*=\"railIn\"] [class*=\"panelList\"],[class*=\"sidebarCol\"] [class*=\"railIn\"] [class*=\"regionArea\"],[class*=\"sidebarCol\"] [class*=\"railIn\"] [class*=\"footArea\"]{animation:none!important}[data-sidebar-right-panel]{opacity:1;transform:translate3d(100%,0,0)}[data-sidebar-right-panel][data-sidebar-right-open]{opacity:1;transform:none}[data-sidebar-right-panel]::before,[data-sidebar-right-panel] [class*=\"panelBody\"]{transition:none!important;opacity:1;transform:none}}"
		].join("");
		const cssTagId = "@local/dsh-ui-motion/motion.css";
		//#endregion

		//#region plugin body
		const inject = [];

		/** @param {any} ctx */
		function apply(ctx) {
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "@local/dsh-ui-motion";
				tag.dataset.pluginCss = cssTagId;
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => tag.remove();
			}, "motion: styles");
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		exports.__internals = { css };
		return module.exports;
	}
});
