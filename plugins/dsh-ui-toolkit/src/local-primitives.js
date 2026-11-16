
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
