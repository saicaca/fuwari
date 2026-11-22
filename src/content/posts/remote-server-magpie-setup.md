---
title: 都什么年代了还在用 CC Switch？无桌面服务器部署 Magpie，直连与 Mac 反向隧道双通道实战
published: 2026-11-22
description: 记录在无可视化桌面的远程 Linux GPU 服务器上部署 Magpie（TUI + Serve）的完整实战：从「本机聚合优先」调整为「直连中转优先 + Mac Magpie 反向隧道互补回退」，涵盖模型列表精细化裁剪、接入 Codex 与 Claude Code、Screen 常驻以及对比 CC Switch 后台机制的深度排查。
tags: [magpie, claude-code, codex, ssh, linux, ai, tooling]
category: 环境与系统
draft: false
aigc: Gemini 4 Neon
device: Linux
---

在远程 Linux GPU 服务器上跑 Claude Code、Codex 这类 CLI Agent 时，最头疼的往往不是工具本身，而是**模型与上游通道的管理**：一部分常用模型有稳定的公网中转站，另一部分本地独占通道（比如跑在个人 Mac 上的本地 CLI 桥接或聚合订阅）又只能在笔记本上用。如果每次切模型都要手改 `~/.claude/settings.json` 或 `~/.codex/config.toml`，很容易留下历史残留字段，维护成本极高。

