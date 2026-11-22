---
title: 远程服务器 Codex 使用本地 AiMaMi 中转服务指南
published: 2026-07-18
description: 分享我在远程服务器上让 Codex 通过 SSH 反向隧道连接本地 AiMaMi 中转服务，并在官方模型与智能路由之间安全切换的实操方案。
tags: [codex, ai, shell, ssh, tooling]
category: 环境与系统
draft: false
aigc: Codex
---

先交代一下我自己的使用场景：平时跑开发时，Codex 在远程服务器上运行，而 AiMaMi 中转服务跑在本地电脑上。想让远端的 Codex 顺畅用上本地中转，得先把两端用 SSH 反向隧道打通，再去服务器上把 Provider 和切换机制理顺。

配好之后，远程服务器上的 Codex 既可以直连官方模型，也能随时切到本地的 AiMaMi 智能路由，彻底省掉每次手工改 `~/.codex/config.toml` 的麻烦。

以 AiMaMi 智能路由为例，实际折腾下来我总结了两条路线：

1. 直接用 Codex 原生 Profile，在启动 CLI 时按需叠加配置层；
2. 写一个轻量 Shell 脚本，原地开关全局配置块，并在需要时重启 `app-server` 让配置立刻生效。

两条路线瞄准的是同一个需求，但适用场景不太一样：Profile 更干净、互不干扰，适合主要在终端用 CLI 的场景；开关脚本直接改全局配置，更适合 Codex 桌面 App 或者常驻 `app-server` 的用法。

> [!WARNING]
> 不要使用 `cc-switch-cli` 切换本文涉及的 Codex 配置。它可能改写或接管配置状态，导致不同 Codex 进程读取到不一致的配置，最终出现会话不同步。本文只使用 Codex 原生 Profile 或定向开关脚本；会话记录同步则单独使用 `codex-provider-sync`。

## 先理清配置结构与切换边界

打开 `~/.codex/config.toml` 可以看到，智能路由的开关配置位于文件顶部：

```toml
# >>> aimami-relay codex-router top start (DO NOT EDIT MANUALLY)
# Codex 智能路由：使用 HTTP-only 自定义 provider，避开内建 openai WebSocket 路径
# 菜单模型来自 model_catalog_json；官方 / 中转分流由本地 proxy 决定
# 在 AiMaMi 里关闭智能路由开关后，本段会被自动移除
model_provider = "aimai1"
model_catalog_json = "/sdc/home/<username>/.codex/model-catalogs/codex_router_catalog.json"
# <<< aimami-relay codex-router top end
```

至于自定义 Provider 本身的定义，完全可以留在公共配置区域里不动：

```toml
[model_providers.aimai1]
name = "AiMaMi 智能路由"
base_url = "http://127.0.0.1:25123/codex/router/v1"
wire_api = "responses"
requires_openai_auth = true
supports_websockets = false
```

动手改之前，先分清这两块配置的职责会省很多事：

- `[model_providers.aimai1]` 只是声明一个可用的 Provider，放着长期保留就行；
- 真正决定这次会话走哪条路、看到哪些模型菜单的，是顶层的 `model_provider` 和 `model_catalog_json`——它们才是切换时要动的部分。

> [!IMPORTANT]
> `config.toml` 是 TOML 文件，不是 Shell 脚本。`model_catalog_json = "$HOME/..."` 或 `model_catalog_json = "$CODEX_HOME/..."` 通常不会展开环境变量，应填写真实绝对路径。

## 在本机单独起一条 SSH 反向隧道

在让服务器上的 Codex 连本地 AiMaMi 之前，得先把服务器的 `127.0.0.1:25123` 反向转发回本机的 `127.0.0.1:25817`，流量走向很直观：

```text
服务器 Codex
    ↓ 127.0.0.1:25123
SSH 反向隧道
    ↓
本机 AiMaMi：127.0.0.1:25817
```

