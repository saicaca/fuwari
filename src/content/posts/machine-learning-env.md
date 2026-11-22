---
title: 机器学习环境配置
published: 2025-10-28
updated: 2026-09-17
description: 分享我在无 root 权限的服务器上用 micromamba 搭建轻量、隔离的机器学习环境，并接入远程 VS Code 与按目录自动切换环境的实践记录。
tags: [conda, micromamba, python, ml, linux, vscode, env-setup]
category: 环境与系统
draft: false
device: Windows
---

平时在没有 root 权限的实验室或算力服务器上跑机器学习项目，环境管理一直是个绕不开的活。下面整理一下我自己在用的这套轻量方案：用 `micromamba` 替代完整版 Conda，接入远程 VS Code 的 Python 环境管理，再配合一套按目录自动激活环境的 Shell 脚本。

## 为什么选 micromamba

`micromamba` 是一个兼容 Conda 生态、默认走 `conda-forge` channel 的环境管理器。跟完整版的 Anaconda/Miniconda 相比，放在无 root 权限、且需要控制磁盘占用的服务器上，它有几个特别实在的好处：

1. 本身是静态链接的 C++ 单文件可执行程序，装完就能直接跑；
2. 默认走 `conda-forge` channel，常用科学计算和机器学习包的覆盖面很广；
3. 全程不需要 root 权限，安装和卸载都在自己的用户目录下搞定；
4. 安装体积非常克制，特别适合空间紧张的服务器环境。

除了 Python 之外，`micromamba` 同样可以用来装和管理 JDK、Node.js 甚至 CUDA 等 Conda 包——当然，要不要把这些都塞进 Conda 环境里，还是要看具体项目的需求来定。

> [!TIP]
> 现在完全可以用 Conda / micromamba 来统一安装、管理和隔离 JDK、Node.js，甚至 CUDA 环境。

## 安装与更新 micromamba

> [!NOTE]
> 这里直接使用官方安装脚本，不依赖 Homebrew。

