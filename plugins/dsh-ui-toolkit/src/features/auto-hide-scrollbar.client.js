window.__ModuleLoader__.load({
	id: "@local/dsh-ui-toolkit",
	factory: () => {
		var module = { exports: {} };
		var exports = module.exports;

		//#region auto-hide scrollbars
		/** Marker on <html> that enables the rules while the feature runs. */
		const ROOT_ATTR = "data-uit-autohide-scrollbars";
		/** Marker put on a scroll container while its thumb should stay visible. */
		const SCROLL_ATTR = "data-uit-scrolling";
		/** Marker put on a scroller the first time it scrolls, so it owns the fade transition. */
		const TRACKED_ATTR = "data-uit-scrollbar-tracked";
		const CSS_ID = "ui-toolkit-autohide-scrollbar";
		/** How long the thumb stays visible after a scroll event settles. */
		const VISIBLE_MS = 900;

		const css = [
			"@property --uit-scrollbar-alpha{syntax:'<number>';inherits:true;initial-value:0}",
			"html[data-uit-autohide-scrollbars] ::-webkit-scrollbar-thumb{background-color:color-mix(in srgb,var(--dsh-scrollbar-thumb,var(--dsw-alias-scrollbar-bg-l2,#888)) calc(var(--uit-scrollbar-alpha,0)*100%),transparent)!important;background-image:none!important;transition:none!important}",
			"html[data-uit-autohide-scrollbars] *:hover::-webkit-scrollbar-thumb{background-color:color-mix(in srgb,var(--dsh-scrollbar-thumb-hover,var(--dsh-scrollbar-thumb,var(--dsw-alias-scrollbar-bg-l2,#888))) calc(var(--uit-scrollbar-alpha,0)*100%),transparent)!important}",
			"html[data-uit-autohide-scrollbars] ::-webkit-scrollbar-track{background-color:transparent!important;background-image:none!important}",
			"html[data-uit-autohide-scrollbars] [data-uit-scrollbar-tracked]{--uit-scrollbar-alpha:0;transition:--uit-scrollbar-alpha .42s cubic-bezier(.22,.8,.28,1)}",
			"html[data-uit-autohide-scrollbars] [data-uit-scrolling]{--uit-scrollbar-alpha:1;transition-duration:.12s}"
		].join("");

		const inject = [];

		/** @param {any} ctx */
		function apply(ctx) {
			if (
				typeof document === "undefined" ||
				document.documentElement === undefined ||
				document.documentElement === null ||
				typeof document.documentElement.setAttribute !== "function" ||
				typeof document.addEventListener !== "function"
			) {
				return;
			}
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "@local/dsh-ui-toolkit";
				tag.dataset.pluginCss = CSS_ID;
				tag.textContent = css;
				document.head.appendChild(tag);
				document.documentElement.setAttribute(ROOT_ATTR, "");

				/** @type {WeakMap<Element, ReturnType<typeof setTimeout>>} */
				const timers = new WeakMap();
				const onScroll = (event) => {
					const target = event.target;
					const node = typeof Element !== "undefined" && target instanceof Element ? target : document.documentElement;
					if (!node.hasAttribute(TRACKED_ATTR)) node.setAttribute(TRACKED_ATTR, "");
					if (!node.hasAttribute(SCROLL_ATTR)) node.setAttribute(SCROLL_ATTR, "");
					const previous = timers.get(node);
					if (previous !== undefined) clearTimeout(previous);
					timers.set(
						node,
						setTimeout(() => {
							node.removeAttribute(SCROLL_ATTR);
							timers.delete(node);
						}, VISIBLE_MS)
					);
				};
				document.addEventListener("scroll", onScroll, true);

				return () => {
					document.removeEventListener("scroll", onScroll, true);
					document.documentElement.removeAttribute(ROOT_ATTR);
					for (const node of document.querySelectorAll("[" + SCROLL_ATTR + "]")) node.removeAttribute(SCROLL_ATTR);
					for (const node of document.querySelectorAll("[" + TRACKED_ATTR + "]")) node.removeAttribute(TRACKED_ATTR);
					tag.remove();
				};
			}, "ui-toolkit: auto-hide scrollbars");
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
