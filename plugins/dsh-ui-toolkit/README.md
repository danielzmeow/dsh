# dsh-ui-toolkit

DeepSeek Harness 的合并界面插件。原来六个独立的 UI 插件加上新会话标题清理、侧边栏动画、自动加载更早和侧边栏入口管理，现在是同一个 bundle 里的十二个功能，在 **Settings → 界面 / Interface** 里逐项开关。

合并进来的功能：

| id | 功能 | 原来的插件 |
| --- | --- | --- |
| `sidebar` | 侧边栏统一：New Session 扁平行、去掉 HARNESS 徽章 | `dsh-sidebar-unify` |
| `sidebarEntries` | 侧边栏入口管理：调整全局面板的顺序和显隐，并始终隐藏 More | 新增 |
| `hero` | 去掉新会话标题旁边的 Preview / 预览版徽章 | 新增 |
| `motion` | 左右侧边栏开关时的弹性滑入、淡入、缩放和右侧面板边缘阴影 | 新增 |
| `composerHud` | 输入框状态环：上下文占用 + 用量明细面板 | `dsh-composer-hud` |
| `gitBranch` | 输入框左侧的 Git 分支，可搜索切换 | `dsh-git-branch` |
| `modelEffort` | 模型选择 + 可拖动 reasoning effort 滑块 | `dsh-model-effort` |
| `viewMenu` | Chat / Trajectory 标签折叠进右上角 ⋯ 菜单 | `dsh-view-menu` |
| `modelContext` | 输入框状态栏的估算对话成本 | `dsh-model-context` |
| `autoLoad` | 滚动到对话顶部时自动加载更早历史 | 新增 |
| `terminal` | 输入框右下角的浮动 Terminal 按钮，点开后从底边展开，关闭即结束进程 | 新增 |
| `autoHideScrollbars` | 悬停/聚焦/滚动时才显示原生滚动条 | 新增 |

**没有合并**：`dsh-opencode-quota`（OpenCode Go 额度）保持独立；外部插件 `dsh-delete-session` 也不动。

## 开关在哪

打开 **Settings → 界面 / Interface**，里面是一列开关：

![Settings](docs/settings.png)

```text
Interface
Choose which interface enhancements to enable.

侧边栏                                      [开]
  统一 New Session 行、去掉 HARNESS 徽章
侧边栏入口                                  [开]
  管理全局面板的显示和顺序，「更多」始终隐藏
  全局面板                                  恢复默认
    用箭头调整顺序，或关闭某一项…
    ↑↓  Plugins          plugins            [开]
    ↑↓  Plugin Market    dsh-market         [开]
    ↑↓  Automation tasks schedules           [开]
    「更多」已隐藏…
新会话标题                                  [开]
  去掉「探索未至之境 / Into the Unknown」旁边的 Preview 徽章
侧边栏动画                                  [开]
  左右侧边栏开关时的弹性滑入、淡入和缩放过渡
输入框状态环                                [开]
  在输入框工具栏显示上下文圆环…
Git 分支                                    [开]
  在输入框左侧显示当前分支…
自动加载更早                                [开]
  滚动到对话顶部时自动加载更早历史…
...
```

- 开关立即生效，不需要刷新页面。
- 功能开关保存在当前浏览器：`localStorage` 的 `dsh-ui-toolkit.features.v1`，同时写一份 host-scoped cookie `dsh_ui_toolkit_features`。DSH Desktop 每次启动的 loopback 端口可能不同，cookie 不区分端口，所以重启后选择不会丢。
- 默认全部开启；侧边栏入口默认显示全部面板并隐藏 More。
- 关掉一个功能只卸载它自己的 slot、locale、样式和监听；其他功能继续运行。

### 侧边栏入口管理

`sidebarEntries` 接管 `sidebar.panellist` 里渲染出来的全局面板行，但**不修改任何插件的 slot 注册**，只调整最终呈现：

