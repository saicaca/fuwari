---
title: 使用ArchiSteamFarm进行Steam自动挂卡
published: 2024-12-18
description: ''
image: "https://oss.onani.cn/fuwari-blog/img/QmPEHve8DdVZdwxAZ26BPgbc6cDCBaKC76VVijqVoMBY2k"
tags: [Steam]
category: '小技巧'
draft: false 
lang: ''
---

# 可用的目标作业系统
Windows x86/Arm64
Linux x86/Arm64/Arm32
OS X x86/Arm64
（和其余任何可以获取有效 .NET Core 运行时的地方工作。基于Github仓库源码手动编译）

# 安装&使用 ArchiSteamFarm
https://github.com/JustArchiNET/ArchiSteamFarm

或前往Release：https://github.com/JustArchiNET/ArchiSteamFarm/releases/latest

下载你适用于你作业系统的可执行文件的压缩包

启动ArchiSteamFarm
等待终端输出WebUI地址，进入

添加机器人，简单配置即可

![image](https://oss.onani.cn/fuwari-blog/img/QmcoF7K5sTkd4CRGTZPmnLwheAHpSf68RkZTd4ZST41uXc)

如果你配置了Steam手机验证器，此时应该会弹出登录请求，允许它。然后前往终端界面输入 **Y** 并回车
此时终端应该输出：**成功以 XXXXXXXXXX 的身份登录。**


![image](https://oss.onani.cn/fuwari-blog/img/QmcuktSJjWFmufsLmrYRsbLa9ns7pvRXKWZ5EUyirasKt6)

如果此时登录的账号未被占用，则自动开始挂卡。

---

ASF并不会干扰你的正常使用Steam的行为，当账号被占用时，ASF会暂停挂卡，直到账号未被占用，这个过程是全自动的，无需手动干涉

---

ASF可以视为一个无头Steam客户端，它不仅能挂卡，还能做更多事情，详见：https://github.com/JustArchiNET/ArchiSteamFarm/wiki