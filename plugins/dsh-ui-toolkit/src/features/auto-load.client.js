window.__ModuleLoader__.load({
	id: "@local/dsh-ui-auto-load",
	factory: () => {
		var module = { exports: {} };
		var exports = module.exports;

		//#region constants
		/** Never start closer to the top than this (px). */
		const MIN_TRIGGER_PX = 360;
		/** Nor farther away than this, however tall the viewport is. */
		const MAX_TRIGGER_PX = 900;
		/** Preload roughly one viewport before the reader reaches the top. */
		const TRIGGER_RATIO = 1.1;
		/** Click only after scrolling pauses; a click during momentum breaks the anchor. */
		const SCROLL_IDLE_MS = 120;
		/** Check for the settled page before the browser paints (about three seconds max). */
		const MAX_FRAMES = 180;
		/** Reset the stuck guard once the reader scrolls this far below the band. */
		const RESET_MARGIN_PX = 40;
		//#endregion

		//#region styles
		/**
		 * Keep the native button in the DOM (it is the load trigger) but take it out
		 * of the layout: its "Load earlier" / "Loading…" swap is the visible flash
		 * between two pages. Turning this feature off removes the sheet and brings
		 * the manual button back.
		 */
		const css = "[class*='_older']{display:none!important}";
		const cssTagId = "@local/dsh-ui-auto-load/auto-load.css";
		//#endregion

		//#region helpers
		/**
		 * Find the Chat view's "Load earlier" button inside one scroll box.
		 * The class suffix is stable; the text fallback covers builds whose CSS
		 * module was renamed.
		 * @param {any} root
		 * @returns {any}
		 */
		function findLoadEarlierButton(root) {
			if (root === null || root === undefined || typeof root.querySelector !== "function") return null;
			const direct = root.querySelector("[class*='_older'] button");
			if (direct !== null) return direct;
			const buttons = typeof root.querySelectorAll === "function" ? root.querySelectorAll("button") : [];
			for (const button of buttons) {
				const text = typeof button.textContent === "string" ? button.textContent.trim() : "";
				if (text === "Load earlier" || text === "加载更早") return button;
			}
			return null;
		}

		/** Structural check so the listener also works under the test harness. */
		function isScrollTarget(target) {
			return target !== null && typeof target === "object" && typeof target.scrollTop === "number" && typeof target.querySelector === "function";
		}

		/** Preload window for one scroll box. */
		function triggerPx(scroll) {
			const height = typeof scroll.clientHeight === "number" && scroll.clientHeight > 0 ? scroll.clientHeight : 600;
			return Math.max(MIN_TRIGGER_PX, Math.min(MAX_TRIGGER_PX, Math.round(height * TRIGGER_RATIO)));
		}

		/**
		 * Record the first anchor-keyed row visible at the top of the scrollport.
		 * The native loader does this too, but it can fall back to a row without a
		 * stable key (day dividers, notices); our own capture gives the post-load
		 * correction something exact to measure.
		 */
		function findAnchor(scroll) {
			if (typeof scroll.querySelectorAll !== "function" || typeof scroll.getBoundingClientRect !== "function") return null;
			const viewport = scroll.getBoundingClientRect();
			if (typeof document !== "undefined" && typeof document.elementsFromPoint === "function" && viewport.width > 0) {
				const x = viewport.left + viewport.width / 2;
				for (const element of document.elementsFromPoint(x, viewport.top + 1)) {
					const row = typeof element.closest === "function" ? element.closest("[data-chat-anchor-key]") : null;
					if (row !== null && (typeof scroll.contains !== "function" || scroll.contains(row))) {
						const key = row.getAttribute("data-chat-anchor-key");
						if (key !== null && key !== "") return { key, top: row.getBoundingClientRect().top - viewport.top };
					}
				}
			}
			let rows;
			try {
				rows = scroll.querySelectorAll("[data-chat-anchor-key]");
			} catch (_error) {
				return null;
			}
			for (const row of rows) {
				if (typeof row.getBoundingClientRect !== "function" || typeof row.getAttribute !== "function") continue;
				const key = row.getAttribute("data-chat-anchor-key");
				if (key === null || key === "") continue;
				const rect = row.getBoundingClientRect();
				if (rect.bottom <= viewport.top + 1 || rect.top >= viewport.bottom) continue;
				return { key, top: rect.top - viewport.top };
			}
			return null;
		}

		/**
		 * Put the same anchor row back at the same viewport offset. If the native
		 * anchoring already did it, the measured shift is ~0 and this is a no-op.
		 * Returns false when the row is gone (the caller then uses the height delta
		 * only if the native anchor left the scroll position untouched).
		 */
		function restoreAnchor(scroll, anchor) {
			if (anchor === null || typeof scroll.querySelectorAll !== "function" || typeof scroll.getBoundingClientRect !== "function") return false;
			let rows;
			try {
				rows = scroll.querySelectorAll("[data-chat-anchor-key]");
			} catch (_error) {
				return false;
			}
			const viewport = scroll.getBoundingClientRect();
			for (const row of rows) {
				if (typeof row.getAttribute !== "function" || row.getAttribute("data-chat-anchor-key") !== anchor.key) continue;
				if (typeof row.getBoundingClientRect !== "function") return false;
				const shift = row.getBoundingClientRect().top - viewport.top - anchor.top;
				if (Number.isFinite(shift) && Math.abs(shift) >= 1) scroll.scrollTop += shift;
				return true;
			}
			return false;
		}

		/**
		 * One shared scroll listener. The native "Load earlier" button captures the
		 * current first visible row before prepending, so a click lands the reader on
		 * the same row after the new page arrives. We click once per approach, well
		 * before the top, then wait for that page to settle before allowing another.
		 *
		 * One page per approach is deliberate: chaining a second click into the same
		 * approach fights the native scroll anchor (two prepends before the browser
		 * paints) and reads as a flicker. A user who keeps scrolling up re-enters the
		 * preload band after each anchored page and gets the next one.
		 */
		function createAutoLoader() {
			const states = new WeakMap();
			const timers = new Set();
			const frames = new Set();
			const raf = typeof requestAnimationFrame === "function" ? requestAnimationFrame : (callback) => setTimeout(callback, 16);
			const caf = typeof cancelAnimationFrame === "function" ? cancelAnimationFrame : (id) => clearTimeout(id);

			function clear(state) {
				if (state.timer === 0) return;
				clearTimeout(state.timer);
				timers.delete(state.timer);
				state.timer = 0;
			}

			/**
			 * Let the scroll frame paint, then capture the anchor and click once.
			 * Waiting here matters: clicking mid-scroll captures a moving anchor row
			 * and the prepend can visibly jump.
			 */
			function scheduleClick(scroll, state) {
				state.timer = setTimeout(() => {
					const timer = state.timer;
					state.timer = 0;
					timers.delete(timer);
					if (scroll.isConnected === false || state.busy || state.blocked) return;
					if (scroll.scrollTop > triggerPx(scroll)) return;
					const button = findLoadEarlierButton(scroll);
					if (button === null || button.disabled === true) return;
					state.busy = true;
					state.height = scroll.scrollHeight;
					state.top = scroll.scrollTop;
					state.anchor = findAnchor(scroll);
					button.click();
					watch(scroll, state, 0);
				}, SCROLL_IDLE_MS);
				timers.add(state.timer);
			}

			/** Put the pre-click row back where it was, with a height-only fallback. */
			function settle(scroll, state) {
				const delta = scroll.scrollHeight - state.height;
				if (delta <= 8) return false;
				const restored = restoreAnchor(scroll, state.anchor);
				if (!restored && Math.abs(scroll.scrollTop - state.top) <= 2) {
					scroll.scrollTop = state.top + delta;
				}
				return true;
			}

			/**
			 * Watch for the prepended page in animation frames, not on a timer: the
			 * correction then lands before the browser paints the first frame at the
			 * unanchored position. Waiting for a 120ms poll is exactly the flash a fast
			 * scroll can still expose.
			 */
			function watch(scroll, state, frameCount) {
				state.frame = raf(() => {
					const frame = state.frame;
					state.frame = 0;
					frames.delete(frame);
					if (scroll.isConnected === false) {
						state.busy = false;
						return;
					}
					const button = findLoadEarlierButton(scroll);
					if (button === null) {
						settle(scroll, state);
						state.busy = false;
						return;
					}
					if (button.disabled === true) {
						if (frameCount < MAX_FRAMES) {
							watch(scroll, state, frameCount + 1);
						} else {
							state.busy = false;
						}
						return;
					}
					if (!settle(scroll, state)) {
						if (frameCount < MAX_FRAMES) {
							watch(scroll, state, frameCount + 1);
							return;
						}
						state.busy = false;
						state.blocked = true;
						return;
					}
					state.busy = false;
				});
				frames.add(state.frame);
			}

			function onScroll(event) {
				const scroll = event.target;
				if (!isScrollTarget(scroll)) return;
				let state = states.get(scroll);
				if (state === undefined) {
					state = { timer: 0, frame: 0, busy: false, blocked: false, height: 0, top: 0, anchor: null };
					states.set(scroll, state);
				}
				if (state.busy) {
					// Keep the anchor on the row the reader is looking at now: fast
					// scrolling during the request must not snap back to click time.
					const current = findAnchor(scroll);
					// Only upward reader moves retarget the anchor. A downward jump is
					// usually the native anchor settling; retargeting there would hide a
					// wrong adjustment instead of correcting it.
					if (current !== null && scroll.scrollTop <= state.top + 2) {
						state.anchor = current;
						state.top = scroll.scrollTop;
					}
					return;
				}
				const limit = triggerPx(scroll);
				if (scroll.scrollTop > limit + RESET_MARGIN_PX) {
					state.blocked = false;
					clear(state);
					return;
				}
				if (scroll.scrollTop > limit) {
					clear(state);
					return;
				}
				if (state.blocked) return;
				if (state.timer !== 0) clear(state);
				scheduleClick(scroll, state);
			}

			onScroll.dispose = () => {
				for (const timer of timers) clearTimeout(timer);
				timers.clear();
				for (const frame of frames) caf(frame);
				frames.clear();
			};
			return onScroll;
		}
		//#endregion

		//#region plugin body
		const inject = [];

		/** @param {any} ctx */
		function apply(ctx) {
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "@local/dsh-ui-auto-load";
				tag.dataset.pluginCss = cssTagId;
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => tag.remove();
			}, "auto-load: styles");
			ctx.effect(() => {
				const onScroll = createAutoLoader();
				document.addEventListener("scroll", onScroll, { capture: true, passive: true });
				return () => {
					document.removeEventListener("scroll", onScroll, true);
					onScroll.dispose();
				};
			}, "auto-load: scroll listener");
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		exports.__internals = {
			MIN_TRIGGER_PX,
			MAX_TRIGGER_PX,
			TRIGGER_RATIO,
			SCROLL_IDLE_MS,
			MAX_FRAMES,
			RESET_MARGIN_PX,
			css,
			findLoadEarlierButton,
			isScrollTarget,
			triggerPx,
			findAnchor,
			restoreAnchor,
			createAutoLoader
		};
		return module.exports;
	}
});