- 设置页按当前实时注册表列出面板，显示解析后的标签和注册 id。
- 箭头按钮逐个移动位置；位置保存在配置里，新注册的面板默认排到末尾。
- 每一项都有开关；关掉只是把对应行 `display:none`，主面板和当前选择保持不变，重新打开即可恢复。
- 全部关掉时整个面板列表收起，和原生「没有任何面板」时的布局一致。
- **More 始终隐藏**：不再判断是否存在插件面板。需要恢复 More 时，关掉「侧边栏入口」这个开关即可；`sidebar` 功能不再负责 More。
- 面板增删、语言切换或侧边栏重新挂载后，功能会重新扫描 DOM 并同步标记。
- 行与注册项的对应关系优先用 `aria-label`（即面板标签）匹配；遇到重名标签时，只在行数一致的情况下按位置兜底，避免把顺序套到错误的面板上。
- 配置保存在 `localStorage` 的 `dsh-ui-toolkit.sidebar-entries.v1`，并写一份 host-scoped cookie `dsh_ui_toolkit_sidebar_entries`，换端口重启后仍保留。

### 自动加载更早

对话滚动容器上挂一个 capture 阶段的 `scroll` 监听。

- 预加载带取 `max(360px, min(900px, 视口高度 × 1.1))`：用户在离顶部大约一个视口时就开始预加载，而不是撞到顶部才转圈。
- **等滚动停下来 120ms 再点**：滚动过程中不插入内容，避免中途重排和锚点抖动。
- **每次只加载一页**：加载后等原生按钮重新可用、并且列表高度确实增长，才允许下一次接近。绝不会在同一轮滚动里连续 prepend 两页。
- 点击前自己记录当前视口里第一个带 `data-chat-anchor-key` 的稳定行及其视口偏移；加载后重新量这一行，按差值修正 `scrollTop`。即使 `loadOlderAnchored` 在快速滚动时选到了没有稳定 key 的分隔行，这一行也会被放回原位。
- 加载期间用户继续向上滚，会持续把锚点更新到最新可见行；向下位移视为原生锚点回填，不覆盖。
- 只有这一行已经不存在、并且原生位置完全没动时，才退回“按新增高度补一次”的兜底，避免二次修正造成反向跳动。
- 用户继续向上滚，会重新进入预加载带并加载下一页；这就是伪无限滚动。
- 点击后按**动画帧**检查原生按钮和列表高度（约 3 秒上限），锚点修正在浏览器绘制前完成。按钮消失（没有更多历史）、页面没有变高或超时后停止，避免空转。
- 启用本功能时，原生「加载更早」按钮会 `display:none` 隐藏（按钮仍在 DOM 里作为触发点），这样加载时按钮文字和高度变化不会造成闪烁；关掉功能后按钮恢复。

### 底部终端

- **位置**：关闭时是一个浮在对话列右下角的小按钮（icon + Terminal）：**底边和右边使用同一个 inset**（取输入框卡片底边到对话列底边的距离），所以右下 padding 对称。它 `position:absolute`，不占对话列布局，所以输入框可以贴到最底边。右侧 gutter 需要同时容纳按钮宽度和这个 inset，否则自动放到右上角「右边栏」按钮的左侧，样式跟随 header 的 ghost 按钮。
- **打开**：点击按钮后，面板从底边展开，docked 在对话列下方（默认 280px，可拖动上边缘，双击复位）；展开时输入框会随面板高度上移，关闭后回到最底边。打开即创建 shell，不再显示启动卡片。
- **关闭**：header 最右侧的 X 永远可点；点击立即结束进程并收起面板。没有持久化：不写打开状态、启动标记或高度到 localStorage；刷新页面、切换会话、离开再回来都不会恢复旧终端，每次打开都是新 shell。
- **动画**：按钮淡入/缩放和位置过渡；面板高度 + 透明度 260ms ease-out；`prefers-reduced-motion` 下关闭动画。按钮在面板收起动画结束后才重新出现，避免位置跳动。
- **风格**：按钮使用 `--dsw-alias-bg-layer-1` / `border-l2` / `label-secondary`，贴输入框时是紧凑圆角按钮；放进 header 时变成透明 ghost 按钮，和旁边按钮同高。
- **隐藏**：切到 Plugins/Settings 等主面板或打开 `[role="dialog"][aria-modal="true"]` 时，面板和按钮一起隐藏；返回后如果之前是打开状态，会重新接上同一个进程（只在当前页面生命周期内，不跨刷新）。
- **xterm 懒加载**：xterm.js 6.0.0 + FitAddon 0.11.0 打包在 `lib/client.terminal.js`，第一次启动终端时才 `require.async`；基础 `client.js` 不背这 344KB。
- **只 patch 一个内置方法**：内置 controller 的窗口保活只认右侧栏 tab 列表，`retainTabs` 又是覆盖式的。本功能在运行时给它包一层并集（合并右侧栏终端 tab 和底部终端 tab），否则底部终端会被侧栏的任意 tab 变化回收。这是唯一的内置触点，DSH 升级时需要回归；关闭功能时会还原原方法。


