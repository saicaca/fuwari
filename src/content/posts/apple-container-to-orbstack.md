---
title: 逃离 Docker Desktop、尝鲜 Apple Container，最后我全迁回了 OrbStack
published: 2026-11-22
description: 记录一次把 macOS 本机 Apple Container 里的 4 个项目（5 个容器）无损迁到 OrbStack 的实操复盘，覆盖 :latest 标签漂移、APFS 大小写坑、回收 12.55 GB 空间以及清理 Docker Desktop 历史残留的避坑细节。
tags: [macos, orbstack, apple-container, docker, devops]
category: 环境与系统
draft: false
aigc: Gemini 4 Neon
device: MacBook Pro
---

折腾 Mac 本地容器环境的朋友，大概都经历过类似的演进路线：最早用 **Docker Desktop**，受够了内存和耗电后去尝鲜了苹果官方的 **Apple Container**，用了一阵子发现日常多容器编排和笔记本续航、易用性上，还是 **OrbStack** 更省心。

最近我把本机 Apple Container 里跑着的 4 个常用项目（共 5 个容器）完整迁到了 OrbStack，顺手把之前卸载 Docker Desktop 留下的历史残余一并查清，最后腾出了 **12.55 GB** 的硬盘空间。整个过程踩了几个非常典型、也挺有参考价值的坑——比如 `:latest` 镜像上游破坏性更新、macOS APFS 大小写不敏感坑坏 conda 环境、误删 `~/.docker` 的雷区等等。

这篇笔记把这次「无损迁移 + 彻底瘦身」的思路和实操复盘记录下来，供同样准备在 macOS 上切换容器运行时的朋友参考。

## 一、迁移背景与环境信息

Apple Container 为每个容器提供独立的轻量级 Linux 虚拟机，隔离性思路很惊艳；但放在主力笔记本的日常开发与自托管场景下，OrbStack 的综合体验明显更顺手：

- 原生无缝接管 `docker` 与 `docker-compose` 生态，多容器项目编排与健康检查开箱即用；
- 内存动态回收与冷启动速度极快，笔记本续航和发热控制很友好；
- 内置 Linux 文件系统卷支持，能优雅规避 macOS 宿主文件系统带来的各种兼容性问题。

本次迁移的实测环境如下：

| 项目 | 版本 / 规格 |
| --- | --- |
| 设备架构 | Apple Silicon (`arm64`) |
| 操作系统 | macOS 27.2.1 |
| 旧运行时 | Apple Container CLI `1.1.0` (`com.apple.container-installer`) |
| 目标运行时 | OrbStack `2.2.5`（Docker Engine `29.8.2` / Docker Compose `v5.5.0`） |
| 迁移范围 | 4 个 Compose 项目 / 5 个容器（覆盖 Web 服务、数据库、AI 翻译服务、Ubuntu 开发环境） |

## 二、迁移铁律：先双跑验证，再动刀清理

本地容器迁移最怕“还没确认新环境跑通，就把旧数据清没了”。这次我给自己定了三条原则：

1. **先盘点，再分类**：分清哪些是无状态镜像、哪些带持久化数据卷、哪些在容器系统层里装过自定义软件。
2. **不直接删旧环境**：迁移期间完整保留 Apple Container 的镜像、容器和卷，直到 OrbStack 侧所有服务通过端到端验证。
3. **借机整理编排规范**：把零散的数据卷、缓存目录和资源限制统一收口到各自项目的 `docker-compose.yml` 里，告别“跑起来就忘了怎么配的”状态。

## 三、四个典型场景的迁移与踩坑实录

这 5 个容器恰好代表了个人开发者最常见的 4 类工作负载，每一类都有值得注意的细节。

### 场景 1：标准多容器栈 + 数据库持久化（`moontvplus`）

- **构成**：`moontv-core`（Web 应用，`10900 -> 3000`） + `moontv-kvrocks`（`apache/kvrocks:2.16.0` 数据库）。
- **迁移要点**：
  - 将旧版编排文件先备份留档（如 `compose-old-20260914.yml`），按 OrbStack 环境整理新版 `docker-compose.yml`。
  - 把原 Apple Container 命名卷里的 Kvrocks 数据（约 `4.2 MB`）导出并落盘到项目目录 `./kvrocks-data`，挂载至容器内 `/var/lib/kvrocks/db`。