最近在远程无桌面 Ubuntu 服务器上落地了 [Magpie](https://github.com/yetone/magpie)，把「公网直连中转」和「本机 Mac 上的 Magpie 聚合网关」统一收口到了服务器本地的 `127.0.0.1:3425`。这篇文章从架构演进讲起，完整复盘安装、SSH 反向隧道打通、模型精细化裁剪、接入 Codex 与 Claude Code、以及最后排查「为什么 CC Switch 不用起后台而 Magpie 需要」的全过程。

::github{repo="yetone/magpie"}

## 一、架构思路演进：从「绕本机聚合」到「直连优先 + 本机互补」

一开始的想法很直觉：既然本机 Mac 上已经装好了 Magpie 桌面版，里面聚合了多套上游模型，那远程服务器也装一个 Magpie，主力走 SSH 反向隧道连回 Mac 的 Magpie API，再配一个自建 Sub4API（类似 Sub2API 中转站）作为次要备份。

动手前细想了一层，发现这个顺序其实绕了弯路：**本机 Mac 的 Magpie 背后本身也接了同一个 Sub4API 站点**。如果服务器上的高频主力模型先通过 SSH 隧道传回 Mac，再由 Mac 转发给 Sub4API，会带来两个明显问题：

1. **平白多出一跳网络延迟**：服务器本来就能公网直连中转站，绕一圈本地笔记本反而变慢；
2. **单点依赖本机在线**：Mac 一旦合盖休眠、切网络或断开 SSH，服务器上的主力模型也会跟着中断。

因此把架构反转并整理成了最终落地的**双通道结构**：

```text
远程 Linux 服务器 (无桌面)
┌──────────────────────────────────────────────────────────┐
│  Claude Code / Codex                                     │
│        │  http://127.0.0.1:3425 (Token: magpie)          │
│        ▼                                                 │
│  远端 Magpie Gateway (magpie serve)                      │
│   ├──► Provider: sub4  ──► 公网直连 Sub4API（主力优先）  │
│   └──► Provider: mac   ──► 127.0.0.1:13425               │
└──────────────────────────────▲───────────────────────────┘
                               │ SSH Reverse Tunnel
                               │ (-R 127.0.0.1:13425:127.0.0.1:3425)
┌──────────────────────────────┴───────────────────────────┐
│  本机 MacBook Pro                                        │
│  本地 Magpie App ([::]:3425，开启 Caller Key)            │
│   ├──► agy-cli (Gemini / Claude 等本地独占通道)          │
│   ├──► OpenCode Go (DeepSeek 等)                         │
│   └──► 其他上游（必要时亦可作为 sub4 的回退链路）        │
└──────────────────────────────────────────────────────────┘
```

- **高频主力直连**：服务器上的 `sub4` Provider 直接连公网中转站，零额外跳数，Mac 关机也不受影响；
- **独占能力穿透**：只有 Mac 上才有的本地桥接通道（如 `agy-cli`、`opencode-go`），通过 SSH 反向隧道映射到远端 `127.0.0.1:13425`，以 `remote-magpie` 预设接入远端 Magpie；
- **按需顺序回退**：需要高可用时，还可以用 Magpie 的 Routing Group 配 `routing=order`，实现 `sub4` 优先、异常自动切 `mac` 回退。

## 二、无桌面 Linux 服务器安装与运行形态

远程计算节点通常既没有图形界面，也不方便动系统级目录。Magpie 提供了静态链接的 Linux `x86_64` 单文件二进制，直接放在 `~/.local/bin/magpie` 即可免 root 运行。

安装后确认 PATH 包含 `~/.local/bin` 并检查版本：

```bash
export PATH="$HOME/.local/bin:$PATH"
which magpie
magpie --version
```

在没有桌面环境的服务器上，Magpie 的使用形态和 macOS 上略有不同，主要靠以下三种模式组合：

| 命令 | 定位 | 适用场景 |
| --- | --- | --- |
| `magpie serve` | 纯本地代理网关（默认 `127.0.0.1:3425`） | 放入 `screen` / `tmux` 或 `systemd` 后台常驻 |
| `magpie tui` | 终端交互界面（若无网关运行会临时附带启动） | SSH 终端内快速查看状态、切模型、调配置 |
| `magpie web` / `magpie serve --web` | 浏览器版完整面板（默认 `127.0.0.1:3430`） | 配合 SSH 本地端口转发，在本机浏览器里可视化管理 |

> [!TIP]
> 即使完全不使用 GUI，Magpie 的 CLI 本身也非常完整，从 Provider 管理、模型过滤、路由组配置到接管 Claude Code / Codex，都可以纯命令行完成。

## 三、打通本机 Mac Magpie：Caller Key 与 SSH 反向隧道

要让远程服务器上的 Magpie 安全地调用本机 Mac 上的 Magpie，只需两步：

### 1. 本机 Mac 开启 Caller Key

本机 Mac 上运行的 Magpie 默认监听 `[::]:3425`（可在 `~/.config/magpie/gateway.json` 确认）。在 Magpie 设置里生成一枚用于外部调用的 **Caller Key**（开启局域网/远程调用权限，对应保存在本机 `~/.config/magpie/caller-keys.json`），记下生成的密钥字符串。

### 2. 建立 SSH 反向隧道

由于远程服务器自己的 Magpie 也要占用 `127.0.0.1:3425`，反向隧道在远端必须换一个端口，这里选用 `13425`：

```bash
# 临时后台建立反向隧道：远端 127.0.0.1:13425 -> 本机 127.0.0.1:3425
ssh -fN \
  -o ServerAliveInterval=30 \
  -o ServerAliveCountMax=3 \
  -o ExitOnForwardFailure=yes \
  -R 127.0.0.1:13425:127.0.0.1:3425 \
  gpu-server
```

如果习惯直接随常用 SSH 会话一起打通，也可以写进本机 `~/.ssh/config`：

```ssh-config
Host gpu-server
    HostName <server-ip-or-host>
    User <username>
    RemoteForward 127.0.0.1:13425 127.0.0.1:3425
```

在远端服务器上确认 `13425` 已经监听并能拿到本机模型列表：

```bash
ss -tlnp | grep 13425
curl -sS -H "Authorization: Bearer <MAC_CALLER_KEY>" http://127.0.0.1:13425/v1/models | head -c 300
```

## 四、配置双 Provider 与精细化裁剪模型列表

### 1. 添加 `mac` 与 `sub4` 两个 Provider

Magpie 内置了专门面向「另一台电脑的 Magpie」的 `remote-magpie` 预设（可通过 `magpie presets` 看到），能够自动把 `chat`、`responses`、`anthropic`、`decide` 四个协议端点全部指向反向隧道地址：

```bash
# 添加本机 Mac Magpie 聚合通道（经 127.0.0.1:13425）
magpie provider add remote-magpie <MAC_CALLER_KEY> \
  id=mac \
  name="Mac Magpie" \
  url=http://127.0.0.1:13425/v1

# 添加公网直连的 Sub4API 中转站
magpie provider add sub4 \
  url=https://sub-api.example.com \
  key=<SUB4_API_KEY>
```

添加完成后，用 `magpie providers` 可以看到两者的联通与模型拉取情况：

```text
Mac Magpie   mac   127.0.0.1:13425      ● ...  49 models
sub4 custom  sub4  sub-api.example.com  ● ...  14 models
```

### 2. 自动分组（Auto Groups）与模型列表过长的噪音问题

两个 Provider 都接上后，马上遇到了一个非常现实的体验问题：

- `mac` 侧一次性拉回了 **49 个模型**（包含 Mac 上本身的 `auto/*` 组、`opencode-go/*` 一堆免费/测试模型、`codex/*`、`agy-cli/*` 等）；
- `sub4` 侧拉回了 **14 个模型**；
- 更麻烦的是，因为 `sub4` 和 `mac` 里有大量同名模型，Magpie 默认还会自动聚合出一批 `auto-*` 路由组。结果打开 Agent 的模型选择器时，列表里塞满了重复项和根本不会点开的模型。

> [!NOTE]
> 如果确实需要同名模型自动主备切换，可以保留或手动创建 Routing Group（例如 `magpie group add "GPT-6.2 Sol" models=sub4/gpt-6.2-sol,mac/auto/gpt-6.2-sol routing=order`），并给分组加上 `listed=no` 隐藏底层的重复裸模型。在本次配置里，我更倾向于让选择器直白可控，所以先关闭了自动分组，直接按通道精选暴露的模型。

### 3. 精细化裁剪：63 个模型压缩到 11 个主力模型

调整目标非常明确：

1. 关闭冗余的自动发现分组（`magpie group auto off`，对应 `~/.config/magpie/providers.json` 中的 `"noAutoGroups": true`）；
2. **`mac` 通道只留 Mac 独占精品（6 个，隐藏其余 43 个）**：
   - `opencode-go` 组只留主力 DeepSeek Flash；
   - `agy-cli` 组只留主力 Gemini 4 系列及 Claude Opus / Sonnet；
3. **`sub4` 通道只留高频直连主力（5 个，隐藏其余 9 个）**。

Magpie 支持直接通过 `magpie provider models <id> +<model>` / `-<model>` 动态增减暴露列表，也可以整理 `~/.config/magpie/providers.json` 的 `models` 字段（完整拉取列表保留在 `pickedFrom` 中，随时可恢复）。精简后的 `providers.json` 核心结构如下（敏感字段已脱敏）：

```json
{
  "providers": [
    {
      "id": "mac",
      "name": "Mac Magpie",
      "icon": "magpie",
      "preset": "remote-magpie",
      "key": "<MAC_CALLER_KEY>",
      "chat": "http://127.0.0.1:13425/v1",
      "responses": "http://127.0.0.1:13425/v1",
      "anthropic": "http://127.0.0.1:13425",
      "decide": "http://127.0.0.1:13425/v1",
      "models": [
        "opencode-go/deepseek-v4.1-flash",
        "agy-cli/gemini-4-neon",
        "agy-cli/gemini-4-argon",
        "agy-cli/gemini-4-hydrogen",
        "agy-cli/claude-opus-5-5",
        "agy-cli/claude-sonnet-5-5"
      ]
    },
    {
      "id": "sub4",
      "name": "sub4",
      "key": "<SUB4_API_KEY>",
      "chat": "https://sub-api.example.com",
      "models": [
        "gpt-6-luna",
        "gpt-6.2-astra",
        "gpt-6.2-astra-pro",
        "gpt-6.2-sol",
        "codex-auto-review"
      ]
    }
  ],
  "noAutoGroups": true
}
```

调整后执行 `magpie models`，整个远端网关对外只展示清清爽爽的 **11 个模型**，选型零干扰。

## 五、接入 Codex 与 Claude Code，并做端到端实测

### 1. 接入 Codex

一条命令切换模型和推理强度，Magpie 会自动维护 `~/.codex/config.toml`：

```bash
magpie codex sub4/gpt-6.2-sol
magpie codex effort high
```

写入后的 `~/.codex/config.toml` 核心片段如下（后续也可以在 Codex 内直接切到 `mac/agy-cli/...` 等任意已暴露模型）：

```toml
model_provider = "magpie"
model = "sub4/gpt-6.2-sol"
model_reasoning_effort = "high"
disable_response_storage = true
model_catalog_json = "/sdc/home/<username>/.codex/magpie-models.json"
openai_base_url = "http://127.0.0.1:3425/backend-api/codex"

[model_providers.magpie]
name = "magpie"
base_url = "http://127.0.0.1:3425/v1"
wire_api = "responses"
experimental_bearer_token = "magpie"
http_headers = { "x-openai-actor-authorization" = "magpie" }
```

### 2. 接入 Claude Code

动手前先给原有配置留一份备份，再执行接入命令：

```bash
cp ~/.claude/settings.json ~/.claude/settings.json.bak.pre-magpie
magpie claude sub4/gpt-6.2-sol
```

实际查看生成的 `~/.claude/settings.json`，Magpie 做得比预期细致得多：

- **自动清理历史脏字段**：此前其他中转工具写入的旧 `ANTHROPIC_BASE_URL` 以及一堆冗余的 `*_MODEL_NAME`、`CLAUDE_CODE_SUBAGENT_MODEL` 字段都被干净替换；
- **自动同步 `modelPicker`**：刚裁剪好的 11 个模型全部自动写入 `modelPicker.options`，在 Claude Code 里敲 `/model` 就能直接切换 `sub4` 和 `mac` 两侧的模型；
- **自动声明模型能力**：通过 `CLAUDE_CODE_MODEL_CAPABILITIES` 为每个模型写入对应的 `effort` / `xhigh_effort` / `max_effort` 支持矩阵，并配置好上下文窗口与自动压缩阈值。

生成的配置节选如下：

```json
{
  "modelPicker": {
    "options": [
      {
        "description": "via magpie",
        "label": "Claude Sonnet 5.5 · Antigravity (local agy CLI) · Mac Magpie",
        "model": "mac/agy-cli/claude-sonnet-5-5[1m]"
      },
      {
        "description": "via magpie",
        "label": "GPT-6.2 Sol · sub4",
        "model": "sub4/gpt-6.2-sol"
      }
    ]
  },
  "model": "sonnet",
  "env": {
    "ANTHROPIC_BASE_URL": "http://127.0.0.1:3425",
    "ANTHROPIC_AUTH_TOKEN": "magpie",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "sub4/gpt-6.2-sol",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "sub4/gpt-6.2-sol",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "sub4/gpt-6.2-sol",
    "ANTHROPIC_SMALL_FAST_MODEL": "sub4/gpt-6.2-sol",
    "CLAUDE_CODE_MAX_CONTEXT_TOKENS": "922000",
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "272000",
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "128000"
  }
}
```

### 3. 双通道端到端实测

配置完别只看 `magpie ls`，直接跑两次 `claude -p` 实测两条物理链路（直连 `sub4` 与隧道回 `mac`）：

```bash
# 测试 1：默认模型走 sub4 公网直连
claude -p "Reply with exactly: OK_SUB4" --no-session-persistence --output-format text

# 测试 2：指定模型走 SSH 反向隧道回本机 Mac Magpie
claude -p "Reply with exactly: OK_MAC" \
  --model "mac/agy-cli/claude-sonnet-5-5" \
  --no-session-persistence --output-format text
```

两条命令分别返回 `OK_SUB4` 和 `OK_MAC`，证明远端网关、协议转换、公网直连与反向隧道全线跑通。

## 六、后台常驻方案，以及为什么 CC Switch 不用起后台？

验证完毕后，我停掉了临时调试用的 `tmux` 会话，改用自己顺手的 `screen` 来常驻 `magpie serve`：

```bash
# 推荐带会话名启动，后续排查日志方便直接 screen -r magpie
screen -dmS magpie magpie serve
```

三步确认服务健康：

```bash
# 1. 确认 screen 会话在运行
screen -ls
# 2. 确认 3425（远端网关）和 13425（Mac 反向隧道）均处于 LISTEN
ss -tlnp | grep -E "3425"
# 3. 确认网关接口可正常返回模型清单
curl -sS -m 5 -H "Authorization: Bearer magpie" http://127.0.0.1:3425/v1/models | head -c 300
```

### 为什么服务器上的 CC Switch 平时「不用管」，Magpie 却必须挂后台？

做到这里产生了一个很自然的疑问：同一台服务器上之前也装了 `cc-switch`，为什么平时从来没手动拉起过它的进程，它是不是自带开机自启？为什么 Magpie 不行？

上服务器实际查了一圈进程、`cc-switch daemon status`、`~/.config/systemd/user`、`/etc/systemd/system` 和 `crontab`，结果发现：**服务器上的 `cc-switch` 根本没有任何后台进程，也没有配置开机自启**（shell 配置里只有一条自动补全脚本）。

两者的差异其实来自**架构定位完全不同**：

| 对比项 | CC Switch（普通模式） | CC Switch（Daemon 模式） | Magpie（`magpie serve`） |
| --- | --- | --- | --- |
| 工作机制 | 静态配置文件切换器 | 本地代理 + 故障转移守护进程 | 本地统一协议网关 + 路由调度 |
| 写入配置的目标地址 | 直接写远端上游 URL 与真实 Key | 写本地代理端口 | 统一写 `http://127.0.0.1:3425` |
| 是否需要常驻进程 | **不需要**（写完配置即退出） | 需要 | **必须常驻** |
| 支持跨协议转换 / 模型聚合 | 否（依赖上游本身兼容） | 有限支持 | 原生支持（Responses / Anthropic / Chat） |

简而言之，普通模式下 `cc-switch` 只是帮你改完配置文件就下班了，后续 Claude Code / Codex 直接连远端 API，所以看起来像“永远在线”；而 Magpie 是流量必经的本地网关，所有协议转换、模型裁剪、双通道分流和用量统计都在 `127.0.0.1:3425` 上实时完成，因此 `magpie serve` 必须常驻。

### 无桌面服务器想给 Magpie 做开机自启，怎么配？

顺带踩了一脚 `magpie autostart on` 的坑：这个子命令是给带桌面环境的登录会话（例如 macOS `LaunchAgents` 菜单栏自启）设计的，在无桌面 Linux 服务器上直接执行并不生效。

如果希望服务器重启后自动拉起 Magpie，且不依赖人工开 `screen`，有两种标准 Linux 做法：

#### 方案 A：`systemd --user` + `Linger`（推荐，带崩溃自动重启）

新建 `~/.config/systemd/user/magpie.service`：

```ini
[Unit]
Description=Magpie Local AI Gateway
After=network-online.target

[Service]
Type=simple
ExecStart=%h/.local/bin/magpie serve
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
```

启用服务，并**务必检查当前用户的 `Linger` 状态**：

```bash
systemctl --user daemon-reload
systemctl --user enable --now magpie.service

# 检查 Linger 状态
loginctl show-user "$USER" -p Linger
```

> [!IMPORTANT]
> 如果输出是 `Linger=no`，意味着一旦你断开所有 SSH 会话，用户级 `systemd` 进程树会被系统回收，Magpie 也会跟着停掉。执行一次 `loginctl enable-linger "$USER"` 即可实现真正的开机自启与断连常驻。

#### 方案 B：`crontab` 的 `@reboot`（无 Linger 权限时的轻量兜底）

如果服务器没有开启 `enable-linger` 的权限，可以用用户级 `crontab -e` 补一条开机拉起：

```text
@reboot /usr/bin/screen -dmS magpie /home/<username>/.local/bin/magpie serve
```

缺点是进程异常退出后不会像 `systemd` 那样自动重启，日常使用还是 `systemd --user` 或按需手动维护 `screen` 更直观。

## 七、常用运维命令速查

| 目标 | 命令 |
| --- | --- |
| 查看所有 Agent 接入状态 | `magpie ls` |
| 查看 Provider 与通道状态 | `magpie providers` |
| 查看当前对外暴露的模型清单 | `magpie models` |
| 动态暴露 / 隐藏某个模型 | `magpie provider models <id> +<model>` / `-<model>` |
| 切换 Claude Code / Codex 模型 | `magpie claude <provider/model>` / `magpie codex <provider/model>` |
| 彻底还原某个 Agent 的原生配置 | `magpie claude default` / `magpie codex default` |
| 在无桌面环境下打开终端面板 | `magpie tui` |
| 在线升级远端 Magpie | `magpie update` |