### 自动隐藏滚动条

- 在 `<html>` 上挂 `data-uit-autohide-scrollbars`，用 CSS 隐藏 `::-webkit-scrollbar-thumb` / `::-webkit-scrollbar-track`，只在刚滚动过的 900ms 内显示；悬停或焦点在输入框里不会把滚动条钉住。
- 在 document 的捕获阶段监听 `scroll`，给正在滚动的元素加 `data-uit-scrolling`，900ms 后移除。只改滚动条颜色，不改容器宽高，所以不会有布局跳动。
- 对 conversation、左右 sidebar、dock panes 等原生 WebKit 滚动条都生效；颜色沿用 `--dsh-scrollbar-thumb` / `--dsh-scrollbar-thumb-hover`，不引入自定义色。键盘滚动同样由 `scroll` 事件触发显示。
- xterm 终端自己的滚动条是自绘的，不受这个规则影响。
- 只能在 Chromium/Electron 的 `::-webkit-scrollbar` 上工作；系统级 overlay scrollbar 不受 CSS 控制。


## 结构

```text
dsh-ui-toolkit/
├── package.json
├── cordis.patch.yml
├── lib/
│   ├── index.js          # Host：Git 两条 Fetch 路由（始终挂载）
│   ├── git.js            # Git 读取/切换实现
│   ├── client.js         # 生成物：十二个 feature factory + 开关 UI
│   └── client.terminal.js # 生成物：懒加载的 xterm 6 + FitAddon chunk
├── src/
│   ├── client.template.js
│   └── features/*.client.js   # 十二个 feature 的 client 源码
├── scripts/build-client.mjs   # 把 features 拼进 lib/client.js，并生成 xterm chunk
├── vendor/xterm.bundle.js     # xterm + fit 的 esbuild 产物（源）
├── locale/{zh,en}.json
├── icon.svg
├── test/
└── README.md
```

### 为什么需要 build script

DSH 的客户端 bundle 是一次 `window.__ModuleLoader__.load({ factory })` 调用，不能相对 import 其他文件。`scripts/build-client.mjs` 把每个原插件 factory 的函数体抽出来，变成 `createComposerHud(require)` 这样的命名函数，再拼进模板。

修改 `src/features/` 或 `src/client.template.js` 后重新生成：

```sh
node plugins/dsh-ui-toolkit/scripts/build-client.mjs
```

这条命令会同时写 `lib/client.js` 和 `lib/client.terminal.js`。xterm 的 vendor 产物来自：

```sh
npm install --no-save @xterm/xterm@6.0.0 @xterm/addon-fit@0.11.0 esbuild@0.25.10
npx esbuild entry.js --bundle --minify --format=iife \
  --loader:.css=text --outfile=vendor/xterm.bundle.js
```

`entry.js` 只做 `import { Terminal } from "@xterm/xterm"`、`FitAddon` 和 xterm.css 的 text 导入，最后挂到 `globalThis.__DSH_UI_TOOLKIT_XTERM__`。细节见 `vendor/README.md`。

### 运行时怎么隔离各个功能

每个功能启动时都拿到一个 **scoped context**：

- `ctx.effect` 的 disposer 被记录；
- `ctx.slots.inject / register / subscribe` 的 disposer 被记录；
- `ctx.locale.register` 的 disposer 被记录；
- 未在合并插件 `inject` 里声明的服务（例如 `modelDirectories`）通过 `ctx.get(name)` 读取，避免为了一个功能把整个插件卡在依赖上。

