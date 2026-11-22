---
title: Python 环境配置
published: 2025-08-08
description: 分享一段 Python 环境配置视频，顺便聊聊 Miniconda、conda-forge、mamba 和 micromamba 各自的适用场景。
tags: [conda, python, env-setup]
category: 环境与系统
draft: false
device: Windows
---

这篇短文主要留存一段 Python 环境配置的视频，顺带记一下我自己用下来的工具选型思路。如果你刚好要在没有 root 权限的服务器上折腾环境，可以直接跳过大块头，改用体积更小的 `micromamba`。

## 介绍视频

<div style="position: relative; width: 60%; aspect-ratio: 16/9; border-bottom: 20px solid #ffffff00;">
    <iframe src="https://player.bilibili.com/player.html?bvid=BV1Fm4ZzDEeY"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
        scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true">
    </iframe>
</div>

## 我的选择建议

几个工具定位其实挺清晰的，按自己的使用环境对号入座就行：

1. 想省心获得完整的 Conda 体验，直接上 `Miniconda` 就好，代价就是安装包和依赖求解过程相对重一些。
2. 如果平时已经在用 `conda-forge` 频道，不妨配合 `mamba` 来明显提速依赖求解。
3. 碰到没有 root 权限的机器，或者单纯不想占太多磁盘空间，优先选 `micromamba`。
