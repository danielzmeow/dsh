window.__ModuleLoader__.load({
	id: "@local/dsh-model-context",
	factory: (require) => {
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
			if (value >= 1) return `$${value.toFixed(2)}`;
			if (value >= 0.01) return `$${value.toFixed(3)}`;
			if (value >= 0.001) return `$${value.toFixed(4)}`;
			return `$${value.toFixed(5)}`;
		}

		/** Format a unit price without trailing zero padding: `$0.44`, `$0.014`. */
		function formatPrice(value) {
			if (value >= 1) return `$${String(Number(value.toFixed(2)))}`;
			if (value >= 0.01) return `$${String(Number(value.toFixed(3)))}`;
			return `$${String(Number(value.toFixed(4)))}`;
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
});