详细的安装参数和选项可以参考 [micromamba 官方文档](https://mamba.readthedocs.io/en/latest/installation/micromamba-installation.html "点击跳转")。在 macOS、Linux 或 Windows 的 Git Bash 下，一条命令就能装好：

```shell
"${SHELL}" <(curl -L micro.mamba.pm/install.sh)
```

后续想要升级到最新版本也很省事，直接自更新即可：

```shell
micromamba self-update
```

## 接入远程 VS Code 环境管理

平时写代码主要靠 VS Code Remote SSH 连服务器。只要装好 **Python** 和 **Python Environments** 这两个扩展，就可以让远程 VS Code 直接把 `micromamba` 当成 Conda 兼容的环境管理器来识别和调用。具体配置分两层：一层是跟服务器路径绑定的远程主机设置，另一层是放进项目仓库的项目设置。

### 远程主机设置

通过 Remote SSH 连上服务器后，打开命令面板执行 `Preferences: Open Remote Settings (JSON)`。对应的远程配置文件通常位于：

```text
~/.vscode-server/data/Machine/settings.json
```

在里面加上这两项：

```json
{
  "python-envs.defaultEnvManager": "ms-python.python:conda",
  "python.condaPath": "~/micromamba/micromamba"
}
```

这里的 `python.condaPath` 必须指向远程服务器上真正的 `micromamba` 可执行文件。如果你当初修改了安装路径，可以先在终端里查一下确认位置：

```shell
command -v micromamba
```

> [!IMPORTANT]
> 示例里刻意用了 `~` 表示当前用户的 home 目录，避免在共享配置、截图或文章中暴露真实用户名。写配置时尽量不要硬编码 `/home/<username>/...` 或其他带有个人账号信息的绝对路径。

### 项目设置

主机路径配好之后，再去项目根目录下创建或修改 `.vscode/settings.json`：

```json
{
  "python-envs.pythonProjects": [
    {
      "path": ".",
      "envManager": "ms-python.python:conda",
      "packageManager": "ms-python.python:conda"
    }
  ]
}
```

这段配置把当前目录声明为一个 Python 项目，并指定环境和包管理都走 Conda 兼容通道；真正干活的可执行文件，则由前面远程主机设置里的 `python.condaPath` 指向 `micromamba`。

> [!NOTE]
> `python.condaPath` 属于远程主机级配置，千万别提交到项目的 `.vscode/settings.json` 里。拆开来放，既不会泄露服务器目录结构，也能让不同协作者各自填自己的安装路径。

两处都保存后，执行一次 `Developer: Reload Window`，接着就能在 `Python: Select Interpreter` 或侧边栏的 Python Environments 面板里挑选环境了。如果刷新后环境列表还没出来，执行一遍 `Python Environments: Refresh All Environment Managers` 再试即可。

## 按目录自动加载 Conda 环境

在终端里来回切项目时，每次都手动 `conda activate` 挺烦人的。我写了一段放在 `~/.zshrc` 或 `~/.bashrc` 里的辅助脚本，从 `~/.conda_map.ini` 读取“目录路径 -> 环境名”的映射关系，做到**每次新建终端时按当前所在目录自动激活对应环境**。

这套逻辑采用最长路径前缀匹配：如果当前子目录没有单独配置映射，会自动沿用父目录绑定的环境；如果你在同一个终端里 `cd` 到了别处，随时敲一下脚本里注册的 `ac` 别名就能手动重新匹配并激活最合适的环境。

Zsh 用户直接把下面这段放进 `~/.zshrc`：

```shell collapse={5-100}
<!-- ~/.zshrc -->
# --- 自动按路径激活 micromamba 环境（从 ~/.conda_map.ini 读取） ---
_load_auto_map() {
    local file="$HOME/.conda_map.ini"
    typeset -gA AUTO_ACTIVATE_MAP
    [[ -f "$file" ]] || return
    local line key val
    while IFS= read -r line || [[ -n "$line" ]]; do
        # 删除注释（# 或 ;）和首尾空白
        line="${line%%[#;]*}"
        line="${line#"${line%%[![:space:]]*}"}"
        line="${line%"${line##*[![:space:]]}"}"
        [[ -z "$line" ]] && continue
        if [[ "$line" == *=* ]]; then
            key="${line%%=*}"
            val="${line#*=}"
            key="${key#"${key%%[![:space:]]*}"}"; key="${key%"${key##*[![:space:]]}"}"
            val="${val#"${val%%[![:space:]]*}"}"; val="${val%"${val##*[![:space:]]}"}"
            AUTO_ACTIVATE_MAP[$key]="$val"
        fi
    done < "$file"
}

_find_env_for_dir() {
    local pwd="$PWD"
    local best_prefix=""
    local best_env=""
    local prefix
    for prefix in "${(@k)AUTO_ACTIVATE_MAP}"; do
        # 确保以目录前缀匹配（支持不带斜杠的写法）
        if [[ "${pwd%/}" == "${prefix%/}"* ]]; then
            if (( ${#prefix} > ${#best_prefix} )); then
                best_prefix="$prefix"
                best_env="${AUTO_ACTIVATE_MAP[$prefix]}"
            fi
        fi
    done
    printf '%s' "$best_env"
}

_auto_activate_on_cd() {
    _load_auto_map
    local target_env cur_env
    target_env="$(_find_env_for_dir)"

    cur_env="${CONDA_DEFAULT_ENV:-}"
    if [[ -z "$cur_env" && -n "$CONDA_PREFIX" ]]; then
        cur_env="$(basename "$CONDA_PREFIX")"
    fi

    if [[ -n "$target_env" ]]; then
        if [[ "$cur_env" != "$target_env" ]]; then
            conda activate "$target_env" >/dev/null 2>&1 || true
        fi
    else
        if [[ -n "$cur_env" && "$cur_env" != "base" ]]; then
            conda deactivate >/dev/null 2>&1 || true
        fi
    fi
}
_auto_activate_on_cd
alias ac=_auto_activate_on_cd
# ac 来手动激活对应环境（前缀匹配激活，子文件夹都可用）
# --- 结束 自动激活 ---
```

如果服务器上默认用的是 Bash，对应的 `~/.bashrc` 版本如下：

```shell collapse={5-100}
<!-- ~/.bashrc -->
# --- 自动按路径激活 micromamba 环境（从 ~/.conda_map.ini 读取） ---
_load_auto_map() {
    local file="$HOME/.conda_map.ini"
    # 使用全局关联数组
    declare -gA AUTO_ACTIVATE_MAP=()
    [[ -f "$file" ]] || return
    local line key val
    while IFS= read -r line || [[ -n "$line" ]]; do
        # 删除注释（# 或 ;）和首尾空白
        line="${line%%[#;]*}"
        line="${line#"${line%%[![:space:]]*}"}"
        line="${line%"${line##*[![:space:]]}"}"
        [[ -z "$line" ]] && continue
        if [[ "$line" =~ ^([^=]+)=(.+)$ ]]; then
            key="${BASH_REMATCH[1]}"
            val="${BASH_REMATCH[2]}"
            key="${key#"${key%%[![:space:]]*}"}"; key="${key%"${key##*[![:space:]]}"}"
            val="${val#"${val%%[![:space:]]*}"}"; val="${val%"${val##*[![:space:]]}"}"
            AUTO_ACTIVATE_MAP["$key"]="$val"
        fi
    done < "$file"
}

_find_env_for_dir() {
    local pwd="$PWD"
    local best_prefix=""
    local best_env=""
    local prefix
    for prefix in "${!AUTO_ACTIVATE_MAP[@]}"; do
        # 确保以目录前缀匹配（支持不带斜杠的写法）
        if [[ "${pwd%/}" == "${prefix%/}"* ]]; then
            if (( ${#prefix} > ${#best_prefix} )); then
                best_prefix="$prefix"
                best_env="${AUTO_ACTIVATE_MAP[$prefix]}"
            fi
        fi
    done
    printf '%s' "$best_env"
}

_auto_activate_on_cd() {
    _load_auto_map
    local target_env cur_env
    target_env="$(_find_env_for_dir)"

    cur_env="${CONDA_DEFAULT_ENV:-}"
    if [[ -z "$cur_env" && -n "$CONDA_PREFIX" ]]; then
        cur_env="$(basename "$CONDA_PREFIX")"
    fi

    if [[ -n "$target_env" ]]; then
        if [[ "$cur_env" != "$target_env" ]]; then
            conda activate "$target_env" >/dev/null 2>&1 || true
        fi
    else
        if [[ -n "$cur_env" && "$cur_env" != "base" ]]; then
            conda deactivate >/dev/null 2>&1 || true
        fi
    fi
}
_auto_activate_on_cd
alias ac=_auto_activate_on_cd
# ac 来手动激活对应环境（前缀匹配激活，子文件夹都可用）
# --- 结束 自动激活 ---
```

## 验收与收尾要点

整套配置跑通之后，回头确认这三件事基本就算稳了：

1. 在没有 root 权限或需要控制磁盘占用的服务器上，用 `micromamba` 管 Conda 环境足够轻量且省心；
2. 远程 VS Code 里把 `python.condaPath` 指到 `micromamba`，再在项目里指定 Conda 环境管理器，就能顺畅完成环境发现、切换和包管理；
3. 与主机强绑定的路径留在远程 Machine 设置里，项目仓库的 `.vscode/settings.json` 只放可共享配置，既干净又避免暴露用户名和服务器目录结构。