因为在我当前的环境里没法靠 SSH Config 自动把这条转发拉起来，最稳妥的做法是在运行 AiMaMi 的本机单独开一个终端，直接手动起隧道：

```bash
ssh -N -R 127.0.0.1:25123:127.0.0.1:25817 服务器
```

几个参数的作用分别是：

- `-N`：只建立隧道，不在服务器执行远程命令；
- `-R`：创建反向端口转发；
- `127.0.0.1:25123`：服务器侧监听地址；
- `127.0.0.1:25817`：本机 AiMaMi 服务地址；
- `服务器`：SSH 主机名、别名或 `user@host`。

这个终端就专门挂在后台维持隧道，别关掉，也别在里面干别的。一旦终端断开或者 SSH 进程退了，反向转发就会立刻失效，服务器上的 Codex 也就连不上本地 AiMaMi 了。真断了也不用慌，重新开个终端再跑一遍上面的命令就能恢复。

> [!NOTE]
> 我当前无法通过 `~/.ssh/config` 中的 `RemoteForward` 正常使用这条隧道，所以本文不再把 SSH Config 作为可用方案。主机地址、用户名、密钥等常规连接信息仍可由 SSH Config 提供，但反向转发本身使用命令行中的 `-R` 显式创建。

注意区分访问地址：服务器上的 AiMaMi Provider 走的是反向隧道，所以 `base_url` 要指向服务器本机映射出来的端口：

```toml
base_url = "http://127.0.0.1:25123/codex/router/v1"
```

如果是在本机直接访问 AiMaMi，那么地址对应本机服务端口：

```toml
base_url = "http://127.0.0.1:25817/codex/router/v1"
```

隧道打通以后，就可以按自己的使用习惯，从下面两套切换方案里挑一套来用了。

## 方案 A：使用 Codex Profile（适合 CLI）

### Profile 是怎么叠加生效的

Profile 本质上是 Codex 启动时加载的一层配置覆盖。当你执行：

```bash
codex --profile aimami-router
```

Codex 会先读主配置：

```text
~/.codex/config.toml
```

然后再把对应 Profile 的配置叠加上去：

```text
~/.codex/aimami-router.config.toml
```

所以思路很明确：所有公共配置留在主配置里，只有存在差异的字段才拆到各自的 Profile 文件里。

这里有个版本变化需要注意：从 Codex 0.134.0 开始，每个 Profile 都要写成独立文件并用 `--profile` 显式指定，官方不再推荐把它们塞在 `config.toml` 的 `[profiles.xxx]` 表里，也不支持靠顶层 `profile = "xxx"` 自动选中。

### 清理主配置

先把 `~/.codex/config.toml` 顶部的这两个选择项去掉：

```toml
model_provider = "aimai1"
model_catalog_json = "/sdc/home/<username>/.codex/model-catalogs/codex_router_catalog.json"
```

下面的 Provider 定义照旧留着就行：

```toml
[model_providers.aimai1]
name = "AiMaMi 智能路由"
base_url = "http://127.0.0.1:25123/codex/router/v1"
wire_api = "responses"
requires_openai_auth = true
supports_websockets = false
```

这么改完，主配置就只管公共项，不会强行把所有 Codex 实例都绑死在智能路由上了。

### 新建官方模型 Profile

创建 `~/.codex/official.config.toml`，指定直连官方 Provider：

```toml
model_provider = "openai"
model = "gpt-5.6-sol"
model_reasoning_effort = "high"
```

平时交互式启动直接带参数：

```bash
codex --profile official
```

跑 `codex exec` 这类非交互任务时也完全一样：

```bash
codex exec --profile official "检查当前代码改动"
```

### 新建智能路由 Profile

接着创建 `~/.codex/aimami-router.config.toml`，把智能路由和自定义模型目录写进去：

```toml
model_provider = "aimai1"
model_catalog_json = "/sdc/home/<username>/.codex/model-catalogs/codex_router_catalog.json"
model = "gpt-5.6-sol"
model_reasoning_effort = "high"
```

