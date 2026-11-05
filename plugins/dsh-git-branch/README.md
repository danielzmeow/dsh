# dsh-git-branch

DeepSeek Harness 的客户端插件：在输入框工具行显示**当前 Git 分支**，点开后可以搜索并切换本地分支。位置和排版对齐输入框里的权限/模型控件，不额外占一行。

对应 Codex 那类「底部随时能看到当前分支、点一下就能换」的体验。

## 显示效果

```text
＋  Workspace Write   ⎇ main • ↑2   DeepSeek V4.1 Flash High ⌄   ➤
```

- 分支控件在权限选择器右侧、模型选择器左侧。
- 有未提交更改时，分支名后出现一个琥珀色小圆点。
- 当前分支领先/落后上游时显示 `↑2`、`↓1`；上游已删除时显示 `gone`。
- 悬停显示仓库名、分支、未提交更改数量与领先/落后。
- 当前目录不是 Git 仓库时，控件完全不出现，不占位。
- 尺寸与左右选择器一致：触发器高 28px、圆角使用 `--dsw-radius-sm`（当前 8px）；列表项高 34px、圆角使用 `--dsw-radius-md`（当前 12px）；面板圆角 20px。

## 切换分支

点击分支名打开面板：

- 顶部是仓库名与路径，右侧标出当前分支。
- 搜索框过滤本地分支，匹配分支名和上游名，不区分大小写。
- 列表按「当前分支 → 最近提交 → 名称」排序；每行显示分支名、领先/落后/上游状态。
- 点击一行即可切换；切换成功后面板关闭，控件立即更新。
- 支持键盘：`↑` / `↓` 移动，`Enter` 切换，`Esc` 关闭，`Home` / `End` 跳到首尾。
- 切换期间列表禁用并显示进度，避免连点并发。

Git 拒绝切换时，面板会保留并显示原因和 Git 原始诊断，例如：

| 情况 | 提示 |
| --- | --- |
| 本地更改会被覆盖 | 先提交或暂存，再切换 |
| 分支已在另一个工作树检出 | 在对应工作树处理 |
| 仓库正在合并 / 变基 | 完成操作后再切换 |
| 索引有冲突 | 先解决冲突 |
| 分支不存在 | 重新打开面板刷新列表 |

**切换由 Git 决定，插件不 discard 任何东西。** 能带着未提交更改切过去就切；会被覆盖时 Git 拒绝，工作区保持原样。

## 数据来源

Host 半部分注册两个经认证的 Fetch 路由：

| 路由 | 用途 |
| --- | --- |
| `POST /api/git-branch/status` | 读取仓库、当前分支、未提交数量、进行中的操作、本地分支列表 |
| `POST /api/git-branch/switch` | 校验分支并执行 `git switch` |

- 浏览器只传 `sessionId` 和分支名，**不传路径**。仓库来自会话当前工作目录，由 Host 的 `workingDirectory` 投影解析；会话未激活时回退到持久化 header 的 `cwd`。
- 分支名先过 `git check-ref-format --branch`，再用 `git show-ref --verify` 证明本地分支存在，最后才调用 `git switch --no-guess -- <branch>`。全程 `spawn` 传参数组，不经过 shell。
- 读状态使用 `git status --porcelain`、`git for-each-ref` 与 `git symbolic-ref`；状态缓存 1.2 秒，切换后立即失效。
- 路由挂在 `ctx.connection.fetch` 上，继承 DSH 的启动令牌、会话 Cookie、Host/Origin 栅栏与 Peer 鉴权，不额外暴露未认证端口。

## 刷新

- 首次挂载读取一次。
- 每 5 秒轮询一次（页面不可见时暂停）。
- 窗口重新获得焦点、页面从后台恢复时刷新。
- 打开面板时再刷新一次；切换成功后直接用 Host 返回的新状态更新。

## 安装

本目录是标准 profile bundle：

```text
dsh-git-branch/
├── package.json
├── cordis.patch.yml
├── lib/
│   ├── index.js      # Host 路由
│   ├── git.js        # Git 读取/切换
│   └── client.js     # 输入框控件
├── locale/{zh,en}.json
├── icon.svg
├── test/
└── README.md
```

在 **Plugins → Add plugin → Install a third-party plugin** 中选择本目录即可；安装后点 **Enable now**，再刷新页面。

本地开发也可以把目录链接进 profile：

```sh
ln -s /path/to/dsh-git-branch ~/.dsh/profiles/desktop/node_modules/@local/dsh-git-branch
```

并在 profile 的 `package.json` 中把 `@local/dsh-git-branch` 加进 `dsh.profile.bundles`。重启或重载 DSH 后生效。

## 测试

```sh
node --test plugins/dsh-git-branch/test/*.test.mjs
```

Host 测试会在临时目录里创建真实 Git 仓库，覆盖分支读取、脏工作区、分离 HEAD、切换、脏冲突拒绝和错误分类；Client 测试覆盖排序、过滤、状态文案与错误映射。

## 已知限制

- **只列本地分支**：不 fetch、不列远端分支，也不会从远端自动建本地分支。需要远端分支时先在终端 `git fetch` 并 checkout。
- **不创建/删除/重命名分支**：这里只做「显示 + 切换」。
- **切换会运行仓库自己的 hooks**：和终端里的 `git switch` 一样；hook 卡住时 20 秒超时。
- **工作树分支互斥由 Git 判断**：一个分支已在另一个工作树检出时，Git 会拒绝。
- **轮询而非文件监听**：外部终端切分支后，最多约 5 秒更新；窗口重新聚焦会立即刷新。
- **同仓库切换串行**：一个仓库同一时间只执行一个切换，第二次点击会等待前一个结束。
