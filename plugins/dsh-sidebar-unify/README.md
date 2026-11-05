# dsh-sidebar-unify

DeepSeek Harness 客户端插件：把侧边栏的三处不一致收拢成一套。

1. **「新会话」不再是一个凸起的胶囊按钮。** 它变成和 Plugins / Automation tasks 完全相同的行：透明底、36px 高、12px 圆角、左侧 16px 图标、14px/400 字重、悬停才出现底色。
2. **没有插件入口时隐藏「更多」。** 侧边栏的 More 只用于管理插件面板；当 `sidebar.panellist` 里只有应用自带的 Plugins 和 Automation tasks 时，这一行直接消失，不再留一个点开只有两个官方项的菜单。
3. **去掉 wordmark 里的 HARNESS 徽章。** 品牌区的 SVG 把 `deepseek` 文字和一块黑底 `HARNESS` 徽章画在同一个 SVG 里；插件只隐藏徽章底板和徽章文字，保留 `deepseek` 文字和鲸鱼标记。

## 显示效果

修改前：

```text
┌──────────────────────────┐
│        ⊕  New Session    │  ← 白底、描边、圆角胶囊，居中
├──────────────────────────┤
│ ✦  Plugins               │
│ ◷  Automation tasks      │
│ ⊞  More                  │
└──────────────────────────┘
```

修改后：

```text
┌──────────────────────────┐
│ ⊕  New Session           │  ← 透明底，和下面几行同高、同圆角、同 hover
│ ✦  Plugins               │
│ ◷  Automation tasks      │
└──────────────────────────┘
```

- 新会话的快捷键提示（⌘N）仍留在行尾，只在悬停/聚焦时出现。
- 折叠成 56px 图标栏时保持原有 36×36 的图标按钮，不受影响。
- 品牌区保留 `deepseek` 和鲸鱼标记，只去掉 `HARNESS` 徽章。
- 只要有任意第三方插件注册了侧边栏面板，More 立即恢复显示；插件卸载或禁用后自动隐藏。

## 实现方式

插件不改 DSH 源码，只做客户端的三件事：

### 1. 把 New Session 变成普通行

选择器以侧边栏根节点为作用域，并且只在展开态生效：

```css
div[class*="root"]:not([class*="collapsed"]) > button[class*="newSession"] {
  height: auto;
  min-height: 36px;
  margin: 0 2px 2px;
  padding: 7px 8px;
  border: 0;
  border-radius: var(--dsw-radius-md);
  background: transparent;
  font: inherit;
  font-size: 14px;
  line-height: 22px;
  justify-content: flex-start;
  gap: 8px;
}
```

几处数字都和 `.panelRow` 对齐：

- 宽、左右外边距：`margin: 0 2px`，和面板行一致。
- 高度：面板行是 `min-height: 36px` + `padding: 7px 8px`，不是固定 38px；这里改成 `height: auto` + 同样的 min-height/padding，行高 22px 时正好 36px。
- 内部间距：`padding: 7px 8px`、图标 16px、图标与文字 `gap: 8px`。
- 字体：面板行用 `font: inherit`；这里也继承系统字体，避免按钮默认 Arial 让文字宽度和下面几行不一致。
- 行间距：面板行之间由 `.panelList` 的 `gap: 2px` 控制；New Session 不在这个列表里，所以用 `margin-bottom: 2px` 复现同一段间隙。

同时把内部的 `newSessionContent` 从居中改为左对齐，图标固定 16px，短横线占满剩余宽度。所有覆盖都限定在展开态，折叠栏继续用 DSH 原本的 36×36 图标按钮。

### 2. 用面板注册表决定 More

插件从 `ctx.slots.entriesOfSlot("sidebar.panellist")` 读取当前启用的面板 id，把应用自带的 `plugins`、`schedules` 之外的任何 id 视为插件入口，并把它写成 `<html data-dsu-has-plugin-panels="true|false">`。CSS 只在值为 `false` 时隐藏 More：

```css
html[data-dsu-has-plugin-panels="false"]
  nav[class*="panelList"] button[class*="panelRow"][aria-haspopup="menu"] {
  display: none !important;
}
```

这个判断是响应式的：面板注册表变化时重新计算，插件卸载时清除根节点属性，More 立刻回到原样。

### 3. 去掉 HARNESS 徽章

官方 wordmark 的 SVG 末尾有一块深色圆角矩形（徽章底板）和一个带 `clip-path` 的文字组。插件只隐藏这两部分：

```css
div[class*="logoRow"] [class*="brandName"] svg > rect { display: none !important; }
div[class*="logoRow"] [class*="brandName"] svg [clip-path*="badge"] { display: none !important; }
```

前面的 `deepseek` 文字路径和旁边的鲸鱼标记不在选择器范围内，保持原样。

## 安装

本目录是标准 profile bundle：

```text
dsh-sidebar-unify/
├── package.json
├── cordis.patch.yml
├── lib/
│   ├── index.js      # Host 占位（无 Host 服务）
│   └── client.js     # 样式 + 面板注册表监听
├── locale/{zh,en}.json
├── icon.svg
├── test/
└── README.md
```

在 **Plugins → Add plugin → Install a third-party plugin** 中选择本目录即可；安装后点 **Enable now**，再刷新页面或重启 DSH。

本地开发也可以把目录链接进 profile：

```sh
ln -s /Users/daniel/Developer/DSH/plugins/dsh-sidebar-unify \
  ~/.dsh/profiles/desktop/node_modules/@local/dsh-sidebar-unify
```

并在 profile 的 `package.json` 中把 `@local/dsh-sidebar-unify` 加进 `dsh.profile.bundles` 和 `dependencies`。重启或重载 DSH 后生效。

## 测试

```sh
node --test plugins/dsh-sidebar-unify/test/*.test.mjs
```

测试覆盖：面板 id 的两种注册形态、官方面板与插件面板判定、根节点开关、注册表读取兜底、样式表内容、apply 的副作用与卸载清理，以及无 DOM 环境下的惰性处理。

## 已知限制

- **依赖 Sidebar 的类名后缀与 Slot 合约**：选择器使用 `root`、`collapsed`、`newSession`、`panelList`、`panelRow`、`brandName` 等稳定的类名片段，而不是完整哈希类名；面板来源依赖 `sidebar.panellist` Slot 的注册 id。DSH 如果重命名这些结构，需要同步调整选择器。
- **官方面板 id 是硬编码的**：当前只把 `plugins`、`schedules` 视为官方面板；未来如果官方新增第三个全局面板，它会被当作插件入口，More 会继续显示（偏保守，不会误藏）。
- **HARNESS 徽章靠 SVG 结构识别**：徽章底板是 wordmark SVG 的直接子 `rect`，徽章文字带 `clip-path*="badge"`。如果品牌 SVG 改版，需要重新确认这两个选择器。