启动方式同样很直观：

```bash
codex --profile aimami-router
codex exec --profile aimami-router "检查当前代码改动"
```

### 顺手加两个 Shell 别名

每次敲一长串 `--profile` 肯定嫌烦，建议在 `~/.bashrc` 或 `~/.zshrc` 里补两行别名：

```bash
alias codex-official='codex --profile official'
alias codex-router='codex --profile aimami-router'
```

之后想走哪条路，直接敲简短命令就行：

```bash
codex-official
codex-router
```

### 这套方案的优缺点

实际用下来，Profile 方案的优点很明显：

- 不用反复改动全局主配置；
- 可以同时开两个终端，各自跑不同的 Profile 互不打架；
- 切换只作用于新拉起的 Codex 进程；
- 非常适合日常 CLI 交互和 `codex exec` 自动化脚本。

当然它也有使用边界：

- Profile 是 CLI 启动参数，并不会改写桌面 App 读取的全局配置；
- 已经跑起来的 Codex 进程不会中途自动切换；
- 每次启动都得带上 `--profile`，或者靠上面配好的别名来省事。

## 方案 B：用 Shell 脚本原地切换全局配置

如果你主要用 Codex 桌面 App，或者就是想一键把所有新会话统一切到某条路由，那直接操作全局 `config.toml` 会更痛快。

为了不破坏原文件结构，我的做法不是直接删掉那段配置，而是给标记块里的有效 TOML 行加上一条专用注释前缀：

```toml
# aimami-router-disabled: model_provider = "aimai1"
# aimami-router-disabled: model_catalog_json = "/sdc/home/<username>/.codex/model-catalogs/codex_router_catalog.json"
```

等要重新开启时，脚本只剥掉 `# aimami-router-disabled: ` 这个前缀，原本的说明注释、块起止标记和块外的其他配置都会原封不动地留着。

### 完整 Linux 脚本

把下面这段脚本直接保存为 `~/codex-switch.sh`：

