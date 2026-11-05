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
		const CSS_ID = "ui-toolkit-autohide-scrollbar";
		/** How long the thumb stays visible after a scroll event settles. */
		const VISIBLE_MS = 900;

		const css = [
			"html[data-uit-autohide-scrollbars] :not([data-uit-scrolling])::-webkit-scrollbar-thumb{background-color:transparent!important;background-image:none!important}",
			"html[data-uit-autohide-scrollbars] :not([data-uit-scrolling])::-webkit-scrollbar-track{background-color:transparent!important;background-image:none!important}",
			"html[data-uit-autohide-scrollbars] ::-webkit-scrollbar-thumb{transition:background-color .18s ease}"
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
					tag.remove();
				};
			}, "ui-toolkit: auto-hide scrollbars");
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
