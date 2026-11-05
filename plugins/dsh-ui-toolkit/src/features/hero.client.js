window.__ModuleLoader__.load({
	id: "@local/dsh-ui-hero-cleanup",
	factory: () => {
		var module = { exports: {} };
		var exports = module.exports;

		//#region styles
		/**
		 * The hero headline renders a "Preview" pill after the wordmark. It is a
		 * release-channel artifact, not content, so remove just that pill while
		 * leaving the whale and the headline intact.
		 */
		const css = [
			"[class*=\"titleGroup\"]>[class*=\"previewBadge\"]{display:none!important}"
		].join("");
		const cssTagId = "@local/dsh-ui-hero-cleanup/hero-cleanup.css";
		//#endregion

		//#region plugin body
		const inject = [];

		/** @param {any} ctx */
		function apply(ctx) {
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "@local/dsh-ui-hero-cleanup";
				tag.dataset.pluginCss = cssTagId;
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => tag.remove();
			}, "hero-cleanup: styles");
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		exports.__internals = { css };
		return module.exports;
	}
});
