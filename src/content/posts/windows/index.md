---
title: 新装windows系统后的配置
published: 2025-01-02
description: 新装windows系统后的配置
image: ./cover.jpg
tags: [windows]
category: Record
draft: false
---

# 安装Git
- 下载地址：[Git](https://git-scm.com/downloads/win)

# 配置GitHub SSH
1. 打开gitbash
2. 输入`ssh-keygen -t ed25519 -C "your_email@example.com"`
3. 将 SSH 密钥添加到 ssh-agent
   1. 管理员身份打开 powershell
   2. 输入`Get-Service -Name ssh-agent | Set-Service -StartupType Manual`
   3. 输入`Start-Service ssh-agent`
   4. 输入`ssh-add c:/Users/YOU/.ssh/id_ed25519`
4. 新增 SSH 密钥到 GitHub 帐户
    1. 输入`cat ~/.ssh/id_ed25519.pub | clip`

# 激活系统
- [仓库地址](https://github.com/massgravel/Microsoft-Activation-Scripts)

# 设置系统停止自动更新
1. 创建文件`stopUpdate.txt`
    ```txt
    Windows Registry Editor Version 5.00

    [HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings]
    "FlightSettingsMaxPauseDays"=dword:00001b58
    "PauseFeatureUpdatesStartTime"="2023-07-07T10:00:52Z"
    "PauseFeatureUpdatesEndTime"="2042-09-05T09:59:52Z"
    "PauseQualityUpdatesStartTime"="2023-07-07T10:00:52Z"
    "PauseQualityUpdatesEndTime"="2042-09-05T09:59:52Z"
    "PauseUpdatesStartTime"="2023-07-07T09:59:52Z"
    "PauseUpdatesExpiryTime"="2042-09-05T09:59:52Z"
    ```
2. 进入文件管理器，设置文件显示后缀名
3. 修改后缀名为`.reg`，双击导入注册表

# 系统设置
- 设置不休眠

# 参考文章
1. [分享一个无任何副作用的方法来禁止烦人的Win10/Win11自动更新](https://www.52txr.cn/2023/stop1011updata.html)
2. [生成新的 SSH 密钥并将其添加到 ssh-agen](https://docs.github.com/zh/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)
3. [新增 SSH 密钥到 GitHub 帐户](https://docs.github.com/zh/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)

