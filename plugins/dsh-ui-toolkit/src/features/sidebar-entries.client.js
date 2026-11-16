window.__ModuleLoader__.load({
	id: "@local/dsh-ui-toolkit/sidebar-entries",
	factory: () => {
		var module = { exports: {} };
		var exports = module.exports;

		//#region constants
		/** The shell's panel list; the class name carries the CSS-module hash. */
		const NAV_SELECTOR = "nav[class*=\"panelList\"]";
		/** Marks the nav this feature owns; every rule below is scoped to it. */
		const NAV_ATTR = "data-uit-sidebar-nav";
		/** Marks one tagged panel row host and stores its registration id. */
		const ENTRY_ATTR = "data-uit-sidebar-entry";
		/** "true" hides a row without unmounting it, so React state survives. */
		const HIDDEN_ATTR = "data-uit-sidebar-hidden";
		/** Marks the More launcher's host so the manager owns the whole list. */
		const MORE_ATTR = "data-uit-sidebar-more";
		/** Custom property read by the order rule (0 = first). */
		const ORDER_VAR = "--uit-entry-order";
		/** Set on the nav when every row is hidden, matching the native empty list. */
		const EMPTY_ATTR = "data-uit-sidebar-empty";
		const cssTagId = "@local/dsh-ui-toolkit/sidebar-entries.css";
		//#endregion

		//#region styles
		/**
		 * Rows keep their shipped markup and handlers; this sheet only changes
		 * order and visibility. More is hidden outright: the manager owns the
		 * whole panel list, so the app's overflow menu would only offer plugin
		 * browsing/creation actions the feature deliberately replaces.
		 *
		 * DSH 0.2.2 wraps each row button in div.panelEntry (pin/unpin seat), so
		 * the order/hidden marks live on the direct nav child, which may be the
		 * button itself or that wrapper.
		 */
		const css = [
			NAV_SELECTOR + "[" + NAV_ATTR + "]>[" + ENTRY_ATTR + "]{order:var(" + ORDER_VAR + ",0)}",
			NAV_SELECTOR + "[" + NAV_ATTR + "]>[" + ENTRY_ATTR + "][" + HIDDEN_ATTR + "=\"true\"]{display:none!important}",
			NAV_SELECTOR + "[" + NAV_ATTR + "][" + EMPTY_ATTR + "=\"true\"]{display:none!important}",
			// The More launcher sits inside its own direct child (Menu anchor or a
			// column wrapper). Hide whichever direct child owns it.
			NAV_SELECTOR + "[" + NAV_ATTR + "] [" + MORE_ATTR + "]{display:none!important}",
			NAV_SELECTOR + "[" + NAV_ATTR + "]>button[aria-haspopup=\"menu\"]{display:none!important}"
		].join("");
		//#endregion

		//#region helpers
		/**
		 * Match rendered rows to registered entries. aria-label carries the
		 * resolved label, so unique labels are exact. Duplicate labels are
		 * resolved positionally only when the counts agree; otherwise a row
		 * stays untagged rather than ordering the wrong panel.
		 * @param {ReadonlyArray<any>} rows
		 * @param {ReadonlyArray<any>} entries
		 * @param {(row: any) => string} readLabel
		 * @returns {Map<any, string>}
		 */
		function mapRows(rows, entries, readLabel) {
			const byLabel = new Map();
			for (const entry of entries) {
				const list = byLabel.get(entry.label);
				if (list === undefined) byLabel.set(entry.label, [entry.id]);
				else list.push(entry.id);
			}
			const assigned = new Map();
			const used = new Set();
			for (const row of rows) {
				const candidates = byLabel.get(readLabel(row));
				if (candidates === undefined) continue;
				const id = candidates.find((candidate) => !used.has(candidate));
				if (id === undefined) continue;
				assigned.set(row, id);
				used.add(id);
			}
			if (assigned.size === rows.length || rows.length !== entries.length) return assigned;
			const remaining = entries.filter((entry) => !used.has(entry.id));
			let cursor = 0;
			for (const row of rows) {
				if (assigned.has(row)) continue;
				const entry = remaining[cursor];
				cursor += 1;
				if (entry === undefined) break;
				assigned.set(row, entry.id);
				used.add(entry.id);
			}
			return assigned;
		}

		/** @param {any} row */
		function rowLabel(row) {
			try {
				return row.getAttribute("aria-label") ?? "";
			} catch (_error) {
				return "";
			}
		}

		/** @param {any} node */
		function isPanelRow(node) {
			if (node === null || node === undefined) return false;
			if (node.tagName !== "BUTTON" || node.getAttribute === undefined) return false;
			return node.getAttribute("aria-haspopup") !== "menu";
		}

		/** The direct nav child that owns a row button (the button or its wrapper). */
		function rowHost(nav, node) {
			let current = node;
			while (current !== null && current !== undefined && current.parentElement !== null && current.parentElement !== nav) {
				current = current.parentElement;
			}
			return current !== null && current !== undefined && current.parentElement === nav ? current : node;
		}

		/**
		 * Snapshot one nav's panel rows. 0.2.2 renders a button inside a
		 * div.panelEntry; older shells rendered the button directly. Prefer the
		 * shipped panelRow class and fall back to direct buttons.
		 * @param {any} nav
		 * @returns {ReadonlyArray<{ button: any, host: any }>}
		 */
		function collectRows(nav) {
			if (nav === null || nav === undefined || typeof nav.querySelectorAll !== "function") return [];
			let buttons = [];
			try {
				buttons = Array.from(nav.querySelectorAll("button[class*=\"panelRow\"]")).filter(isPanelRow);
			} catch (_error) {
				buttons = [];
			}
			if (buttons.length === 0) {
				buttons = Array.from(nav.children).filter(isPanelRow);
			}
			const seen = new Set();
			const rows = [];
			for (const button of buttons) {
				const host = rowHost(nav, button);
				if (seen.has(host)) continue;
				seen.add(host);
				rows.push({ button, host });
			}
			return rows;
		}

		/**
		 * Hide the More launcher's direct nav child, whether the launcher is a
		 * direct button or wrapped by a Menu anchor.
		 * @param {any} nav
		 */
		function tagMore(nav) {
			if (nav === null || nav === undefined || typeof nav.querySelectorAll !== "function") return;
			for (const button of nav.querySelectorAll("button[aria-haspopup=\"menu\"]")) {
				const host = rowHost(nav, button);
				if (host !== null && host !== undefined && typeof host.setAttribute === "function") host.setAttribute(MORE_ATTR, "");
			}
		}
		//#endregion

		//#region plugin body
		const inject = ["slots"];

		/** @param {any} ctx */
		function apply(ctx) {
			const store = sidebarEntriesHost;
			if (store === null || store === undefined) return;

			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "@local/dsh-ui-toolkit";
				tag.dataset.pluginCss = cssTagId;
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => tag.remove();
			}, "sidebar-entries: styles");

			const root = typeof document !== "undefined" ? document.documentElement : undefined;
			if (root === undefined) return;

			const raf = typeof requestAnimationFrame === "function" ? requestAnimationFrame : null;
			const cancelRaf = typeof cancelAnimationFrame === "function" ? cancelAnimationFrame : null;
			let frame = 0;

			const sync = () => {
				frame = 0;
				const snapshot = store.getSnapshot();
				const nav = document.querySelector(NAV_SELECTOR);
				if (nav === null) return;
				const records = collectRows(nav);
				const buttons = records.map((record) => record.button);
				const assigned = mapRows(buttons, snapshot.entries, rowLabel);
				const order = new Map(snapshot.entries.map((entry, index) => [entry.id, index]));
				const hidden = new Set(snapshot.hidden);
				let visible = 0;
				for (const record of records) {
					const host = record.host;
					const id = assigned.get(record.button);
					if (id === undefined) {
						host.removeAttribute(ENTRY_ATTR);
						host.removeAttribute(HIDDEN_ATTR);
						host.style.removeProperty(ORDER_VAR);
						continue;
					}
					host.setAttribute(ENTRY_ATTR, id);
					host.style.setProperty(ORDER_VAR, String(order.get(id) ?? 0));
					const isHidden = hidden.has(id);
					host.setAttribute(HIDDEN_ATTR, isHidden ? "true" : "false");
					if (!isHidden) visible += 1;
				}
				tagMore(nav);
				nav.setAttribute(NAV_ATTR, "");
				// A zero-entry snapshot can be a startup race (rows already
				// rendered, registry subscription not delivered yet). In that
				// case leave the native list visible instead of collapsing it.
				nav.setAttribute(EMPTY_ATTR, snapshot.entries.length > 0 && visible === 0 ? "true" : "false");
			};

			const schedule = () => {
				if (frame !== 0) return;
				if (raf !== null) frame = raf(sync);
				else frame = setTimeout(sync, 0);
			};

			const cleanup = () => {
				if (frame !== 0) {
					if (raf !== null && cancelRaf !== null) cancelRaf(frame);
					else clearTimeout(frame);
					frame = 0;
				}
				for (const node of document.querySelectorAll("[" + ENTRY_ATTR + "]")) {
					node.removeAttribute(ENTRY_ATTR);
					node.removeAttribute(HIDDEN_ATTR);
					node.style.removeProperty(ORDER_VAR);
				}
				for (const node of document.querySelectorAll("[" + MORE_ATTR + "]")) node.removeAttribute(MORE_ATTR);
				for (const nav of document.querySelectorAll("[" + NAV_ATTR + "]")) {
					nav.removeAttribute(NAV_ATTR);
					nav.removeAttribute(EMPTY_ATTR);
				}
			};

			ctx.effect(() => {
				// childList catches rows mounting/leaving; aria-label catches a
				// locale switch, which changes the label without replacing the
				// row DOM. Our own data-* attributes are filtered out so the
				// observer cannot feed its own writes back in.
				const observer = typeof MutationObserver === "function"
					? new MutationObserver(schedule)
					: null;
				if (observer !== null) {
					observer.observe(document.body ?? root, {
						childList: true,
						subtree: true,
						attributes: true,
						attributeFilter: ["aria-label"]
					});
				}
				const unsubscribe = store.subscribe(schedule);
				sync();
				return () => {
					if (observer !== null) observer.disconnect();
					unsubscribe();
					cleanup();
				};
			}, "sidebar-entries: applied prefs");
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		exports.__internals = {
			NAV_SELECTOR,
			NAV_ATTR,
			ENTRY_ATTR,
			HIDDEN_ATTR,
			MORE_ATTR,
			ORDER_VAR,
			EMPTY_ATTR,
			css,
			isPanelRow,
			mapRows,
			rowLabel,
			rowHost,
			collectRows
		};
		return module.exports;
	}
});