- **验证**：`moontv-kvrocks` 健康检查显示 `healthy`，访问 `http://127.0.0.1:10900` 正常 `307` 跳转登录，原有账号、观看记录与收藏数据全部无损恢复。

### 场景 2：警惕 `:latest` 标签漂移引发启动崩溃（`ac-downloader`）

- **构成**：`douyin_tiktok_api`（`10902 -> 80`，挂载 `./app:/app`）。
- **踩坑经历**：
  - 一开始按习惯在 OrbStack 里直接拉取上游 `evil0ctal/douyin_tiktok_download_api:latest`，结果容器启动报错——上游新版 `latest` 修改了入口逻辑，并且新增了强制环境变量校验（要求配置 `DTK_SECRET_KEY`），与本地现存代码配置不兼容。
- **解法**：
  - 直接从仍在运行的 Apple Container 中把**原本能正常工作的镜像版本**导出，再 `docker load` 导入 OrbStack。
  - 在 `docker-compose.yml` 中显式锁定拉取策略：

```yaml
services:
  douyin_tiktok_api:
    image: evil0ctal/douyin_tiktok_download_api:latest
    pull_policy: if_not_present
```

- **经验总结**：线上和本地服务都尽量避免无约束依赖 `:latest`；如果历史镜像已经用了 `:latest`，迁完后务必配好 `pull_policy: if_not_present`（或重新打固定 tag），防止哪天顺手拉镜把可用环境冲掉。

### 场景 3：把模型缓存和产物归位，顺手加上资源限额（`zotero-pdf2zh`）

- **构成**：`zotero-pdf2zh`（`crushry/zotero-pdf2zh:4.0.3`，仅绑定本机 `127.0.0.1:8890 -> 8890`）。
- **迁移要点**：
  - 除了导出导入原镜像外，重点把此前散落在卷和容器内的三类资产全部理顺并映射到项目目录：
    - 配置文件 `./config`（旧配置备份为 `config/config.toml.bak-20260807`）；
    - 已生成的译文 PDF `./translated`（`117.4 MB`）；
    - 翻译模型缓存 `./cache`（`341.1 MB`）——提前搬过去能省去迁移后重新下载几百 MB 模型的等待。
  - 翻译 PDF 属于突发高算力任务，在 Compose 中补上了资源护栏（`cpus: 4`、`mem_limit: 4g`），避免在笔记本上跑翻译时把整机拖卡。
- **验证**：`http://127.0.0.1:8890` 返回 `200 OK`，历史译文和模型缓存直接命中。

### 场景 4：有状态 Linux 开发容器搬家与 macOS 大小写坑（`ub-env`）

这是本次迁移最有意思、也最容易踩深坑的一个容器。

- **构成**：`ub-env-ubuntu22`（`2222 -> 22`，一个长期使用的 Ubuntu 22.04 SSH 开发环境）。里面在运行期间手动装过不少系统软件、生成了固定 SSH 主机密钥，`/home/test` 目录下还装着约 `547.5 MB` 的 `conda/mamba` 环境和工程代码。
- **两个关键决策**：
  1. **保留容器系统层**：把原容器文件系统导出导入为本地基础镜像 `ub-env-ubuntu22:migrated`，这样已安装的 APT 软件包、SSH Host Keys（避免客户端报 `REMOTE HOST IDENTIFICATION HAS CHANGED`）和 `test` 用户都会完整保留。
  2. **绝不把 `/home/test` 直接 bind-mount 到 macOS 宿主机目录**：
     - macOS 默认的 APFS 分区是**大小写不敏感**（Case-Insensitive）的，而 Linux 下的 `conda`/`mamba`/Python 依赖包和编译产物很容易出现仅大小写不同的文件名，直接挂载到宿主机不仅存在文件覆盖风险，还会导致 UID/GID（`1000:1000`）权限错乱以及大量小文件 IO 变慢。
     - 正确做法是把 `/home/test` 迁入 **OrbStack 的 Linux ext4 命名卷**（`ub-env_home-test`），保持原生区分大小写和完整权限。
     - 同时在 `docker-compose.yml` 里把该卷声明为 `external: true`——这是一个极实用的防手滑技巧：哪怕以后误敲了 `docker-compose down -v`，这个外部命名卷也不会被顺带删掉。
- **验证**：使用原有私钥 `ssh -p 2222 -i ~/.ssh/ub-env-test_ed25519 test@127.0.0.1` 一次直连成功，家目录和环境分毫不差。

## 四、空间大扫除：回收 12.55 GB 与排查旧 Docker 残留

