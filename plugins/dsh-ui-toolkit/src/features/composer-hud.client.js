window.__ModuleLoader__.load({
	id: "@local/dsh-composer-hud",
	factory: (require) => {
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
});