关闭某个功能时倒序执行这些 disposer，于是它的 slot 注册、样式标签、locale 词条、resize/pointer 监听都会消失；再打开会重新创建一遍。侧边栏入口管理器关闭时还会移除所有 `data-uit-sidebar-*` 标记和行内顺序变量，把 More 和原生顺序立即还给应用。

Host 的 Git 路由是始终挂载的：Git 功能关掉时只是没有客户端入口，路由不会被访问，也就不影响插件热切换。

## 安装

本目录是标准 profile bundle。已经链接进 desktop profile 时，刷新页面（或重启 DSH）后生效。

手动安装：

```sh
ln -s /Users/daniel/Developer/DSH/plugins/dsh-ui-toolkit \
  ~/.dsh/profiles/desktop/node_modules/@local/dsh-ui-toolkit
```

并在 profile 的 `package.json` 里把 `@local/dsh-ui-toolkit` 加进 `dsh.profile.bundles` 和 `dependencies`。

## 测试

```sh
node --test plugins/dsh-ui-toolkit/test/*.test.mjs
```

覆盖：

- 十二个 feature creator 都能产出带 `apply` / `inject` 的模块；
- 开关存储、损坏 JSON、未知 id 的兜底；
- 每个开关只触发一次通知；
- 功能 runner 的启动 / 停止 / 重启；
- **DSH 动态 facade 没有 `ctx.plugin`** 时，scoped context 仍能启动各个功能，并在关闭时执行 disposer；
- 侧边栏入口配置的规范化、顺序移动、显隐持久化、新面板追加和重置；
- 行到面板的标签匹配、重名兜底和 More 排除；
- 设置页入口管理器的行数、开关和排序按钮；
- Git 读取、切换、脏工作区保护、detached HEAD 等 Host 行为。

## 已知限制

- **开关和入口配置是浏览器本地状态**：换浏览器、清 localStorage / cookie 会回到默认。要跨设备同步需要 Host 侧配置，当前没有做。
- **合并后只有一个 bundle 开关**：在 Plugins 页关掉 `dsh-ui-toolkit` 会关掉全部功能；只想关某一个请用 Settings → 界面。
- **入口管理是 DOM 层适配**：依赖 `nav[class*="panelList"]`、行按钮的 `aria-label` 和 `panelRow` 结构。DSH 大版本改这些名字时需要同步 `src/features/sidebar-entries.client.js`。
- **隐藏不等于卸载**：被关掉的入口仍然注册在 slot 里，主面板和选择状态不变；当前选中的面板被隐藏后，主区域不会自动切走。
- **Git 路由始终存在**：功能关闭时路由仍注册在 Host 上，只是客户端不调用。
- **依赖原插件的 slot 名和 DOM 结构**：侧边栏、输入框、模型选择等 slot 由 DSH 提供；DSH 大版本改 slot 名时需要同步 `src/features` 里的代码。
- **底部终端依赖 center column 的 DOM**：面板在打开时挂到 `[data-slot="main"]` 的父元素末尾，并给 `[data-slot="main.conversation"]` 的第一个子元素加 `flex:1 1 0; min-height:0`；关闭时恢复。按钮靠 `[data-composer-card]`、`[data-conversation-header-corner]` 和右边栏按钮定位。DSH 改 AppFrame/composer 结构时需要同步 `terminal.client.js`。
- **底部终端只 patch `retainTabs`**：给内置 controller 的窗口保活加并集；换 controller 版本或侧栏保活策略时要回归。关闭功能会还原原方法，已经启动的 Host 进程会失去窗口保活，按 controller 的空闲回收策略处理。
- **按钮位置是自适应的**：右侧空间足够时贴输入框右下角，不足时进 header；窗口或右侧栏宽度跨过阈值时按钮会切换位置。
- **底部终端不是右侧栏终端的替代**：两者各自独立，不共享进程；底部没有多标签、shell 选择器和 web-links addon。
- **不持久化**：打开状态、终端内容和高度都不跨刷新/会话保存；关闭即 kill。
- **滚动条功能依赖 WebKit 伪元素**：只在 Chromium/Electron 的 `::-webkit-scrollbar` 上生效；原生 overlay scrollbar 和 xterm 自绘滚动条不受影响。
- **终端权限**：用户终端以操作系统用户权限运行，不经过 Agent 的 sandbox 或审批；不要把不可信命令粘进去。
