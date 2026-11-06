window.__ModuleLoader__.load({
	id: "@local/dsh-model-effort",
	factory: (require) => {
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
});
