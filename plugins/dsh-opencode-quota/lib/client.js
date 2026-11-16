window.__ModuleLoader__.load({
	id: "@local/dsh-opencode-quota",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		const React = require("react");
		const ReactDOM = require("react-dom");
		const h = React.createElement;

		/**
		 * Local fallbacks for the two primitives this bundle uses. DSH 0.2.2
		 * stopped exposing @deepseek-ai/dsh-client-ui-primitives to runtime
		 * client bundles, so a raw require throws and the quota row never
		 * registers. Keep the same call shape the panel already expects.
		 */
		function createQuotaPrimitives(React) {
			const layoutEffect = typeof React.useLayoutEffect === "function" ? React.useLayoutEffect : React.useEffect;
			function useAnchoredPosition(options) {
				const [position, setPosition] = React.useState(null);
				layoutEffect(() => {
					if (!options.open) {
						setPosition(null);
						return undefined;
					}
					if (typeof window === "undefined") return undefined;
					let disposed = false;
					let frame = 0;
					const measure = () => {
						frame = 0;
						if (disposed) return;
						const anchor = options.anchorRef?.current;
						const panel = options.panelRef?.current;
						if (anchor === null || anchor === undefined || panel === null || panel === undefined) return;
						const a = anchor.getBoundingClientRect();
						const p = panel.getBoundingClientRect();
						const vw = window.innerWidth || 0;
						const vh = window.innerHeight || 0;
						const margin = typeof options.margin === "number" ? options.margin : 12;
						const gap = typeof options.gap === "number" ? options.gap : 8;
						let left = a.left + a.width / 2 - p.width / 2;
						left = Math.max(margin, Math.min(left, vw - p.width - margin));
						let top = a.top - p.height - gap;
						if (top < margin && a.bottom + gap + p.height <= vh - margin) top = a.bottom + gap;
						top = Math.max(margin, Math.min(top, vh - p.height - margin));
						const next = { left: Math.round(left), top: Math.round(top) };
						setPosition((current) => current !== null && current.left === next.left && current.top === next.top ? current : next);
					};
					frame = typeof requestAnimationFrame === "function" ? requestAnimationFrame(measure) : 0;
					if (frame === 0) measure();
					let observer = null;
					if (typeof ResizeObserver === "function") {
						observer = new ResizeObserver(measure);
						const panel = options.panelRef?.current;
						if (panel !== null && panel !== undefined) observer.observe(panel);
					}
					window.addEventListener("resize", measure);
					window.addEventListener("scroll", measure, true);
					return () => {
						disposed = true;
						if (frame !== 0 && typeof cancelAnimationFrame === "function") cancelAnimationFrame(frame);
						if (observer !== null) observer.disconnect();
						window.removeEventListener("resize", measure);
						window.removeEventListener("scroll", measure, true);
					};
				}, [options.open, options.anchorRef, options.panelRef, options.side, options.gap, options.margin]);
				return position;
			}
			function useDismissOnOutsidePointer(root, open, setOpen, portal) {
				React.useEffect(() => {
					if (!open) return undefined;
					const onPointerDown = (event) => {
						if (!(event.target instanceof Node)) return;
						const insideRoot = root?.current?.contains(event.target) === true;
						const insidePortal = portal?.current?.contains(event.target) === true;
						if (!insideRoot && !insidePortal) setOpen(false);
					};
					document.addEventListener("pointerdown", onPointerDown);
					return () => document.removeEventListener("pointerdown", onPointerDown);
				}, [root, open, setOpen, portal]);
			}
			return { useAnchoredPosition, useDismissOnOutsidePointer };
		}

		const primitives = createQuotaPrimitives(React);

		//#region styles
		const css = [
			".ocq_stat{flex:1 1 auto;width:calc(100% + 4px);min-width:0;margin:6px -2px 0;display:flex}",
			".ocq_row{box-sizing:border-box;border-radius:var(--dsw-radius-md);color:var(--dsw-alias-label-primary);cursor:pointer;background:0 0;border:none;align-items:center;justify-content:flex-start;gap:10px;width:100%;min-width:0;height:42px;padding:0 10px 0 8px;display:flex;font:inherit;text-align:left}",
			".ocq_row:hover,.ocq_row[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover)}",
			".ocq_reading{flex:1 1 auto;min-width:0;gap:5px;display:flex;flex-direction:column}",
			".ocq_heading{align-items:baseline;justify-content:space-between;gap:10px;min-width:0;display:flex}",
			".ocq_label{flex:1 1 auto;min-width:0;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;color:var(--dsw-alias-label-primary)}",
			".ocq_meter{width:100%;height:4px;border-radius:999px;background:var(--dsw-alias-border-l3);display:flex;overflow:hidden}",
			".ocq_meterFill{background:var(--dsw-alias-state-business-primary);height:100%;border-radius:999px;flex:none;transition:width .3s ease}",
			".ocq_row[data-level=warn] .ocq_meterFill{background:var(--dsw-alias-state-warn-primary)}",
			".ocq_row[data-level=critical] .ocq_meterFill,.ocq_row[data-level=exhausted] .ocq_meterFill{background:var(--dsw-alias-state-error-primary)}",
			".ocq_value{font-size:12px;line-height:16px;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary);text-align:right}",
			"div[data-sidebar-collapsed=true] .ocq_stat{flex:none;width:36px;margin:0;justify-content:center}",
			"div[data-sidebar-collapsed=true] .ocq_label,div[data-sidebar-collapsed=true] .ocq_meter{display:none}",
			"div[data-sidebar-collapsed=true] .ocq_row{width:36px;height:36px;padding:0;gap:0;justify-content:center}",
			"div[data-sidebar-collapsed=true] .ocq_reading{align-items:center}",
			"div[data-sidebar-collapsed=true] .ocq_value{font-size:13px;line-height:18px}",
			"div[data-sidebar-collapsed=true] .ocq_value{min-width:0;text-align:center}",
			".ocq_row:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}",
			".ocq_panel{z-index:1100;box-sizing:border-box;border-radius:var(--dsw-radius-lg);background:var(--dsw-specific-menu);width:max-content;min-width:min(324px,100vw - 24px);max-width:min(420px,100vw - 24px);backdrop-filter:var(--dsw-menu-backdrop-filter);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-secondary);cursor:default;border:0;padding:16px;font-size:12px;line-height:18px;position:fixed}",
			".ocq_title{color:var(--dsw-alias-label-primary);justify-content:space-between;gap:16px;margin-bottom:8px;font-weight:500;display:flex}",
			".ocq_titleLabel{align-items:center;gap:6px;min-width:0;display:inline-flex}",
			".ocq_titleLabel svg{flex:none;height:14px;width:auto}",
			".ocq_titleValue{font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary);white-space:nowrap}",
			".ocq_binding{color:var(--dsw-alias-label-tertiary);justify-content:space-between;gap:16px;margin:-4px 0 12px;display:flex}",
			".ocq_bindingValue{color:var(--dsw-alias-label-secondary);font-weight:500}",
			".ocq_titleRule{border-top:.5px solid var(--dsw-alias-border-l2);margin-bottom:12px}",
			".ocq_windows{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}",
			".ocq_windowName{color:var(--dsw-alias-label-primary);font-weight:500}",
			".ocq_windowHead{align-items:baseline;justify-content:space-between;gap:16px;display:flex}",
			".ocq_windowValue{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;white-space:nowrap}",
			".ocq_bar{background:var(--dsw-alias-interactive-bg-hover);height:3px;margin:7px 0 6px;display:flex;overflow:hidden}",
			".ocq_fill{background:var(--dsw-alias-state-business-primary);height:100%;flex:none;transition:width .3s ease}",
			".ocq_window[data-empty=true] .ocq_windowValue{color:var(--dsw-alias-state-error-primary);font-weight:500}",
			".ocq_window[data-level=warn] .ocq_fill{background:var(--dsw-alias-state-warn-primary)}",
			".ocq_window[data-level=critical] .ocq_fill{background:var(--dsw-alias-state-error-primary)}",
			".ocq_windowMeta{color:var(--dsw-alias-label-tertiary);justify-content:space-between;gap:16px;font-variant-numeric:tabular-nums;display:flex}",
			".ocq_footer{border-top:.5px solid var(--dsw-alias-border-l2);align-items:center;justify-content:space-between;gap:16px;margin-top:12px;padding-top:8px;color:var(--dsw-alias-label-tertiary);display:flex}",
			".ocq_footerNote{min-width:0;text-overflow:ellipsis;overflow:hidden}",
			".ocq_stale{color:var(--dsw-alias-state-warn-primary)}",
			".ocq_refresh{color:var(--dsw-alias-label-tertiary);border-radius:var(--dsw-radius-sm);cursor:pointer;background:0 0;border:none;font:inherit;padding:2px 6px;flex:none}",
			".ocq_refresh:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}",
			".ocq_refresh:disabled{cursor:default;opacity:.55}",
			".ocq_note{color:var(--dsw-alias-state-error-primary);margin:12px 0 0;padding-left:10px;border-left:2px solid var(--dsw-alias-state-error-primary)}",
			".ocq_sr{clip:rect(0 0 0 0);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}"
		].join("");
		const cssTagId = "@local/dsh-opencode-quota/opencode-quota.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(cssTagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@local/dsh-opencode-quota";
			tag.dataset.pluginCss = cssTagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion

		//#region dictionaries
		const zh = {
			"quota.aria": "OpenCode Go {window}剩余 {percent}%",
			"quota.dialog": "OpenCode 额度",
			"quota.title": "OpenCode Go",
			"quota.remaining": "剩余 {percent}%",
			"quota.used": "已用 {percent}%",
			"quota.binding": "最紧张的窗口",
			"quota.headlineValue": "剩余 {percent}% · 已用 {used}%",
			"quota.emptyValue": "已用完",
			"quota.emptyNote": "额度已用完，新的请求会被拒绝；{time} 后重置。",
			"quota.level.warn": "接近用完",
			"quota.level.critical": "即将用完",
			"quota.level.exhausted": "已用完",
			"quota.suffix.warn": "，接近用完",
			"quota.suffix.critical": "，即将用完",
			"quota.suffix.exhausted": "，已用完",
			"quota.suffix.stale": "，数据可能已过期",
			"quota.announce": "{window}剩余 {percent}%，{level}",
			"quota.reset": "{time} 重置",
			"quota.inDays": "{days} 天后",
			"quota.inDaysHours": "{days} 天 {hours} 小时后",
			"quota.inHours": "{hours} 小时后",
			"quota.inHoursMinutes": "{hours} 小时 {minutes} 分后",
			"quota.inMinutes": "{minutes} 分钟后",
			"quota.window.session": "5 小时",
			"quota.window.weekly": "本周",
			"quota.window.monthly": "本月",
			"quota.updated": "更新于 {time}",
			"quota.stale": "刷新失败，显示上次数据",
			"quota.refresh": "刷新",
			"quota.refreshing": "刷新中…"
		};
		const en = {
			"quota.aria": "OpenCode Go {window}: {percent}% left",
			"quota.dialog": "OpenCode quota",
			"quota.title": "OpenCode Go",
			"quota.remaining": "{percent}% left",
			"quota.used": "{percent}% used",
			"quota.binding": "Tightest window",
			"quota.headlineValue": "{percent}% left · {used}% used",
			"quota.emptyValue": "Used up",
			"quota.emptyNote": "Quota exhausted; new requests are rejected. Resets {time}.",
			"quota.level.warn": "running low",
			"quota.level.critical": "almost out",
			"quota.level.exhausted": "exhausted",
			"quota.suffix.warn": ", running low",
			"quota.suffix.critical": ", almost out",
			"quota.suffix.exhausted": ", exhausted",
			"quota.suffix.stale": ", reading may be stale",
			"quota.announce": "{window}: {percent}% left, {level}",
			"quota.reset": "resets {time}",
			"quota.inDays": "in {days} d",
			"quota.inDaysHours": "in {days} d {hours} h",
			"quota.inHours": "in {hours} h",
			"quota.inHoursMinutes": "in {hours} h {minutes} m",
			"quota.inMinutes": "in {minutes} min",
			"quota.window.session": "5-hour",
			"quota.window.weekly": "This week",
			"quota.window.monthly": "This month",
			"quota.updated": "Updated {time}",
			"quota.stale": "Refresh failed; showing the last reading",
			"quota.refresh": "Refresh",
			"quota.refreshing": "Refreshing…"
		};
		//#endregion

		//#region helpers
		const ENDPOINT = "/api/opencode-quota";
		const REFRESH_MS = 60000;
		/** Re-open within this window reuses the cached reading; older opens refresh. */
		const FRESH_MS = 15000;
		/** Tie-break preference for the headline reading: monthly, weekly, then the 5-hour window. */
		const HEADLINE_ORDER = ["monthly", "weekly", "session"];
		const PANEL_GAP = 8;
		const PANEL_MARGIN = 12;
		const MEASURE_STYLE = { visibility: "hidden", left: 0, top: 0 };

		/** @param {number} value */
		function round1(value) {
			return Math.round(value * 10) / 10;
		}

		/**
		 * Percent text for humans: whole numbers by default, one decimal below 10,
		 * and "<1" for a sliver that would otherwise read as a misleading 0.
		 * @param {number} value
		 */
		function formatPercent(value) {
			const clamped = Math.max(0, Math.min(100, round1(value)));
			if (clamped >= 100) return "100";
			if (clamped <= 0) return "0";
			if (clamped < 1) return "<1";
			if (clamped < 10) return clamped.toFixed(1);
			return String(Math.round(clamped));
		}

		/** Spoken suffix so severity is never carried by colour alone. */
		function levelSuffix(level, tr) {
			return level === "ok" ? "" : tr(`quota.suffix.${level}`);
		}

		/** @param {string | undefined} kind */
		function windowLabel(kind, tr) {
			return tr(`quota.window.${kind ?? "monthly"}`);
		}

		/**
		 * Escalation ladder shared by the ring and the panel rows: amber while
		 * there is still room to act (20%), red only once the limit is nearly
		 * or fully reached.
		 * @param {number} remaining
		 */
		function levelFor(remaining) {
			if (remaining <= 0) return "exhausted";
			if (remaining <= 5) return "critical";
			if (remaining <= 20) return "warn";
			return "ok";
		}

		/** @param {string | undefined} iso @returns {number | null} */
		function epochOf(iso) {
			if (typeof iso !== "string") return null;
			const value = Date.parse(iso);
			return Number.isNaN(value) ? null : value;
		}

		/** @param {string | undefined} iso */
		function formatResetClock(iso) {
			const epoch = epochOf(iso);
			if (epoch === null) return null;
			const date = new Date(epoch);
			const now = new Date();
			const locale = document.documentElement.lang || navigator.language || undefined;
			const time = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
			if (date.toDateString() === now.toDateString()) return time;
			const day = new Intl.DateTimeFormat(locale, { month: "numeric", day: "numeric" }).format(date);
			return `${day} ${time}`;
		}

		/** @param {string | undefined} iso */
		function formatCountdown(iso, tr) {
			const epoch = epochOf(iso);
			if (epoch === null) return null;
			const minutes = Math.max(0, Math.round((epoch - Date.now()) / 60000));
			if (minutes < 60) return tr("quota.inMinutes", { minutes });
			const hours = Math.floor(minutes / 60);
			if (hours < 24) {
				const rest = minutes % 60;
				return rest === 0
					? tr("quota.inHours", { hours })
					: tr("quota.inHoursMinutes", { hours, minutes: rest });
			}
			const days = Math.floor(hours / 24);
			const restHours = hours % 24;
			return restHours === 0
				? tr("quota.inDays", { days })
				: tr("quota.inDaysHours", { days, hours: restHours });
		}

		/**
		 * The reading that actually limits use: the window with the least
		 * remaining quota. Ties fall back to the stable preference order so an
		 * untouched account keeps reporting the monthly window.
		 * @param {any} windows
		 */
		function headlineWindow(windows) {
			const preference = (kind) => {
				const index = HEADLINE_ORDER.indexOf(kind);
				return index === -1 ? HEADLINE_ORDER.length : index;
			};
			return [...windows].sort((a, b) =>
				(a.remainingPercent - b.remainingPercent) || (preference(a.kind) - preference(b.kind))
			)[0];
		}

		function formatClock(date) {
			const locale = document.documentElement.lang || navigator.language || undefined;
			return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
		}
		//#endregion

		//#region icons
		/**
		 * The OpenCode logo, taken verbatim from the official brand asset
		 * (opencode-logo-light.svg, viewBox 0 0 240 300) and inlined so it can take
		 * the surrounding text colour. The frame is solid; the inner block is a wash
		 * of it, matching the two-tone file.
		 */
		function OpenCodeMark() {
			return h("svg", {
				viewBox: "0 0 240 300",
				width: 11.2,
				height: 14,
				fill: "none",
				"aria-hidden": true,
				focusable: "false"
			},
				h("path", { d: "M180 240H60V120H180V240Z", fill: "currentColor", opacity: 0.2 }),
				h("path", { d: "M180 60H60V240H180V60ZM240 300H0V0H240V300Z", fill: "currentColor" })
			);
		}

		/**
		 * The compact reading: a thin remaining-quota line followed by its
		 * percentage. A stale reading is prefixed with "~", so freshness is
		 * carried by text rather than colour.
		 * @param {{ remaining: number, stale?: boolean }} props
		 */
		function QuotaReading({ remaining, stale, label }) {
			const width = Math.max(0, Math.min(100, remaining));
			return h("span", { className: "ocq_reading", "aria-hidden": true },
				h("span", { className: "ocq_heading" },
					h("span", { className: "ocq_label" }, label),
					h("span", { className: "ocq_value" }, `${stale ? "~" : ""}${formatPercent(width)}%`)
				),
				h("span", { className: "ocq_meter" },
					h("span", { className: "ocq_meterFill", style: { width: `${width}%` } })
				)
			);
		}
		//#endregion

		//#region data
		/**
		 * Poll the host endpoint. The reading stays mounted across refreshes so
		 * the pill never blinks; a failed refresh only marks it stale.
		 */
		function useQuota() {
			const [state, setState] = React.useState({ payload: null, fetchedAt: 0, stale: false });
			const [busy, setBusy] = React.useState(false);
			const alive = React.useRef(true);

			const load = React.useCallback(async (force) => {
				if (typeof fetch !== "function") return;
				if (force) setBusy(true);
				try {
					const response = await fetch(force ? `${ENDPOINT}?refresh=1` : ENDPOINT, {
						headers: { accept: "application/json" },
						cache: "no-store"
					});
					if (!response.ok) throw new Error(`HTTP ${response.status}`);
					const payload = await response.json();
					if (!alive.current) return;
					if (payload?.ok === true && Array.isArray(payload.windows) && payload.windows.length > 0) {
						setState({ payload, fetchedAt: Date.now(), stale: false });
					} else if (payload?.status === "not-configured") {
						setState({ payload: null, fetchedAt: 0, stale: false });
					} else {
						setState((previous) => ({
							payload: previous.payload,
							fetchedAt: previous.fetchedAt,
							stale: previous.payload !== null
						}));
					}
				} catch {
					if (!alive.current) return;
					setState((previous) => ({
						payload: previous.payload,
						fetchedAt: previous.fetchedAt,
						stale: previous.payload !== null
					}));
				} finally {
					if (alive.current && force) setBusy(false);
				}
			}, []);

			React.useEffect(() => {
				alive.current = true;
				load(false);
				const timer = setInterval(() => {
					if (!document.hidden) load(false);
				}, REFRESH_MS);
				const onVisible = () => {
					if (!document.hidden) load(false);
				};
				document.addEventListener("visibilitychange", onVisible);
				window.addEventListener("focus", onVisible);
				return () => {
					alive.current = false;
					clearInterval(timer);
					document.removeEventListener("visibilitychange", onVisible);
					window.removeEventListener("focus", onVisible);
				};
			}, [load]);

			return { ...state, busy, refresh: () => load(true) };
		}
		//#endregion

		//#region components
		/** Trigger-anchored dialog seat: clamped placement, outside close, Escape close. */
		function useQuotaDialog() {
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
				document.addEventListener("keydown", onKeyDown);
				return () => document.removeEventListener("keydown", onKeyDown);
			}, [open]);
			return { open, setOpen, rootRef, panelRef, pos };
		}

		/**
		 * The dock reading: the tightest window's remaining quota as a ring,
		 * clickable for a per-window breakdown. The panel states the same
		 * quantity everywhere (remaining first, used second), names the window
		 * that actually binds, and escalates in words as well as colour before
		 * the limit is reached.
		 * @param {{ t?: (key: string, values?: Record<string, unknown>) => string }} props
		 */
		function QuotaStat({ t }) {
			const tr = React.useMemo(() => (typeof t === "function" ? t : (key) => key), [t]);
			const { payload, fetchedAt, stale, busy, refresh } = useQuota();
			const { open, setOpen, rootRef, panelRef, pos } = useQuotaDialog();
			const windows = payload?.windows ?? [];
			const headline = windows.length > 0 ? headlineWindow(windows) : null;
			const headlineKind = headline === null ? null : headline.kind;
			const remaining = headline === null ? 0 : Math.max(0, Math.min(100, headline.remainingPercent));
			const level = levelFor(remaining);
			const [announcement, setAnnouncement] = React.useState("");
			const previousLevel = React.useRef(null);

			// Announce a downgrade once, politely: the ring alone cannot say
			// "running low" to a screen-reader user.
			React.useEffect(() => {
				if (headlineKind === null) {
					previousLevel.current = null;
					return;
				}
				if (previousLevel.current !== null && previousLevel.current !== level && level !== "ok") {
					setAnnouncement(tr("quota.announce", {
						window: windowLabel(headlineKind, tr),
						percent: formatPercent(remaining),
						level: tr(`quota.level.${level}`)
					}));
				}
				previousLevel.current = level;
			}, [headlineKind, level, remaining, tr]);

			if (headline === null) return null;

			const aria = tr("quota.aria", { window: windowLabel(headline.kind, tr), percent: formatPercent(remaining) })
				+ levelSuffix(level, tr)
				+ (stale ? tr("quota.suffix.stale") : "");

			const toggle = () => {
				const next = !open;
				setOpen(next);
				if (next && Date.now() - fetchedAt > FRESH_MS) refresh();
			};

			const rows = windows.map((window) => {
				const rowRemaining = Math.max(0, Math.min(100, window.remainingPercent));
				const rowLevel = levelFor(rowRemaining);
				const exhausted = rowRemaining <= 0;
				const clock = formatResetClock(window.resetsAt);
				const countdown = formatCountdown(window.resetsAt, tr);
				const label = windowLabel(window.kind, tr);
				const value = exhausted
					? tr("quota.emptyValue")
					: tr("quota.remaining", { percent: formatPercent(rowRemaining) });
				const resetText = [clock === null ? null : tr("quota.reset", { time: clock }), countdown]
					.filter((part) => part !== null && part !== "")
					.join(" · ");
				return h("li", { key: window.kind, className: "ocq_window", "data-level": rowLevel, "data-empty": exhausted ? "true" : undefined },
					h("div", { className: "ocq_windowHead" },
						h("span", { className: "ocq_windowName" }, label),
						h("span", { className: "ocq_windowValue" }, value)
					),
					h("div", {
						className: "ocq_bar",
						role: "meter",
						"aria-label": label,
						"aria-valuemin": 0,
						"aria-valuemax": 100,
						"aria-valuenow": Math.round(rowRemaining),
						"aria-valuetext": value
					},
						h("span", { className: "ocq_fill", style: { width: `${rowRemaining}%` } })
					),
					h("div", { className: "ocq_windowMeta" },
						h("span", null, exhausted ? tr("quota.emptyValue") : tr("quota.used", { percent: formatPercent(window.usedPercent) })),
						resetText === "" ? null : h("span", null, resetText)
					)
				);
			});

			const headlineReset = formatResetClock(headline.resetsAt);
			const exhausted = level === "exhausted";

			const panelBody = h("div", {
				ref: panelRef,
				className: "ocq_panel",
				style: pos ?? MEASURE_STYLE,
				role: "dialog",
				"aria-label": tr("quota.dialog")
			},
				h("div", { className: "ocq_title" },
					h("span", { className: "ocq_titleLabel" },
						h(OpenCodeMark),
						h("span", null, tr("quota.title"))
					),
					h("span", { className: "ocq_titleValue" }, tr("quota.headlineValue", {
						percent: formatPercent(remaining),
						used: formatPercent(headline.usedPercent)
					}))
				),
				h("div", { className: "ocq_titleRule", "aria-hidden": true }),
				windows.length > 1
					? h("div", { className: "ocq_binding" },
						h("span", null, tr("quota.binding")),
						h("span", { className: "ocq_bindingValue" }, windowLabel(headline.kind, tr))
					)
					: null,
				h("ul", { className: "ocq_windows" }, rows),
				exhausted && headlineReset !== null
					? h("p", { className: "ocq_note" }, tr("quota.emptyNote", { time: headlineReset }))
					: null,
				h("div", { className: "ocq_footer" },
					h("span", { className: stale ? "ocq_footerNote ocq_stale" : "ocq_footerNote" },
						stale
							? tr("quota.stale")
							: fetchedAt > 0
								? tr("quota.updated", { time: formatClock(new Date(fetchedAt)) })
								: tr("quota.dialog")
					),
					h("button", {
						type: "button",
						className: "ocq_refresh",
						disabled: busy,
						onClick: (event) => {
							event.preventDefault();
							event.stopPropagation();
							refresh();
						}
					}, busy ? tr("quota.refreshing") : tr("quota.refresh"))
				)
			);
			const panel = open && ReactDOM.createPortal(panelBody, document.body);

			return h(React.Fragment, null,
				h("span", {
					className: "ocq_stat",
					"data-quota-sidebar": true,
					ref: rootRef
				},
				h("button", {
					type: "button",
					className: "ocq_row",
					"data-level": level,
					"data-stale": stale ? "true" : "false",
					"aria-haspopup": "dialog",
					"aria-expanded": open,
					"aria-label": aria,
					title: aria,
					onClick: toggle
				},
				h(QuotaReading, { remaining, stale, label: tr("quota.title") })
				),
				h("span", { className: "ocq_sr", role: "status", "aria-live": "polite" }, announcement)
				),
				panel
			);
		}
		//#endregion

		//#region plugin body
		const NS = "opencode-quota";
		const inject = ["slots", "locale"];

		/**
		 * Register the quota reading as a sidebar footer action above Settings.
		 * The badge follows the sidebar's wide/rail state: a full row while wide,
		 * a 36px icon button when collapsed.
		 * @param {any} ctx
		 */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "opencode-quota: dictionaries");
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "opencode-quota",
				order: 1,
				locale: NS
			}, QuotaStat));
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		exports.QuotaStat = QuotaStat;
		exports.__internals = {
			formatCountdown,
			formatPercent,
			formatResetClock,
			headlineWindow,
			levelFor,
			levelSuffix
		};
		return module.exports;
	}
});