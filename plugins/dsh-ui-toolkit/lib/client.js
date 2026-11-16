window.__ModuleLoader__.load({
	id: "@local/dsh-ui-toolkit",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		const React = require("react");
		const h = React.createElement;

		//#region local UI primitives

	/**
	 * Local stand-ins for the UI atoms the merged features were built against.
	 *
	 * DSH 0.2.2 stopped shipping \`@deepseek-ai/dsh-client-ui-primitives\` as a
	 * runtime client module: it is now a build-time devDependency that every
	 * shipped client bundle inlines. The loader's require table therefore has
	 * no entry for it, so requiring it throws while the feature creators run.
	 * These implementations cover exactly the surface the toolkit uses
	 * (tooltip, menu surface, anchored position, outside dismissal, and the
	 * icons the features resolve by name) so the bundle stays self-contained.
	 *
	 * The API shape mirrors @deepseek-ai/dsh-client-ui-primitives 0.2.2-rc.3
	 * (MIT); the code below is an independent minimal implementation.
	 */

	/** Create the local primitives object for one client bundle. */
	function createLocalPrimitives(React, h, require) {
		let idCounter = 0;

		/** Chain a React event handler ahead of ours. */
		function chain(original, next) {
			return function chained(event) {
				if (typeof original === "function") original(event);
				next(event);
			};
		}

		/** Keep a ref current without discarding the child's own ref. */
		function mergeRef(ref, node) {
			if (typeof ref === "function") ref(node);
			else if (ref !== null && typeof ref === "object") ref.current = node;
		}

		/**
		 * Position a fixed panel above or below an anchor.
		 * Returns null until the panel can be measured.
		 */
		function useAnchoredPosition(options) {
			const open = options.open;
			const anchorRef = options.anchorRef;
			const panelRef = options.panelRef;
			const side = options.side === "bottom" ? "bottom" : "top";
			const gap = typeof options.gap === "number" ? options.gap : 8;
			const margin = typeof options.margin === "number" ? options.margin : 12;
			const [position, setPosition] = React.useState(null);

			React.useLayoutEffect(() => {
				if (!open) {
					setPosition(null);
					return undefined;
				}
				if (typeof window === "undefined" || typeof document === "undefined") return undefined;
				let disposed = false;
				let frame = 0;
				const measure = () => {
					frame = 0;
					if (disposed) return;
					const anchor = anchorRef !== null && anchorRef !== undefined ? anchorRef.current : null;
					const panel = panelRef !== null && panelRef !== undefined ? panelRef.current : null;
					if (anchor === null || anchor === undefined || panel === null || panel === undefined) return;
					if (anchor.isConnected === false || panel.isConnected === false) return;
					const anchorRect = anchor.getBoundingClientRect();
					const panelRect = panel.getBoundingClientRect();
					const width = panelRect.width;
					const height = panelRect.height;
					const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
					const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
					let left = anchorRect.left + anchorRect.width / 2 - width / 2;
					left = Math.max(margin, Math.min(left, viewportWidth - width - margin));
					let top = side === "top" ? anchorRect.top - height - gap : anchorRect.bottom + gap;
					if (side === "top" && top < margin && anchorRect.bottom + gap + height <= viewportHeight - margin) {
						top = anchorRect.bottom + gap;
					} else if (side === "bottom" && top + height > viewportHeight - margin && anchorRect.top - height - gap >= margin) {
						top = anchorRect.top - height - gap;
					}
					top = Math.max(margin, Math.min(top, viewportHeight - height - margin));
					const next = { left: Math.round(left), top: Math.round(top) };
					setPosition((current) => {
						if (current !== null && current.left === next.left && current.top === next.top) return current;
						return next;
					});
				};
				const schedule = () => {
					if (frame !== 0 || disposed) return;
					if (typeof requestAnimationFrame === "function") frame = requestAnimationFrame(measure);
					else measure();
				};
				schedule();
				let observer = null;
				if (typeof ResizeObserver === "function") {
					observer = new ResizeObserver(schedule);
					const panel = panelRef !== null && panelRef !== undefined ? panelRef.current : null;
					if (panel !== null && panel !== undefined) observer.observe(panel);
				}
				window.addEventListener("resize", schedule);
				window.addEventListener("scroll", schedule, true);
				return () => {
					disposed = true;
					if (frame !== 0 && typeof cancelAnimationFrame === "function") cancelAnimationFrame(frame);
					if (observer !== null) observer.disconnect();
					window.removeEventListener("resize", schedule);
					window.removeEventListener("scroll", schedule, true);
				};
			}, [open, anchorRef, panelRef, side, gap, margin]);

			return position;
		}

		/** Close a trigger-owned popover on an outside pointerdown. */
		function useDismissOnOutsidePointer(root, open, setOpen, portal) {
			React.useEffect(() => {
				if (!open) return undefined;
				if (typeof document === "undefined") return undefined;
				const onPointerDown = (event) => {
					if (!(event.target instanceof Node)) return;
					const insideRoot = root !== null && root !== undefined && root.current !== null && root.current.contains(event.target);
					const insidePortal = portal !== null && portal !== undefined && portal.current !== null && portal.current.contains(event.target);
					if (!insideRoot && !insidePortal) setOpen(false);
				};
				document.addEventListener("pointerdown", onPointerDown);
				return () => document.removeEventListener("pointerdown", onPointerDown);
			}, [root, open, setOpen, portal]);
		}

		/** Hover/focus tooltip; renders a fixed bubble in a body portal. */
		function Tooltip(props) {
			const label = props.label;
			const side = props.side === "bottom" ? "bottom" : "top";
			const delayMs = typeof props.delayMs === "number" ? props.delayMs : 0;
			const disabled = props.disabled === true;
			const openOnClick = props.openOnClick === true;
			const [open, setOpen] = React.useState(false);
			const [position, setPosition] = React.useState(null);
			const anchor = React.useRef(null);
			const bubble = React.useRef(null);
			const timer = React.useRef(null);
			const id = React.useRef(null);
			if (id.current === null) {
				idCounter += 1;
				id.current = "uit-tooltip-" + idCounter;
			}
			const clearTimer = () => {
				if (timer.current !== null) {
					clearTimeout(timer.current);
					timer.current = null;
				}
			};
			const show = () => {
				if (disabled) return;
				clearTimer();
				if (delayMs > 0) timer.current = setTimeout(() => setOpen(true), delayMs);
				else setOpen(true);
			};
			const hide = () => {
				clearTimer();
				setOpen(false);
			};
			React.useEffect(() => () => clearTimer(), []);
			React.useEffect(() => {
				if (disabled) hide();
			}, [disabled]);
			React.useLayoutEffect(() => {
				if (!open || disabled) {
					setPosition(null);
					return undefined;
				}
				const place = () => {
					const anchorNode = anchor.current;
					const bubbleNode = bubble.current;
					if (anchorNode === null || bubbleNode === null) return;
					const anchorRect = anchorNode.getBoundingClientRect();
					const bubbleRect = bubbleNode.getBoundingClientRect();
					const viewportWidth = window.innerWidth || 0;
					const viewportHeight = window.innerHeight || 0;
					let left = anchorRect.left + anchorRect.width / 2 - bubbleRect.width / 2;
					left = Math.max(8, Math.min(left, viewportWidth - bubbleRect.width - 8));
					let top = side === "top" ? anchorRect.top - bubbleRect.height - 6 : anchorRect.bottom + 6;
					if (top < 8) top = anchorRect.bottom + 6;
					if (top + bubbleRect.height > viewportHeight - 8) top = anchorRect.top - bubbleRect.height - 6;
					setPosition({ left: Math.round(left), top: Math.round(top) });
				};
				place();
				window.addEventListener("resize", place);
				window.addEventListener("scroll", place, true);
				return () => {
					window.removeEventListener("resize", place);
					window.removeEventListener("scroll", place, true);
				};
			}, [open, disabled, side, label]);
			const child = props.children;
			if (child === null || child === undefined || typeof child !== "object") return child;
			const childRef = child.ref;
			const childProps = child.props !== null && child.props !== undefined ? child.props : {};
			const anchorProps = {
				ref: (node) => {
					anchor.current = node;
					mergeRef(childRef, node);
				},
				onMouseEnter: chain(childProps.onMouseEnter, show),
				onMouseLeave: chain(childProps.onMouseLeave, hide),
				onFocus: chain(childProps.onFocus, show),
				onBlur: chain(childProps.onBlur, hide),
				onPointerDown: chain(childProps.onPointerDown, openOnClick ? () => setOpen((value) => !value) : hide),
				"aria-describedby": open ? id.current : undefined
			};
			const rendered = React.cloneElement(child, anchorProps);
			if (!open) return rendered;
			const resolved = typeof label === "function" ? label() : label;
			let ReactDOM = null;
			try {
				ReactDOM = require("react-dom");
			} catch (_error) {
				ReactDOM = null;
			}
			const bubbleNode = h("span", {
				ref: bubble,
				id: id.current,
				role: "tooltip",
				style: {
					position: "fixed",
					left: position === null ? 0 : position.left,
					top: position === null ? 0 : position.top,
					visibility: position === null ? "hidden" : "visible",
					zIndex: 1300,
					maxWidth: "min(320px, calc(100vw - 24px))",
					padding: "5px 8px",
					borderRadius: "6px",
					background: "var(--dsw-alias-bg-layer-3, var(--dsw-specific-menu, #2b2b2b))",
					color: "var(--dsw-alias-label-primary, #fff)",
					boxShadow: "var(--dsw-elevation-prominent, 0 4px 12px rgba(0,0,0,.28))",
					fontSize: "12px",
					lineHeight: "18px",
					pointerEvents: "none",
					whiteSpace: "normal"
				}
			}, resolved);
			const portalTarget = typeof document !== "undefined" ? document.body : null;
			const portal = ReactDOM !== null && typeof ReactDOM.createPortal === "function" && portalTarget !== null
				? ReactDOM.createPortal(bubbleNode, portalTarget)
				: bubbleNode;
			return h(React.Fragment, null, rendered, portal);
		}

		/** Shared menu material seat. Class-provided styling stays authoritative. */
		const MenuSurface = React.forwardRef(function MenuSurface(props, ref) {
			const className = props.className === undefined ? "uit_menuSurface" : "uit_menuSurface " + props.className;
			const rest = {};
			for (const key of Object.keys(props)) {
				if (key !== "className" && key !== "children") rest[key] = props[key];
			}
			rest.ref = ref;
			rest.className = className;
			return h("div", rest, props.children);
		});

		/** Build a stroke icon component. */
		function strokeIcon(path, viewBox) {
			return function Icon(props) {
				const size = typeof props.size === "number" ? props.size : 16;
				const className = props.className;
				return h("svg", {
					width: size,
					height: size,
					viewBox: viewBox || "0 0 16 16",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: 1.5,
					strokeLinecap: "round",
					strokeLinejoin: "round",
					className,
					"aria-hidden": "true"
				}, h("path", { d: path }));
			};
		}

		function filledIcon(path, viewBox) {
			return function Icon(props) {
				const size = typeof props.size === "number" ? props.size : 16;
				return h("svg", {
					width: size,
					height: size,
					viewBox: viewBox || "0 0 16 16",
					fill: "currentColor",
					className: props.className,
					"aria-hidden": "true"
				}, h("path", { d: path }));
			};
		}

		function EllipsisIcon(props) {
			const size = typeof props.size === "number" ? props.size : 16;
			return h("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				fill: "currentColor",
				className: props.className,
				"aria-hidden": "true"
			},
				h("circle", { cx: 3, cy: 8, r: 1.5 }),
				h("circle", { cx: 8, cy: 8, r: 1.5 }),
				h("circle", { cx: 13, cy: 8, r: 1.5 })
			);
		}

		const IconBranch = filledIcon("M5 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 5.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Zm6 1.3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0-1.2a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4ZM5.6 6.5c0 2.2 1.6 3.9 3.8 3.9h.6v1.2h-.6c-2.9 0-5.1-2.3-5.1-5.1V6.5h1.3Z");
		const IconCheck = strokeIcon("M3.2 8.3l3 3 6.6-6.7");
		const IconChevronDown = strokeIcon("M4 6l4 4 4-4");
		const IconChevronRight = strokeIcon("M6 4l4 4-4 4");
		const IconDownload = strokeIcon("M8 2v8m0 0 3-3m-3 3L5 7M3 13h10");
		const IconData = strokeIcon("M3 4.5c0-1.1 2.2-2 5-2s5 .9 5 2v7c0 1.1-2.2 2-5 2s-5-.9-5-2v-7Zm0 0c0 1.1 2.2 2 5 2s5-.9 5-2M3 8c0 1.1 2.2 2 5 2s5-.9 5-2");

		return {
			Tooltip,
			MenuSurface,
			useAnchoredPosition,
			useDismissOnOutsidePointer,
			IconBranchOutline16: IconBranch,
			IconBranchOutlineRegular: IconBranch,
			IconCheckOutline14: IconCheck,
			IconCheckOutline16: IconCheck,
			IconCheckOutlineRegular: IconCheck,
			IconChevronDownOutline14: IconChevronDown,
			IconChevronDownOutlineRegular: IconChevronDown,
			IconChevronRightOutlineRegular: IconChevronRight,
			IconEllipsisOutline16: EllipsisIcon,
			IconEllipsisOutlineRegular: EllipsisIcon,
			IconDownloadOutline16: IconDownload,
			IconDownloadOutlineRegular: IconDownload,
			IconDataOutlineRegular: IconData
		};
	}

		/**
		 * DSH 0.2.2 no longer exposes @deepseek-ai/dsh-client-ui-primitives to
		 * runtime client bundles. Route that specifier at the local shim so the
		 * features built against it keep loading; every other specifier continues
		 * through the loader's module table unchanged.
		 */
		const toolkitPrimitives = createLocalPrimitives(React, h, require);
		const toolkitRequire = (id) => id === "@deepseek-ai/dsh-client-ui-primitives" ? toolkitPrimitives : require(id);
		// The terminal feature lazy-loads its xterm chunk through require.async;
		// a plain wrapper function would drop the loader's non-call properties.
		toolkitRequire.async = typeof require.async === "function" ? require.async : undefined;
		toolkitRequire.asset = typeof require.asset === "function" ? require.asset : undefined;
		//#endregion

		//#region vendored xterm

		//#endregion

		/**
		 * Shared sidebar-entry store created by apply(). The feature creator reads
		 * it through this closure; keeping it here lets the settings section and
		 * the running feature observe the same snapshot.
		 */
		let sidebarEntriesHost = null;

		//#region merged feature factories
		// feature: composer-hud.client.js
		function createComposerHud(require) {
		var module = { exports: {} };
		var exports = module.exports;
		const React = require("react");
		const ReactDOM = require("react-dom");
		const primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		const h = React.createElement;

		//#region styles
		const css = [
			// A ring alone, left of the model name: Codex keeps its footer to one glance.
			// The toolbar reserves 12px between entries and the model trigger adds its
			// own 8px inset, which leaves a 20px hole around a 16px ring. Pulling the
			// ring 8px toward the trigger settles it at ~12px to the model text.
			".chud_stat{min-width:0;flex:none;display:inline-flex;align-items:center;margin-right:-8px}",
			".chud_button{border-radius:999px;color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;align-items:center;justify-content:center;padding:3px;line-height:0;display:inline-flex}",
			".chud_button:hover,.chud_button[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}",
			".chud_button[data-level=warn]{color:var(--dsw-alias-state-warn-primary)}",
			".chud_button[data-level=critical]{color:var(--dsw-alias-state-error-primary)}",
			".chud_button svg{flex:none;width:16px;height:16px;display:block}",
			".chud_button:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}",
			// One panel owns both readings, so the disabled dock keeps no detail surface.
			".chud_panel{z-index:1100;box-sizing:border-box;border-radius:var(--dsw-radius-lg);background:var(--dsw-specific-menu);width:min(320px,100vw - 24px);max-height:min(70vh,520px);overflow-y:auto;backdrop-filter:var(--dsw-menu-backdrop-filter);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-secondary);cursor:default;border:0;padding:12px;font-size:12px;line-height:20px;position:fixed}",
			".chud_header{align-items:center;gap:6px;display:flex}",
			".chud_title{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;line-height:20px}",
			".chud_reading{margin-left:auto;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;font-weight:500}",
			".chud_figures{margin-top:8px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}",
			".chud_bar{corner-shape:round;background:var(--dsw-alias-interactive-bg-hover);border-radius:999px;gap:1px;height:4px;margin:8px 0 10px;display:flex;overflow:hidden}",
			".chud_segment{background:var(--chud-tint,var(--dsw-alias-label-tertiary));border-radius:1px;flex:none;min-width:2px;height:100%}",
			".chud_swatch{background:var(--chud-tint);vertical-align:baseline;border-radius:2px;width:8px;height:8px;margin-right:6px;display:inline-block}",
			".chud_system{--chud-tint:var(--dsw-static-neutral-bluish-400)}",
			".chud_tools{--chud-tint:#a78bfa}",
			".chud_messages{--chud-tint:var(--dsw-static-blue-450)}",
			".chud_rows{margin:0}",
			".chud_row{justify-content:space-between;align-items:center;gap:12px;padding:2px 0;display:flex}",
			".chud_row dt{color:var(--dsw-alias-label-secondary)}",
			".chud_row dd{font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary);margin:0}",
			".chud_row.chud_total dt,.chud_row.chud_total dd{color:var(--dsw-alias-label-primary);font-weight:500}",
			".chud_rule{border-top:.5px solid var(--dsw-alias-border-l2);margin:10px 0}",
			".chud_sectionTitle{color:var(--dsw-alias-label-caption);text-transform:uppercase;letter-spacing:.04em;margin:0 0 2px;font-size:11px;font-weight:500;line-height:16px}",
			// Codex hides per-turn token chatter; the readings above replace it.
			"[data-composer-dock] [data-composer-stat=activity],[data-composer-dock] [data-composer-stat=usage],[data-composer-dock]>span:not([data-composer-stat]){display:none!important}"
		].join("");
		const cssTagId = "@local/dsh-composer-hud/composer-hud.css";

		//#region dictionaries
		const zh = {
			"hud.aria.context": "上下文剩余 {percent}%",
			"hud.aria.tokens": "{tokens} token",
			"hud.aria.cache": "缓存命中 {percent}%",
			"hud.label.tokens": "{tokens} tok",
			"hud.dialog": "上下文与用量",
			"hud.used": "已用 {percent}%",
			"hud.system": "系统提示",
			"hud.tools": "工具",
			"hud.messages": "对话",
			"hud.tokens": "Token 用量",
			"hud.input": "未缓存输入",
			"hud.cacheRead": "缓存读取",
			"hud.cacheWrite": "缓存写入",
			"hud.output": "输出",
			"hud.total": "合计",
			"hud.cacheHit": "缓存命中",
			"hud.session": "本次会话",
			"hud.turnsSteps": "轮次 · 步骤",
			"hud.speed": "速度",
			"hud.speedValue": "{tps} tok/s"
		};
		const en = {
			"hud.aria.context": "Context left {percent}%",
			"hud.aria.tokens": "{tokens} tokens",
			"hud.aria.cache": "Cache hit {percent}%",
			"hud.label.tokens": "{tokens} tok",
			"hud.dialog": "Context & usage",
			"hud.used": "{percent}% used",
			"hud.system": "System prompt",
			"hud.tools": "Tools",
			"hud.messages": "Conversation",
			"hud.tokens": "Token usage",
			"hud.input": "Uncached input",
			"hud.cacheRead": "Cache read",
			"hud.cacheWrite": "Cache write",
			"hud.output": "Output",
			"hud.total": "Total",
			"hud.cacheHit": "Cache hit",
			"hud.session": "This session",
			"hud.turnsSteps": "Turns · steps",
			"hud.speed": "Speed",
			"hud.speedValue": "{tps} tok/s"
		};
		//#endregion

		//#region helpers
		const MEASURE_STYLE = { visibility: "hidden", left: 0, top: 0 };
		const RADIUS = 6.5;
		const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

		/** @param {number} value */
		function round1(value) {
			return Math.round(value * 10) / 10;
		}

		/** Integer text unless a real fraction exists. @param {number} value */
		function percentText(value) {
			const rounded = round1(Math.max(0, Math.min(100, value)));
			return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
		}

		/**
		 * Compact K/M token text, matching the built-in readings.
		 * @param {number} value
		 */
		function compactNumber(value) {
			const scaled = (candidate) => {
				const rounded = round1(candidate);
				return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
			};
			if (value >= 1e6) return `${scaled(value / 1e6)}M`;
			if (value >= 1e3) return `${scaled(value / 1e3)}K`;
			return String(Math.round(value));
		}

		/** @param {number} value */
		function exactNumber(value) {
			const locale = (typeof document !== "undefined" && document.documentElement.lang) || undefined;
			try {
				return new Intl.NumberFormat(locale).format(Math.round(value));
			} catch {
				return String(Math.round(value));
			}
		}

		/**
		 * Resolve bounded display occupancy from independently updated pressure
		 * fields, mirroring the built-in context meter.
		 * @param {any} pressure
		 */
		function contextOccupancy(pressure) {
			const usedTokens = pressure?.projectedTokens ?? pressure?.pressureTokens;
			if (usedTokens === undefined || pressure?.contextWindow === undefined) return null;
			return {
				percent: Math.min(100, Math.round((usedTokens / pressure.contextWindow) * 100)),
				usedTokens,
				contextWindow: pressure.contextWindow
			};
		}

		/** @param {any} usage */
		function billedInputTokens(usage) {
			if (usage === undefined || usage === null) return 0;
			return (usage.uncachedInputTokens ?? 0) + (usage.cacheReadTokens ?? 0) + (usage.cacheWriteTokens ?? 0);
		}

		/** @param {any} usage */
		function totalTokens(usage) {
			return billedInputTokens(usage) + (usage?.outputTokens ?? 0);
		}

		/**
		 * Display-ready cache-hit share of prompt-side input. Returns null when no
		 * billed input exists.
		 * @param {any} usage
		 */
		function cacheHitPercent(usage) {
			const denominator = billedInputTokens(usage);
			if (denominator === 0) return null;
			const raw = ((usage.cacheReadTokens ?? 0) / denominator) * 100;
			return raw >= 99.95 ? 100 : round1(raw);
		}

		/** @param {any} stats */
		function decodeSpeed(stats) {
			if (stats === undefined || stats.decodeMs === undefined || stats.decodeMs <= 0) return null;
			return Math.round(stats.decodeTokens / (stats.decodeMs / 1e3));
		}
		//#endregion

		//#region icons
		/**
		 * The same 14px occupancy ring the built-in meter uses, so the moved
		 * reading keeps its visual identity.
		 * @param {{ percent: number }} props
		 */
		function Ring({ percent }) {
			const clamped = Math.max(0, Math.min(100, percent));
			return h("svg", { viewBox: "0 0 16 16", width: 16, height: 16, "aria-hidden": true },
				h("circle", {
					cx: 8,
					cy: 8,
					r: RADIUS,
					fill: "none",
					stroke: "var(--dsw-alias-border-l3)",
					"stroke-width": 2
				}),
				h("circle", {
					cx: 8,
					cy: 8,
					r: RADIUS,
					fill: "none",
					stroke: "currentColor",
					"stroke-width": 2,
					"stroke-linecap": "round",
					strokeDasharray: `${(CIRCUMFERENCE * clamped) / 100} ${CIRCUMFERENCE}`,
					transform: "rotate(-90 8 8)"
				})
			);
		}
		//#endregion

		//#region components
		/** Trigger-anchored panel: clamped placement, outside close, Escape close. */
		function useStatusDialog() {
			const [open, setOpen] = React.useState(false);
			const rootRef = React.useRef(null);
			const panelRef = React.useRef(null);
			const pos = primitives.useAnchoredPosition({
				open,
				anchorRef: rootRef,
				panelRef,
				side: "top",
				gap: 8,
				margin: 12
			});
			primitives.useDismissOnOutsidePointer(rootRef, open, setOpen, panelRef);
			React.useEffect(() => {
				if (!open) return;
				const onKeyDown = (event) => {
					if (event.key === "Escape") setOpen(false);
				};
				document.addEventListener("keydown", onKeyDown);
				return () => document.removeEventListener("keydown", onKeyDown);
			}, [open]);
			return { open, setOpen, rootRef, panelRef, pos };
		}

		/** @param {{ label: string, value: string, className?: string }} props */
		function DetailRow({ label, value, className }) {
			return h("div", { className: className === undefined ? "chud_row" : `chud_row ${className}` },
				h("dt", null, label),
				h("dd", null, value)
			);
		}

		/**
		 * The composer reading: `21% · 16M tok`, clickable for one panel that
		 * carries the context composition and the token/cache ledger.
		 * @param {{ useProjection?: (key: string) => any, t?: (key: string, values?: Record<string, unknown>) => string }} props
		 */
		function StatusPill({ useProjection, t }) {
			const tr = typeof t === "function" ? t : (key) => key;
			const pressure = typeof useProjection === "function" ? useProjection("contextPressure") : undefined;
			const breakdown = typeof useProjection === "function" ? useProjection("contextBreakdown") : undefined;
			const usage = typeof useProjection === "function" ? useProjection("tokenUsage") : undefined;
			const stats = typeof useProjection === "function" ? useProjection("sessionStats") : undefined;
			const { open, setOpen, rootRef, panelRef, pos } = useStatusDialog();
			const context = contextOccupancy(pressure);
			const total = totalTokens(usage);
			const cacheHit = cacheHitPercent(usage);
			if (context === null && total === 0) return null;

			const remaining = context === null ? 0 : Math.max(0, 100 - context.percent);
			const level = remaining <= 10 ? "critical" : remaining <= 25 ? "warn" : "ok";
			const ariaParts = [];
			if (context !== null) ariaParts.push(tr("hud.aria.context", { percent: remaining }));
			if (total > 0) ariaParts.push(tr("hud.aria.tokens", { tokens: compactNumber(total) }));
			if (cacheHit !== null) ariaParts.push(tr("hud.aria.cache", { percent: percentText(cacheHit) }));
			const aria = ariaParts.join(" · ");

			const breakdownTotal = breakdown === undefined ? 0
				: breakdown.systemTokens + breakdown.toolsTokens + breakdown.messageTokens;
			const segments = context === null ? [] : breakdownTotal > 0
				? [
					{ key: "system", color: "chud_system", width: (context.percent * breakdown.systemTokens) / breakdownTotal },
					{ key: "tools", color: "chud_tools", width: (context.percent * breakdown.toolsTokens) / breakdownTotal },
					{ key: "messages", color: "chud_messages", width: (context.percent * breakdown.messageTokens) / breakdownTotal }
				].filter((segment) => segment.width > 0)
				: [{ key: "total", color: undefined, width: context.percent }];

			const toggle = () => setOpen(!open);

			const contextRows = context !== null && breakdownTotal > 0
				? [
					["chud_system", "hud.system", breakdown.systemTokens],
					["chud_tools", "hud.tools", breakdown.toolsTokens],
					["chud_messages", "hud.messages", breakdown.messageTokens]
				].map(([color, key, tokens]) => h(DetailRow, {
					key,
					className: undefined,
					label: h(React.Fragment, null,
						h("span", { className: `chud_swatch ${color}`, "aria-hidden": true }),
						tr(key)
					),
					value: `~${compactNumber(tokens)}`
				}))
				: null;

			const tokenRows = usage === undefined || total === 0 ? null : [
				h(DetailRow, { key: "input", label: tr("hud.input"), value: exactNumber(usage.uncachedInputTokens) }),
				h(DetailRow, { key: "cacheRead", label: tr("hud.cacheRead"), value: exactNumber(usage.cacheReadTokens) }),
				usage.cacheWriteTokens > 0
					? h(DetailRow, { key: "cacheWrite", label: tr("hud.cacheWrite"), value: exactNumber(usage.cacheWriteTokens) })
					: null,
				h(DetailRow, { key: "output", label: tr("hud.output"), value: exactNumber(usage.outputTokens) }),
				h(DetailRow, { key: "total", className: "chud_total", label: tr("hud.total"), value: exactNumber(total) }),
				cacheHit === null
					? null
					: h(DetailRow, { key: "cacheHit", label: tr("hud.cacheHit"), value: `${percentText(cacheHit)}%` })
			];

			const sessionRows = stats === undefined ? null : [
				h(DetailRow, {
					key: "turnsSteps",
					label: tr("hud.turnsSteps"),
					value: `${stats.turns} · ${stats.steps}`
				}),
				decodeSpeed(stats) === null
					? null
					: h(DetailRow, {
						key: "speed",
						label: tr("hud.speed"),
						value: tr("hud.speedValue", { tps: decodeSpeed(stats) })
					})
			];

			const panelBody = h("div", {
				ref: panelRef,
				className: "chud_panel",
				style: pos ?? MEASURE_STYLE,
				role: "dialog",
				"aria-label": tr("hud.dialog")
			},
				h("div", { className: "chud_header" },
					h(Ring, { percent: remaining }),
					h("span", { className: "chud_title" }, tr("hud.dialog")),
					context === null ? null : h("span", { className: "chud_reading" }, tr("hud.used", { percent: context.percent }))
				),
				context === null ? null : h("div", { className: "chud_figures" },
					`~${compactNumber(context.usedTokens)} / ${compactNumber(context.contextWindow)}`
				),
				context === null ? null : h("div", { className: "chud_bar", "aria-hidden": true },
					segments.map((segment) => h("span", {
						key: segment.key,
						className: segment.color === undefined ? "chud_segment" : `chud_segment ${segment.color}`,
						style: { width: `${segment.width}%` }
					}))
				),
				contextRows === null ? null : h("dl", { className: "chud_rows" }, contextRows),
				context !== null && (tokenRows !== null || sessionRows !== null)
					? h("div", { className: "chud_rule", "aria-hidden": true })
					: null,
				tokenRows === null ? null : h("section", null,
					h("h3", { className: "chud_sectionTitle" }, tr("hud.tokens")),
					h("dl", { className: "chud_rows" }, tokenRows)
				),
				tokenRows !== null && sessionRows !== null
					? h("div", { className: "chud_rule", "aria-hidden": true })
					: null,
				sessionRows === null ? null : h("section", null,
					h("h3", { className: "chud_sectionTitle" }, tr("hud.session")),
					h("dl", { className: "chud_rows" }, sessionRows)
				)
			);
			const panel = open ? ReactDOM.createPortal(panelBody, document.body) : null;

			return h(React.Fragment, null,
				h("span", { className: "chud_stat", ref: rootRef },
					h(primitives.Tooltip, {
						label: aria,
						side: "top",
						delayMs: 200,
						disabled: open,
						children: h("button", {
							type: "button",
							className: "chud_button",
							"data-level": level,
							"aria-haspopup": "dialog",
							"aria-expanded": open,
							"aria-label": aria,
							onClick: toggle
						},
							h(Ring, { percent: remaining }),
						)
					})
				),
				panel
			);
		}
		//#endregion

		//#region plugin body
		const NS = "composer-hud";
		const inject = ["slots", "locale"];

		/** @param {any} ctx */
		function apply(ctx) {
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "@local/dsh-composer-hud";
				tag.dataset.pluginCss = cssTagId;
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => {
					tag.remove();
				};
			}, "composer-hud: styles");
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "composer-hud: dictionaries");
			// `conversation.input.right` seats the ring immediately left of the model
			// name, inside the composer tool row.
			ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
				name: "conversation.input.right",
				id: "composer-hud",
				order: 0,
				locale: NS
			}, StatusPill));
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		exports.StatusPill = StatusPill;
		exports.__internals = {
			cacheHitPercent,
			compactNumber,
			contextOccupancy,
			decodeSpeed,
			percentText,
			totalTokens
		};
		return module.exports;
		}

		// feature: git-branch.client.js
		function createGitBranch(require) {
		var module = { exports: {} };
		var exports = module.exports;
		const React = require("react");
		const ReactDOM = require("react-dom");
		const primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		const h = React.createElement;

		// The primitives package renamed its icons between releases. Resolve the
		// current names first, then the older Regular names, then an inline glyph.
		// The control must never take the composer down because a glyph moved.
		const Tooltip = typeof primitives.Tooltip === "function" ? primitives.Tooltip : ({ children }) => children;
		const useAnchoredPosition = typeof primitives.useAnchoredPosition === "function" ? primitives.useAnchoredPosition : () => null;
		const useDismissOnOutsidePointer = typeof primitives.useDismissOnOutsidePointer === "function" ? primitives.useDismissOnOutsidePointer : () => {};

		function BranchGlyph(props) {
			return h("svg", { viewBox: "0 0 16 16", width: 16, height: 16, "aria-hidden": true, ...props },
				h("path", { d: "M5 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 5.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Zm6 1.3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0-1.2a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4ZM5.6 6.5c0 2.2 1.6 3.9 3.8 3.9h.6v1.2h-.6c-2.9 0-5.1-2.3-5.1-5.1V6.5h1.3Z", fill: "currentColor" })
			);
		}
		function CheckGlyph(props) {
			return h("svg", { viewBox: "0 0 16 16", width: 14, height: 14, "aria-hidden": true, ...props },
				h("path", { d: "m3.2 8.3 3 3 6.6-6.7", fill: "none", stroke: "currentColor", "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round" })
			);
		}
		function ChevronGlyph(props) {
			return h("svg", { viewBox: "0 0 16 16", width: 14, height: 14, "aria-hidden": true, ...props },
				h("path", { d: "m4 6 4 4 4-4", fill: "none", stroke: "currentColor", "stroke-width": 1.5, "stroke-linecap": "round", "stroke-linejoin": "round" })
			);
		}
		const IconBranch = primitives.IconBranchOutline16 ?? primitives.IconBranchOutlineRegular ?? BranchGlyph;
		const IconCheck = primitives.IconCheckOutline14 ?? primitives.IconCheckOutline16 ?? primitives.IconCheckOutlineRegular ?? CheckGlyph;
		const IconChevron = primitives.IconChevronDownOutline14 ?? primitives.IconChevronDownOutlineRegular ?? ChevronGlyph;

		//#region styles
		const css = [
			// Trigger: the same 28px seat as the permission and model controls.
			".gb_root{min-width:0;position:relative;display:inline-flex;align-items:center}",
			".gb_trigger{border-radius:var(--dsw-radius-sm);min-width:0;max-width:220px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:inline-flex}",
			".gb_trigger:hover:not(:disabled),.gb_trigger[data-open]{background:var(--dsw-alias-interactive-bg-hover)}",
			".gb_trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}",
			".gb_trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}",
			".gb_icon{color:var(--dsw-alias-label-tertiary);flex:none;display:inline-flex}",
			".gb_icon svg{width:14px;height:14px}",
			".gb_label{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}",
			".gb_dirty{background:var(--dsw-alias-state-warn-primary);border-radius:50%;flex:none;width:5px;height:5px}",
			".gb_track{color:var(--dsw-alias-label-caption);font-variant-numeric:tabular-nums;letter-spacing:-.02em;flex:none;font-size:11px;line-height:16px}",
			".gb_chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s;display:inline-flex}",
			".gb_chevron[data-open]{transform:rotate(180deg)}",
			// Panel: Codex-style flat menu, but with a search field and branch meta.
			".gb_menu{box-sizing:border-box;z-index:1100;position:fixed;width:min(340px,100vw - 24px);max-height:min(480px,100vh - 96px);background:var(--dsw-specific-menu);box-shadow:0 12px 32px #00000024,0 2px 8px #00000012,0 0 0 .5px #0000000f;color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border:0;border-radius:20px;flex-direction:column;padding:0;display:flex;overflow:hidden}",
			".gb_head{align-items:flex-start;gap:10px;padding:13px 14px 10px;display:flex}",
			".gb_headText{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}",
			".gb_repo{text-overflow:ellipsis;white-space:nowrap;min-width:0;font-size:13px;font-weight:600;line-height:18px;overflow:hidden}",
			".gb_path{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-caption);font-size:10px;line-height:15px;overflow:hidden}",
			".gb_now{color:var(--dsw-alias-label-secondary);align-items:center;gap:4px;max-width:42%;flex:none;padding-top:1px;font-size:11px;line-height:16px;display:inline-flex}",
			".gb_nowLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}",
			".gb_nowDot{background:var(--dsw-alias-state-success-primary);border-radius:50%;flex:none;width:5px;height:5px}",
			".gb_searchWrap{padding:0 10px 8px;flex:none}",
			".gb_search{box-sizing:border-box;width:100%;height:30px;border-radius:var(--dsw-radius-md);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);border:none;outline:none;padding:0 10px;font:inherit;font-size:13px;line-height:18px}",
			".gb_search::placeholder{color:var(--dsw-alias-label-tertiary)}",
			".gb_search:focus{box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}",
			".gb_list{min-height:0;overflow-y:auto;padding:0 6px 6px}",
			".gb_row{box-sizing:border-box;border-radius:var(--dsw-radius-md);width:100%;height:34px;min-height:34px;color:inherit;text-align:left;cursor:pointer;background:0 0;border:none;outline:none;align-items:center;gap:6px;padding:5px 7px;display:flex}",
			".gb_row:hover:not(:disabled),.gb_row[data-active]{background:var(--dsw-alias-interactive-bg-hover)}",
			".gb_row:focus-visible{box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}",
			".gb_row:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}",
			".gb_check{color:var(--dsw-alias-label-primary);flex:none;width:16px;height:16px;place-items:center;display:grid}",
			".gb_check svg{width:14px;height:14px}",
			".gb_branchName{text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1;font-size:13px;line-height:18px;overflow:hidden}",
			".gb_meta{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;align-items:center;gap:6px;flex:none;font-size:11px;line-height:16px;display:inline-flex}",
			".gb_upstream{text-overflow:ellipsis;white-space:nowrap;max-width:96px;overflow:hidden}",
			".gb_ahead{color:var(--dsw-alias-state-success-primary)}",
			".gb_behind{color:var(--dsw-alias-state-warn-primary)}",
			".gb_gone{color:var(--dsw-alias-state-error-primary)}",
			".gb_empty{color:var(--dsw-alias-label-tertiary);padding:12px 8px 14px;font-size:13px;line-height:18px}",
			".gb_error{margin:0 10px 8px;color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 8%,transparent);border-radius:var(--dsw-radius-md);padding:8px 10px;font-size:12px;line-height:17px}",
			".gb_errorTitle{font-weight:500}",
			".gb_errorDetail{max-height:72px;overflow:auto;color:var(--dsw-alias-label-tertiary);margin:4px 0 0;white-space:pre-wrap;word-break:break-word;font-family:var(--dsw-font-mono,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:10px;line-height:14px}",
			".gb_foot{border-top:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-caption);flex:none;padding:8px 14px 10px;font-size:10px;line-height:15px}",
			".gb_footRow{align-items:center;gap:6px;display:flex}",
			".gb_warn{color:var(--dsw-alias-state-warn-primary)}",
			".gb_spinner{width:12px;height:12px;border-radius:50%;border:1.5px solid var(--dsw-alias-border-l3);border-top-color:var(--dsw-alias-label-secondary);flex:none;animation:gb_spin .7s linear infinite;display:inline-block}",
			"@keyframes gb_spin{to{transform:rotate(360deg)}}",
			"@media (prefers-reduced-motion:reduce){.gb_spinner{animation:none;border-top-color:var(--dsw-alias-label-tertiary)}}"
		].join("");
		const cssTagId = "@local/dsh-git-branch/git-branch.css";

		//#region dictionaries
		const zh = {
			"trigger.aria": "Git 分支：{branch}（{repo}）",
			"trigger.tooltip": "{repo} · {branch} · {detail}",
			"dialog": "Git 分支",
			"current": "当前",
			"search": "搜索本地分支",
			"noBranches": "没有本地分支",
			"noMatch": "没有匹配的分支",
			"count": "{count} 个本地分支",
			"switching": "正在切换到 {branch}…",
			"operation": "仓库正在进行 {operation}",
			"unborn": "尚无提交",
			"unknown": "未命名分支",
			"clean": "工作区干净",
			"unknownChanges": "状态不可用",
			"dirty": "{count} 个未提交更改",
			"dirtyOne": "1 个未提交更改",
			"ahead": "领先 {count}",
			"behind": "落后 {count}",
			"upstreamGone": "上游已删除",
			"operation.merge": "合并",
			"operation.rebase": "变基",
			"operation.cherry-pick": "拣选提交",
			"operation.revert": "回退提交",
			"operation.bisect": "二分查找",
			"error.dirty-conflict": "有未提交的更改会被覆盖，请先提交或暂存。",
			"error.checked-out-elsewhere": "该分支已在另一个工作树中检出。",
			"error.invalid-branch": "分支不存在或名称无效。",
			"error.operation-in-progress": "仓库正在进行合并、变基或其他操作，完成后才能切换。",
			"error.index-conflict": "请先解决索引冲突。",
			"error.timeout": "Git 操作超时。",
			"error.git-unavailable": "找不到可用的 git 命令。",
			"error.not-a-repository": "当前目录不是 Git 仓库。",
			"error.no-session-cwd": "会话没有记录工作目录。",
			"error.switch-failed": "切换失败。",
			"error.status-failed": "无法读取 Git 状态。",
			"error.http": "请求失败。",
			"error.body-too-large": "请求过大。",
			"error.invalid-json": "请求格式错误。",
			"error.session-required": "缺少会话。",
			"error.invalid-session": "会话无效。",
			"error.branch-required": "缺少分支。",
			"error.branch-too-long": "分支名过长。",
			"error.method": "请求方法不支持。"
		};
		const en = {
			"trigger.aria": "Git branch: {branch} ({repo})",
			"trigger.tooltip": "{repo} · {branch} · {detail}",
			"dialog": "Git branch",
			"current": "Current",
			"search": "Search local branches",
			"noBranches": "No local branches",
			"noMatch": "No matching branches",
			"count": "{count} local branches",
			"switching": "Switching to {branch}…",
			"operation": "Repository is {operation}",
			"unborn": "No commits yet",
			"unknown": "Unnamed branch",
			"clean": "Working tree clean",
			"unknownChanges": "Status unavailable",
			"dirty": "{count} uncommitted changes",
			"dirtyOne": "1 uncommitted change",
			"ahead": "{count} ahead",
			"behind": "{count} behind",
			"upstreamGone": "upstream gone",
			"operation.merge": "merging",
			"operation.rebase": "rebasing",
			"operation.cherry-pick": "cherry-picking",
			"operation.revert": "reverting",
			"operation.bisect": "bisecting",
			"error.dirty-conflict": "Uncommitted changes would be overwritten. Commit or stash them first.",
			"error.checked-out-elsewhere": "That branch is already checked out in another worktree.",
			"error.invalid-branch": "The branch does not exist or its name is invalid.",
			"error.operation-in-progress": "The repository is in the middle of an operation. Finish it before switching.",
			"error.index-conflict": "Resolve the index conflict first.",
			"error.timeout": "The Git operation timed out.",
			"error.git-unavailable": "No usable git executable was found.",
			"error.not-a-repository": "The session directory is not inside a Git work tree.",
			"error.no-session-cwd": "The session has no recorded working directory.",
			"error.switch-failed": "Could not switch branches.",
			"error.status-failed": "Could not read Git status.",
			"error.http": "The request failed.",
			"error.body-too-large": "The request is too large.",
			"error.invalid-json": "The request body is malformed.",
			"error.session-required": "A session is required.",
			"error.invalid-session": "The session is invalid.",
			"error.branch-required": "A branch is required.",
			"error.branch-too-long": "The branch name is too long.",
			"error.method": "That request method is not supported."
		};
		//#endregion

		//#region helpers
		const STATUS_PATH = "/api/git-branch/status";
		const SWITCH_PATH = "/api/git-branch/switch";
		const MEASURE_STYLE = { visibility: "hidden", left: 0, top: 0 };
		const POLL_MS = 5000;

		/**
		 * Parse the Host's upstream track string. Kept in step with the host
		 * parser so the client can also decode optimistic or cached payloads.
		 * @param {string} text
		 */
		function parseTrack(text) {
			const raw = typeof text === "string" ? text : "";
			const ahead = /ahead\s+(\d+)/u.exec(raw);
			const behind = /behind\s+(\d+)/u.exec(raw);
			return {
				ahead: ahead === null ? 0 : Number(ahead[1]),
				behind: behind === null ? 0 : Number(behind[1]),
				gone: /\[gone\]/u.test(raw)
			};
		}

		/** Current branch first, then most recent commit, then name. @param {any[]} branches */
		function sortBranches(branches) {
			return [...branches].sort((left, right) => {
				if (left.current !== right.current) return left.current ? -1 : 1;
				const leftTime = Date.parse(left.commit ?? "") || 0;
				const rightTime = Date.parse(right.commit ?? "") || 0;
				if (rightTime !== leftTime) return rightTime - leftTime;
				return String(left.name).localeCompare(String(right.name));
			});
		}

		/**
		 * Case-insensitive substring match over branch and upstream names.
		 * @param {any[]} branches
		 * @param {string} query
		 */
		function filterBranches(branches, query) {
			const needle = String(query ?? "").trim().toLowerCase();
			if (needle === "") return branches;
			return branches.filter((branch) => {
				const name = String(branch.name ?? "").toLowerCase();
				const upstream = String(branch.upstream ?? "").toLowerCase();
				return name.includes(needle) || upstream.includes(needle);
			});
		}

		/** Compact ahead/behind marker for a row or trigger. @param {any} branch */
		function trackText(branch) {
			if (branch === undefined || branch === null) return "";
			const parts = [];
			if (branch.ahead > 0) parts.push("↑" + branch.ahead);
			if (branch.behind > 0) parts.push("↓" + branch.behind);
			if (branch.gone) parts.push("gone");
			return parts.join(" ");
		}

		/** @param {string} head */
		function shortHead(head) {
			return typeof head === "string" && head.length > 0 ? head.slice(0, 7) : "";
		}

		/**
		 * Human branch label, including detached and unborn states.
		 * @param {any} status
		 * @param {(key: string, values?: Record<string, unknown>) => string} tr
		 */
		function branchLabel(status, tr) {
			if (status === undefined || status === null) return "";
			if (status.unborn) return tr("unborn");
			if (status.detached) {
				const head = shortHead(status.head);
				return head === "" ? "HEAD" : "HEAD@" + head;
			}
			return typeof status.branch === "string" && status.branch !== "" ? status.branch : tr("unknown");
		}

		/**
		 * Dirty description shared by the tooltip and the panel header.
		 * @param {number} count
		 * @param {(key: string, values?: Record<string, unknown>) => string} tr
		 */
		function changeText(count, tr) {
			const value = Number(count) || 0;
			if (value <= 0) return tr("clean");
			return tr(value === 1 ? "dirtyOne" : "dirty", { count: value });
		}

		/** The dictionaries are the source of truth for whether a key has copy. */
		function hasCopy(key) {
			return Object.prototype.hasOwnProperty.call(zh, key) || Object.prototype.hasOwnProperty.call(en, key);
		}

		/** Localized operation label. @param {string | null} operation @param {any} tr */
		function operationText(operation, tr) {
			if (typeof operation !== "string" || operation === "") return "";
			const key = "operation." + operation;
			return hasCopy(key) ? tr(key) : operation;
		}

		/**
		 * Localized switch failure. The raw Git detail stays beside it in the panel,
		 * so localization never hides what actually happened.
		 * @param {{ code?: string, detail?: string, error?: string }} error
		 * @param {(key: string, values?: Record<string, unknown>) => string} tr
		 * @param {string | null} operation
		 */
		function errorMessage(error, tr, operation) {
			const code = error !== undefined && error !== null && typeof error.code === "string" ? error.code : "switch-failed";
			const key = "error." + code;
			if (!hasCopy(key)) return tr("error.switch-failed");
			const values = code === "operation-in-progress" ? { operation: operationText(operation, tr) } : undefined;
			return tr(key, values);
		}

		/** Send one JSON request and turn a non-ok body into an Error-shaped result. */
		async function post(path, payload, signal) {
			const response = await fetch(path, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(payload),
				credentials: "same-origin",
				signal
			});
			let data = null;
			try {
				data = await response.json();
			} catch {
				data = null;
			}
			if (!response.ok) {
				const failure = new Error(data !== null && typeof data.error === "string" ? data.error : "HTTP " + response.status);
				failure.code = data !== null && typeof data.code === "string" ? data.code : "http";
				failure.detail = data !== null && typeof data.detail === "string" ? data.detail : "";
				throw failure;
			}
			if (data === null || typeof data !== "object") throw new Error("invalid response");
			if (data.ok === false) {
				const failure = new Error(typeof data.error === "string" ? data.error : "request failed");
				failure.code = typeof data.code === "string" ? data.code : "switch-failed";
				failure.detail = typeof data.detail === "string" ? data.detail : "";
				failure.branch = typeof data.branch === "string" ? data.branch : "";
				throw failure;
			}
			return data;
		}

		/**
		 * Follow one session's Git status. The last good snapshot survives a
		 * transient failure, so a dropped socket does not erase the chip.
		 * @param {string | undefined} sessionId
		 */
		function useBranchStatus(sessionId) {
			const [state, setState] = React.useState({ data: null, error: null, loading: true });
			const mounted = React.useRef(false);
			const sequence = React.useRef(0);
			const active = React.useRef(null);

			const load = React.useCallback(async () => {
				if (typeof sessionId !== "string" || sessionId === "") return undefined;
				const ticket = ++sequence.current;
				if (active.current !== null) active.current.abort();
				const controller = new AbortController();
				active.current = controller;
				try {
					const data = await post(STATUS_PATH, { sessionId }, controller.signal);
					if (!mounted.current || ticket !== sequence.current) return data;
					setState({ data: data.repository === null || data.repository === undefined ? null : data, error: null, loading: false });
					return data;
				} catch (error) {
					if (!mounted.current || ticket !== sequence.current || (error !== null && error !== undefined && error.name === "AbortError")) return undefined;
					setState((previous) => ({ data: previous.data, error, loading: false }));
					return undefined;
				} finally {
					if (active.current === controller) active.current = null;
				}
			}, [sessionId]);

			React.useEffect(() => {
				mounted.current = true;
				setState({ data: null, error: null, loading: true });
				load();
				const onFocus = () => {
					load();
				};
				const onVisibility = () => {
					if (document.visibilityState === "visible") load();
				};
				window.addEventListener("focus", onFocus);
				document.addEventListener("visibilitychange", onVisibility);
				const timer = window.setInterval(() => {
					if (document.visibilityState === "visible") load();
				}, POLL_MS);
				return () => {
					mounted.current = false;
					sequence.current += 1;
					window.clearInterval(timer);
					window.removeEventListener("focus", onFocus);
					document.removeEventListener("visibilitychange", onVisibility);
					if (active.current !== null) active.current.abort();
					active.current = null;
				};
			}, [load, sessionId]);

			const replace = React.useCallback((data) => {
				if (data !== null && typeof data === "object" && data.repository !== null && data.repository !== undefined) {
					setState({ data, error: null, loading: false });
				}
			}, []);

			return { state, load, replace };
		}
		//#endregion

		//#region component
		/**
		 * Composer branch seat: a compact branch name that opens a searchable list
		 * of local branches. Switching is a Host operation; this component only
		 * renders the result and Git's refusal.
		 * @param {{ sessionId: string, t?: (key: string, values?: Record<string, unknown>) => string }} props
		 */
		function BranchControl({ sessionId, t }) {
			const tr = typeof t === "function" ? t : (key) => key;
			const { state, load, replace } = useBranchStatus(sessionId);
			const [open, setOpen] = React.useState(false);
			const [query, setQuery] = React.useState("");
			const [active, setActive] = React.useState(0);
			const [switching, setSwitching] = React.useState(null);
			const [switchError, setSwitchError] = React.useState(null);
			const triggerRef = React.useRef(null);
			const panelRef = React.useRef(null);
			const rootRef = React.useRef(null);
			const inputRef = React.useRef(null);
			const rowRefs = React.useRef(new Map());
			const alive = React.useRef(true);

			React.useEffect(() => {
				alive.current = true;
				return () => {
					alive.current = false;
				};
			}, []);

			const position = useAnchoredPosition({
				open,
				anchorRef: triggerRef,
				panelRef,
				side: "top",
				gap: 8,
				margin: 12
			});

			const close = React.useCallback(() => {
				setOpen(false);
				setQuery("");
				setSwitchError(null);
			}, []);

			const onOpenChange = React.useCallback((next) => {
				if (next) setOpen(true);
				else close();
			}, [close]);

			useDismissOnOutsidePointer(rootRef, open, onOpenChange, panelRef);

			React.useEffect(() => {
				if (!open) return undefined;
				const onKeyDown = (event) => {
					if (event.key === "Escape") {
						event.stopPropagation();
						close();
						if (triggerRef.current !== null) triggerRef.current.focus();
					}
				};
				document.addEventListener("keydown", onKeyDown);
				return () => document.removeEventListener("keydown", onKeyDown);
			}, [open, close]);

			const status = state.data;
			const branches = React.useMemo(() => sortBranches(status === null ? [] : status.branches ?? []), [status]);
			const visible = React.useMemo(() => filterBranches(branches, query), [branches, query]);
			const currentBranch = React.useMemo(() => branches.find((branch) => branch.current), [branches]);

			React.useEffect(() => {
				if (!open) return undefined;
				const index = branches.findIndex((branch) => branch.current);
				setActive(index >= 0 ? index : 0);
				setQuery("");
				const frame = window.requestAnimationFrame(() => {
					if (inputRef.current !== null) inputRef.current.focus();
				});
				return () => window.cancelAnimationFrame(frame);
				// Only opening resets the query and focus; poll updates must not steal either.
			}, [open]);

			React.useEffect(() => {
				setActive(0);
			}, [query]);

			React.useEffect(() => {
				if (!open) return;
				const node = rowRefs.current.get(active);
				if (node !== undefined && typeof node.scrollIntoView === "function") node.scrollIntoView({ block: "nearest" });
			}, [active, open, query]);

			if (status === null || status === undefined || status.repository === null || status.repository === undefined) return null;

			const repo = status.repository;
			const label = branchLabel(status, tr);
			const changed = typeof status.dirty === "number" && Number.isFinite(status.dirty) ? status.dirty : null;
			const currentTrack = trackText(currentBranch);
			const detail = changed === null ? tr("unknownChanges") : changeText(changed, tr);
			const detailWithTrack = currentTrack === "" ? detail : detail + " · " + currentTrack;
			const aria = tr("trigger.aria", { branch: label, repo: repo.name });
			const tooltip = tr("trigger.tooltip", { repo: repo.name, branch: label, detail: detailWithTrack });
			const busy = switching !== null;

			const toggle = () => {
				if (open) close();
				else {
					setSwitchError(null);
					setOpen(true);
					load();
				}
			};

			const switchTo = async (branch) => {
				if (branch === undefined || branch === null) return;
				if (branch.current) {
					close();
					return;
				}
				if (switching !== null) return;
				setSwitchError(null);
				setSwitching(branch.name);
				try {
					const result = await post(SWITCH_PATH, { sessionId, branch: branch.name });
					if (!alive.current) return;
					if (result.ok === false) {
						setSwitchError({ code: result.code, error: result.error, detail: result.detail, branch: branch.name });
						return;
					}
					if (result.repository === undefined || result.repository === null) await load();
					else replace(result);
					close();
				} catch (error) {
					if (!alive.current) return;
					setSwitchError({
						code: error !== null && error !== undefined && typeof error.code === "string" ? error.code : "switch-failed",
						error: String(error !== null && error !== undefined && error.message !== undefined ? error.message : error),
						detail: error !== null && error !== undefined && typeof error.detail === "string" ? error.detail : "",
						branch: branch.name
					});
				} finally {
					if (alive.current) setSwitching(null);
				}
			};

			const onListKeyDown = (event) => {
				if (event.key === "ArrowDown") {
					event.preventDefault();
					setActive((index) => Math.min(Math.max(0, visible.length - 1), index + 1));
				} else if (event.key === "ArrowUp") {
					event.preventDefault();
					setActive((index) => Math.max(0, index - 1));
				} else if (event.key === "Home") {
					event.preventDefault();
					setActive(0);
				} else if (event.key === "End") {
					event.preventDefault();
					setActive(Math.max(0, visible.length - 1));
				} else if (event.key === "Enter") {
					event.preventDefault();
					const branch = visible[active];
					if (branch !== undefined) switchTo(branch);
				}
			};

			const rows = visible.map((branch, index) => {
				const track = trackText(branch);
				return h("button", {
					key: branch.name,
					type: "button",
					role: "option",
					"aria-selected": branch.current,
					className: "gb_row",
					"data-active": index === active ? "" : undefined,
					disabled: busy,
					title: branch.name + (branch.upstream === null ? "" : " · " + branch.upstream) + (typeof branch.subject === "string" && branch.subject !== "" ? " · " + branch.subject : ""),
					onMouseEnter: () => setActive(index),
					onClick: () => switchTo(branch),
					ref: (node) => {
						if (node !== null) rowRefs.current.set(index, node);
						else rowRefs.current.delete(index);
					}
				},
					h("span", { className: "gb_check", "aria-hidden": true },
						branch.current ? h(IconCheck, { size: 14 }) : null
					),
					h("span", { className: "gb_branchName" }, branch.name),
					track === "" && branch.gone !== true ? null : h("span", { className: "gb_meta" },
						track === "" ? null : h("span", {
							className: branch.gone ? "gb_gone" : (branch.ahead > 0 ? "gb_ahead" : "gb_behind")
						}, track)
					)
				);
			});

			const errorDetail = switchError === null
				? ""
				: (typeof switchError.detail === "string" && switchError.detail !== ""
					? switchError.detail
					: (typeof switchError.error === "string" ? switchError.error : ""));

			const panel = h("div", {
				ref: panelRef,
				className: "gb_menu",
				style: position ?? MEASURE_STYLE,
				role: "dialog",
				"aria-label": tr("dialog"),
				"aria-busy": busy
			},
				h("div", { className: "gb_head" },
					h("div", { className: "gb_headText" },
						h("div", { className: "gb_repo", title: repo.name }, repo.name),
						h("div", { className: "gb_path", title: repo.root }, repo.root)
					),
					h("div", { className: "gb_now", title: label + " · " + detail },
						h("span", { className: "gb_nowDot", "aria-hidden": true }),
						h("span", { className: "gb_nowLabel" }, label)
					)
				),
				h("div", { className: "gb_searchWrap" },
					h("input", {
						ref: inputRef,
						className: "gb_search",
						type: "text",
						value: query,
						placeholder: tr("search"),
						"aria-label": tr("search"),
						spellCheck: false,
						autoComplete: "off",
						disabled: busy,
						onChange: (event) => setQuery(event.target.value),
						onKeyDown: onListKeyDown
					})
				),
				switchError === null ? null : h("div", { className: "gb_error", role: "alert" },
					h("div", { className: "gb_errorTitle" }, errorMessage(switchError, tr, status.operation)),
					errorDetail === "" ? null : h("pre", { className: "gb_errorDetail" }, errorDetail)
				),
				h("div", { className: "gb_list", role: "listbox", "aria-label": tr("dialog") },
					visible.length === 0
						? h("div", { className: "gb_empty" }, query === "" ? tr("noBranches") : tr("noMatch"))
						: rows
				),
				h("div", { className: "gb_foot" },
					h("div", { className: "gb_footRow" },
						busy ? h("span", { className: "gb_spinner", "aria-hidden": true }) : null,
						h("span", null, busy ? tr("switching", { branch: switching }) : tr("count", { count: branches.length })),
						status.operation === null || status.operation === undefined ? null : h("span", { className: "gb_warn" }, "· " + tr("operation", { operation: operationText(status.operation, tr) }))
					)
				)
			);

			return h("div", { className: "gb_root", ref: rootRef },
				h(Tooltip, {
					label: tooltip,
					side: "top",
					delayMs: 250,
					disabled: open,
					children: h("button", {
						ref: triggerRef,
						type: "button",
						className: "gb_trigger",
						"data-open": open ? "" : undefined,
						"aria-haspopup": "dialog",
						"aria-expanded": open,
						"aria-label": aria,
						title: tooltip,
						onClick: (event) => {
							event.stopPropagation();
							toggle();
						}
					},
						h(IconBranch, { className: "gb_icon", size: 14 }),
						h("span", { className: "gb_label" }, label),
						changed !== null && changed > 0 ? h("span", { className: "gb_dirty", "aria-hidden": true }) : null,
						currentTrack === "" ? null : h("span", { className: "gb_track" }, currentTrack),
						h(IconChevron, { className: "gb_chevron", "data-open": open ? "" : undefined })
					)
				}),
				open ? ReactDOM.createPortal(panel, document.body) : null
			);
		}
		//#endregion

		//#region plugin body
		/** Show a render failure instead of silently disappearing from the composer. */
		class BranchBoundary extends React.Component {
			constructor(props) {
				super(props);
				this.state = { error: null };
			}
			static getDerivedStateFromError(error) {
				return { error };
			}
			componentDidCatch(error) {
				console.error("git-branch: render failed", error);
			}
			render() {
				if (this.state.error === null) return this.props.children;
				return h("span", { style: { color: "var(--dsw-alias-state-error-primary)", fontSize: "11px" } }, "git-branch error: " + String(this.state.error?.message ?? this.state.error));
			}
		}

		const NS = "git-branch";
		const inject = ["slots", "locale"];

		/** @param {any} ctx */
		function apply(ctx) {
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "@local/dsh-git-branch";
				tag.dataset.pluginCss = cssTagId;
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => tag.remove();
			}, "git-branch: styles");
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "git-branch: dictionaries");
			ctx.slots.inject("conversation.input.left", () => ctx.slots.register({
				name: "conversation.input.left",
				id: "git-branch",
				order: 10,
				locale: NS,
				inject: (sessionId) => ({ sessionId })
			}, (props) => h(BranchBoundary, null, h(BranchControl, props))));
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		exports.BranchControl = BranchControl;
		exports.__internals = {
			parseTrack,
			sortBranches,
			filterBranches,
			trackText,
			shortHead,
			branchLabel,
			changeText,
			operationText,
			errorMessage
		};
		return module.exports;
		}

		// feature: model-effort.client.js
		function createModelEffort(require) {
		var module = { exports: {} };
		var exports = module.exports;
		const React = require("react");
		const ReactDOM = require("react-dom");
		const primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		const h = React.createElement;

		//#region styles
		const css = [
			// Trigger: model name and effort read as one control, but each opens its own pane.
			".meff_root{min-width:0;position:relative}",
			".meff_trigger{border-radius:var(--dsw-radius-sm);min-width:0;max-width:min(360px,45cqw);height:28px;color:var(--dsw-alias-label-secondary);background:0 0;align-items:center;gap:7px;padding:0 2px 0 8px;font-size:13px;font-weight:400;line-height:20px;display:flex}",
			".meff_trigger:hover:not([data-disabled]){background:var(--dsw-alias-interactive-bg-hover)}",
			".meff_modelBtn,.meff_effortBtn{border:none;background:0 0;color:inherit;font:inherit;cursor:pointer;outline:none;padding:0}",
			".meff_modelBtn{text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1;text-align:left;display:var(--dsh-composer-model-text-display,block);overflow:hidden}",
			// The effort seat is a stacked grid: every possible wording occupies the same
			// cell, only the current one is visible, so the seat always keeps the width of
			// the widest effort and the trigger never reflows when the level changes.
			".meff_effortBtn{display:inline-grid;grid-template-columns:1fr;align-items:center;justify-items:stretch;min-width:0;max-width:40%;color:var(--dsw-alias-label-caption);flex:none;overflow:hidden;text-align:center}",
			".meff_effortLabel{grid-area:1/1;min-width:0;text-overflow:ellipsis;white-space:nowrap;visibility:hidden;text-align:center;overflow:hidden}",
			".meff_effortBtn .meff_effortLabel[data-active]{visibility:visible}",
			".meff_trigger[data-disabled] .meff_modelBtn,.meff_trigger[data-disabled] .meff_effortBtn{color:var(--dsw-alias-label-dimmed);cursor:default}",
			".meff_modelBtn:focus-visible,.meff_effortBtn:focus-visible{box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));border-radius:var(--dsw-radius-sm)}",
			".meff_chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .18s cubic-bezier(.22,1,.36,1);transform-origin:center}",
			".meff_chevron[data-open]{transform:rotate(180deg)}",
			".meff_chevron[data-busy]{opacity:.4}",
			".meff_icon{display:var(--dsh-composer-model-icon-display,none);flex:none;color:var(--dsw-alias-label-tertiary)}",
			// Model pane: one flat list, a gray caption, a checked current row.
			".meff_menu{box-sizing:border-box;z-index:1100;position:fixed;width:min(304px,100vw - 32px);max-height:min(390px,100vh - 96px);background:var(--dsw-specific-menu);box-shadow:0 12px 32px #00000024,0 2px 8px #00000012,0 0 0 .5px #0000000f;color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border:0;border-radius:18px;flex-direction:column;padding:0;display:flex;overflow:hidden;animation:meff-menu-in .15s cubic-bezier(.2,.8,.2,1);transform-origin:50% 100%}",
			".meff_menu[data-closing]{pointer-events:none;animation:meff-menu-out .09s ease-in both}",
			"@keyframes meff-menu-in{from{opacity:0;transform:translateY(6px) scale(.985)}to{opacity:1;transform:none}}",
			"@keyframes meff-menu-out{from{opacity:1;transform:none}to{opacity:0;transform:translateY(4px) scale(.99)}}",
			".meff_caption{color:var(--dsw-alias-label-tertiary);flex:none;padding:12px 14px 4px;font-size:12px;line-height:17px}",
			".meff_list{min-height:0;overflow-y:auto;padding:0 6px 6px}",
			".meff_option{box-sizing:border-box;border-radius:8px;width:100%;min-height:32px;color:inherit;text-align:left;cursor:pointer;background:0 0;border:none;outline:none;align-items:center;gap:8px;padding:0 8px;display:flex}",
			".meff_option:hover:not(:disabled),.meff_option:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}",
			".meff_option:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}",
			".meff_optionLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1;font-size:13px;line-height:18px;overflow:hidden}",
			".meff_check{color:var(--dsw-alias-label-primary);flex:none;width:16px;height:16px;place-items:center;display:grid}",
			".meff_empty{color:var(--dsw-alias-label-tertiary);padding:10px 8px;font-size:13px;line-height:18px}",
			".meff_error{color:var(--dsw-alias-state-error-primary);padding:8px 16px 4px;font-size:11px;line-height:16px}",
			".meff_effortRow{border-top:.5px solid var(--dsw-alias-border-l2);border-radius:0 0 18px 18px;height:38px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border-left:0;border-right:0;border-bottom:0;align-items:center;gap:8px;padding:0 14px;font:inherit;font-size:12px;display:flex}",
			".meff_effortRow:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".meff_effortRowValue{color:var(--dsw-alias-label-tertiary);align-items:center;gap:2px;margin-left:auto;display:inline-flex}",
			// Effort pane: bolt, centered blue value, reset, model breadcrumb, segmented pill.
			".meff_effortTop{justify-content:center;align-items:center;padding:12px 14px 0;display:flex}",
			"",
			"",
			"",
			"",
			".meff_effortName{color:var(--dsw-alias-state-business-primary);text-align:center;letter-spacing:.01em;font-size:14px;font-weight:600;line-height:20px}",
			".meff_crumb{color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:var(--dsw-radius-sm);justify-content:center;align-items:center;gap:2px;margin:8px auto 8px;padding:1px 5px;font:inherit;font-size:11px;line-height:16px;display:flex}",
			".meff_crumb:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}",
			".meff_codexSlider{padding:0 14px 12px}",
			".meff_codexTrack{position:relative;height:22px;cursor:pointer;touch-action:none;outline:none;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover)}",
			".meff_codexFill{position:absolute;left:0;top:0;bottom:0;border-radius:999px;background:var(--dsw-alias-state-business-primary);transition:width .08s linear}",
			".meff_codexDot{position:absolute;top:50%;width:2.5px;height:2.5px;border-radius:50%;background:var(--dsw-alias-label-dimmed);transform:translate(-50%,-50%);z-index:1;pointer-events:none}",
			".meff_codexDot[data-on]{background:#ffffff8c}",
			".meff_codexThumb{position:absolute;top:50%;width:28px;height:28px;border-radius:50%;background:var(--dsw-alias-bg-base);box-shadow:0 2px 8px #0000002e,0 0 0 .5px #00000014;transform:translate(-50%,-50%);z-index:2;pointer-events:none;transition:left .08s linear}",
			".meff_codexTrack:focus-visible .meff_codexThumb{box-shadow:0 0 0 4px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}",
			".meff_noEffort{color:var(--dsw-alias-label-tertiary);text-align:center;padding:8px 14px 16px;font-size:11px;line-height:16px}",
			"@media (prefers-reduced-motion:reduce){.meff_menu,.meff_menu[data-closing],.meff_chevron{animation:none;transition:none}}"
		].join("");

		//#region helpers
		const MEASURE_STYLE = { visibility: "hidden", left: 0, top: 0 };

		/** @param {number} value */
		function clamp(value, min, max) {
			return Math.min(max, Math.max(min, value));
		}

		/**
		 * Catalog order used by the composer: account and official providers first.
		 * @param {any[]} groups
		 */
		function orderedGroups(groups) {
			const weight = (id) => (id === "deepseek-account" ? 0 : id === "deepseek-official" ? 1 : 2);
			return [...groups].sort((left, right) => weight(left.id) - weight(right.id));
		}

		/** @param {any} state @param {any[]} groups */
		function currentChoiceOf(state, groups) {
			if (state.current === null) return undefined;
			for (const group of groups) {
				const model = group.models.find((candidate) => candidate.id === state.current.model);
				if (model !== undefined) return { group, model };
			}
			return undefined;
		}
		//#endregion

		//#region slider
		/**
		 * Codex-style segmented effort pill: a large white thumb over a blue fill and
		 * gray step dots. Values snap while dragging and commit once on release.
		 * @param {{ levels: Array<{ id?: string, name: string }>, value: string | undefined, disabled?: boolean, onChange: (id: string | undefined) => void }} props
		 */
		function EffortSlider({ levels, value, disabled = false, onChange, onPreview }) {
			const trackRef = React.useRef(null);
			const [dragIndex, setDragIndex] = React.useState(null);
			const activeIndex = Math.max(0, levels.findIndex((level) => level.id === value));
			const index = dragIndex === null ? activeIndex : dragIndex;
			const last = Math.max(1, levels.length - 1);
			const ratio = index / last;
			// Keep the first and last dots inside the pill so neither stop is clipped.
			const INSET = 10;
			const trackPos = (value) => `calc(${INSET}px + (100% - ${INSET * 2}px) * ${value})`;
			const fill = ratio <= 0 ? "0px" : ratio >= 1 ? "100%" : trackPos(ratio);

			const indexAt = (clientX) => {
				const rect = trackRef.current?.getBoundingClientRect();
				if (rect === undefined || rect.width === 0) return activeIndex;
				return Math.round(clamp((clientX - rect.left) / rect.width, 0, 1) * last);
			};

			const commit = (next) => {
				const level = levels[next];
				if (level !== undefined && level.id !== value) onChange(level.id);
			};

			return h("div", { className: "meff_codexSlider" },
				h("div", {
					ref: trackRef,
					className: "meff_codexTrack",
					role: "slider",
					tabIndex: disabled ? -1 : 0,
					"aria-valuemin": 0,
					"aria-valuemax": last,
					"aria-valuenow": index,
					"aria-valuetext": levels[index]?.name,
					"aria-disabled": disabled || undefined,
					onPointerDown: (event) => {
						if (disabled) return;
						event.preventDefault();
						event.currentTarget.setPointerCapture(event.pointerId);
						const next = indexAt(event.clientX);
						setDragIndex(next);
						onPreview(next);
					},
					onPointerMove: (event) => {
						if (disabled || dragIndex === null) return;
						const next = indexAt(event.clientX);
						setDragIndex(next);
						onPreview(next);
					},
					onPointerUp: (event) => {
						if (disabled || dragIndex === null) return;
						const next = indexAt(event.clientX);
						setDragIndex(null);
						commit(next);
					},
					onPointerCancel: () => {
						setDragIndex(null);
						onPreview(null);
					},
					onKeyDown: (event) => {
						if (disabled) return;
						if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
							event.preventDefault();
							const next = Math.max(0, activeIndex - 1);
							onPreview(next);
							commit(next);
						} else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
							event.preventDefault();
							const next = Math.min(last, activeIndex + 1);
							onPreview(next);
							commit(next);
						}
					}
				},
					h("span", { className: "meff_codexFill", style: { width: fill } }),
					levels.map((level, order) => h("span", {
						key: level.id ?? `level-${order}`,
						className: "meff_codexDot",
						"data-on": order <= index ? "" : undefined,
						style: { left: trackPos(order / last) }
					})),
					h("span", { className: "meff_codexThumb", style: { left: trackPos(ratio) } })
				)
			);
		}
		//#endregion

		//#region model picker
		/**
		 * Composer model seat with Codex's two panes: a flat model list, and a
		 * separate effort card with a draggable segmented pill.
		 * @param {any} props
		 */
		function EffortModelSelect({ locked, available = true, directory, load, select, t }) {
			const state = React.useSyncExternalStore((fn) => directory.subscribe(fn), () => directory.getSnapshot());
			const [open, setOpen] = React.useState(false);
			const [closing, setClosing] = React.useState(false);
			const [pane, setPane] = React.useState("effort");
			const [localError, setLocalError] = React.useState(null);
			const [previewEffort, setPreviewEffort] = React.useState(null);
			const triggerRef = React.useRef(null);
			const menuRef = React.useRef(null);
			const rootRef = React.useRef(null);
			const closeTimer = React.useRef(null);
			const paneHeightRef = React.useRef(null);
			const paneRef = React.useRef("effort");
			const position = primitives.useAnchoredPosition({
				open,
				anchorRef: triggerRef,
				panelRef: menuRef,
				side: "top",
				gap: 6,
				margin: 12
			});

			/** Close through a short exit phase so the surface can animate away. */
			const dismiss = React.useCallback(() => {
				if (closeTimer.current !== null) return;
				const reduceMotion = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
				setClosing(true);
				closeTimer.current = setTimeout(() => {
					closeTimer.current = null;
					setClosing(false);
					setOpen(false);
				}, reduceMotion ? 0 : 90);
			}, []);
			const cancelDismiss = React.useCallback(() => {
				if (closeTimer.current === null) return;
				clearTimeout(closeTimer.current);
				closeTimer.current = null;
				setClosing(false);
			}, []);
			React.useEffect(() => () => {
				if (closeTimer.current !== null) clearTimeout(closeTimer.current);
			}, []);
			const dismissOutside = React.useCallback((next) => {
				if (next === false) dismiss();
			}, [dismiss]);
			primitives.useDismissOnOutsidePointer(rootRef, open, dismissOutside, menuRef);

			React.useEffect(() => {
				if (!open) return;
				const onKeyDown = (event) => {
					if (event.key === "Escape") {
						event.stopPropagation();
						dismiss();
						triggerRef.current?.focus();
					}
				};
				document.addEventListener("keydown", onKeyDown);
				return () => document.removeEventListener("keydown", onKeyDown);
			}, [open, dismiss]);

			/** Animate the surface height when the model list and the effort card swap. */
			React.useLayoutEffect(() => {
				const pending = paneHeightRef.current;
				paneHeightRef.current = null;
				const menu = menuRef.current;
				if (pending === null || menu === null || pending.to !== pane) return;
				menu.style.height = "auto";
				const target = menu.offsetHeight;
				const from = pending.from;
				const reduceMotion = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
				if (reduceMotion || typeof menu.animate !== "function" || Math.abs(target - from) < 1) {
					menu.style.height = "";
					return;
				}
				menu.style.height = `${from}px`;
				void menu.offsetHeight;
				const animation = menu.animate(
					[{ height: `${from}px` }, { height: `${target}px` }],
					{ duration: 180, easing: "cubic-bezier(.22, 1, .36, 1)", fill: "forwards" }
				);
				const finish = () => {
					animation.cancel();
					menu.style.height = "";
				};
				animation.addEventListener("finish", finish, { once: true });
				return () => {
					animation.removeEventListener("finish", finish);
					animation.cancel();
					menu.style.height = "";
				};
			}, [pane]);
			React.useEffect(() => {
				paneRef.current = pane;
			}, [pane]);

			const groups = React.useMemo(() => orderedGroups(state.groups), [state.groups]);
			const models = React.useMemo(() => groups.flatMap((group) => group.models.map((model) => ({ group, model }))), [groups]);
			const currentChoice = currentChoiceOf(state, groups);
			const reasoning = currentChoice?.model.reasoning;
			const levels = React.useMemo(() => {
				if (reasoning === undefined) return [];
				const named = (reasoning.efforts ?? []).map((level) => ({ id: level.id, name: level.name }));
				return reasoning.defaultEffort === undefined
					? [{ id: undefined, name: t("effort.providerDefault") }, ...named]
					: named;
			}, [reasoning, t]);
			const effectiveEffort = state.current?.reasoningEffort ?? reasoning?.defaultEffort;
			const effortLabel = reasoning === undefined
				? state.retainedEffort
				: effectiveEffort === undefined
					? t("effort.providerDefault")
					: reasoning.efforts.find((level) => level.id === effectiveEffort)?.name ?? effectiveEffort;
			// Every effort wording this seat can ever display. The trigger renders all of
			// them in one stacked grid cell, so it reserves the widest one up front
			// instead of resizing as the level (or the model) changes.
			const effortLabels = React.useMemo(() => {
				const labels = new Set();
				for (const group of groups) {
					for (const model of group.models) {
						const modelReasoning = model.reasoning;
						if (modelReasoning === undefined) continue;
						for (const level of modelReasoning.efforts ?? []) labels.add(level.name);
						if (modelReasoning.defaultEffort === undefined) labels.add(t("effort.providerDefault"));
					}
				}
				if (state.retainedEffort !== undefined) labels.add(state.retainedEffort);
				if (previewEffort !== null) labels.add(previewEffort);
				if (effortLabel !== undefined) labels.add(effortLabel);
				return [...labels];
			}, [groups, effortLabel, previewEffort, state.retainedEffort, t]);
			const shownEffort = previewEffort ?? effortLabel;
			React.useEffect(() => {
				setPreviewEffort(null);
			}, [effectiveEffort]);

			const modelLabel = currentChoice?.model.name
				?? (state.status === "loading" ? t("trigger.loading") : t("trigger.fallback"));
			const busy = state.pending !== null || !available;
			const activeLevel = levels[Math.max(0, levels.findIndex((level) => level.id === effectiveEffort))];

			/** Switch panes and remember the old height so the surface can grow smoothly. */
			const switchPane = (next) => {
				if (next === paneRef.current) return;
				const menu = menuRef.current;
				if (menu !== null) paneHeightRef.current = { from: menu.offsetHeight, to: next };
				paneRef.current = next;
				setPane(next);
			};

			const show = (nextPane) => {
				cancelDismiss();
				setLocalError(null);
				switchPane(nextPane);
				setOpen(true);
				load();
			};

			/** Opening always lands on effort; the crumb is the way to the model list. */
			const toggle = () => {
				if (open && !closing && pane === "effort") {
					dismiss();
					return;
				}
				show("effort");
			};

			const chooseModel = async (group, model) => {
				if (busy) return;
				if (state.current?.provider === group.id && state.current.model === model.id) {
					switchPane("effort");
					return;
				}
				setLocalError(null);
				const result = await select({ provider: group.id, model: model.id });
				if (result !== undefined && result.ok === false) setLocalError(t("error.action", { message: result.error.code }));
				else switchPane("effort");
			};

			const chooseEffort = async (id) => {
				if (busy || state.current === null) return;
				if (id === effectiveEffort) return;
				setLocalError(null);
				const result = await select({
					provider: state.current.provider,
					model: state.current.model,
					...(id === undefined ? {} : { reasoningEffort: id })
				});
				if (result !== undefined && result.ok === false) setLocalError(t("error.action", { message: result.error.code }));
			};


			const triggerAria = state.current === null
				? t("trigger.selectAria")
				: effortLabel === undefined
					? t("trigger.aria", { model: modelLabel })
					: t("trigger.ariaEffort", { model: modelLabel, effort: effortLabel });

			const modelRows = models.map(({ group, model }) => {
				const selected = state.current?.provider === group.id && state.current.model === model.id;
				return h("button", {
					key: `${group.id}/${model.id}`,
					type: "button",
					className: "meff_option",
					role: "option",
					"aria-selected": selected,
					disabled: busy,
					title: model.name,
					onClick: () => chooseModel(group, model)
				},
					h("span", { className: "meff_optionLabel" }, model.name),
					h("span", { className: "meff_check" }, selected ? h(primitives.IconCheckOutlineRegular, { size: 16 }) : null)
				);
			});

			const modelPane = h(React.Fragment, null,
				h("div", { className: "meff_caption" }, t("trigger.selectAria")),
				state.error !== null ? h("div", { className: "meff_error" }, t("error.action", { message: state.error })) : null,
				localError !== null ? h("div", { className: "meff_error" }, localError) : null,
				h("div", { className: "meff_list", role: "listbox", "aria-label": t("menu.model") },
					state.status === "loading" && models.length === 0
						? h("div", { className: "meff_empty" }, t("status.loading"))
						: models.length === 0
							? h("div", { className: "meff_empty" }, t("empty.models"))
							: modelRows
				),
				reasoning === undefined
					? null
					: h("button", {
						type: "button",
						className: "meff_effortRow",
						onClick: () => switchPane("effort")
					},
						h("span", null, t("menu.effort")),
						h("span", { className: "meff_effortRowValue" },
							effortLabel,
							h(primitives.IconChevronRightOutlineRegular, { size: 14 })
						)
					)
			);

			const shownLevel = previewEffort ?? activeLevel?.name ?? t("effort.providerDefault");
			const effortPane = h(React.Fragment, null,
				h("div", { className: "meff_effortTop" },
					h("span", { className: "meff_effortName" }, shownLevel)
				),
				h("button", {
					type: "button",
					className: "meff_crumb",
					onClick: () => switchPane("model")
				},
					modelLabel,
					h(primitives.IconChevronRightOutlineRegular, { size: 12 })
				),
				localError !== null ? h("div", { className: "meff_error" }, localError) : null,
				levels.length <= 1
					? h("div", { className: "meff_noEffort" }, t("empty.efforts"))
					: h(EffortSlider, {
						levels,
						value: effectiveEffort,
						disabled: busy,
						onChange: chooseEffort,
						onPreview: (index) => setPreviewEffort(index === null ? null : levels[index]?.name ?? null)
					})
			);

			const menuBody = h(primitives.MenuSurface, {
				ref: menuRef,
				className: "meff_menu",
				"data-closing": closing ? "" : undefined,
				style: position ?? MEASURE_STYLE,
				role: "dialog",
				"aria-label": t("menu.aria"),
				"aria-busy": state.status === "loading" || busy
			}, pane === "model" ? modelPane : effortPane);

			return h("div", { className: "meff_root", ref: rootRef },
				h("div", {
					className: "meff_trigger",
					ref: triggerRef,
					"data-disabled": locked || undefined,
					onClick: (event) => {
						if (locked || event.target.closest("button") !== null) return;
						toggle();
					}
				},
					h(primitives.IconDataOutlineRegular, { className: "meff_icon", size: 16 }),
					h("button", {
						type: "button",
						className: "meff_modelBtn",
						"aria-label": triggerAria,
						"aria-haspopup": "dialog",
						"aria-expanded": open && !closing,
						title: modelLabel,
						disabled: locked,
						onClick: () => toggle()
					}, modelLabel),
					effortLabel === undefined
						? null
						: h("button", {
							type: "button",
							className: "meff_effortBtn",
							"aria-label": t("trigger.ariaEffort", { model: modelLabel, effort: shownEffort }),
							"aria-haspopup": "dialog",
							"aria-expanded": open && !closing,
							title: `${modelLabel} · ${shownEffort}`,
							disabled: locked,
							onClick: () => toggle()
						},
							effortLabels.map((label) => h("span", {
								key: label,
								className: "meff_effortLabel",
								"data-active": label === shownEffort ? "" : undefined,
								"aria-hidden": "true"
							}, label))
						),
					h(primitives.IconChevronDownOutlineRegular, {
						className: "meff_chevron",
						"data-open": open && !closing ? "" : undefined,
						"data-busy": busy ? "" : undefined
					})
				),
				open ? ReactDOM.createPortal(menuBody, document.body) : null
			);
		}
		//#endregion

		/** Show a render failure instead of silently abdicating to the stock picker. */
		class EffortBoundary extends React.Component {
			constructor(props) {
				super(props);
				this.state = { error: null };
			}
			static getDerivedStateFromError(error) {
				return { error };
			}
			render() {
				if (this.state.error === null) return this.props.children;
				return h("span", { style: { color: "var(--dsw-alias-state-error-primary)", fontSize: "11px" } }, `effort error: ${this.state.error?.message ?? this.state.error}`);
			}
		}

		//#region plugin body
		const NS = "model";
		const inject = ["slots", "modelDirectories", "sessions", "remote", "remote.session"];

		/** @param {any} ctx */
		function apply(ctx) {
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "@local/dsh-model-effort";
				tag.dataset.pluginCss = "@local/dsh-model-effort/model-effort.css";
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => tag.remove();
			}, "model-effort: styles");
			const models = ctx.modelDirectories;
			ctx.slots.inject("conversation.input.model", () => ctx.slots.register({
				name: "conversation.input.model",
				// Lower priority shadows the shipped single-slot entry; unloading
				// this plugin hands the seat straight back to it.
				priority: -1000,
				locale: NS,
				inject: (sessionId) => {
					try {
						const directory = models.directoryFor(sessionId);
						return {
							available: true,
							directory: directory.store,
							load: () => {
								directory.load().catch(() => {});
							},
							select: (selection) => directory.select(selection)
						};
					} catch (error) {
						console.error("model-effort: the model directory is unavailable", error);
						return {
							available: false,
							directory: {
								subscribe: () => () => {},
								getSnapshot: () => ({
									current: null,
									routable: null,
									groups: [],
									failures: [],
									status: "error",
									pending: null,
									error: String(error?.message ?? error)
								})
							},
							load: () => {},
							select: async () => ({ ok: false, error: { code: "unavailable", message: String(error?.message ?? error) } })
						};
					}
				}
			}, function EffortSeat(props) {
				return h(EffortBoundary, null, h(EffortModelSelect, props));
			}));
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		exports.EffortModelSelect = EffortModelSelect;
		exports.EffortSlider = EffortSlider;
		exports.__internals = { clamp, currentChoiceOf, orderedGroups };
		return module.exports;
		}

		// feature: view-menu.client.js
		function createViewMenu(require) {
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

		// feature: sidebar-unify.client.js
		function createSidebarUnify(require) {
		var module = { exports: {} };
		var exports = module.exports;

		//#region constants
		const cssTagId = "@local/dsh-sidebar-unify/sidebar-unify.css";
		//#endregion

		//#region styles
		/**
		 * The shipped New Session button is a raised capsule (border, elevated
		 * fill, centered label). This sheet makes it a peer of the panel rows:
		 * transparent, 32px, left-aligned icon + label, the same hover wash.
		 * Collapsed rail styles are left untouched.
		 *
		 * DSH 0.2.2 wrapped the button in div.newSessionRow (the session-action
		 * HOC seat), so the old direct-child selector no longer matched. Match
		 * the button inside that row instead.
		 */
		const css = [
			// New Session wrapper: align it with the panel rows' inset.
			"div[class*=\"root\"]:not([class*=\"collapsed\"]) [class*=\"newSessionRow\"]:has(>button[class*=\"newSession\"]){margin:0 0 2px!important;gap:0!important}",
			// New Session: same geometry and surface as a global panel row.
			"div[class*=\"root\"]:not([class*=\"collapsed\"]) button[class*=\"newSession\"]{box-sizing:border-box!important;width:auto!important;height:auto!important;min-height:32px!important;margin:0!important;padding:5px calc(var(--dsh-sidebar-row-padding) - var(--dsh-sidebar-paint-inset))!important;border:0!important;border-radius:var(--dsw-radius-md)!important;background:transparent!important;color:var(--dsw-alias-label-primary)!important;font-family:inherit!important;font-size:14px!important;font-weight:400!important;font-style:inherit!important;letter-spacing:inherit!important;line-height:22px!important;text-align:left!important;justify-content:flex-start!important;gap:8px!important;overflow:visible!important;container-type:normal!important}",
			"div[class*=\"root\"]:not([class*=\"collapsed\"]) button[class*=\"newSession\"]:hover{background:var(--dsw-alias-interactive-bg-hover)!important}",
			"div[class*=\"root\"]:not([class*=\"collapsed\"]) button[class*=\"newSession\"]:active{background:var(--dsw-alias-interactive-bg-active)!important}",
			"div[class*=\"root\"]:not([class*=\"collapsed\"]) button[class*=\"newSession\"]:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))!important;outline-offset:-2px!important}",
			// Let the label take the row and keep the shortcut hint at the far right.
			"div[class*=\"root\"]:not([class*=\"collapsed\"]) button[class*=\"newSession\"]>[class*=\"newSessionLabelMask\"]{display:flex!important;flex:1 1 auto!important;align-items:center!important;min-width:0!important}",
			"div[class*=\"root\"]:not([class*=\"collapsed\"]) button[class*=\"newSession\"] [class*=\"newSessionContent\"]{justify-content:flex-start!important;gap:8px!important;width:100%!important;min-width:0!important}",
			"div[class*=\"root\"]:not([class*=\"collapsed\"]) button[class*=\"newSession\"] [class*=\"newSessionContent\"]>svg{flex:none!important;width:16px!important;height:16px!important}",
			"div[class*=\"root\"]:not([class*=\"collapsed\"]) button[class*=\"newSession\"] [class*=\"newSessionLabel\"]{max-width:100%!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important}",
			"div[class*=\"root\"]:not([class*=\"collapsed\"]) button[class*=\"newSession\"] [class*=\"newSessionShortcut\"]{flex:none!important;margin-left:auto!important;padding-left:8px!important}",
			// The wordmark SVG may carry a dark HARNESS badge after the deepseek
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

		// feature: sidebar-entries.client.js
		function createSidebarEntries(require) {
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

		// feature: model-context.client.js
		function createModelContext(require) {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const React = require("react");
		const ReactDOM = require("react-dom");
		const { jsx, jsxs } = require("react/jsx-runtime");
		const primitives = require("@deepseek-ai/dsh-client-ui-primitives");

		//#region styles
		const css = [
			".mcc_stat{min-width:0;font-size:calc(var(--dsh-content-font-size-secondary,13px) - 1px);line-height:calc(20px + var(--dsh-content-font-delta-secondary,0px));display:inline-flex;order:1}",
			".mcc_statPill{box-sizing:border-box;border-radius:var(--dsw-radius-sm);max-width:100%;color:var(--dsw-alias-label-tertiary);font:inherit;font-variant-numeric:tabular-nums;line-height:inherit;white-space:nowrap;cursor:pointer;background:0 0;border:none;align-items:center;gap:6px;padding:1px 8px;display:inline-flex}",
			".mcc_statPill svg{flex:none;width:14px;height:14px}",
			".mcc_statPill:hover,.mcc_statPill[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}",
			".mcc_statLabel{text-overflow:ellipsis;min-width:0;overflow:hidden}",
			".mcc_panel{z-index:1100;box-sizing:border-box;border-radius:var(--dsw-radius-lg);background:var(--dsw-specific-menu);width:max-content;min-width:min(300px,100vw - 24px);max-width:min(440px,100vw - 24px);backdrop-filter:var(--dsw-menu-backdrop-filter);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-secondary);cursor:default;border:0;padding:16px;font-size:12px;line-height:18px;position:fixed}",
			".mcc_title{color:var(--dsw-alias-label-primary);justify-content:space-between;gap:16px;margin-bottom:8px;font-weight:500;display:flex}",
			".mcc_titleRule{border-top:.5px solid var(--dsw-alias-border-l2);margin-bottom:10px}",
			".mcc_titleValue{font-variant-numeric:tabular-nums}",
			".mcc_titleLabel{align-items:center;gap:6px;min-width:0;display:inline-flex}",
			".mcc_titleLabel svg{flex:none;width:14px;height:14px}",
			".mcc_details{color:var(--dsw-alias-label-tertiary);grid-template-columns:minmax(76px,auto) minmax(0,1fr);gap:6px 16px;margin:0;display:grid}",
			".mcc_details dt,.mcc_details dd{min-width:0;margin:0}",
			".mcc_details dd{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;text-align:right}"
		].join("");
		const cssTagId = "@local/dsh-model-context/model-context.css";
		/** Install this feature's styles when it starts, not when it is created. */
		function installStyles(ctx) {
			ctx.effect(() => {
				const existing = document.querySelector("style[data-plugin-css=" + JSON.stringify(cssTagId) + "]");
				if (existing !== null) return () => {};
				const tag = document.createElement("style");
				tag.dataset.plugin = "@local/dsh-model-context";
				tag.dataset.pluginCss = cssTagId;
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => tag.remove();
			}, "model-context: styles");
		}
		//#endregion

		//#region pricing
		/**
		 * Official DeepSeek first-party list prices in USD per 1M tokens.
		 * `cacheWrite` is zero because these routes do not bill a cache write.
		 * The `deepseek-flash` catalog id and the `deepseek-v4-flash` pricing
		 * family name the same official model.
		 */
		const FLASH = Object.freeze({
			offPeak: Object.freeze({ input: 0.22, cacheRead: 0.007, cacheWrite: 0, output: 0.66 }),
			peak: Object.freeze({ input: 0.44, cacheRead: 0.014, cacheWrite: 0, output: 1.32 })
		});
		const PRO = Object.freeze({
			offPeak: Object.freeze({ input: 0.66, cacheRead: 0.022, cacheWrite: 0, output: 1.98 }),
			peak: Object.freeze({ input: 1.32, cacheRead: 0.044, cacheWrite: 0, output: 3.96 })
		});
		const PRICE_TABLE = Object.freeze({
			"deepseek-flash": FLASH,
			"deepseek-v4-flash": FLASH,
			"deepseek-v4-pro": PRO,
			"deepseek-pro": PRO
		});
		const OFFICIAL_PROVIDERS = Object.freeze(["deepseek-account", "deepseek-official", "deepseek"]);

		/** @param {number} value @returns {number} */
		function finite(value) {
			return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
		}

		/**
		 * Official DeepSeek peak windows: 09:00-12:00 and 14:00-18:00 in
		 * Asia/Shanghai on Monday through Friday. Shanghai has no DST, so a
		 * fixed +08:00 offset is exact.
		 * @param {number} [now]
		 * @returns {boolean}
		 */
		function isPeak(now = Date.now()) {
			const shanghai = new Date(now + 8 * 60 * 60 * 1000);
			const day = shanghai.getUTCDay();
			if (day === 0 || day === 6) return false;
			const minutes = shanghai.getUTCHours() * 60 + shanghai.getUTCMinutes();
			return (minutes >= 9 * 60 && minutes < 12 * 60) || (minutes >= 14 * 60 && minutes < 18 * 60);
		}

		/**
		 * Resolve the tariff for one official DeepSeek route, or null when the
		 * route is not one this plugin can price.
		 * @param {string | undefined} providerId
		 * @param {string | undefined} modelId
		 * @param {number} [now]
		 */
		function priceFor(providerId, modelId, now = Date.now()) {
			if (!OFFICIAL_PROVIDERS.includes(providerId)) return null;
			const table = modelId === undefined ? undefined : PRICE_TABLE[modelId];
			if (table === undefined) return null;
			const peak = isPeak(now);
			return Object.freeze({ ...table[peak ? "peak" : "offPeak"], peak });
		}

		/**
		 * Convert the durable `tokenUsage` projection into an estimated cost.
		 * The projection is a whole-log cumulative total, so one tariff is
		 * applied to every bucket; this is an estimate, not a bill.
		 * @param {Record<string, number> | undefined} usage
		 * @param {ReturnType<typeof priceFor>} price
		 */
		function estimateCost(usage, price) {
			if (usage === undefined || usage === null || price === null) return null;
			const input = finite(usage.uncachedInputTokens);
			const cacheRead = finite(usage.cacheReadTokens);
			const cacheWrite = finite(usage.cacheWriteTokens);
			const output = finite(usage.outputTokens);
			const total = input + cacheRead + cacheWrite + output;
			if (total <= 0) return null;
			const inputCost = input * price.input / 1e6;
			const cacheReadCost = cacheRead * price.cacheRead / 1e6;
			const cacheWriteCost = cacheWrite * price.cacheWrite / 1e6;
			const outputCost = output * price.output / 1e6;
			const cost = inputCost + cacheReadCost + cacheWriteCost + outputCost;
			if (!Number.isFinite(cost)) return null;
			return Object.freeze({
				cost, input, cacheRead, cacheWrite, output,
				inputCost, cacheReadCost, cacheWriteCost, outputCost,
				peak: price.peak, price
			});
		}
		//#endregion

		//#region formatting
		/** Exact grouping for dialog rows. @param {number} value */
		function formatExact(value) {
			try {
				return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Math.round(value));
			} catch {
				return String(Math.round(value));
			}
		}

		/**
		 * Format USD without hiding small estimates behind `$0.00`.
		 * @param {number} value
		 */
		function formatCost(value) {
			if (value >= 1) return `${value.toFixed(2)}`;
			if (value >= 0.01) return `${value.toFixed(3)}`;
			if (value >= 0.001) return `${value.toFixed(4)}`;
			return `${value.toFixed(5)}`;
		}

		/** Format a unit price without trailing zero padding: `$0.44`, `$0.014`. */
		function formatPrice(value) {
			if (value >= 1) return `${String(Number(value.toFixed(2)))}`;
			if (value >= 0.01) return `${String(Number(value.toFixed(3)))}`;
			return `${String(Number(value.toFixed(4)))}`;
		}
		//#endregion

		//#region dictionaries
		const zh = {
			"cost.aria": "本次对话估算费用 {cost}",
			"cost.dialog.title": "本次对话费用",
			"cost.dialog.model": "计费模型",
			"cost.dialog.tariff": "时段",
			"cost.dialog.tokensTotal": "Token 合计",
			"cost.dialog.cacheHit": "缓存命中",
			"cost.dialog.tokenTotalValue": "{tokens} tok",
			"cost.dialog.percentValue": "{percent}%",
			"cost.dialog.tokens": "{tokens} tok · {cost}",
			"cost.dialog.unit": "单价 / 1M",
			"cost.dialog.unitValue": "{input} / {cacheRead} / {output}（输入 / 缓存读 / 输出）",
			"cost.dialog.input": "未缓存输入",
			"cost.dialog.cacheRead": "缓存读取",
			"cost.dialog.cacheWrite": "缓存写入",
			"cost.dialog.output": "输出",
			"cost.dialog.total": "合计",
			"tariff.peak": "高峰",
			"tariff.offPeak": "低谷"
		};
		const en = {
			"cost.aria": "Estimated conversation cost {cost}",
			"cost.dialog.title": "Conversation cost",
			"cost.dialog.model": "Priced model",
			"cost.dialog.tariff": "Tariff",
			"cost.dialog.tokensTotal": "Total tokens",
			"cost.dialog.cacheHit": "Cache hit",
			"cost.dialog.tokenTotalValue": "{tokens} tok",
			"cost.dialog.percentValue": "{percent}%",
			"cost.dialog.tokens": "{tokens} tok · {cost}",
			"cost.dialog.unit": "Unit price / 1M",
			"cost.dialog.unitValue": "{input} / {cacheRead} / {output} (input / cache read / output)",
			"cost.dialog.input": "Uncached input",
			"cost.dialog.cacheRead": "Cache read",
			"cost.dialog.cacheWrite": "Cache write",
			"cost.dialog.output": "Output",
			"cost.dialog.total": "Total",
			"tariff.peak": "peak",
			"tariff.offPeak": "off-peak"
		};
		//#endregion

		//#region components
		const EMPTY_PROJECTION = () => undefined;
		const PANEL_GAP = 8;
		const PANEL_MARGIN = 12;
		/** Unplaced portal panel: hidden but laid out so the clamp measures real dimensions. */
		const MEASURE_STYLE = { visibility: "hidden", left: 0, top: 0 };

		/** A small circled-dollar glyph matching the shipped dock icons. */
		function CostIcon() {
			return jsxs("svg", {
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": true,
				"stroke-width": 1,
				children: [
					jsx("circle", { cx: 8, cy: 8, r: 6, stroke: "currentColor" }),
					jsx("path", {
						d: "M8 4.5V11.5M9.8 6.2C9.4 5.7 8.8 5.4 8 5.4C7 5.4 6.2 5.9 6.2 6.8C6.2 7.7 7 8 8 8.2C9 8.4 9.8 8.7 9.8 9.6C9.8 10.5 9 11 8 11C7.2 11 6.6 10.7 6.2 10.2",
						stroke: "currentColor",
						"stroke-linecap": "round"
					})
				]
			});
		}

		/**
		 * One trigger-anchored dialog seat: open state, viewport-clamped
		 * placement, outside-close, and Escape-close.
		 */
		function useCostDialog() {
			const [open, setOpen] = React.useState(false);
			const rootRef = React.useRef(null);
			const panelRef = React.useRef(null);
			const pos = primitives.useAnchoredPosition({
				open,
				anchorRef: rootRef,
				panelRef,
				side: "top",
				gap: PANEL_GAP,
				margin: PANEL_MARGIN
			});
			primitives.useDismissOnOutsidePointer(rootRef, open, setOpen, panelRef);
			React.useEffect(() => {
				if (!open) return;
				const onKeyDown = (event) => {
					if (event.key === "Escape") setOpen(false);
				};
				const onClick = (event) => {
					if (event.target instanceof Node && rootRef.current?.contains(event.target) !== true && panelRef.current?.contains(event.target) !== true) setOpen(false);
				};
				document.addEventListener("keydown", onKeyDown);
				document.addEventListener("click", onClick, true);
				return () => {
					document.removeEventListener("keydown", onKeyDown);
					document.removeEventListener("click", onClick, true);
				};
			}, [open, setOpen]);
			return { open, setOpen, rootRef, panelRef, pos };
		}

		/**
		 * The reading itself: a dock pill that opens a portaled details dialog.
		 * @param {{
		 *   cost: ReturnType<typeof estimateCost>,
		 *   provider: string | undefined,
		 *   model: string | undefined,
		 *   tr: (key: string, values?: Record<string, unknown>) => string
		 * }} props
		 */
		function CostStatView({ cost, provider, model, tr }) {
			const { open, setOpen, rootRef, panelRef, pos } = useCostDialog();
			const label = `≈${formatCost(cost.cost)}`;
			const aria = tr("cost.aria", { cost: label });
			const rows = [
				{ key: "input", label: "cost.dialog.input", tokens: cost.input, amount: cost.inputCost },
				{ key: "cacheRead", label: "cost.dialog.cacheRead", tokens: cost.cacheRead, amount: cost.cacheReadCost },
				{ key: "cacheWrite", label: "cost.dialog.cacheWrite", tokens: cost.cacheWrite, amount: cost.cacheWriteCost },
				{ key: "output", label: "cost.dialog.output", tokens: cost.output, amount: cost.outputCost }
			].filter((row) => row.tokens > 0);
			const promptTokens = cost.input + cost.cacheRead + cost.cacheWrite;
			const totalTokens = promptTokens + cost.output;
			let cacheHit = promptTokens > 0 ? Math.round((cost.cacheRead / promptTokens) * 1000) / 10 : null;
			if (cacheHit !== null && cacheHit >= 100 && cost.cacheRead < promptTokens) cacheHit = 99.9;

			return jsxs(React.Fragment, {
				children: [
					jsx("span", {
						className: "mcc_stat",
						"data-composer-stat": "model-context-cost",
						ref: rootRef,
						children: jsxs("button", {
							type: "button",
							className: "mcc_statPill",
							"aria-haspopup": "dialog",
							"aria-expanded": open,
							"aria-label": aria,
							onClick: () => setOpen(!open),
							children: [
								jsx(CostIcon, {}),
								jsx("span", { className: "mcc_statLabel", children: label })
							]
						})
					}),
					open && ReactDOM.createPortal(
						jsxs("div", {
							ref: panelRef,
							className: "mcc_panel",
							style: pos ?? MEASURE_STYLE,
							role: "dialog",
							"aria-label": tr("cost.dialog.title"),
							children: [
								jsxs("div", {
									className: "mcc_title",
									children: [
										jsxs("span", {
											className: "mcc_titleLabel",
											children: [jsx(CostIcon, {}), jsx("span", { children: tr("cost.dialog.title") })]
										}),
										jsx("span", { className: "mcc_titleValue", children: label })
									]
								}),
								jsx("div", { className: "mcc_titleRule", "aria-hidden": true }),
								jsxs("dl", {
									className: "mcc_details",
									children: [
										jsx("dt", { children: tr("cost.dialog.model") }),
										jsx("dd", {
											children: provider !== undefined && model !== undefined ? `${provider} / ${model}` : "—"
										}),
										jsx("dt", { children: tr("cost.dialog.tariff") }),
										jsx("dd", { children: tr(cost.peak ? "tariff.peak" : "tariff.offPeak") }),
										jsx("dt", { children: tr("cost.dialog.tokensTotal") }),
										jsx("dd", {
											children: tr("cost.dialog.tokenTotalValue", { tokens: formatExact(totalTokens) })
										}),
										cacheHit === null ? null : jsx("dt", { children: tr("cost.dialog.cacheHit") }),
										cacheHit === null ? null : jsx("dd", {
											children: tr("cost.dialog.percentValue", { percent: String(cacheHit) })
										}),
										...rows.flatMap((row) => [
											jsx("dt", { children: tr(row.label) }),
											jsx("dd", {
												children: tr("cost.dialog.tokens", {
													tokens: formatExact(row.tokens),
													cost: formatCost(row.amount)
												})
											})
										]),
										jsx("dt", { children: tr("cost.dialog.unit") }),
										jsx("dd", {
											children: tr("cost.dialog.unitValue", {
												input: formatPrice(cost.price.input),
												cacheRead: formatPrice(cost.price.cacheRead),
												output: formatPrice(cost.price.output)
											})
										}),
										jsx("dt", { children: tr("cost.dialog.total") }),
										jsx("dd", { children: label })
									]
								})
							]
						}),
						document.body
					)
				]
			});
		}

		/**
		 * Resolve usage and the selected model, then render the trigger only
		 * when the current route has a known tariff and at least one token.
		 * @param {{
		 *   useProjection?: (key: string) => unknown,
		 *   useModelDirectory?: (selector: (state: any) => any) => any,
		 *   t?: (key: string, values?: Record<string, unknown>) => string
		 * }} props
		 */
		function CostStat({ useProjection, useModelDirectory, t }) {
			const read = typeof useProjection === "function" ? useProjection : EMPTY_PROJECTION;
			const usage = read("tokenUsage");
			const selection = typeof useModelDirectory === "function"
				? useModelDirectory((state) => state?.current)
				: undefined;
			const tr = typeof t === "function" ? t : (key) => key;
			const cost = estimateCost(usage, priceFor(selection?.provider, selection?.model));
			if (cost === null) return null;
			return jsx(CostStatView, {
				cost,
				provider: selection?.provider,
				model: selection?.model,
				tr
			});
		}
		//#endregion

		//#region plugin body
		const NS = "model-context";
		const inject = ["slots", "locale", "modelDirectories"];

		/**
		 * Register the estimated-cost reading at the right end of the composer
		 * status row. The plugin does not touch the model label, so the shipped
		 * label and its release badge render unchanged.
		 * @param {any} ctx
		 */
		function apply(ctx) {
			installStyles(ctx);
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "model-context: dictionaries");
			ctx.slots.inject("conversation.composer.dock", () => ctx.slots.register({
				name: "conversation.composer.dock",
				id: "model-context-cost",
				order: 2,
				locale: NS,
				inject: (sessionId) => {
					if (sessionId === undefined) return { hooks: {} };
					const directory = ctx.modelDirectories.directoryFor(sessionId);
					directory.load().catch(() => {});
					return { hooks: { modelDirectory: directory.store } };
				}
			}, CostStat));
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		exports.CostStat = CostStat;
		exports.__internals = {
			estimateCost,
			isPeak,
			formatCost,
			formatPrice,
			priceFor
		};
		return module.exports;
		}

		// feature: hero.client.js
		function createHeroCleanup(require) {
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

		// feature: motion.client.js
		function createSidebarMotion(require) {
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

		// feature: auto-load.client.js
		function createAutoLoadEarlier(require) {
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

		// feature: terminal.client.js
		function createTerminalPanelFeature(require) {
		var module = { exports: {} };
		var exports = module.exports;

		//#region terminal dock
		const NS = "ui-toolkit-terminal";
		const VIEW_KEY = "bottom";
		const XTERM_CSS_ID = "ui-toolkit-terminal-xterm";
		const PANEL_CSS_ID = "ui-toolkit-terminal-panel";
		const DEFAULT_HEIGHT = 280;
		const MIN_HEIGHT = 140;
		const MAX_RATIO = 0.7;

		const zh = {
			"title": "终端",
			"open": "打开终端",
			"close": "关闭终端",
			"toggle": "展开或收起终端",
			"resize": "拖动调整高度，双击恢复默认高度",
			"starting": "正在启动…",
			"running": "运行中",
			"connecting": "连接中…",
			"disconnected": "连接已断开",
			"exited": "已退出（{code}）",
			"failed": "终端错误：{message}",
			"unavailable": "终端不可用",
			"missing": "这个终端已经不存在了",
			"limit": "终端数量已达上限",
			"clear": "清屏",
			"restart": "重启终端",
			"retry": "重试",
			"readOnly": "只读（另一个窗口持有输入）",
			"noXterm": "终端组件未能加载，请刷新页面"
		};

		const en = {
			"title": "Terminal",
			"open": "Open terminal",
			"close": "Close terminal",
			"toggle": "Toggle terminal",
			"resize": "Drag to resize, double-click to reset",
			"starting": "Starting…",
			"running": "Running",
			"connecting": "Connecting…",
			"disconnected": "Disconnected",
			"exited": "Exited ({code})",
			"failed": "Terminal error: {message}",
			"unavailable": "Terminal unavailable",
			"missing": "This terminal no longer exists",
			"limit": "The terminal limit has been reached",
			"clear": "Clear",
			"restart": "Restart terminal",
			"retry": "Retry",
			"readOnly": "Read-only (another window owns input)",
			"noXterm": "The terminal renderer failed to load; reload the page"
		};

		const ICONS = {
			terminal: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="1.7" y="2.7" width="12.6" height="10.6" rx="2.4"/><path d="M4.6 6.2l1.9 1.9-1.9 1.9M8.5 10h3"/></svg>',
			terminalLarge: '<svg viewBox="0 0 28 28" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="22" height="19" rx="4"/><path d="M7.5 10.5l3.4 3.4-3.4 3.4M14 17.5h6"/></svg>',
			clear: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5h10M6.2 4.5V3.2h3.6v1.3M4.6 4.5l.6 8.1h5.6l.6-8.1"/></svg>',
			restart: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.8V5.6h-2.8"/></svg>',
			close: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4.2 4.2l7.6 7.6M11.8 4.2l-7.6 7.6"/></svg>'
		};

		const css = [
			".uit-term-pill{position:absolute;right:16px;bottom:16px;z-index:12;box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px 0 9px;border:.5px solid var(--dsw-alias-border-l2);border-radius:999px;background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base));box-shadow:0 1px 2px rgba(0,0,0,.04);color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;font-weight:500;white-space:nowrap;cursor:pointer;pointer-events:auto;transform-origin:100% 100%;transition:right .18s ease,bottom .18s ease,transform .16s ease,opacity .16s ease,background .16s ease,color .16s ease}",
			".uit-term-pill:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover);transform:translateY(-1px)}",
			".uit-term-pill:active{transform:scale(.97)}",
			".uit-term-pill:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}",
			".uit-term-pill[data-placement=header]{position:static;height:28px;padding:0 8px;border:0;border-radius:6px;background:transparent;box-shadow:none;margin-right:2px}",
			".uit-term-pill[data-placement=header]:hover{background:var(--dsw-alias-interactive-bg-hover);transform:none}",
			".uit-term-pill[data-visible=false]{opacity:0;transform:translateY(6px) scale(.9);pointer-events:none}",
			".uit-term-pill__icon{display:grid;place-items:center;color:var(--dsw-alias-label-secondary)}",
			".uit-term-panel{position:relative;box-sizing:border-box;display:flex;flex-direction:column;flex:0 0 auto;width:100%;min-height:0;height:0;opacity:0;overflow:hidden;border-top:.5px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);transition:height .26s cubic-bezier(.2,.9,.3,1),opacity .16s ease}",
			".uit-term-panel[data-dragging=true]{transition:none}",
			".uit-term-panel__grip{position:absolute;z-index:3;top:0;left:0;right:0;height:5px;cursor:row-resize}",
			".uit-term-panel__grip:hover:after{content:'';position:absolute;top:1px;left:50%;width:36px;height:2px;margin-left:-18px;border-radius:2px;background:var(--dsw-alias-border-l3)}",
			".uit-term-panel__bar{display:flex;align-items:center;gap:8px;height:34px;flex:none;padding:2px 6px 0 10px;background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base));border-bottom:.5px solid var(--dsw-alias-border-l3)}",
			".uit-term-panel__title{display:flex;align-items:center;gap:6px;min-width:0;font-size:12px;font-weight:500}",
			".uit-term-panel__icon{display:grid;place-items:center;color:var(--dsw-alias-label-secondary)}",
			".uit-term-panel__status{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary);font-size:11px;font-weight:400}",
			".uit-term-panel__actions{margin-left:auto;display:flex;align-items:center;gap:2px;flex:none}",
			".uit-term-panel__action{display:grid;place-items:center;width:24px;height:24px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:background .12s ease,color .12s ease}",
			".uit-term-panel__action:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".uit-term-panel__action:disabled{opacity:.35;cursor:default}",
			".uit-term-panel__action:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:-1px}",
			".uit-term-panel__body{position:relative;display:flex;flex:1;min-height:0;flex-direction:column;background:var(--dsw-alias-bg-base)}",
			".uit-term__screen{flex:1;min-height:0;position:relative;padding:4px 6px 8px 10px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);overflow:hidden}",
			".uit-term__screen[hidden]{display:none}",
			".uit-term__screen .xterm{height:100%}",
			".uit-term__screen .xterm-viewport{background:transparent!important}",
			".uit-term-panel__notice{position:absolute;inset:0;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:14px;text-align:center;background:var(--dsw-alias-bg-base)}",
			".uit-term-panel__notice[hidden]{display:none}",
			".uit-term-panel__noticeIcon{display:grid;place-items:center;color:var(--dsw-alias-label-tertiary)}",
			".uit-term-panel__noticeText{margin:0;max-width:440px;font-size:12px;line-height:17px;color:var(--dsw-alias-label-secondary)}",
			".uit-term-panel__retry{margin-top:2px;height:26px;padding:0 12px;border:0;border-radius:7px;background:var(--dsw-alias-state-business-primary,#3b6ce7);color:#fff;font-size:12px;font-weight:500;cursor:pointer;transition:filter .12s ease,transform .12s ease}",
			".uit-term-panel__retry[hidden]{display:none}",
			".uit-term-panel__retry:hover{filter:brightness(1.06)}",
			".uit-term-panel__retry:active{transform:scale(.97)}",
			".uit-term-panel__retry:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}",
			"@media (prefers-reduced-motion:reduce){.uit-term-pill,.uit-term-panel{transition:none!important}}"
		].join("");

		let xtermLib;
		let xtermPromise;

		function loadXterm() {
			if (xtermLib !== undefined) return Promise.resolve(xtermLib);
			if (xtermPromise !== undefined) return xtermPromise;
			if (typeof require === "undefined" || typeof require.async !== "function") {
				return Promise.reject(new Error("client chunk loader unavailable"));
			}
			xtermPromise = require.async("./client.terminal.js").then(
				(loaded) => {
					xtermLib = loaded;
					globalThis.__DSH_UI_TOOLKIT_XTERM__ = loaded;
					return loaded;
				},
				(error) => {
					xtermPromise = undefined;
					throw error;
				}
			);
			return xtermPromise;
		}

		/** @param {string} tag @param {string} [className] @param {Record<string, string>} [attributes] */
		function createElement(tag, className, attributes) {
			const node = document.createElement(tag);
			if (className) node.className = className;
			if (attributes !== undefined) {
				for (const [key, value] of Object.entries(attributes)) {
					if (value === undefined) continue;
					node.setAttribute(key, value);
				}
			}
			return node;
		}

		function insertStyleTag(id, text) {
			if (document.querySelector('style[data-plugin-css="' + id + '"]') !== null) return null;
			const tag = document.createElement("style");
			tag.dataset.plugin = "@local/dsh-ui-toolkit";
			tag.dataset.pluginCss = id;
			tag.textContent = text;
			document.head.appendChild(tag);
			return tag;
		}

		function shortcutLabel() {
			const platform = document.documentElement.getAttribute("data-platform");
			const mac = platform === "darwin" || /Mac/i.test(navigator.platform);
			return mac ? "\u2318\u21e7`" : "Ctrl+Shift+`";
		}

		/**
		 * A floating Terminal pill plus the docked terminal panel it opens.
		 * The pill is absolutely positioned and never changes layout; the panel
		 * docks under the conversation for the lifetime of one shell.
		 * @param {any} ctx - Client context with webTerminals and locale.
		 * @param {(key: string, params?: Record<string, string>) => string} t - Bound translator.
		 */
		function createTerminalDock(ctx, t) {
			const terminals = ctx.webTerminals;
			if (terminals === undefined || terminals === null) return { mount: () => () => {} };

			let open = false;
			let closing = false;
			let height = DEFAULT_HEIGHT;
			let sessionId;
			let center;
			let pill;
			let panel;
			let statusNode;
			let notice;
			let noticeText;
			let noticeIcon;
			let retryButton;
			let screen;
			let clearButton;
			let restartButton;
			let closeButton;
			let panelAttached = false;
			let rootEl;
			let disposed = false;
			let centerPositionSet = false;
			let seatEl;
			let centerObserver;
			let seatObserver;
			let closeSerial = 0;
			let shouldFocus = false;
			let frame = 0;

			/** @type {any} */
			let view;
			/** @type {string | undefined} */
			let viewSessionId;
			/** @type {(() => void) | undefined} */
			let unsubscribeView;
			/** @type {(() => void) | undefined} */
			let detachHandle;
			/** @type {any} */
			let terminal;
			/** @type {any} */
			let fit;
			/** @type {any} */
			let input;
			/** @type {ResizeObserver | undefined} */
			let screenObserver;
			/** @type {MutationObserver | undefined} */
			let themeObserver;
			let lastRevision = 0;

			/** @type {Map<string, { sessionId: string, contentId: string, tabId: string }>} */
			const holds = new Map();
			let baseTabs = [];
			let retainTabsOriginal;
			let retainTabsBound;

			const observer = new MutationObserver(scheduleSync);
			const onWindowResize = () => {
				updatePillAnchor();
				if (open && panelAttached) {
					const next = clampHeight(height);
					if (next !== height) {
						height = next;
						panel.style.height = next + "px";
					}
				}
				fitTerminal();
			};
			window.addEventListener("resize", onWindowResize);

			function scheduleSync() {
				if (disposed || frame !== 0) return;
				frame = requestAnimationFrame(() => {
					frame = 0;
					sync();
				});
			}

			function maxHeight() {
				const available = center !== undefined && center.isConnected ? center.clientHeight : window.innerHeight;
				return Math.max(MIN_HEIGHT, Math.floor(available * MAX_RATIO));
			}

			function clampHeight(value) {
				const numeric = Number.isFinite(value) ? value : DEFAULT_HEIGHT;
				return Math.min(Math.max(Math.round(numeric), MIN_HEIGHT), maxHeight());
			}

			function buildPill() {
				pill = createElement("button", "uit-term-pill", { type: "button", "data-visible": "false" });
				const icon = createElement("span", "uit-term-pill__icon");
				icon.innerHTML = ICONS.terminal;
				const label = createElement("span");
				label.textContent = t("title");
				pill.append(icon, label);
				pill.title = t("toggle") + " (" + shortcutLabel() + ")";
				pill.setAttribute("aria-label", t("open"));
				pill.addEventListener("click", () => openPanel());
			}

			function buildPanel() {
				panel = createElement("section", "uit-term-panel", { role: "region", "aria-label": t("title"), "data-open": "false" });
				panel.style.height = "0px";
				panel.style.opacity = "0";

				const grip = createElement("div", "uit-term-panel__grip", { role: "separator", "aria-orientation": "horizontal", title: t("resize") });
				grip.addEventListener("pointerdown", beginDrag);
				grip.addEventListener("dblclick", (event) => {
					event.preventDefault();
					if (!open || !panelAttached) return;
					height = clampHeight(DEFAULT_HEIGHT);
					panel.style.height = height + "px";
					fitTerminal();
				});

				const bar = createElement("div", "uit-term-panel__bar");
				const titleCluster = createElement("div", "uit-term-panel__title");
				const icon = createElement("span", "uit-term-panel__icon");
				icon.innerHTML = ICONS.terminal;
				const title = createElement("span");
				title.textContent = t("title");
				statusNode = createElement("span", "uit-term-panel__status", { role: "status" });
				titleCluster.append(icon, title, statusNode);

				const actions = createElement("div", "uit-term-panel__actions");
				clearButton = actionButton("clear", ICONS.clear, t("clear"), () => {
					if (terminal === undefined || view === undefined) return;
					if (view.state.getSnapshot().writable) view.write("\u000c");
					else terminal.clear();
					focusTerminal();
				});
				restartButton = actionButton("restart", ICONS.restart, t("restart"), () => restart());
				closeButton = actionButton("close", ICONS.close, t("close"), () => closePanel());
				actions.append(clearButton, restartButton, closeButton);
				bar.append(titleCluster, actions);

				const body = createElement("div", "uit-term-panel__body");
				notice = createElement("div", "uit-term-panel__notice");
				notice.hidden = true;
				noticeIcon = createElement("div", "uit-term-panel__noticeIcon");
				noticeIcon.innerHTML = ICONS.terminalLarge;
				noticeText = createElement("p", "uit-term-panel__noticeText");
				retryButton = createElement("button", "uit-term-panel__retry", { type: "button" });
				retryButton.textContent = t("retry");
				retryButton.hidden = true;
				retryButton.addEventListener("click", () => restart());
				notice.append(noticeIcon, noticeText, retryButton);
				screen = createElement("div", "uit-term__screen");
				screen.addEventListener("pointerdown", () => focusTerminal());
				body.append(screen, notice);
				panel.append(grip, bar, body);
			}

			/** @param {string} action @param {string} icon @param {string} label @param {() => void} run */
			function actionButton(action, icon, label, run) {
				const button = createElement("button", "uit-term-panel__action", { type: "button", "data-action": action, title: label, "aria-label": label });
				button.innerHTML = icon;
				button.addEventListener("click", (event) => {
					event.stopPropagation();
					run();
				});
				return button;
			}

			function updatePillAnchor() {
				if (pill === undefined) return;
				const card = document.querySelector("[data-composer-card]");
				const corner = document.querySelector("[data-conversation-header-corner]");
				const centerEl = center;
				if (centerEl !== undefined && centerEl.isConnected) {
					const centerRect = centerEl.getBoundingClientRect();
					if (card !== null) {
						const cardRect = card.getBoundingClientRect();
						const width = pill.offsetWidth === 0 ? 92 : pill.offsetWidth;
						const gutter = Math.round(centerRect.right - cardRect.right);
						const inset = Math.max(0, Math.round(centerRect.bottom - cardRect.bottom));
						if (gutter >= width + inset) {
							if (pill.parentElement !== centerEl) centerEl.appendChild(pill);
							pill.dataset.placement = "dock";
							pill.style.right = inset + "px";
							pill.style.bottom = inset + "px";
							return;
						}
					}
				}
				if (corner !== null) {
					if (pill.parentElement !== corner) {
						const toggle = corner.querySelector("[data-sidebar-right-expand],[data-sidebar-right-toggle]");
						corner.insertBefore(pill, toggle ?? corner.firstElementChild);
					}
					pill.dataset.placement = "header";
					pill.style.right = "";
					pill.style.bottom = "";
					return;
				}
				if (centerEl !== undefined && centerEl.isConnected) {
					if (pill.parentElement !== centerEl) centerEl.appendChild(pill);
					pill.dataset.placement = "dock";
					pill.style.right = "16px";
					pill.style.bottom = "16px";
				}
			}

			function setPillVisible(visible) {
				if (pill === undefined) return;
				pill.dataset.visible = visible ? "true" : "false";
				pill.tabIndex = visible ? 0 : -1;
				pill.setAttribute("aria-hidden", String(!visible));
			}

			function ensureCenter(centerEl) {
				if (center === centerEl) return;
				center = centerEl;
				if (getComputedStyle(center).position === "static") {
					center.style.position = "relative";
					centerPositionSet = true;
				}
				if (centerObserver !== undefined) centerObserver.disconnect();
				centerObserver = new ResizeObserver(() => updatePillAnchor());
				centerObserver.observe(center);
			}

			function applyRootFlex() {
				const conversation = document.querySelector('[data-slot="main.conversation"]');
				const root = conversation === null ? null : conversation.firstElementChild;
				if (root === null) return;
				rootEl = root;
				root.style.flex = "1 1 0";
				root.style.minHeight = "0";
			}

			function restoreRoot() {
				if (rootEl === undefined || rootEl === null) return;
				rootEl.style.removeProperty("flex");
				rootEl.style.removeProperty("min-height");
				rootEl = undefined;
			}

			function showPanel() {
				if (panel === undefined || center === undefined) return;
				if (!panelAttached) {
					center.appendChild(panel);
					panelAttached = true;
					panel.dataset.open = "false";
					panel.style.height = "0px";
					panel.style.opacity = "0";
					applyRootFlex();
					void panel.offsetHeight;
				}
				panel.dataset.open = "true";
				panel.setAttribute("aria-hidden", "false");
				panel.style.height = clampHeight(height) + "px";
				panel.style.opacity = "1";
				setPillVisible(false);
				attachTransport();
				renderState();
			}

			function hidePanelDom() {
				if (!panelAttached) {
					restoreRoot();
					return;
				}
				panelAttached = false;
				closing = false;
				if (panel.parentElement !== null) panel.remove();
				restoreRoot();
				detachTransport();
			}

			function openPanel() {
				if (sessionId === undefined || center === undefined) return;
				closeSerial += 1;
				closing = false;
				open = true;
				ensureView();
				showPanel();
				updateChrome();
				shouldFocus = true;
				updatePillAnchor();
				setTimeout(() => {
					if (open) focusTerminal();
				}, 280);
			}

			function closePanel() {
				if (!open && !panelAttached) {
					updatePillAnchor();
					setPillVisible(true);
					return;
				}
				open = false;
				shouldFocus = false;
				closing = true;
				closeCurrent();
				setPillVisible(false);
				updateChrome();
				if (!panelAttached) {
					hidePanelDom();
					closing = false;
					updatePillAnchor();
					setPillVisible(true);
					return;
				}
				panel.dataset.open = "false";
				panel.style.height = "0px";
				panel.style.opacity = "0";
				const serial = ++closeSerial;
				setTimeout(() => {
					if (serial !== closeSerial || open) return;
					hidePanelDom();
					closing = false;
					updatePillAnchor();
					setPillVisible(true);
					const active = document.activeElement;
					if (active instanceof HTMLElement && panel.contains(active)) {
						pill.focus({ preventScroll: true });
					}
				}, 280);
			}

			function toggle() {
				if (open) closePanel();
				else openPanel();
			}

			function sync() {
				if (disposed) return;
				if (pill === undefined) buildPill();
				if (panel === undefined) buildPanel();
				const modal = document.querySelector('[role="dialog"][aria-modal="true"]');
				const anchor = document.querySelector('[data-slot="main.conversation"]');
				if (modal !== null || anchor === null) {
					hidePanelDom();
					setPillVisible(false);
					return;
				}
				const main = anchor.closest('[data-slot="main"]');
				const centerEl = main === null ? undefined : main.parentElement;
				const root = anchor.firstElementChild;
				if (centerEl === undefined || centerEl === null || root === null) {
					hidePanelDom();
					setPillVisible(false);
					return;
				}
				const sessionNode = root.querySelector("[data-conversation-session]") ?? anchor.querySelector("[data-conversation-session]");
				const nextSession = sessionNode === null ? undefined : sessionNode.getAttribute("data-conversation-session") ?? undefined;
				if (nextSession === undefined) {
					hidePanelDom();
					setPillVisible(false);
					return;
				}
				ensureCenter(centerEl);
				if (sessionId !== nextSession) {
					if (open || panelAttached) {
						open = false;
						closing = false;
						closeCurrent();
						hidePanelDom();
					}
					sessionId = nextSession;
				}
				updateChrome();
				if (open) {
					ensureView();
					if (!panelAttached) showPanel();
					else {
						attachTransport();
						renderState();
					}
					setPillVisible(false);
				} else {
					if (panelAttached && !closing) hidePanelDom();
					if (!closing && !panelAttached) {
						updatePillAnchor();
						setPillVisible(true);
					} else {
						setPillVisible(false);
					}
				}
			}

			function ensureView() {
				if (sessionId === undefined) return undefined;
				if (view !== undefined && viewSessionId === sessionId) return view;
				dropView();
				const contentId = "ui-toolkit.terminal:" + sessionId;
				try {
					terminals.close(sessionId, VIEW_KEY, contentId);
				} catch (_error) {
					// A stale binding may still be cleaned up by the controller.
				}
				try {
					view = terminals.view(sessionId, VIEW_KEY, contentId);
				} catch (error) {
					renderNotice({ phase: "failed", error: error instanceof Error ? error.message : String(error) });
					return undefined;
				}
				viewSessionId = sessionId;
				holds.set(sessionId, { sessionId, contentId, tabId: VIEW_KEY });
				syncHolds();
				subscribeView();
				attachTransport();
				return view;
			}

			function subscribeView() {
				if (unsubscribeView !== undefined) {
					unsubscribeView();
					unsubscribeView = undefined;
				}
				if (view === undefined) return;
				unsubscribeView = view.state.subscribe(renderState);
			}

			function dropView() {
				if (unsubscribeView !== undefined) {
					unsubscribeView();
					unsubscribeView = undefined;
				}
				detachTransport();
				view = undefined;
				viewSessionId = undefined;
				lastRevision = 0;
				updateChrome();
			}

			function closeCurrent() {
				const closingView = view;
				const closingSession = viewSessionId ?? sessionId;
				dropView();
				if (closingSession === undefined) return;
				holds.delete(closingSession);
				syncHolds();
				if (closingView === undefined) return;
				try {
					terminals.close(closingSession, VIEW_KEY, "ui-toolkit.terminal:" + closingSession, closingView.id);
				} catch (_error) {
					// The controller keeps a retryable cleanup request.
				}
			}

			function restart() {
				if (sessionId === undefined) return;
				closeCurrent();
				open = true;
				closing = false;
				closeSerial += 1;
				ensureView();
				if (!panelAttached) showPanel();
				else {
					panel.style.height = clampHeight(height) + "px";
					panel.style.opacity = "1";
					attachTransport();
					renderState();
				}
				updateChrome();
				shouldFocus = true;
				setTimeout(() => {
					if (open) focusTerminal();
				}, 200);
			}

			function attachTransport() {
				if (view === undefined || !panelAttached || detachHandle !== undefined) return;
				try {
					detachHandle = view.mount();
				} catch (error) {
					console.warn("ui-toolkit: terminal attach failed", error);
				}
			}

			function detachTransport() {
				destroyTerminal();
				if (detachHandle !== undefined) {
					const detach = detachHandle;
					detachHandle = undefined;
					try {
						detach();
					} catch (_error) {
						// Detaching only releases browser work.
					}
				}
			}

			function renderState() {
				if (disposed || view === undefined) {
					renderNotice(undefined);
					return;
				}
				const snapshot = view.state.getSnapshot();
				updateStatus(snapshot);
				if (snapshot.info === undefined) {
					destroyTerminal();
					screen.hidden = true;
					renderNotice(snapshot);
					return;
				}
				if (!notice.hidden) notice.hidden = true;
				if (screen.hidden) screen.hidden = false;
				ensureTerminal(snapshot);
				applySnapshot(snapshot);
				updateChrome();
			}

			function updateChrome() {
				if (panel === undefined) return;
				panel.dataset.open = open ? "true" : "false";
				if (clearButton !== undefined) clearButton.disabled = terminal === undefined;
				if (restartButton !== undefined) restartButton.disabled = sessionId === undefined;
				if (closeButton !== undefined) closeButton.disabled = false;
			}

			function updateStatus(snapshot) {
				if (statusNode === undefined) return;
				let text = "";
				if (snapshot !== undefined) {
					if (snapshot.issue === "missingTerminal") text = t("missing");
					else if (snapshot.issue === "terminalLimit") text = t("limit");
					else if (snapshot.phase === "loading" || snapshot.phase === "idle" || snapshot.phase === "creating") text = t("starting");
					else if (snapshot.phase === "connecting") text = t("connecting");
					else if (snapshot.phase === "disconnected") text = t("disconnected");
					else if (snapshot.phase === "failed") text = t("unavailable");
					else if (snapshot.info !== undefined && snapshot.info.state === "exited") text = t("exited", { code: String(snapshot.info.exitCode ?? "\u2014") });
					else if (snapshot.info !== undefined && snapshot.info.state === "failed") text = t("unavailable");
					else if (snapshot.info !== undefined && snapshot.info.state === "running") text = snapshot.writable ? t("running") : t("readOnly");
				}
				if (statusNode.textContent !== text) statusNode.textContent = text;
			}

			function renderNotice(snapshot) {
				if (notice === undefined) return;
				let text = t("starting");
				let retry = false;
				if (snapshot === undefined) {
					text = t("starting");
				} else if (snapshot.issue === "missingTerminal") {
					text = t("missing");
					retry = true;
				} else if (snapshot.issue === "terminalLimit") {
					text = t("limit");
					retry = true;
				} else if (snapshot.phase === "failed") {
					text = snapshot.error === undefined ? t("unavailable") : t("failed", { message: String(snapshot.error) });
					retry = true;
				} else if (snapshot.phase === "loading" || snapshot.phase === "idle" || snapshot.phase === "creating") {
					text = t("starting");
				} else if (snapshot.phase === "connecting") {
					text = t("connecting");
				} else if (snapshot.phase === "disconnected") {
					text = t("disconnected");
					retry = true;
				}
				if (notice.hidden) notice.hidden = false;
				if (noticeText.textContent !== text) noticeText.textContent = text;
				if (retryButton.hidden !== !retry) retryButton.hidden = !retry;
				if (screen.hidden !== true) screen.hidden = true;
				updateStatus(snapshot);
			}

			function ensureTerminal(snapshot) {
				if (terminal !== undefined) return;
				const lib = xtermLib ?? globalThis.__DSH_UI_TOOLKIT_XTERM__;
				if (lib === undefined) {
					renderNotice({ phase: "loading" });
					loadXterm().then(
						() => {
							if (!disposed) renderState();
						},
						(error) => {
							if (!disposed) renderNotice({ phase: "failed", error: error instanceof Error ? error.message : t("noXterm") });
						}
					);
					return;
				}
				if (lib.css !== undefined) insertStyleTag(XTERM_CSS_ID, lib.css);
				const environment = snapshot.environment;
				terminal = new lib.Terminal({
					cursorBlink: true,
					minimumContrastRatio: 4.5,
					fontSize: readFontSize(),
					fontFamily: readFontFamily(),
					scrollback: environment === undefined ? 1000 : environment.scrollback,
					theme: readTheme()
				});
				fit = new lib.FitAddon();
				terminal.loadAddon(fit);
				terminal.open(screen);
				terminal.textarea?.setAttribute("aria-label", t("title"));
				input = terminal.onData((data) => {
					if (view !== undefined) view.write(data);
				});
				screenObserver = new ResizeObserver(() => fitTerminal());
				screenObserver.observe(screen);
				lastRevision = 0;
				themeObserver = new MutationObserver(() => {
					if (terminal !== undefined) terminal.options.theme = readTheme();
				});
				themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-ds-dark-theme", "data-theme"] });
				themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class", "style", "data-ds-dark-theme"] });
			}

			function destroyTerminal() {
				if (themeObserver !== undefined) {
					themeObserver.disconnect();
					themeObserver = undefined;
				}
				if (screenObserver !== undefined) {
					screenObserver.disconnect();
					screenObserver = undefined;
				}
				if (input !== undefined) {
					input.dispose();
					input = undefined;
				}
				if (terminal !== undefined) {
					terminal.dispose();
					terminal = undefined;
				}
				fit = undefined;
				lastRevision = 0;
			}

			function applySnapshot(snapshot) {
				if (terminal === undefined || view === undefined) return;
				const render = snapshot.render;
				if (render !== undefined && render.revision > lastRevision) {
					lastRevision = render.revision;
					const frameData = render.frame;
					if (frameData.type === "snapshot") {
						terminal.reset();
						terminal.resize(frameData.info.cols, frameData.info.rows);
					}
					terminal.write(frameData.type === "snapshot" ? frameData.screen : frameData.data, () => {
						view?.acknowledge(render.revision);
					});
				}
				terminal.options.disableStdin = !snapshot.writable || !open;
				if (snapshot.writable) {
					fitTerminal();
					if (shouldFocus) {
						shouldFocus = false;
						terminal.focus();
					}
				}
			}

			function fitTerminal() {
				if (terminal === undefined || fit === undefined || view === undefined || !panelAttached) return;
				const snapshot = view.state.getSnapshot();
				const environment = snapshot.environment;
				if (environment === undefined || !snapshot.writable) return;
				const dimensions = fit.proposeDimensions();
				if (dimensions === undefined) return;
				const cols = Math.min(dimensions.cols, environment.maxCols);
				const rows = Math.min(dimensions.rows, environment.maxRows);
				if (cols < 2 || rows < 1) return;
				if (snapshot.info !== undefined && snapshot.info.cols === cols && snapshot.info.rows === rows) return;
				terminal.resize(cols, rows);
				view.resize(cols, rows);
			}

			function focusTerminal() {
				if (!open || terminal === undefined || view === undefined) return;
				const snapshot = view.state.getSnapshot();
				if (snapshot.writable) terminal.focus();
			}

			function beginDrag(event) {
				if (!open || !panelAttached) return;
				event.preventDefault();
				const startY = event.clientY;
				const startHeight = panel.offsetHeight;
				panel.dataset.dragging = "true";
				const move = (moveEvent) => {
					const next = Math.min(Math.max(startHeight + (startY - moveEvent.clientY), MIN_HEIGHT), maxHeight());
					height = next;
					panel.style.height = next + "px";
					fitTerminal();
				};
				const end = () => {
					window.removeEventListener("pointermove", move);
					window.removeEventListener("pointerup", end);
					window.removeEventListener("pointercancel", end);
					if (panel !== undefined) delete panel.dataset.dragging;
				};
				window.addEventListener("pointermove", move);
				window.addEventListener("pointerup", end);
				window.addEventListener("pointercancel", end);
			}

			function readFontSize() {
				const raw = getComputedStyle(document.body).getPropertyValue("--dsh-terminal-font-size");
				const size = Number.parseFloat(raw);
				return Number.isFinite(size) && size > 0 ? size : 12;
			}

			function readFontFamily() {
				const raw = getComputedStyle(document.body).getPropertyValue("--dsh-font-family-terminal").trim();
				const stack = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
				return raw === "" ? stack : raw + ", " + stack;
			}

			function readTheme() {
				const probe = screen === undefined ? document.body : screen;
				const style = getComputedStyle(probe);
				const background = style.backgroundColor === "rgba(0, 0, 0, 0)" ? "#111418" : style.backgroundColor;
				const foreground = style.color === "" ? "#e6e8eb" : style.color;
				return { background, foreground, cursor: foreground, selectionBackground: "rgba(90, 130, 255, 0.32)" };
			}

			function installHolds() {
				if (retainTabsOriginal !== undefined) return;
				const original = terminals.retainTabs;
				if (typeof original !== "function") return;
				retainTabsOriginal = original;
				retainTabsBound = original.bind(terminals);
				baseTabs = Array.isArray(terminals.openTabs) ? [...terminals.openTabs] : [];
				terminals.retainTabs = function (tabs) {
					baseTabs = Array.isArray(tabs) ? [...tabs] : [];
					return retainTabsBound([...baseTabs, ...holds.values()]);
				};
				terminals.retainTabs([...baseTabs]);
			}

			function syncHolds() {
				if (retainTabsBound === undefined) return;
				try {
					retainTabsBound([...baseTabs, ...holds.values()]);
				} catch (error) {
					console.warn("ui-toolkit: terminal hold sync failed", error);
				}
			}

			function mount() {
				buildPill();
				buildPanel();
				installHolds();
				centerObserver = new ResizeObserver(() => updatePillAnchor());
				seatObserver = new ResizeObserver(() => updatePillAnchor());
				observer.observe(document.body, {
					childList: true,
					subtree: true,
					attributes: true,
					attributeFilter: ["data-conversation-session", "data-phase", "data-content-phase"]
				});
				sync();
				return () => {
					disposed = true;
					observer.disconnect();
					if (frame !== 0) cancelAnimationFrame(frame);
					window.removeEventListener("resize", onWindowResize);
					if (centerObserver !== undefined) centerObserver.disconnect();
					if (seatObserver !== undefined) seatObserver.disconnect();
					closeCurrent();
					hidePanelDom();
					holds.clear();
					if (retainTabsOriginal !== undefined) {
						terminals.retainTabs = retainTabsOriginal;
						retainTabsOriginal = undefined;
						retainTabsBound = undefined;
						try {
							terminals.retainTabs(baseTabs);
						} catch (_error) {
							// The sidebar re-establishes its own holds on its next sync.
						}
					}
					if (pill !== undefined && pill.parentElement !== null) pill.remove();
					if (panel !== undefined && panel.parentElement !== null) panel.remove();
					restoreRoot();
					if (centerPositionSet && center !== undefined) center.style.removeProperty("position");
					document.querySelector('style[data-plugin-css="' + PANEL_CSS_ID + '"]')?.remove();
					document.querySelector('style[data-plugin-css="' + XTERM_CSS_ID + '"]')?.remove();
				};
			}

			return { mount, toggle, open: openPanel, close: closePanel, restart };
		}

		/**
		 * Register the terminal toggle with the shared shortcut service.
		 * @param {any} ctx
		 * @param {{ toggle: () => void }} dock
		 * @param {(key: string) => string} t
		 */
		function registerShortcut(ctx, dock, t) {
			const defaults = {
				"desktop:macos": { code: "Backquote", modifiers: ["primary", "shift"] },
				"desktop:windows": { code: "Backquote", modifiers: ["primary", "shift"] },
				"desktop:linux": { code: "Backquote", modifiers: ["primary", "shift"] },
				"web:macos": { code: "Backquote", modifiers: ["primary", "shift"] },
				"web:windows": { code: "Backquote", modifiers: ["primary", "shift"] }
			};
			try {
				const dispose = ctx.shortcuts.register({
					id: "ui-toolkit.terminal.toggle",
					label: () => t("toggle"),
					aliases: ["terminal", "dock terminal"],
					defaults,
					regions: ["page", "editable", "terminal"],
					modals: [],
					resolve: () => ({ status: "handled", run: () => dock.toggle() })
				});
				return () => {
					if (typeof dispose === "function") dispose();
					else if (dispose !== undefined && typeof dispose.dispose === "function") dispose.dispose();
				};
			} catch (error) {
				console.warn("ui-toolkit: terminal shortcut unavailable", error);
				return () => {};
			}
		}

		const inject = ["webTerminals", "shortcuts", "locale"];

		/** @param {any} ctx */
		function apply(ctx) {
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "ui-toolkit: terminal dictionaries");
			ctx.effect(() => {
				const tag = insertStyleTag(PANEL_CSS_ID, css);
				return () => {
					if (tag !== null) tag.remove();
				};
			}, "ui-toolkit: terminal styles");
			const dock = createTerminalDock(ctx, t);
			ctx.effect(() => dock.mount(), "ui-toolkit: terminal dock");
			ctx.effect(() => registerShortcut(ctx, dock, t), "ui-toolkit: terminal shortcut");
		}

		exports.apply = apply;
		exports.inject = inject;
		exports.__internals = { loadXterm };
		return module.exports;
		}

		// feature: auto-hide-scrollbar.client.js
		function createAutoHideScrollbars(require) {
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
		//#endregion

		//#region feature registry
		/**
		 * One row per merged feature. Keep the ids stable: they are the keys in
		 * localStorage, so renaming one forgets the user's choice.
		 */
		const FEATURES = Object.freeze([
			Object.freeze({ id: "sidebar", creator: createSidebarUnify, titleKey: "feature.sidebar.title", hintKey: "feature.sidebar.hint" }),
			Object.freeze({ id: "sidebarEntries", creator: createSidebarEntries, titleKey: "feature.sidebarEntries.title", hintKey: "feature.sidebarEntries.hint" }),
			Object.freeze({ id: "hero", creator: createHeroCleanup, titleKey: "feature.hero.title", hintKey: "feature.hero.hint" }),
			Object.freeze({ id: "motion", creator: createSidebarMotion, titleKey: "feature.motion.title", hintKey: "feature.motion.hint" }),
			Object.freeze({ id: "composerHud", creator: createComposerHud, titleKey: "feature.composerHud.title", hintKey: "feature.composerHud.hint" }),
			Object.freeze({ id: "gitBranch", creator: createGitBranch, titleKey: "feature.gitBranch.title", hintKey: "feature.gitBranch.hint" }),
			Object.freeze({ id: "modelEffort", creator: createModelEffort, titleKey: "feature.modelEffort.title", hintKey: "feature.modelEffort.hint" }),
			Object.freeze({ id: "viewMenu", creator: createViewMenu, titleKey: "feature.viewMenu.title", hintKey: "feature.viewMenu.hint" }),
			Object.freeze({ id: "modelContext", creator: createModelContext, titleKey: "feature.modelContext.title", hintKey: "feature.modelContext.hint" }),
			Object.freeze({ id: "autoLoad", creator: createAutoLoadEarlier, titleKey: "feature.autoLoad.title", hintKey: "feature.autoLoad.hint" }),
			Object.freeze({ id: "terminal", creator: createTerminalPanelFeature, titleKey: "feature.terminal.title", hintKey: "feature.terminal.hint" }),
			Object.freeze({ id: "autoHideScrollbars", creator: createAutoHideScrollbars, titleKey: "feature.autoHideScrollbars.title", hintKey: "feature.autoHideScrollbars.hint" })
		]);
		const FEATURE_IDS = FEATURES.map((feature) => feature.id);
		const FEATURE_BY_ID = new Map(FEATURES.map((feature) => [feature.id, feature]));
		const DEFAULT_FLAGS = Object.freeze(Object.fromEntries(FEATURE_IDS.map((id) => [id, true])));
		const STORAGE_KEY = "dsh-ui-toolkit.features.v1";
		//#endregion

		//#region dictionaries
		const NS = "ui-toolkit";
		const zh = {
			"title": "界面",
			"description": "选择要启用的界面增强。更改会立即生效，并记住在这台机器上。",
			"feature.sidebar.title": "侧边栏",
			"feature.sidebar.hint": "统一 New Session 行，去掉 HARNESS 徽章",
			"feature.sidebarEntries.title": "侧边栏入口",
			"feature.sidebarEntries.hint": "管理全局面板的显示和顺序，「更多」始终隐藏",
			"entries.title": "全局面板",
			"entries.hint": "用箭头调整顺序，或关闭某一项。更改立即生效，并记住在这台机器上。",
			"entries.reset": "恢复默认",
			"entries.empty": "还没有可管理的全局面板。",
			"entries.moveUp": "上移",
			"entries.moveDown": "下移",
			"entries.moreHidden": "「更多」已隐藏，插件市场等入口仍在上方管理。",
			"feature.hero.title": "新会话标题",
			"feature.hero.hint": "去掉「探索未至之境 / Into the Unknown」旁边的 Preview 徽章",
			"feature.motion.title": "侧边栏动画",
			"feature.motion.hint": "左右侧边栏开关时的弹性滑入、淡入和缩放过渡",
			"feature.composerHud.title": "输入框状态环",
			"feature.composerHud.hint": "在输入框工具栏显示上下文圆环和可展开的用量明细",
			"feature.gitBranch.title": "Git 分支",
			"feature.gitBranch.hint": "在输入框左侧显示当前分支，支持搜索和切换本地分支",
			"feature.modelEffort.title": "模型与推理强度",
			"feature.modelEffort.hint": "用可拖动滑块选择模型和 reasoning effort",
			"feature.viewMenu.title": "会话视图菜单",
			"feature.viewMenu.hint": "把 Chat / Trajectory 标签折叠进右上角的 ⋯ 菜单",
			"feature.modelContext.title": "对话成本",
			"feature.modelContext.hint": "在输入框状态栏显示估算费用，点开查看分项明细",
			"feature.autoLoad.title": "自动加载更早",
			"feature.autoLoad.hint": "接近对话顶部时自动加载更早历史，不用再点「加载更早」",
			"feature.terminal.title": "底部终端",
			"feature.terminal.hint": "右下角浮动的 Terminal 按钮，点开后从底边展开；关闭即结束进程（⌘⇧` / Ctrl+Shift+`）",
			"feature.autoHideScrollbars.title": "自动隐藏滚动条",
			"feature.autoHideScrollbars.hint": "只在滚动时显示滚动条，静止后柔和淡出"
		};
		const en = {
			"title": "Interface",
			"description": "Choose which interface enhancements to enable. Changes apply immediately and are remembered on this machine.",
			"feature.sidebar.title": "Sidebar",
			"feature.sidebar.hint": "Flatten New Session and remove the HARNESS badge",
			"feature.sidebarEntries.title": "Sidebar entries",
			"feature.sidebarEntries.hint": "Choose which global panels appear and in what order; More is always hidden",
			"entries.title": "Global panels",
			"entries.hint": "Reorder with the arrows or switch a row off. Changes apply immediately and are remembered on this machine.",
			"entries.reset": "Reset",
			"entries.empty": "No global panels are registered yet.",
			"entries.moveUp": "Move up",
			"entries.moveDown": "Move down",
			"entries.moreHidden": "More is hidden. Plugins and the market remain manageable above.",
			"feature.hero.title": "Hero headline",
			"feature.hero.hint": "Remove the Preview badge beside the hero headline",
			"feature.motion.title": "Sidebar motion",
			"feature.motion.hint": "Springy slide, fade, and scale transitions when either sidebar opens or closes",
			"feature.composerHud.title": "Composer status ring",
			"feature.composerHud.hint": "Show the context ring and an expandable usage breakdown in the composer toolbar",
			"feature.gitBranch.title": "Git branch",
			"feature.gitBranch.hint": "Show the current branch at the left of the composer, with searchable local-branch switching",
			"feature.modelEffort.title": "Model & reasoning effort",
			"feature.modelEffort.hint": "Pick the model and reasoning effort with a draggable slider",
			"feature.viewMenu.title": "Conversation view menu",
			"feature.viewMenu.hint": "Fold the Chat / Trajectory tabs into the More (…) menu at the top right",
			"feature.modelContext.title": "Conversation cost",
			"feature.modelContext.hint": "Show the estimated cost in the composer status row, with a click-open breakdown",
			"feature.autoLoad.title": "Auto-load earlier",
			"feature.autoLoad.hint": "Load earlier history automatically as the conversation nears the top",
			"feature.terminal.title": "Bottom terminal",
			"feature.terminal.hint": "A floating Terminal button at the bottom-right that expands from the bottom edge; closing ends the process (⌘⇧` / Ctrl+Shift+`)",
			"feature.autoHideScrollbars.title": "Auto-hide scrollbars",
			"feature.autoHideScrollbars.hint": "Show scrollbars only while scrolling; gently fade them out when idle"
		};
		//#endregion

		//#region styles
		const css = [
			".uit_section{box-sizing:border-box;width:100%;max-width:720px;flex-direction:column;gap:18px;display:flex}",
			".uit_intro{flex-direction:column;gap:4px;display:flex}",
			".uit_title{color:var(--dsw-alias-label-primary);margin:0;font-size:16px;font-weight:600;line-height:24px}",
			".uit_description{color:var(--dsw-alias-label-secondary);margin:0;font-size:13px;line-height:20px}",
			".uit_list{flex-direction:column;border-top:.5px solid var(--dsw-alias-border-l2);display:flex}",
			".uit_row{align-items:center;gap:24px;padding:12px 0;border-bottom:.5px solid var(--dsw-alias-border-l2);display:flex}",
			".uit_row:last-child{border-bottom:0}",
			".uit_text{flex-direction:column;gap:2px;min-width:0;flex:1;display:flex}",
			".uit_label{color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px}",
			".uit_hint{color:var(--dsw-alias-label-caption);font-size:12px;line-height:18px}",
			".uit_switch{box-sizing:border-box;appearance:none;-webkit-appearance:none;background:var(--dsw-alias-interactive-bg-active);border-radius:999px;flex:none;width:36px;height:20px;margin:0;cursor:pointer;position:relative;transition:background-color .15s var(--ds-ease-in-out)}",
			".uit_switch::after{content:\"\";background:#fff;border-radius:50%;width:16px;height:16px;position:absolute;top:2px;left:2px;transition:transform .15s var(--ds-ease-in-out);box-shadow:0 1px 2px rgba(0,0,0,.2)}",
			".uit_switch:checked{background:var(--dsw-alias-state-business-primary)}",
			".uit_switch:checked::after{transform:translateX(16px)}",
			".uit_switch:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}",
			".uit_switch:disabled{cursor:default;opacity:.5}",
			".uit_row:has(+.uit_subsection){border-bottom:0}",
			".uit_subsection{box-sizing:border-box;padding:2px 0 14px;border-bottom:.5px solid var(--dsw-alias-border-l2);margin-top:-6px}",
			".uit_subhead{align-items:center;gap:12px;display:flex}",
			".uit_sublabel{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;line-height:20px;flex:1}",
			".uit_link{appearance:none;background:none;border:0;color:var(--dsw-alias-state-business-primary);cursor:pointer;font:inherit;font-size:12px;line-height:20px;padding:2px 0}",
			".uit_link:hover{text-decoration:underline}",
			".uit_link:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}",
			".uit_subhint{color:var(--dsw-alias-label-caption);font-size:12px;line-height:18px;margin:2px 0 10px}",
			".uit_entries{flex-direction:column;gap:4px;display:flex}",
			".uit_entryRow{align-items:center;gap:10px;padding:6px 8px;border-radius:var(--dsw-radius-md);display:flex}",
			".uit_entryRow:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".uit_entryRow[data-hidden=\"true\"] .uit_entryName{color:var(--dsw-alias-label-caption)}",
			".uit_order{flex-direction:column;gap:1px;flex:none;display:flex}",
			".uit_orderButton{appearance:none;background:none;border:0;border-radius:var(--dsw-radius-sm);color:var(--dsw-alias-label-secondary);cursor:pointer;width:20px;height:15px;padding:0;justify-content:center;align-items:center;display:flex}",
			".uit_orderButton:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-active);color:var(--dsw-alias-label-primary)}",
			".uit_orderButton:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-1px}",
			".uit_orderButton:disabled{cursor:default;opacity:.25}",
			".uit_entryText{flex-direction:column;gap:1px;min-width:0;flex:1;display:flex}",
			".uit_entryName{color:var(--dsw-alias-label-primary);font-size:13px;line-height:18px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
			".uit_entryId{color:var(--dsw-alias-label-caption);font-family:var(--ds-font-family-code);font-size:11px;line-height:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
			".uit_empty{color:var(--dsw-alias-label-caption);font-size:12px;line-height:18px;padding:6px 0}",
			".uit_moreNote{color:var(--dsw-alias-label-caption);font-size:11px;line-height:16px;margin-top:8px}"
		].join("");
		const cssTagId = "@local/dsh-ui-toolkit/ui-toolkit.css";
		//#endregion

		//#region flag storage
		/**
		 * Merge a stored object over the defaults, ignoring unknown ids and
		 * non-boolean values (a corrupted entry must not disable a whole feature
		 * set).
		 * @param {any} value
		 * @returns {Record<string, boolean>}
		 */
		function normalizeFlags(value) {
			const flags = { ...DEFAULT_FLAGS };
			if (value === null || typeof value !== "object" || Array.isArray(value)) return flags;
			for (const id of FEATURE_IDS) {
				if (typeof value[id] === "boolean") flags[id] = value[id];
			}
			return flags;
		}

		/** @param {Storage | undefined} storage */
		function loadFlags(storage) {
			if (storage === undefined || storage === null) return { ...DEFAULT_FLAGS };
			try {
				const raw = storage.getItem(STORAGE_KEY);
				if (raw === null || raw === "") return { ...DEFAULT_FLAGS };
				return normalizeFlags(JSON.parse(raw));
			} catch (_error) {
				return { ...DEFAULT_FLAGS };
			}
		}

		/** @param {Storage | undefined} storage @param {Record<string, boolean>} flags */
		function saveFlags(storage, flags) {
			if (storage === undefined || storage === null) return;
			try {
				storage.setItem(STORAGE_KEY, JSON.stringify(flags));
			} catch (_error) {
				// Private mode / quota: the session still works, it just forgets.
			}
		}

		/**
		 * Tiny external store for the settings page.
		 * @param {Storage | undefined} storage
		 */
		function createFlagsStore(storage) {
			let flags = loadFlags(storage);
			const listeners = new Set();
			return {
				getSnapshot: () => flags,
				subscribe: (listener) => {
					listeners.add(listener);
					return () => listeners.delete(listener);
				},
				read: () => flags,
				set: (id, enabled) => {
					if (!FEATURE_BY_ID.has(id) || flags[id] === enabled) return false;
					flags = { ...flags, [id]: enabled };
					saveFlags(storage, flags);
					for (const listener of [...listeners]) {
						try {
							listener();
						} catch (error) {
							console.error("ui-toolkit: flag listener failed", error);
						}
					}
					return true;
				}
			};
		}

		/** @returns {Storage | undefined} */
		function browserStorage() {
			try {
				return typeof window !== "undefined" ? window.localStorage : undefined;
			} catch (_error) {
				return undefined;
			}
		}

		/** Cookie name for the cross-port copy; localStorage is the fallback. */
		const COOKIE_NAME = "dsh_ui_toolkit_features";

		/** @param {string} name */
		function readCookie(name) {
			try {
				if (typeof document === "undefined" || typeof document.cookie !== "string") return null;
				for (const part of document.cookie.split(";")) {
					const index = part.indexOf("=");
					if (index < 0) continue;
					if (part.slice(0, index).trim() !== name) continue;
					return decodeURIComponent(part.slice(index + 1).trim());
				}
			} catch (_error) {
				// Cookie access can be blocked; localStorage still works.
			}
			return null;
		}

		/** @param {string} name @param {string} value */
		function writeCookie(name, value) {
			try {
				if (typeof document === "undefined") return;
				document.cookie = name + "=" + encodeURIComponent(value) + "; Max-Age=31536000; Path=/; SameSite=Lax";
			} catch (_error) {
				// Ignored: the localStorage copy remains authoritative for this port.
			}
		}

		/**
		 * The desktop app can bind a fresh loopback port each launch, and
		 * localStorage is origin-scoped (port included). A cookie is host-scoped,
		 * so it keeps the feature choices across restarts; localStorage remains
		 * the fallback when cookies are unavailable.
		 */
		function createPreferenceStorage(cookieName) {
			const name = cookieName ?? COOKIE_NAME;
			const local = browserStorage();
			return {
				getItem: (key) => {
					const cookie = readCookie(name);
					if (cookie !== null) return cookie;
					try {
						return local === undefined || local === null ? null : local.getItem(key);
					} catch (_error) {
						return null;
					}
				},
				setItem: (key, value) => {
					writeCookie(name, value);
					try {
						if (local !== undefined && local !== null) local.setItem(key, value);
					} catch (_error) {
						// The cookie already carries the value.
					}
				}
			};
		}
		//#endregion

		//#region sidebar entry preferences
		/** Persisted selection for the global panel list. */
		const ENTRY_STORAGE_KEY = "dsh-ui-toolkit.sidebar-entries.v1";
		const ENTRY_COOKIE_NAME = "dsh_ui_toolkit_sidebar_entries";

		/**
		 * Keep only unique string ids; a corrupted value must not break the
		 * settings page or the sidebar.
		 * @param {any} value
		 * @returns {{ hidden: string[], order: string[] }}
		 */
		function normalizeEntryPrefs(value) {
			const hidden = [];
			const order = [];
			const seenHidden = new Set();
			const seenOrder = new Set();
			if (value !== null && typeof value === "object" && !Array.isArray(value)) {
				if (Array.isArray(value.hidden)) {
					for (const id of value.hidden) {
						if (typeof id !== "string" || seenHidden.has(id)) continue;
						seenHidden.add(id);
						hidden.push(id);
					}
				}
				if (Array.isArray(value.order)) {
					for (const id of value.order) {
						if (typeof id !== "string" || seenOrder.has(id)) continue;
						seenOrder.add(id);
						order.push(id);
					}
				}
			}
			return { hidden, order };
		}

		/** @param {Storage | undefined} storage */
		function loadEntryPrefs(storage) {
			if (storage === undefined || storage === null) return { hidden: [], order: [] };
			try {
				const raw = storage.getItem(ENTRY_STORAGE_KEY);
				if (raw === null || raw === "") return { hidden: [], order: [] };
				return normalizeEntryPrefs(JSON.parse(raw));
			} catch (_error) {
				return { hidden: [], order: [] };
			}
		}

		/** @param {Storage | undefined} storage @param {{ hidden: string[], order: string[] }} prefs */
		function saveEntryPrefs(storage, prefs) {
			if (storage === undefined || storage === null) return;
			try {
				storage.setItem(ENTRY_STORAGE_KEY, JSON.stringify(prefs));
			} catch (_error) {
				// Private mode / quota: the manager still works for this session.
			}
		}

		/** @param {any} label @param {string} fallback */
		function resolveEntryLabel(label, fallback) {
			try {
				const value = typeof label === "function" ? label() : label;
				if (typeof value === "string" && value !== "") return value;
			} catch (_error) {
				// A label whose locale service is not ready yet falls back to id.
			}
			return fallback;
		}

		/**
		 * Snapshot the live panel roster. Kept free of DOM access so the host
		 * tests can drive it with a plain slot stub.
		 * @param {any} slots
		 * @returns {ReadonlyArray<{ id: string, label: string, nativeOrder: number }>}
		 */
		function readPanelEntries(slots) {
			let entries = [];
			try {
				if (slots !== null && slots !== undefined && typeof slots.entriesOfSlot === "function") {
					entries = slots.entriesOfSlot("sidebar.panellist") ?? [];
				}
			} catch (_error) {
				// The registry may not be ready yet; the subscription re-syncs.
			}
			const seen = new Set();
			const rows = [];
			let index = 0;
			for (const entry of entries) {
				const options = entry !== null && entry !== undefined ? entry.options : undefined;
				const id = options !== null && options !== undefined && typeof options.id === "string" ? options.id : null;
				if (id === null || seen.has(id)) continue;
				seen.add(id);
				rows.push({
					id,
					label: resolveEntryLabel(options.label, id),
					nativeOrder: typeof options.order === "number" ? options.order : 0,
					index
				});
				index += 1;
			}
			rows.sort((left, right) => left.nativeOrder - right.nativeOrder || left.index - right.index);
			return rows.map(({ id, label, nativeOrder }) => ({ id, label, nativeOrder }));
		}

		/**
		 * @param {ReadonlyArray<any>} entries
		 * @param {ReadonlyArray<string>} order
		 * @returns {ReadonlyArray<any>}
		 */
		function orderPanelEntries(entries, order) {
			const remaining = new Map(entries.map((entry) => [entry.id, entry]));
			const result = [];
			for (const id of order) {
				const entry = remaining.get(id);
				if (entry === undefined) continue;
				result.push(entry);
				remaining.delete(id);
			}
			for (const entry of entries) {
				if (!remaining.has(entry.id)) continue;
				result.push(entry);
				remaining.delete(entry.id);
			}
			return result;
		}

		/**
		 * @param {ReadonlyArray<any>} entries
		 * @param {ReadonlyArray<string>} order
		 * @param {string} id
		 * @param {number} delta
		 * @returns {string[] | null}
		 */
		function shiftPanelOrder(entries, order, id, delta) {
			const ids = orderPanelEntries(entries, order).map((entry) => entry.id);
			const from = ids.indexOf(id);
			if (from < 0) return null;
			const to = from + delta;
			if (to < 0 || to >= ids.length) return null;
			ids.splice(from, 1);
			ids.splice(to, 0, id);
			return ids;
		}

		/**
		 * Shared store for the sidebar entry manager: the live roster plus the
		 * user's order/visibility choices, persisted through the same
		 * host-scoped cookie mechanism as the feature flags.
		 * @param {{ slots: any, locale?: any, storage?: any }} options
		 */
		function createSidebarEntryStore(options) {
			const slots = options.slots;
			const locale = options.locale;
			const storage = options.storage;

			let prefs = loadEntryPrefs(storage);
			let entries = readPanelEntries(slots);
			const listeners = new Set();

			const build = () => {
				const ordered = orderPanelEntries(entries, prefs.order);
				const hiddenSet = new Set(prefs.hidden);
				return {
					entries: ordered,
					hidden: ordered.filter((entry) => hiddenSet.has(entry.id)).map((entry) => entry.id)
				};
			};

			let snapshot = build();

			const signature = (value) => value.entries.map((entry) => entry.id + "\u0000" + entry.label).join("\u0001") + "\u0002" + value.hidden.join("\u0001");

			const publish = () => {
				const next = build();
				if (signature(next) === signature(snapshot)) return;
				snapshot = next;
				for (const listener of [...listeners]) {
					try {
						listener();
					} catch (error) {
						console.error("ui-toolkit: sidebar entry listener failed", error);
					}
				}
			};

			const commit = (next) => {
				prefs = normalizeEntryPrefs(next);
				saveEntryPrefs(storage, prefs);
				publish();
			};

			return {
				getSnapshot: () => snapshot,
				subscribe: (listener) => {
					listeners.add(listener);
					return () => listeners.delete(listener);
				},
				/**
				 * @param {string} id
				 * @param {boolean} hidden
				 */
				setHidden: (id, hidden) => {
					const set = new Set(prefs.hidden);
					if (hidden) set.add(id);
					else set.delete(id);
					commit({ ...prefs, hidden: [...set] });
				},
				/**
				 * @param {string} id
				 * @param {number} delta
				 * @returns {boolean}
				 */
				move: (id, delta) => {
					const order = shiftPanelOrder(entries, prefs.order, id, delta);
					if (order === null) return false;
					commit({ ...prefs, order });
					return true;
				},
				reset: () => {
					commit({ hidden: [], order: [] });
				},
				refreshEntries: () => {
					entries = readPanelEntries(slots);
					publish();
				},
				start: () => {
					const disposers = [];
					try {
						if (slots !== null && slots !== undefined && typeof slots.subscribe === "function") {
							const dispose = slots.subscribe("sidebar.panellist", () => {
								entries = readPanelEntries(slots);
								publish();
							});
							if (typeof dispose === "function") disposers.push(dispose);
						}
					} catch (_error) {
						// No live registry: the initial snapshot is still usable.
					}
					try {
						if (locale !== null && locale !== undefined && typeof locale.subscribe === "function") {
							const dispose = locale.subscribe(() => {
								entries = readPanelEntries(slots);
								publish();
							});
							if (typeof dispose === "function") disposers.push(dispose);
						}
					} catch (_error) {
						// Labels keep their initial language.
					}
					entries = readPanelEntries(slots);
					publish();
					return () => {
						for (const dispose of disposers.splice(0)) {
							try {
								dispose();
							} catch (_error) {
								// Best-effort unsubscription.
							}
						}
					};
				}
			};
		}
		//#endregion

		//#region feature lifecycle
		/**
		 * Fallback for runtimes without ctx.plugin(): wrap the methods features
		 * use to register cleanup so one feature can be stopped independently.
		 * @param {any} ctx
		 * @param {Array<() => void>} bag
		 */
		function createScopedContext(ctx, bag) {
			const record = (value) => {
				if (typeof value === "function") bag.push(value);
				return value;
			};
			const wrap = (target) => {
				if (target === undefined || target === null) return target;
				return new Proxy(target, {
					get(object, property) {
						const value = Reflect.get(object, property, object);
						if (typeof value !== "function") return value;
						return (...args) => record(value.apply(object, args));
					}
				});
			};
			const slots = wrap(ctx.slots);
			const locale = wrap(ctx.locale);
			const effect = (execute, label) => record(ctx.effect(execute, label));
			const reserved = new Set([
				"effect", "slots", "locale", "get", "on", "once", "provide",
				"timeout", "interval", "setTimeout", "setInterval", "throttle",
				"debounce", "then", "toJSON"
			]);
			/** Reach undeclared services through the facade's optional lookup. */
			const readService = (name) => {
				try {
					const service = typeof ctx.get === "function" ? ctx.get(name) : undefined;
					return service === undefined ? undefined : wrap(service);
				} catch (_error) {
					return undefined;
				}
			};
			return new Proxy(ctx, {
				get(target, property, receiver) {
					if (property === "effect") return effect;
					if (property === "slots") return slots;
					if (property === "locale") return locale;
					if (typeof property === "string" && !reserved.has(property)) {
						const service = readService(property);
						if (service !== undefined) return service;
					}
					return Reflect.get(target, property, receiver);
				}
			});
		}

		/**
		 * Start/stop one feature at a time. A child Cordis plugin gives each
		 * feature its own fiber, so disposing it tears down its slots, locale
		 * entries, style tags, and observers without touching its siblings.
		 */
		function createFeatureRunner(ctx, require) {
			const running = new Map();
			const generations = new Map();

			const start = (feature) => {
				if (running.has(feature.id)) return true;
				let featureModule;
				try {
					featureModule = feature.creator(require);
				} catch (error) {
					console.error("ui-toolkit: failed to create " + feature.id, error);
					return false;
				}
				if (featureModule === null || featureModule === undefined || typeof featureModule.apply !== "function") return false;

				let handle;
				let canPlugin = false;
				try {
					canPlugin = typeof ctx.plugin === "function";
				} catch (_error) {
					// The DSH dynamic facade withholds ctx.plugin; use the scoped
					// fallback below, which records each feature's disposers.
					canPlugin = false;
				}
				if (canPlugin) {
					try {
						handle = {
							fiber: ctx.plugin({
								name: "@local/dsh-ui-toolkit/" + feature.id,
								inject: Array.isArray(featureModule.inject) ? featureModule.inject : [],
								apply: (sub) => featureModule.apply(sub)
							})
						};
					} catch (error) {
						console.error("ui-toolkit: failed to start " + feature.id, error);
					}
				}
				if (handle === undefined) {
					const bag = [];
					const scoped = createScopedContext(ctx, bag);
					try {
						featureModule.apply(scoped);
						handle = {
							dispose: () => {
								while (bag.length > 0) {
									const dispose = bag.pop();
									try {
										dispose();
									} catch (error) {
										console.error("ui-toolkit: " + feature.id + " cleanup failed", error);
									}
								}
							}
						};
					} catch (error) {
						console.error("ui-toolkit: failed to apply " + feature.id, error);
						while (bag.length > 0) {
							const dispose = bag.pop();
							try {
								dispose();
							} catch (_cleanupError) {
								// Best-effort rollback of a partially applied feature.
							}
						}
					}
				}
				if (handle === undefined) return false;
				running.set(feature.id, handle);
				return true;
			};

			const stop = async (id) => {
				const handle = running.get(id);
				running.delete(id);
				if (handle === undefined) return;
				try {
					if (handle.fiber !== undefined && typeof handle.fiber.dispose === "function") await handle.fiber.dispose();
					else if (typeof handle.dispose === "function") handle.dispose();
				} catch (error) {
					console.error("ui-toolkit: failed to stop " + id, error);
				}
			};

			return {
				has: (id) => running.has(id),
				start,
				stop,
				/**
				 * Apply a boolean selection. Generation guards make rapid
				 * toggles settle on the last click.
				 */
				set: async (id, enabled) => {
					const feature = FEATURE_BY_ID.get(id);
					if (feature === undefined) return;
					const generation = (generations.get(id) ?? 0) + 1;
					generations.set(id, generation);
					await stop(id);
					if (generations.get(id) !== generation) return;
					if (enabled) start(feature);
				},
				sync: (flags) => {
					for (const feature of FEATURES) {
						if (flags[feature.id] !== false) start(feature);
					}
				}
			};
		}
		//#endregion

		//#region settings UI
		let activeStore = null;
		let activeRunner = null;
		let activeEntryStore = null;
		/** Locale-bound translator, used when a section is rendered without props.t. */
		let activeTranslate = null;
		/** Stable empty snapshot so the section renders before apply() wires the store. */
		const EMPTY_ENTRY_SNAPSHOT = Object.freeze({ entries: Object.freeze([]), hidden: Object.freeze([]) });
		const EMPTY_ENTRY_STORE = Object.freeze({
			subscribe: () => () => {},
			getSnapshot: () => EMPTY_ENTRY_SNAPSHOT
		});

		/** Hooks shim so the section also works if the runtime predates useSyncExternalStore. */
		function useStoreSnapshot(subscribe, getSnapshot) {
			if (typeof React.useSyncExternalStore === "function") return React.useSyncExternalStore(subscribe, getSnapshot);
			const [value, setValue] = React.useState(getSnapshot);
			React.useEffect(() => subscribe(() => setValue(getSnapshot())), [subscribe, getSnapshot]);
			return value;
		}

		function Switch({ checked, label, onChange }) {
			return h("input", {
				type: "checkbox",
				role: "switch",
				className: "uit_switch",
				checked,
				"aria-label": label,
				onChange: (event) => onChange(event.target.checked)
			});
		}

		/** Small chevron used by the order buttons. */
		function Chevron({ up }) {
			return h("svg", { width: 10, height: 10, viewBox: "0 0 16 16", "aria-hidden": "true" },
				h("path", {
					d: up ? "M4 10l4-4 4 4" : "M4 6l4 4 4-4",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: 1.75,
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			);
		}

		/**
		 * Inline manager shown under the Sidebar entries switch. It reads the
		 * shared store so its order matches what the sidebar renders.
		 */
		function SidebarEntriesManager({ store, t }) {
			const snapshot = useStoreSnapshot(store.subscribe, store.getSnapshot);
			const entries = snapshot.entries;
			return h("div", { className: "uit_subsection" },
				h("div", { className: "uit_subhead" },
					h("div", { className: "uit_sublabel" }, t("entries.title")),
					h("button", {
						type: "button",
						className: "uit_link",
						onClick: () => store.reset()
					}, t("entries.reset"))
				),
				h("div", { className: "uit_subhint" }, t("entries.hint")),
				entries.length === 0
					? h("div", { className: "uit_empty" }, t("entries.empty"))
					: h("div", { className: "uit_entries" },
						entries.map((entry, index) => {
							const hidden = snapshot.hidden.indexOf(entry.id) >= 0;
							return h("div", {
								key: entry.id,
								className: "uit_entryRow",
								"data-hidden": hidden ? "true" : "false"
							},
								h("div", { className: "uit_order" },
									h("button", {
										type: "button",
										className: "uit_orderButton",
										"aria-label": t("entries.moveUp"),
										disabled: index === 0,
										onClick: () => store.move(entry.id, -1)
									}, h(Chevron, { up: true })),
									h("button", {
										type: "button",
										className: "uit_orderButton",
										"aria-label": t("entries.moveDown"),
										disabled: index === entries.length - 1,
										onClick: () => store.move(entry.id, 1)
									}, h(Chevron, { up: false }))
								),
								h("div", { className: "uit_entryText" },
									h("div", { className: "uit_entryName" }, entry.label),
									entry.label === entry.id ? null : h("div", { className: "uit_entryId" }, entry.id)
								),
								h(Switch, {
									checked: !hidden,
									label: entry.label,
									onChange: (next) => store.setHidden(entry.id, !next)
								})
							);
						})
					),
				h("div", { className: "uit_moreNote" }, t("entries.moreHidden"))
			);
		}

		function UIToolkitSection(props) {
			const t = props !== null && props !== undefined && typeof props.t === "function"
				? props.t
				: (activeTranslate === null ? (key) => key : activeTranslate);
			if (activeStore === null) return null;
			const flags = useStoreSnapshot(activeStore.subscribe, activeStore.getSnapshot);
			const entryStore = activeEntryStore ?? EMPTY_ENTRY_STORE;
			return h("div", { className: "uit_section" },
				h("div", { className: "uit_intro" },
					h("div", { className: "uit_title" }, t("title")),
					h("div", { className: "uit_description" }, t("description"))
				),
				h("div", { className: "uit_list" },
					FEATURES.flatMap((feature) => {
						const enabled = flags[feature.id] !== false;
						const row = h("div", { key: feature.id, className: "uit_row" },
							h("div", { className: "uit_text" },
								h("div", { className: "uit_label" }, t(feature.titleKey)),
								h("div", { className: "uit_hint" }, t(feature.hintKey))
							),
							h(Switch, {
								checked: enabled,
								label: t(feature.titleKey),
								onChange: (next) => {
									if (activeStore === null) return;
									activeStore.set(feature.id, next);
									if (activeRunner !== null) activeRunner.set(feature.id, next);
								}
							})
						);
						if (feature.id !== "sidebarEntries" || !enabled) return [row];
						return [row, h(SidebarEntriesManager, {
							key: feature.id + "-manager",
							store: entryStore,
							t
						})];
					})
				)
			);
		}
		//#endregion

		//#region plugin body
		const inject = ["slots", "locale"];

		/** @param {any} ctx */
		function apply(ctx) {
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "@local/dsh-ui-toolkit";
				tag.dataset.pluginCss = cssTagId;
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => tag.remove();
			}, "ui-toolkit: styles");

			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "ui-toolkit: dictionaries");
			const translate = typeof ctx.locale.bind === "function" ? ctx.locale.bind(NS) : (key) => key;

			const store = createFlagsStore(createPreferenceStorage());
			const entryStore = createSidebarEntryStore({
				slots: ctx.slots,
				locale: ctx.locale,
				storage: createPreferenceStorage(ENTRY_COOKIE_NAME)
			});
			const runner = createFeatureRunner(ctx, toolkitRequire);
			sidebarEntriesHost = entryStore;
			activeStore = store;
			activeRunner = runner;
			activeEntryStore = entryStore;
			activeTranslate = translate;
			ctx.effect(() => entryStore.start(), "ui-toolkit: sidebar entry catalog");
			runner.sync(store.read());

			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "ui-toolkit",
				order: 90,
				label: () => translate("title"),
				locale: NS
			}, UIToolkitSection));

			ctx.effect(() => () => {
				activeRunner = null;
				activeStore = null;
				activeEntryStore = null;
				activeTranslate = null;
				sidebarEntriesHost = null;
			}, "ui-toolkit: settings state");
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		exports.UIToolkitSection = UIToolkitSection;
		exports.SidebarEntriesManager = SidebarEntriesManager;
		exports.__internals = {
			toolkitRequire,
			toolkitPrimitives,
			FEATURES,
			FEATURE_IDS,
			DEFAULT_FLAGS,
			STORAGE_KEY,
			normalizeFlags,
			loadFlags,
			saveFlags,
			createFlagsStore,
			createPreferenceStorage,
			COOKIE_NAME,
			createScopedContext,
			createFeatureRunner,
			ENTRY_STORAGE_KEY,
			ENTRY_COOKIE_NAME,
			normalizeEntryPrefs,
			loadEntryPrefs,
			saveEntryPrefs,
			readPanelEntries,
			orderPanelEntries,
			shiftPanelOrder,
			createSidebarEntryStore,
			css
		};
		return module.exports;
	}
});
