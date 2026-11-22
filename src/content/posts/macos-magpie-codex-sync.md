---
title: CLI 早就接上 Magpie 了，Mac 桌面端 Codex 怎么还在「单飞」？模型同步、Fast 开关与自动审批排障实录
published: 2026-11-22
description: 记录在 macOS 本机用 Magpie 本地网关接管 Codex CLI 与统一桌面端（ChatGPT.app）时踩到的三个连环坑：桌面端模型列表与 CLI 不同步、中转站支持快速模式却不自动显示 Fast / Normal 切换、以及无官方账号登录态下的 Guardian 自动审批配置，附源码级根因定位与安全重启避坑指南。
tags: [magpie, codex, macos, ai, tooling]
category: 环境与系统
draft: false
aigc: Gemini 4 Neon
device: MacBook Pro
---

上一篇折腾完[远程无桌面服务器部署 Magpie 双通道网关](/posts/remote-server-magpie-setup/)后，回到主力 MacBook Pro 上继续用本机 [Magpie](https://github.com/yetone/magpie) 搭配 Codex 写代码，原本以为本地桌面环境肯定比服务器省心——结果反而撞上了三个更隐蔽的连环坑：

1. **CLI 和桌面端「各玩各的」**：Codex CLI 早就乖乖列出了 Magpie 聚合好的全部 **19 个模型**，可打开 Mac 上的统一桌面端 `/Applications/ChatGPT.app`（`com.openai.codex`），模型选择器里依然只有官方 ChatGPT 账号自带的那几款，仿佛 Magpie 压根不存在；
2. **Fast / Normal 开关死活不出来**：中转站明明支持 Codex 快速模式，但 CLI 和桌面端都没自动出现 Fast / Normal 切换选项，总不能每次刷新模型都去手改 `~/.codex/magpie-desktop-models.json`；
3. **无官方登录态下的自动审批**：如果想彻底退出桌面端里的 ChatGPT 账号实现 100% 同步，原本好用的 AutoApprove / ApproveForMe（Guardian）还能不能继续跑？

顺着本地日志、`app.asar` 前端产物，一路翻到 `yetone/magpie` 和 `openai/codex` 的源码，把这三个问题的底层链路彻底摸清并一次性修通了。这篇文章把完整排查思路、源码级根因和最终落地配置整理出来，供同样在 macOS 上用 Magpie 接管 Codex 的朋友参考。

::github{repo="yetone/magpie"}

## 一、排障前先理清涉及的配置文件

在 macOS 上，Magpie、Codex CLI 与统一桌面端（`/Applications/ChatGPT.app`）共享同一套本地配置，但各自读写的职责并不完全一样。先列一张文件地图，后面定位根因会清晰很多：

| 文件路径 | 所属组件 | 作用 |
| --- | --- | --- |
| `~/.codex/config.toml` | Codex CLI / 桌面端 | 通用配置（`openai_base_url`、`model_catalog_json`、`[desktop]`、审批策略等） |
| `~/.codex/auth.json` | Codex CLI / 桌面端 | 当前鉴权状态（例如 `auth_mode: "chatgpt"` 表示处于官方账号登录态） |
| `~/.codex/magpie-desktop-models.json` | Magpie 导出 | Magpie 自动生成给 Codex 读取的本地模型目录 |
| `~/.config/magpie/providers.json` | Magpie | 供应商与协议端点配置（`chat`、`responses`、`baseAPI` 等） |
| `~/.config/magpie/settings.json` | Magpie | 全局开关（含 `codexAutoReview` 等 Codex 专属集成选项） |
| `~/.cache/magpie/models/<provider>.json` | Magpie 缓存 | 拉取到的上游原始模型元数据与 Codex 原生目录缓存 |

## 二、坑一：CLI 早就切好 Magpie，Mac 桌面端 `ChatGPT.app` 为什么还在「单飞」？

### 1. 先排除三个「假嫌疑」

遇到桌面端模型列表不同步，第一反应往往是怀疑「桌面端没读 `~/.codex/config.toml`」或者「被旧缓存污染了」。实测一轮下来，底层其实全都是清白的：

1. **内置 `app-server` 配置完全生效**：`ChatGPT.app` 启动的内置 `codex-cli` 作为本地 `app-server`，实际加载到的配置里明确包含：
   - `openai_base_url = "http://127.0.0.1:3425/backend-api/codex"`
   - `model_catalog_json = "/Users/<username>/.codex/magpie-desktop-models.json"`
2. **本地 `model/list` 输出完全正常**：带着 `CODEX_INTERNAL_ORIGINATOR_OVERRIDE="Codex Desktop"` 直接调用内置二进制的 `model/list`，可以稳定吐出全部 **19 个 Magpie 模型**（涵盖 `auto/*`、`sub4/*`、`opencode-go/*`、`agy-cli/*`），不受 `~/.codex/models_cache.json` 影响；
3. **前端本地过滤也没有拦截**：桌面端前端在 `model_catalog_json` 非空时，会正常放行自定义模型。

底层配置、模型目录、`app-server` 响应全对，界面上却死活不显示——问题显然出在桌面端前端**到底决定去问谁要模型列表**。

### 2. 拆开 `app.asar` 与本地日志，挖出两层真因

检查 `/Applications/ChatGPT.app/Contents/Resources/app.asar` 与本地桌面日志（`~/Library/Logs/com.openai.codex/`）后，真相水落石出，是**两层原因**叠加在起作用：

1. **主因：`auth_mode: "chatgpt"` + `conversationDetailMode = "STEPS_PROSE"` 触发了共享首页逻辑**
   - 本机 `~/.codex/auth.json` 当前处于已登录 Plus 账号状态（`auth_mode: "chatgpt"`）；
   - `~/.codex/config.toml` 的 `[desktop]` 段落原本写着 `conversationDetailMode = "STEPS_PROSE"`；
   - 在桌面端前端的路由映射里：
     - `"STEPS_PROSE"` 映射为 **`everyday` 模式**（`entryPoint: "chatgpt"`）；
     - `"STEPS_COMMANDS"` 才映射为 **`coding` 模式**（`entryPoint: "codex"`）。
   - 处于 ChatGPT 登录态且落在共享首页（`usesSharedHome` + `merged_picker`）时，模型选择器会直接去请求 `https://chatgpt.com/backend-api/models`（Work 默认项走 `/wham/work/settings`），**直接绕过了本地 `openai_base_url` 与 `model_catalog_json`**！
2. **次因：多 Host 视角下的作用域隔离**
   - 如果 `ChatGPT.app` 同时连接了远端 SSH Host（例如 `remote-ssh-discovered:<remote-server>`）或 Cloud（`hostId=durable`），当你切到 Chat、Cloud 或远端 SSH Host 时，前端会向对应 Host 请求它自己的 `model/list`，自然不会读取本机的 `~/.codex/magpie-desktop-models.json`。

### 3. 两种解决方案（按需二选一）

根据你是否想在 `ChatGPT.app` 里继续保留 ChatGPT 官方账号登录态，有两种清晰解法：

| 方案 | 做法 | 同步范围 | 适用场景 |
| --- | --- | --- | --- |
| **方案 A（本次采用）** | 将 `[desktop]` 的 `conversationDetailMode` 改为 `"STEPS_COMMANDS"` 并重启 | **Work / Codex + Local** 下与 CLI 完整同步；Chat 标签页与共享首页仍用账号模型 | 想在同一个 App 里兼顾日常 ChatGPT 对话 + 本地 Magpie 写代码 |
| **方案 B（彻底统一）** | 在 `ChatGPT.app` 内退出 ChatGPT 账号登录（改用 API Key / 非 `chatgpt` 鉴权） | **100% 全局同步**，关闭 `usesSharedHome` 与 `/backend-api/models` | 纯粹把桌面端当 Codex 客户端用，不想再看到任何账号侧模型 |

#### 方案 A 实操：改一行配置

打开 `~/.codex/config.toml`，将 `[desktop]` 下的模式改为 `STEPS_COMMANDS`：

```toml
[desktop]
conversationDetailMode = "STEPS_COMMANDS"
```

保存后**彻底重启** `/Applications/ChatGPT.app`，切换到 **Work / Codex + Local** 视图，Magpie 提供的 19 个模型立刻与 Codex CLI 保持一致。

### 4. 顺手避坑：重启 `ChatGPT.app` 千万别用 `pkill -f Codex`

改完配置需要重启桌面端，这里顺带踩了一个特别容易中招的 macOS 进程坑——**绝对不要随手敲 `pkill -f Codex` 或 `pkill -f codex`**！原因有三个：

- **大小写陷阱**：macOS 上小写 `-f` 才是按完整命令行匹配，大写 `-F` 是读取 PID 文件参数；
- **根本杀不掉主进程**：`/Applications/ChatGPT.app` 主进程的可执行路径是 `/Applications/ChatGPT.app/Contents/MacOS/ChatGPT`，里面压根不含 `Codex` 字样。执行 `pkill -f Codex` 只会打掉 Renderer、GPU 和内置 `codex app-server` 等子进程，主进程依然活着，算不上干净重启；
- **极易误杀无辜进程**：本机实测 `pgrep -fl Codex` 会连带命中菜单栏小组件 `CodexBarWidget`（`CodexBar.app`）和 `SkyComputerUseService`（`Codex Computer Use.app`）；要是敲成小写 `pkill -f codex`，甚至会把你终端里正在干活的 Codex CLI 会话和 `app-server-daemon` 一起端掉。

> [!WARNING]
> 重启 macOS 上的统一版 `ChatGPT.app` 时，请始终使用 `osascript` 优雅退出，或仅在界面卡死时用精准进程名 `pkill -x ChatGPT` 强杀。

```bash
# 优雅重启 ChatGPT.app（推荐）
osascript -e 'tell application "ChatGPT" to quit' && sleep 1 && open -a /Applications/ChatGPT.app

# 界面卡死时仅精准强杀主进程并重启
pkill -x ChatGPT && open -a /Applications/ChatGPT.app
```

## 三、坑二：中转站明明支持快速模式，为什么不自动显示 Fast / Normal？

桌面端和 CLI 模型列表对齐之后，第二个强迫症问题浮出水面：中转站明明支持 Codex 快速模式，可界面上始终没有出现 **Fast / Normal** 切换选项。总不能每次 Magpie 刷新目录，我都手动往 `~/.codex/magpie-desktop-models.json` 里补字段吧？

### 1. 排除上游，直指 Magpie 同步链路

先绕过 Magpie，直接请求中转站的 Codex 模型接口实测：

```text
GET https://sub-api.example.com/v1/models?client_version=0.169.1
```

上游非常痛快地返回了完整的 Codex 原生模型定义，里面 `service_tiers`、`additional_speed_tiers: ["fast"]`、`guardian` 一应俱全。也就是说，**锅完全不在中转站**。

转头去翻 `yetone/magpie` 的源码，很快锁定了两个叠在一起的卡点：

1. **供应商没配 `responses` 端点，压根没触发 Codex 原生目录拉取**
   - 此前 `~/.config/magpie/providers.json` 里只给这个中转站填了 `chat`（`baseAPI: "chat"`），没写 `responses`；
   - 在 `internal/provider/models.go` 中，Magpie 只有在协议为 `Responses` 时，才会调用 `p.codexEntries()` 去请求带 `?client_version=...` 的 Codex 原生目录；只配 `chat` 时它只会拉普通 `/v1/models`，结果本地缓存里所有模型的 `Codex` 字段都是空的。
2. **兜底生成的模型条目不会写入 `additional_speed_tiers`**
   - 当缓存里没有原生 `Codex` 定义时，Magpie 会走 `internal/codexcat/codexcat.go` 的兜底构造逻辑；
   - 这段兜底逻辑虽然会根据 `OwnFast` 补上 `service_tiers: [{"id": "priority", ...}]`，但**不会生成 `additional_speed_tiers`**；
   - 只有真正拿到上游原生 `Codex` 定义并走 `listedEntry` 路径时，Magpie 才会把 `additional_speed_tiers: ["fast"]` 原样透传给 Codex，客户端界面也才会自动渲染出 Fast / Normal 切换项。

### 2. 两步修复：补全 `responses` 端点 + 刷新缓存

第一步，编辑 `~/.config/magpie/providers.json`，为中转站补上 `responses` 端点，并将 `baseAPI` 设为 `"responses"`：

```json
{
  "id": "sub4",
  "name": "sub4",
  "chat": "https://sub-api.example.com",
  "responses": "https://sub-api.example.com",
  "baseAPI": "responses",
  "bestInFamily": true
}
```

第二步，执行命令强制刷新该供应商的模型缓存：

```bash
magpie provider models sub4
```

效果立竿见影：

- 缓存文件 `~/.cache/magpie/models/sub4.json` 直接从 **`7 KB` 涨到了 `206 KB`**，完整拉回并写入了上游的 `Codex` 原生定义；
- 检查 `~/.codex/magpie-desktop-models.json` 与 `codex app-server` 的 `model/list` 输出，可以看到主力模型（如 `sub4/gpt-6.2-sol`、`sub4/gpt-6.2-astra`）都已自动带上：
  - `additional_speed_tiers: ["fast"]`
  - `service_tiers: ["priority"]`
- 重新加载 Codex CLI 与 `ChatGPT.app` 后，Fast / Normal 切换开关自动就位，再也不用手动改 JSON。

> [!TIP]
> **为什么刷新后只有部分模型出现 Fast 开关？** 这是完全正常的边界行为，通常由三个因素决定：
> 1. **上游能力差异**：只有上游 `/v1/models?client_version=...` 返回了 `additional_speed_tiers: ["fast"]` 的模型（如 `gpt-6.2-sol`、`gpt-6.2-astra`）才会显示，上游返回 `[]` 的模型自然没有；
> 2. **`bestInFamily` 过滤**：若供应商配置了 `"bestInFamily": true`，同系列旧版模型（例如 `gpt-6.1-sol`）会被自动折叠隐藏；
> 3. **`auto/*` 路由组机制**：自动路由组条目由 Magpie 兜底生成，仅含 `service_tiers`（如 `priority` / `ultrafast`），默认不含 `additional_speed_tiers`。

## 四、坑三：退出官方账号后，还能用 AutoApprove（Guardian）吗？

如果前面选择了「方案 B」退出官方 ChatGPT 账号，或者平时就习惯纯网关无登录运行 Codex，很容易冒出第三个疑问：**没登官方账号，AutoApprove / ApproveForMe（Guardian 自动审批）还能用吗？**

翻了一遍 `openai/codex` 源码，结论很明确——**完全可以用**：

- `codex-rs/features/src/lib.rs` 里 `Feature::GuardianApproval`（key: `guardian_approval`）已经是 `Stage::Stable` 且默认开启（`default_enabled: true`）；
- `codex-rs/ext/guardian-reviewer/src/routing.rs` 与 `codex-rs/core/src/guardian/reviewer_config.rs` 表明 Guardian 机制本身**不强依赖官方 ChatGPT 账号登录**。

真正容易翻车的点在于**模型路由**：无登录态且经由 Magpie 网关时，如果模型目录里没指定 `auto_review_model_override`，Codex 会直接拿裸模型名 `codex-auto-review` 去发请求，Magpie 找不到对应供应商前缀，就会报错或回退。

只要让 **Codex 和 Magpie 两端各配一行**，就能把自动审批链路稳稳打通：

### 1. Codex 侧（`~/.codex/config.toml`）

```toml
approval_policy = "on-request"
approvals_reviewer = "guardian_subagent"
```

### 2. Magpie 侧（`~/.config/magpie/settings.json`）

```json
{
  "codexAutoReview": "sub4/codex-auto-review"
}
```

对照 `yetone/magpie` 源码（`internal/settings/settings.go` 与 `internal/codexcat/codexcat.go`），`codexAutoReview` 支持两种非常实用的填法：

- **填 `"<provider>/codex-auto-review"`**：Magpie 会在导出的每条 Codex 模型定义中自动注入 `auto_review_model_override: "<provider>/codex-auto-review"`，所有审批请求统一走中转站的专用审核模型，速度快、成本低；
- **填 `"session"`**：如果中转站没有暴露专用 `codex-auto-review` 模型，填 `"session"` 会让每条模型的 `auto_review_model_override` 指向它自身，直接复用当前会话模型完成自动审核。

## 五、常用排查与巡检命令工具箱

最后把这次排查攒下来的高频命令收在一起，以后遇到模型目录不同步、Fast 开关丢失或改完配置需要重载时，直接拿来用就行：

```bash
# 1. 优雅重启 ChatGPT.app（推荐）
osascript -e 'tell application "ChatGPT" to quit' && sleep 1 && open -a /Applications/ChatGPT.app

# 2. 界面卡死时精准强杀主进程并重启（切勿使用 pkill -f codex/Codex）
pkill -x ChatGPT && open -a /Applications/ChatGPT.app

# 3. 强制刷新指定供应商模型缓存（拉取 responses / Codex 原生目录）
magpie provider models sub4

# 4. 一键巡检 Magpie 生成的 Codex 模型目录关键字段
python3 - <<'PY'
import json, pathlib

p = pathlib.Path.home() / ".codex/magpie-desktop-models.json"
d = json.loads(p.read_text())
for m in d.get("models", []):
    slug = m.get("slug", "")
    if slug.startswith(("sub4/", "auto/")):
        print(
            slug,
            "speed:", m.get("additional_speed_tiers"),
            "tiers:", [t.get("id") for t in m.get("service_tiers", [])],
            "auto_review:", m.get("auto_review_model_override"),
        )
PY
```

## 六、一张表总结这三个坑

| 症状 | 真正根因 | 一句话解法 |
| --- | --- | --- |
| 桌面端 `ChatGPT.app` 看不到 Magpie 模型，CLI 正常 | 登录态下 `STEPS_PROSE` 走 `everyday` 共享首页，直连 `chatgpt.com/backend-api/models` 绕过本地目录 | `[desktop]` 改 `conversationDetailMode = "STEPS_COMMANDS"`（或退出登录），并用 `osascript` 干净重启 |
| 中转站支持快速模式，但 Codex 没有 Fast / Normal 切换 | 供应商未配 `responses` / `baseAPI: "responses"`，跳过 `codexEntries()` 导致兜底条目缺失 `additional_speed_tiers` | 补全 `responses` 端点并执行 `magpie provider models <id>` 刷新原生缓存 |
| 退出官方账号后 Guardian 自动审批报错或回退 | 未指定 `auto_review_model_override`，裸模型名 `codex-auto-review` 无法被 Magpie 路由 | Codex 配 `guardian_subagent`，Magpie 配 `codexAutoReview` 为 `"<provider>/codex-auto-review"` 或 `"session"` |

三处问题看似毫不相干，其实全都围绕着同一件事——**Magpie 的本地网关与 Codex 客户端之间的元数据契约**。把协议端点（`responses`）、桌面端模式（`STEPS_COMMANDS`）和审核路由（`codexAutoReview`）对齐之后，Mac 上的 Codex 桌面端与 CLI 终于彻底步调一致了。