```sh
#!/bin/sh

set -eu

START_MARKER='# >>> aimami-relay codex-router top start (DO NOT EDIT MANUALLY)'
END_MARKER='# <<< aimami-relay codex-router top end'
DISABLED_PREFIX='# aimami-router-disabled: '

CONFIG_FILE=${AIMAMI_CODEX_CONFIG:-"$HOME/.codex/config.toml"}
ACTION=toggle
ASSUME_YES=0

usage() {
    printf '%s\n' \
        "用法: $(basename "$0") [-y] [on|off|toggle|status]" \
        '' \
        "默认配置: $CONFIG_FILE" \
        '也可通过 AIMAMI_CODEX_CONFIG 指定其他 config.toml。' \
        '-y：修改后不询问，直接关闭 Codex app-server。'
}

ACTION_SET=0
for ARG in "$@"; do
    case "$ARG" in
        -y|--yes)
            ASSUME_YES=1
            ;;
        on|off|toggle|status)
            if [ "$ACTION_SET" -eq 1 ]; then
                printf '错误: 只能指定一个操作。\n' >&2
                usage >&2
                exit 2
            fi
            ACTION=$ARG
            ACTION_SET=1
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            printf '错误: 未知参数: %s\n' "$ARG" >&2
            usage >&2
            exit 2
            ;;
    esac
done

if [ ! -f "$CONFIG_FILE" ]; then
    printf '错误: 配置文件不存在: %s\n' "$CONFIG_FILE" >&2
    exit 1
fi

get_state() {
    awk -v start="$START_MARKER" -v end="$END_MARKER" -v prefix="$DISABLED_PREFIX" '
        $0 == start {
            starts++
            if (inside) bad = 1
            inside = 1
            next
        }
        $0 == end {
            ends++
            if (!inside) bad = 1
            inside = 0
            next
        }
        inside {
            if (index($0, prefix) == 1) disabled++
            else if ($0 !~ /^[[:space:]]*($|#)/) active++
        }
        END {
            if (inside || starts != 1 || ends != 1 || bad) {
                print "错误: 路由块的起止标记缺失、重复或顺序错误" > "/dev/stderr"
                exit 1
            }
            if (active && disabled) {
                print "错误: 路由块同时含有启用和禁用的配置行" > "/dev/stderr"
                exit 1
            }
            if (disabled) print "off"
            else if (active) print "on"
            else print "empty"
        }
    ' "$CONFIG_FILE"
}

STATE=$(get_state)

if [ "$ACTION" = status ]; then
    printf 'aimami-relay codex-router: %s\n' "$STATE"
    exit 0
fi

if [ "$ACTION" = toggle ]; then
    case "$STATE" in
        on) ACTION=off ;;
        off) ACTION=on ;;
        *)
            printf '错误: 路由块中没有可切换的配置行\n' >&2
            exit 1
            ;;
    esac
fi

if [ "$ACTION" = "$STATE" ]; then
    printf 'aimami-relay codex-router 已经是 %s，无需修改。\n' "$STATE"
    exit 0
fi

TEMP_FILE=$(mktemp "${CONFIG_FILE}.tmp.XXXXXX")
trap 'rm -f "$TEMP_FILE"' EXIT HUP INT TERM

awk -v start="$START_MARKER" -v end="$END_MARKER" \
    -v prefix="$DISABLED_PREFIX" -v action="$ACTION" '
    $0 == start { inside = 1; print; next }
    $0 == end { inside = 0; print; next }
    inside && action == "off" && $0 !~ /^[[:space:]]*($|#)/ {
        print prefix $0
        next
    }
    inside && action == "on" && index($0, prefix) == 1 {
        print substr($0, length(prefix) + 1)
        next
    }
    { print }
' "$CONFIG_FILE" > "$TEMP_FILE"

if ! FILE_MODE=$(stat -c '%a' "$CONFIG_FILE" 2>/dev/null); then
    printf '错误: 无法读取配置文件权限: %s\n' "$CONFIG_FILE" >&2
    exit 1
fi
chmod "$FILE_MODE" "$TEMP_FILE"
mv "$TEMP_FILE" "$CONFIG_FILE"
trap - EXIT HUP INT TERM

printf 'aimami-relay codex-router 已切换为 %s。\n' "$ACTION"

SHOULD_STOP=0
if [ "$ASSUME_YES" -eq 1 ]; then
    SHOULD_STOP=1
else
    printf '是否关闭 Codex app-server 以使配置生效？[y/N] '
    if ! read -r ANSWER; then
        ANSWER=
    fi
    case "$ANSWER" in
        y|Y|yes|YES|Yes) SHOULD_STOP=1 ;;
    esac
fi

if [ "$SHOULD_STOP" -eq 1 ]; then
    if pkill -u "$(id -u)" -TERM -f '[c]odex.*app-server'; then
        printf '已向 Codex app-server 发送 TERM 信号。\n'
    else
        printf '未找到正在运行的 Codex app-server。\n'
    fi
else
    printf '已保留当前 Codex app-server。\n'
fi
```

保存后别忘了加上可执行权限：

```bash
chmod +x ~/codex-switch.sh
```

### 日常怎么用

平时查状态和切换就这几条命令：

```bash
# 查看当前状态
~/codex-switch.sh status

# 开启、关闭或反转智能路由
~/codex-switch.sh on
~/codex-switch.sh off
~/codex-switch.sh toggle
```

每次改完配置，脚本都会贴心地问一句要不要顺手结束当前用户的 Codex `app-server`：

```text
是否关闭 Codex app-server 以使配置生效？[y/N]
```

如果是在自动化流程里调用，不想卡在交互提示上，直接传 `-y` 跳过确认：

```bash
~/codex-switch.sh -y on
~/codex-switch.sh -y off
~/codex-switch.sh -y toggle
```

背后实际用来停服务的命令是这句：

