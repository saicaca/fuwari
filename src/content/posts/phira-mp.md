---
title: Phira多人联机服务器搭建/使用教程
published: 2024-11-06
description: '懒人可以直接下载预构建的可执行文件，但如果想获得日志需要自备Rust环境'
image: "https://oss.onani.cn/fuwari-blog/img/2024-11-06-08-20-39-image.webp"
tags: [Phira]
category: '教程'
draft: false 
lang: ''
---

# 直接下载服务端文件并运行

::github{repo="afoim/phira-mp-autobuild"}

这里有一些由Github Action自动构建的服务端文件，涵盖以下系统和架构![](https://oss.onani.cn/fuwari-blog/img/2024-11-06-08-28-34-image.webp)

也可以前往[Multiplayer Server | Dmocken的Phira下载站](https://phira.dmocken.top/Multiplayer%20Server)自行寻找

寻找适用于你的系统的文件，下载下来并执行即可。默认服务端将会在你的主机12346端口上开放，如果需要自定义端口，请使用`--port`参数指定端口。然后即可使用Phira来填写IP/域名:端口来连接

---

**因为phira-mp使用Rust自带的Log模块，所以如果你需要日志，请自行安装Rust。** 关于Rust的各平台详细安装教程请前往[自行构建（高级）](#%E8%87%AA%E8%A1%8C%E6%9E%84%E5%BB%BA%E9%AB%98%E7%BA%A7)继续阅读。确保你已经安装Rust环境后可以使用`RUST_LOG=info phira-mp的服务端`来获得日志

如果这些文件不适用于你正在使用的系统请前往[自行构建（高级）](#自行构建高级)继续阅读

# 自行构建（高级）

由于phira-mp使用Rust编写，若想要自行构建需要在你的操作系统上安装Rust环境

## 对于Windows

前往[Rust 下载页](https://www.rust-lang.org/zh-CN/learn/get-started)，下载 Rust  ![](https://oss.onani.cn/fuwari-blog/img/2024-11-06-09-57-44-6b333b87e835dfa299b0c3c95e5ea4e0.webp)
打开后会弹出一个 CMD 窗口，输入 1（Quick Install）回车，等待 Visual Studio 安装（如果此步 Visual Studio 下载很慢也可以[手动下载](https://visualstudio.microsoft.com/zh-hans/downloads/)）  

![](https://oss.onani.cn/fuwari-blog/img/2024-11-06-09-57-49-61b4d36dc8cd1ce47da66be5e2a920cd.webp)在 Visual Studio 中，勾选**使用 C++ 的桌面开发**，然后安装  
![](https://oss.onani.cn/fuwari-blog/img/2024-11-06-09-58-05-390c775c83dc245b0690fda699bfee5f.webp)然后请跳过 Linux 教程直接阅读[构建 phira-mp]()

## 对于Linux

执行：`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

选择 1 回车

执行：`source $HOME/.cargo/env`

# 使用Rust构建phira-mp

克隆仓库：`git clone https://github.com/TeamFlos/phira-mp.git`（不支持IPv6）或`git clone https://github.com/afoim/phira-mp-autobuild.git`（支持IPv6）

`cd phira-mp`或`cd phira-mp-autobuild`

更新依赖：`cargo update`

构建：`cargo build --release -p phira-mp-server`

运行程序并将 log 打印到终端，会显示你监听的端口：`RUST_LOG=info target/release/phira-mp-server`  
（如果你需要指定端口号：`RUST_LOG=info target/release/phira-mp-server --port 8080`）

![](https://oss.onani.cn/fuwari-blog/img/2024-11-06-10-14-36-0dce4358b21773ae1261e7fc39339c32.webp)
