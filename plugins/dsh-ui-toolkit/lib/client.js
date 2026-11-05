window.__ModuleLoader__.load({
	id: "@local/dsh-ui-toolkit",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		const React = require("react");
		const h = React.createElement;

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
			".meff_effortBtn{text-overflow:ellipsis;white-space:nowrap;min-width:0;max-width:40%;color:var(--dsw-alias-label-caption);flex:none;overflow:hidden}",
			".meff_trigger[data-disabled] .meff_modelBtn,.meff_trigger[data-disabled] .meff_effortBtn{color:var(--dsw-alias-label-dimmed);cursor:default}",
			".meff_modelBtn:focus-visible,.meff_effortBtn:focus-visible{box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));border-radius:var(--dsw-radius-sm)}",
			".meff_chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s}",
			".meff_chevron[data-open]{transform:rotate(180deg)}",
			".meff_chevron[data-busy]{opacity:.4}",
			".meff_icon{display:var(--dsh-composer-model-icon-display,none);flex:none;color:var(--dsw-alias-label-tertiary)}",
			// Model pane: one flat list, a gray caption, a checked current row.
			".meff_menu{box-sizing:border-box;z-index:1100;position:fixed;width:min(304px,100vw - 32px);max-height:min(390px,100vh - 96px);background:var(--dsw-specific-menu);box-shadow:0 12px 32px #00000024,0 2px 8px #00000012,0 0 0 .5px #0000000f;color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border:0;border-radius:18px;flex-direction:column;padding:0;display:flex;overflow:hidden}",
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
			".meff_noEffort{color:var(--dsw-alias-label-tertiary);text-align:center;padding:8px 14px 16px;font-size:11px;line-height:16px}"
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
			const [pane, setPane] = React.useState("effort");
			const [localError, setLocalError] = React.useState(null);
			const [previewEffort, setPreviewEffort] = React.useState(null);
			const triggerRef = React.useRef(null);
			const menuRef = React.useRef(null);
			const rootRef = React.useRef(null);
			const position = primitives.useAnchoredPosition({
				open,
				anchorRef: triggerRef,
				panelRef: menuRef,
				side: "top",
				gap: 6,
				margin: 12
			});
			primitives.useDismissOnOutsidePointer(rootRef, open, setOpen, menuRef);

			React.useEffect(() => {
				if (!open) return;
				const onKeyDown = (event) => {
					if (event.key === "Escape") {
						event.stopPropagation();
						setOpen(false);
						triggerRef.current?.focus();
					}
				};
				document.addEventListener("keydown", onKeyDown);
				return () => document.removeEventListener("keydown", onKeyDown);
			}, [open]);

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
			React.useEffect(() => {
				setPreviewEffort(null);
			}, [effectiveEffort]);

			const modelLabel = currentChoice?.model.name
				?? (state.status === "loading" ? t("trigger.loading") : t("trigger.fallback"));
			const busy = state.pending !== null || !available;
			const activeLevel = levels[Math.max(0, levels.findIndex((level) => level.id === effectiveEffort))];

			const show = (nextPane) => {
				setLocalError(null);
				setPane(nextPane);
				setOpen(true);
				load();
			};

			/** Opening always lands on effort; the crumb is the way to the model list. */
			const toggle = () => {
				if (open && pane === "effort") {
					setOpen(false);
					return;
				}
				show("effort");
			};

			const chooseModel = async (group, model) => {
				if (busy) return;
				if (state.current?.provider === group.id && state.current.model === model.id) {
					setPane("effort");
					return;
				}
				setLocalError(null);
				const result = await select({ provider: group.id, model: model.id });
				if (result !== undefined && result.ok === false) setLocalError(t("error.action", { message: result.error.code }));
				else setPane("effort");
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
						onClick: () => setPane("effort")
					},
						h("span", null, t("menu.effort")),
						h("span", { className: "meff_effortRowValue" },
							effortLabel,
							h(primitives.IconChevronRightOutlineRegular, { size: 14 })
						)
					)
			);

			const effortPane = h(React.Fragment, null,
				h("div", { className: "meff_effortTop" },
					h("span", { className: "meff_effortName" }, previewEffort ?? activeLevel?.name ?? t("effort.providerDefault"))
				),
				h("button", {
					type: "button",
					className: "meff_crumb",
					onClick: () => setPane("model")
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
						"aria-expanded": open,
						title: modelLabel,
						disabled: locked,
						onClick: () => toggle()
					}, modelLabel),
					effortLabel === undefined
						? null
						: h("button", {
							type: "button",
							className: "meff_effortBtn",
							"aria-label": t("trigger.ariaEffort", { model: modelLabel, effort: effortLabel }),
							"aria-haspopup": "dialog",
							"aria-expanded": open,
							title: `${modelLabel} · ${effortLabel}`,
							disabled: locked,
							onClick: () => toggle()
						}, previewEffort ?? effortLabel),
					h(primitives.IconChevronDownOutlineRegular, {
						className: "meff_chevron",
						"data-open": open ? "" : undefined,
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
		const primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		const h = React.createElement;

		// The primitives package renamed icons between releases. Resolve the
		// current name first, then fall back to an inline glyph; a moved icon
		// must never take the header down.
		function EllipsisGlyph(props) {
			return h("svg", { viewBox: "0 0 16 16", width: 16, height: 16, "aria-hidden": true, ...props },
				h("path", { d: "M3 9c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1Zm5 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1Zm5 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1Z", fill: "currentColor" })
			);
		}
		function DownloadGlyph(props) {
			return h("svg", { viewBox: "0 0 16 16", width: 16, height: 16, "aria-hidden": true, ...props },
				h("path", { d: "M8 2v7m0 0 2.8-2.8M8 9 5.2 6.2M3 11.5v1.2c0 .7.6 1.3 1.3 1.3h7.4c.7 0 1.3-.6 1.3-1.3v-1.2", fill: "none", stroke: "currentColor", "stroke-width": 1.4, "stroke-linecap": "round", "stroke-linejoin": "round" })
			);
		}
		const IconEllipsis = primitives.IconEllipsisOutline16 ?? primitives.IconEllipsisOutlineRegular ?? EllipsisGlyph;
		const IconDownload = primitives.IconDownloadOutline16 ?? primitives.IconDownloadOutlineRegular ?? DownloadGlyph;
		const Menu = typeof primitives.Menu === "function" ? primitives.Menu : null;
		const Tooltip = typeof primitives.Tooltip === "function" ? primitives.Tooltip : ({ children }) => children;

		//#region styles
		const css = [
			// The View strip stays mounted: its buttons are the supported way to
			// select a View. It is taken out of the layout and made invisible so the
			// header shrinks to the title row.
			"header div:has(>[data-conversation-tabs]){position:absolute;top:0;left:0;right:auto;width:8000px;height:0;min-height:0;margin:0;padding:0;overflow:hidden;visibility:hidden}",
			"header:has([data-conversation-tabs]){position:relative;min-height:0!important;padding-bottom:10px!important}",
			// The session-log-export "More actions" trigger is replaced by this
			// menu. Its dialog stays mounted, so download feedback still works.
			"html[data-vwm-export=replaced] [data-slot=\"conversation.session.header.utilities\"] button[class*=\"_moreButton\"]{display:none!important}",
			".vwm_trigger{box-sizing:border-box;width:28px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:var(--dsw-radius-sm);flex:none;justify-content:center;align-items:center;padding:6px;display:inline-flex}",
			".vwm_trigger svg{width:15px;height:15px}",
			".vwm_trigger:hover,.vwm_trigger[data-open]{background:var(--dsw-alias-interactive-bg-hover)}",
			".vwm_trigger:active{background:var(--dsw-alias-interactive-bg-active)}",
			".vwm_trigger:focus-visible{outline:none;box-shadow:0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}",
			".vwm_menu{box-sizing:border-box;width:min(248px,100vw - 24px)}"
		].join("");
		const cssTagId = "@local/dsh-view-menu/view-menu.css";

		//#region dictionaries
		const zh = {
			menu: "会话视图",
			chat: "对话",
			download: "下载 Session 日志"
		};
		const en = {
			menu: "Conversation views",
			chat: "Chat",
			download: "Download session log"
		};
		//#endregion

		//#region helpers
		const VIEW_SLOT = "conversation.view";
		const FIXED_VIEW_ID = "chat";
		const DOWNLOAD_ID = "download";

		/**
		 * Resolve a View label option. Owners register either a string or a
		 * locale-bound thunk; a thunk may throw while its package unloads.
		 * @param {unknown} raw - `label` from the View registration.
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
		 * this build, and `aria-selected` carries the active View.
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
		 * Build the menu rows. `chat` stays available even when a build hides the
		 * tab strip for a single-View conversation; every other row must be backed
		 * by a rendered tab, which also honors feature flags such as Coding Tools.
		 * @param {Array<{ id: string, label: string }>} views
		 * @param {{ labels: Set<string>, active: string | null }} tabs
		 * @param {boolean} hasDownload
		 */
		function buildItems(views, tabs, hasDownload) {
			const available = [];
			for (const view of views ?? []) {
				if (view === null || view === undefined || typeof view.id !== "string") continue;
				if (view.id !== FIXED_VIEW_ID && !tabs.labels.has(view.label)) continue;
				available.push(view);
			}
			const items = available.map((view) => ({ id: view.id, label: view.label }));
			if (hasDownload) {
				if (items.length > 0) items.push({ type: "separator", id: "separator" });
				items.push({ id: DOWNLOAD_ID, label: "", icon: null });
			}
			return { items, available };
		}

		/**
		 * Select a View through its rendered tab button. The tab strip is hidden
		 * with CSS, so the button still exists and still runs the shipped
		 * `selectView` path (activation + preference), unlike a synthetic store
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
		//#endregion

		//#region export slot
		/** Headers mount more than once in split views; only the last owner clears the flag. */
		let exportOwners = 0;
		/**
		 * Mark the shipped export trigger as replaced by our menu. Its dialog
		 * stays mounted, so download feedback keeps working without the trigger.
		 */
		function claimExportSlot() {
			if (typeof document === "undefined") return () => {};
			exportOwners += 1;
			document.documentElement.dataset.vwmExport = "replaced";
			return () => {
				exportOwners = Math.max(0, exportOwners - 1);
				if (exportOwners === 0) delete document.documentElement.dataset.vwmExport;
			};
		}
		//#endregion

		//#region component
		/**
		 * Top-right header menu that owns every Conversation View plus the Session
		 * log download. It replaces the shipped "More actions" trigger while
		 * keeping that package's dialog mounted.
		 * @param {{ readViews: (tr: (key: string) => string) => Array<{ id: string, label: string }>, hasDownload: () => boolean, download: () => void, t: (key: string) => string }} props
		 */
		function ViewMenuButton({ readViews: read, hasDownload, download, t }) {
			const tr = typeof t === "function" ? t : (key) => key;
			const [open, setOpen] = React.useState(false);
			const views = typeof read === "function" ? read(tr) : [];
			const tabs = readTabSnapshot();
			const canDownload = typeof hasDownload === "function" && hasDownload();
			const { items, available } = buildItems(views, tabs, canDownload);
			const activeView = available.find((view) => tabs.active !== null && view.label === tabs.active);
			const label = tr("menu");
			React.useEffect(() => (canDownload ? claimExportSlot() : undefined), [canDownload]);
			const menuItems = items.map((item) => {
				if (item.type === "separator") return item;
				if (item.id === DOWNLOAD_ID) return { ...item, label: tr("download"), icon: h(IconDownload, { size: 16 }) };
				return item;
			});

			const close = () => setOpen(false);
			const onSelect = (id) => {
				close();
				if (id === DOWNLOAD_ID) {
					if (typeof download === "function") download();
					return;
				}
				const view = available.find((entry) => entry.id === id);
				if (view !== undefined) clickViewTab(view.label);
			};

			const trigger = h("button", {
				type: "button",
				className: "vwm_trigger",
				"data-open": open ? "" : undefined,
				"aria-label": label,
				"aria-haspopup": "menu",
				"aria-expanded": open,
				onClick: () => setOpen((value) => !value)
			}, h(IconEllipsis, { size: 15 }));

			return h(Menu, {
				open,
				onClose: close,
				align: "end",
				side: "bottom",
				dense: true,
				portal: true,
				autoFocus: true,
				selectedId: activeView !== undefined ? activeView.id : undefined,
				items: menuItems,
				listClassName: "vwm_menu",
				onSelect,
				anchor: h(Tooltip, { label, side: "bottom", delayMs: 500, children: trigger })
			});
		}
		//#endregion

		//#region plugin body
		/** Show a render failure instead of silently losing the header menu. */
		class ViewMenuBoundary extends React.Component {
			constructor(props) {
				super(props);
				this.state = { error: null };
			}
			static getDerivedStateFromError(error) {
				return { error };
			}
			componentDidCatch(error) {
				console.error("view-menu: render failed", error);
			}
			render() {
				if (this.state.error === null) return this.props.children;
				return h("span", { style: { color: "var(--dsw-alias-state-error-primary)", fontSize: "11px", padding: "6px" } }, "view-menu error: " + String(this.state.error?.message ?? this.state.error));
			}
		}

		const NS = "view-menu";
		const inject = ["slots", "locale"];

		/** @param {any} ctx */
		function apply(ctx) {
			// Without the Menu primitive there is no safe replacement trigger;
			// stay inert instead of hiding the shipped header controls.
			if (Menu === null) return;
			ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = "@local/dsh-view-menu";
				tag.dataset.pluginCss = cssTagId;
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => tag.remove();
			}, "view-menu: styles");
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "view-menu: dictionaries");

			const downloadService = () => {
				try {
					return typeof ctx.get === "function" ? ctx.get("sessionLogDownload") : undefined;
				} catch (_error) {
					return undefined;
				}
			};

			ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
				name: "conversation.session.header.utilities",
				id: "view-menu",
				order: 1000,
				locale: NS,
				inject: (sessionId) => ({
					readViews: (tr) => readViews(ctx, tr),
					hasDownload: () => downloadService() !== undefined,
					download: () => {
						const service = downloadService();
						if (service !== undefined && typeof service.download === "function") service.download(sessionId);
					}
				})
			}, (props) => h(ViewMenuBoundary, null, h(ViewMenuButton, props))));
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		exports.ViewMenuButton = ViewMenuButton;
		exports.__internals = {
			resolveLabel,
			readTabSnapshot,
			buildItems,
			clickViewTab,
			claimExportSlot
		};
		return module.exports;
		}

		// feature: sidebar-unify.client.js
		function createSidebarUnify(require) {
		var module = { exports: {} };
		var exports = module.exports;

		//#region constants
		/** Slot whose registrations are the panel rows below New Session. */
		const PANEL_SLOT = "sidebar.panellist";
		/**
		 * Panels shipped by the app itself. Every other registered panel comes
		 * from an installed plugin; only those make the More (pin/manage) row
		 * useful, so More is hidden while this set is the whole roster.
		 */
		const OFFICIAL_PANEL_IDS = new Set(["plugins", "schedules"]);
		/** Root data attribute consumed by the stylesheet as the More switch. */
		const MORE_FLAG = "dsuHasPluginPanels";
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
			"div[class*=\"logoRow\"] [class*=\"brandName\"] svg [clip-path*=\"badge\"]{display:none!important}",
			// More only manages plugin panels. Without one there is nothing to
			// pin or open there, so the row disappears instead of ending the list
			// with a dead control.
			"html[data-dsu-has-plugin-panels=\"false\"] nav[class*=\"panelList\"] button[class*=\"panelRow\"][aria-haspopup=\"menu\"]{display:none!important}",
			"html[data-dsu-has-plugin-panels=\"false\"] nav[class*=\"panelList\"] [class*=\"moreAnchor\"]{display:none!important}"
		].join("");
		//#endregion

		//#region helpers
		/**
		 * Read a panel id from either registration shape: the current
		 * `{ options: { id } }` entry or a bare options object.
		 * @param {any} entry
		 * @returns {string | null}
		 */
		function panelId(entry) {
			if (entry === null || entry === undefined) return null;
			if (typeof entry.id === "string") return entry.id;
			const options = entry.options;
			if (options !== null && options !== undefined && typeof options.id === "string") return options.id;
			return null;
		}

		/**
		 * Whether any registered panel comes from a plugin rather than the app.
		 * @param {Iterable<any> | null | undefined} entries
		 * @returns {boolean}
		 */
		function hasPluginPanels(entries) {
			if (entries === null || entries === undefined) return false;
			for (const entry of entries) {
				const id = panelId(entry);
				if (id !== null && !OFFICIAL_PANEL_IDS.has(id)) return true;
			}
			return false;
		}

		/**
		 * Read the live panel roster without letting a missing registry or an
		 * unloading package take the client down.
		 * @param {any} ctx
		 * @returns {ReadonlyArray<any>}
		 */
		function readPanelEntries(ctx) {
			try {
				if (typeof ctx.slots.entriesOfSlot === "function") return ctx.slots.entriesOfSlot(PANEL_SLOT) ?? [];
				if (typeof ctx.slots.entries === "function") return ctx.slots.entries(PANEL_SLOT) ?? [];
			} catch (_error) {
				// A registry that is not ready yet simply means "no plugin panels";
				// the subscription below re-syncs when registrations arrive.
			}
			return [];
		}

		/**
		 * Publish the More switch on <html>. Kept as a pure function so the
		 * tests can exercise the roster rules without a DOM.
		 * @param {{ dataset: Record<string, string> } | undefined} root
		 * @param {Iterable<any> | null | undefined} entries
		 * @returns {boolean} whether a plugin panel is present.
		 */
		function syncMore(root, entries) {
			const present = hasPluginPanels(entries);
			if (root !== undefined && root !== null && root.dataset !== undefined) {
				root.dataset[MORE_FLAG] = present ? "true" : "false";
			}
			return present;
		}
		//#endregion

		//#region plugin body
		const inject = ["slots"];

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

			const root = typeof document !== "undefined" ? document.documentElement : undefined;
			if (root === undefined) return;

			const sync = () => syncMore(root, readPanelEntries(ctx));
			sync();

			if (typeof ctx.slots.subscribe === "function") {
				ctx.effect(() => ctx.slots.subscribe(PANEL_SLOT, sync), "sidebar-unify: panel roster");
			}

			// The attribute is global; clear it when the plugin unloads so the
			// shipped More row returns immediately.
			ctx.effect(() => () => {
				delete root.dataset[MORE_FLAG];
			}, "sidebar-unify: root flag");
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		exports.__internals = {
			OFFICIAL_PANEL_IDS,
			MORE_FLAG,
			PANEL_SLOT,
			css,
			hasPluginPanels,
			panelId,
			readPanelEntries,
			syncMore
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
		//#endregion

		//#region feature registry
		/**
		 * One row per merged feature. Keep the ids stable: they are the keys in
		 * localStorage, so renaming one forgets the user's choice.
		 */
		const FEATURES = Object.freeze([
			Object.freeze({ id: "sidebar", creator: createSidebarUnify, titleKey: "feature.sidebar.title", hintKey: "feature.sidebar.hint" }),
			Object.freeze({ id: "hero", creator: createHeroCleanup, titleKey: "feature.hero.title", hintKey: "feature.hero.hint" }),
			Object.freeze({ id: "motion", creator: createSidebarMotion, titleKey: "feature.motion.title", hintKey: "feature.motion.hint" }),
			Object.freeze({ id: "composerHud", creator: createComposerHud, titleKey: "feature.composerHud.title", hintKey: "feature.composerHud.hint" }),
			Object.freeze({ id: "gitBranch", creator: createGitBranch, titleKey: "feature.gitBranch.title", hintKey: "feature.gitBranch.hint" }),
			Object.freeze({ id: "modelEffort", creator: createModelEffort, titleKey: "feature.modelEffort.title", hintKey: "feature.modelEffort.hint" }),
			Object.freeze({ id: "viewMenu", creator: createViewMenu, titleKey: "feature.viewMenu.title", hintKey: "feature.viewMenu.hint" }),
			Object.freeze({ id: "modelContext", creator: createModelContext, titleKey: "feature.modelContext.title", hintKey: "feature.modelContext.hint" }),
			Object.freeze({ id: "autoLoad", creator: createAutoLoadEarlier, titleKey: "feature.autoLoad.title", hintKey: "feature.autoLoad.hint" })
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
			"feature.sidebar.hint": "统一 New Session 行、去掉 HARNESS 徽章，没有插件面板时隐藏「更多」",
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
			"feature.autoLoad.hint": "接近对话顶部时自动加载更早历史，不用再点「加载更早」"
		};
		const en = {
			"title": "Interface",
			"description": "Choose which interface enhancements to enable. Changes apply immediately and are remembered on this machine.",
			"feature.sidebar.title": "Sidebar",
			"feature.sidebar.hint": "Flatten New Session, remove the HARNESS badge, and hide More when no plugin adds a sidebar panel",
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
			"feature.autoLoad.hint": "Load earlier history automatically as the conversation nears the top"
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
			".uit_switch:disabled{cursor:default;opacity:.5}"
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
		function createPreferenceStorage() {
			const local = browserStorage();
			return {
				getItem: (key) => {
					const cookie = readCookie(COOKIE_NAME);
					if (cookie !== null) return cookie;
					try {
						return local === undefined || local === null ? null : local.getItem(key);
					} catch (_error) {
						return null;
					}
				},
				setItem: (key, value) => {
					writeCookie(COOKIE_NAME, value);
					try {
						if (local !== undefined && local !== null) local.setItem(key, value);
					} catch (_error) {
						// The cookie already carries the value.
					}
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

		function UIToolkitSection(props) {
			const t = props !== null && props !== undefined && typeof props.t === "function" ? props.t : (key) => key;
			if (activeStore === null) return null;
			const flags = useStoreSnapshot(activeStore.subscribe, activeStore.getSnapshot);
			return h("div", { className: "uit_section" },
				h("div", { className: "uit_intro" },
					h("div", { className: "uit_title" }, t("title")),
					h("div", { className: "uit_description" }, t("description"))
				),
				h("div", { className: "uit_list" },
					FEATURES.map((feature) => {
						const enabled = flags[feature.id] !== false;
						return h("div", { key: feature.id, className: "uit_row" },
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
			const runner = createFeatureRunner(ctx, require);
			activeStore = store;
			activeRunner = runner;
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
			}, "ui-toolkit: settings state");
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		exports.UIToolkitSection = UIToolkitSection;
		exports.__internals = {
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
			css
		};
		return module.exports;
	}
});