等 4 个项目在 OrbStack 中稳定运行并通过全面核验后，才开始收尾清理工作。

### 1. 清空 Apple Container 数据并停服（回收约 12.55 GB）

依次清理容器、构建器、镜像、数据卷和自定义网络，再停止后台服务：

```bash
# 清理容器、构建器、镜像、数据卷与网络
container prune
container builder delete
container image prune --all
container volume prune
container network prune

# 停止 Apple Container 后台服务并注销 launchd
container system stop
```

各部分实际回收空间相当可观：

| 清理项 | 回收空间 | 说明 |
| --- | --- | --- |
| 5 个容器可写层 | `6.37 GB` | `container prune` |
| 4 个镜像及相关层 | `5.82 GB` | `container image prune --all` |
| 3 个持久化数据卷 | `340.4 MB` | `container volume prune` |
| 滞留临时拉取缓存 | `16 MB` | `content/ingest` 中数月前中断遗留的临时目录 |
| **合计** | **约 `12.55 GB`** | 数据目录从 `12 GB` 骤降至 `15 MB` |

> [!TIP]
> `prune` 跑完后建议顺手 `du -sh ~/Library/Application\ Support/com.apple.container/*` 看一眼。这次就顺藤摸瓜在 `content/ingest` 里翻出一个几个月前拉镜像中断留下的 `16 MB` 临时目录，删掉后整个数据目录就只剩下 `15 MB` 的默认 Linux 内核（`vmlinux`）了。

### 2. 清理历史 Docker Desktop 残余（注意避雷 `~/.docker`）

之前卸掉 Docker Desktop 时，通常会在用户 `Library` 下留下几处零散目录，这次一并清掉了（合计约 `216 KB`）：

- `~/Library/Application Support/Docker Desktop`（`156 KB`）
- `~/Library/Group Containers/group.com.docker`（`56 KB`）
- `~/Library/Preferences/com.electron.dockerdesktop.plist`（`4 KB`）
- `~/Library/Application Scripts/group.com.docker`（`0 B`）

> [!WARNING]
> 清理旧 Docker 残留时，**千万不要顺手删掉 `~/.docker`**！OrbStack 同样依赖 `~/.docker/config.json` 来维护当前上下文（`"currentContext": "orbstack"`）与 CLI 插件配置，删掉会导致 `docker` 命令找不到上下文。

## 五、Apple Container 本体（333.8 MB）到底值不值得卸载？

清空完 12.55 GB 数据后，我也犹豫过要不要顺手把 Apple Container CLI 本体彻底卸了。用 `pkgutil --files com.apple.container-installer` 盘了一遍账，数字非常透明：

- **程序本体**：`318.4 MB`（包含 `/usr/local/bin/container`、`container-apiserver` 及 `/usr/local/libexec/container` 下的 4 个插件二进制）。
- **默认内核**：`15.4 MB`（位于 `~/Library/Application Support/com.apple.container`）。
- **总计**：约 **`333.8 MB`**；执行 `container system stop` 后，经 `launchctl list` 核验后台零常驻进程，不占内存也不耗电。

权衡下来，我的决定是**先留着不卸**：在剩余 112 GiB 硬盘空间面前，334 MB 几乎无感，留着一个“零开销、随时可唤醒”的苹果官方容器运行时，偶尔想做跨运行时对比测试也很方便。如果以后真决定彻底清理，官方其实自带了一条一键卸载脚本，执行即可连同 `pkgutil` 注册记录和默认内核全部清除：

```bash
/usr/local/bin/uninstall-container.sh -d
```

## 六、写在最后：给本地 Docker 目录配一份 `OPS_LOG.md`

最后顺手养成一个小习惯：在存放所有 Compose 项目的根目录（例如 `~/Project/Docker/`）下新建并长期维护一份 **`OPS_LOG.md`**，按时间倒序记录每一次大迁移、端口调整、特殊约束和空间清理。

别小看这份几百字的文档——半年后当你需要升级某个镜像或者重建容器时，一眼就能看到：

- 为什么 `ac-downloader` 锁了 `pull_policy: if_not_present`；
- 为什么 `ub-env` 的命名卷被标成了 `external: true` 以及怎么备份；
- 哪些旧配置做过备份、留在哪个文件名里。

容器工具可以换，但把运行时的“隐性知识”沉淀进清晰的编排文件和运维日志，才是本地开发环境下一次无缝迁移的最大底气。