```bash
pkill -u "$(id -u)" -TERM -f '[c]odex.*app-server'
```

它限定了只匹配当前用户的 Codex `app-server` 进程并发送 `TERM` 信号。不过停掉服务可能会导致正在跑的会话中断，执行前记得把没做完的工作先保存好。

如果你手头有不止一份配置文件，也可以通过环境变量临时指定目标路径：

```bash
AIMAMI_CODEX_CONFIG=/path/to/config.toml ~/codex-switch.sh status
```

### 脚本里做了哪些安全兜底

为了防止脚本把 `config.toml` 改坏，写的时候专门加了这几道防线：

- 起止标记必须各出现一次且先后顺序正确；
- 块内如果同时混着启用和禁用的配置行，直接报错中止；
- 先在同目录写临时文件，再原子替换原配置；
- 完整保留原配置文件的权限位；
- 只碰标记块里面的有效 TOML 行，块外和普通注释一概不动；
- 执行 `status` 是纯只读检查，既不改文件也不停服务；
- 目标状态跟当前一致时直接跳过，不会重复写文件或误杀服务。

> [!NOTE]
> 该版本使用 GNU `stat -c`，面向 Linux，不兼容 macOS/BSD。

## 单独处理会话记录同步

把 Provider 切换和会话记录同步拆开来看，整个链路会清晰得多：

- 配置切换：交给 Codex Profile 或 `codex-switch.sh`；
- 记录同步：交给 `codex-provider-sync`；
- 切记不要图省事用 `cc-switch-cli` 去替代上面任何一步。

第一次用时，通过 npm 直接从 GitHub 全局装一下 `codex-provider-sync`：

```bash
npm install -g git+https://github.com/Dailin521/codex-provider-sync.git
```

之后需要同步记录时，跑一句就行：

```bash
codex-provider sync
```

我平时顺手走下来的完整顺序是这样的：

1. 用 `codex --profile ...` 启动需要的 Profile，或者用 `codex-switch.sh` 切好全局配置；
2. 如果走的是脚本方案，按提示把旧的 `app-server` 关掉，再重新启动 Codex；
3. 最后跑一遍 `codex-provider sync` 把会话记录同步齐。

让配置切换和记录同步各司其职，能有效避开第三方切换器偷偷改写 Codex 状态带来的各种怪毛病。

## 两个方案怎么选

如果你拿不准该选哪一套，可以直接对照下面这张表：

| 使用场景 | 推荐方案 | 原因 |
| --- | --- | --- |
| Codex CLI 交互使用 | Profile | 启动时选择，不修改全局状态 |
| `codex exec` 自动化任务 | Profile | 命令中可以显式声明运行环境 |
| 两个终端同时使用不同路由 | Profile | 每个进程拥有独立配置层 |
| Codex 桌面 App | 开关脚本 | 桌面 App 主要读取全局配置 |
| 希望所有新会话统一切换 | 开关脚本 | 直接改变全局 `config.toml` |
| 无人值守切换并刷新服务 | 开关脚本配合 `-y` | 可修改配置并结束旧 `app-server` |

简单来说，主力在终端用 CLI 就优先选 Profile；重度依赖桌面 App 或常驻服务的话，开关脚本用起来更顺手。

## 配完后的目录结构

走 Profile 方案时，`~/.codex/` 目录大概长这样：

```text
~/.codex/
├── config.toml
├── official.config.toml
├── aimami-router.config.toml
└── model-catalogs/
    └── codex_router_catalog.json
```

走开关脚本方案时，文件会更精简一些：

```text
~/.codex/
├── config.toml
└── model-catalogs/
    └── codex_router_catalog.json

~/codex-switch.sh
```

## 参考资料

- [Codex Advanced Configuration：Profiles](https://learn.chatgpt.com/docs/config-file/config-advanced#profiles)
- [Codex Configuration Reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Codex Environment Variables](https://learn.chatgpt.com/docs/config-file/environment-variables)
