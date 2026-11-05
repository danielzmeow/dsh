# dsh-view-menu

DeepSeek Harness 客户端插件：把会话顶部的 **Chat / Trajectory / …** 视图标签行折叠进右上角的 **⋯** 菜单。

原来占一整行、还带下划线的标签不再渲染；标题栏直接收紧到一行，右上角只留一个 `⋯`。点开后是完整的视图列表，当前视图带勾选标记，点一行即可切换。原来右上角 `⋯` 里的「下载 Session 日志」也合并进同一个菜单。

## 显示效果

折叠前：

```text
Chat   Trajectory   ⋯
───────────────────────
（对话正文）

                                        会话标题      [⋯]
```

折叠后：

```text
会话标题      [⋯]
───────────────────────────────────────────
（对话正文）

点开 ⋯：

┌──────────────────────────┐
│ Chat                   ✓ │
│ Trajectory               │
│ ──────────────────────── │
│ ↓ 下载 Session 日志       │
└──────────────────────────┘
```

- 一个 `⋯`，不是两个：插件接管原来右上角的「More actions / 更多操作」按钮。
- 视图按注册顺序排列，激活项高亮并打勾。
- 被功能开关隐藏的视图（例如关闭 Coding Tools 后的 Trajectory）不会出现，和原标签行一致。
- Chat 是唯一视图时，菜单只剩 Chat 与下载；标题栏同样不再有空标签行。
- 下载 Session 日志仍走 DSH 原有流程，导出中的弹窗、成功/失败提示保持不变。

## 实现方式

插件不修改任何 DSH 源码，只做三件事：

1. **把标签行移出布局**：`header div:has(> [data-conversation-tabs])` 改为 `position:absolute; height:0; visibility:hidden`。标签行仍然挂载，但不再占高度、不可见。
   - 之所以不 `display:none`：标签按钮是 DSH 官方切换视图的入口。保留它们的布局（把宽度固定为 8000px，避免窄窗口把次要视图折叠掉），点击时就能走原来的 `selectView`，激活状态、视图偏好持久化都保持原样。
2. **在 `conversation.session.header.utilities` 注册自己的 `⋯`**（`order: 1000`，排在工具区最右）。菜单用 `@deepseek-ai/dsh-client-ui-primitives` 的 `Menu`，行来自 `ctx.slots.entries("conversation.view")`，标签直接调用各视图注册的 `label` thunk，因此跟随当前语言。
   - 触发器与标题栏标准图标按钮保持一致：28×28、`border-radius: var(--dsw-radius-sm)`（8px）、15px 图标、`ghost` 的 hover / active 背景。
3. **合并下载动作**：会话日志导出的 `⋯` 按钮通过 CSS 隐藏（只在我们的下载动作可用时隐藏），但它的弹窗组件仍挂载。点击菜单里的「下载 Session 日志」调用同一个 `sessionLogDownload` 控制器，反馈弹窗照常出现。

## 安装

本目录是标准 profile bundle：

```text
dsh-view-menu/
├── package.json
├── cordis.patch.yml
├── lib/
│   ├── index.js      # Host 占位（无 Host 服务）
│   └── client.js     # 隐藏标签行 + 右上角菜单
├── locale/{zh,en}.json
├── icon.svg
├── test/
└── README.md
```

在 **Plugins → Add plugin → Install a third-party plugin** 中选择本目录即可；安装后点 **Enable now**，再刷新页面。

本地开发也可以把目录链接进 profile：

```sh
ln -s /Users/daniel/Developer/DSH/plugins/dsh-view-menu \
  ~/.dsh/profiles/desktop/node_modules/@local/dsh-view-menu
```

并在 profile 的 `package.json` 中把 `@local/dsh-view-menu` 加进 `dsh.profile.bundles`。重启或重载 DSH 后生效。

## 测试

```sh
node --test plugins/dsh-view-menu/test/*.test.mjs
```

测试覆盖标签解析、菜单行组成（可见视图 / 功能开关隐藏 / 下载分隔行 / 无注册兜底）、隐藏标签快照、点击隐藏标签切换，以及 Slot/CSS 注册。

## 已知限制

- **依赖 DSH 会话头结构**：需要 `[data-conversation-tabs]` 标签行、`conversation.view` 注册与 `conversation.session.header.utilities` Slot（DSH 0.2.x Web UI）。缺少 Menu 原语或这些 Slot 时插件保持惰性，不改动标题栏。
- **替换了「More actions」按钮**：靠 `_moreButton` 类名后缀识别会话日志导出按钮。若未来改名，会同时出现两个 `⋯`，不影响视图切换。
- **不列未固定（unpinned）视图**：菜单和标签行共用同一份可见视图集合；取消固定的视图没有可点击的标签按钮。当前 DSH 没有暴露固定开关，默认全部固定。
- **原「更多会话视图」菜单里的插件入口不再出现**：`浏览更多插件` / `创建你的插件` 仍可从左侧栏底部的 `More` 菜单进入。
- **所有会话统一生效**：包括右侧栏里的嵌入式会话视图；插件没有按会话开关。
