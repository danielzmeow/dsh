window.__ModuleLoader__.load({
	id: "@local/dsh-git-branch",
	factory: (require) => {
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
});
