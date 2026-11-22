---
title: 用 Tailcat 搭建免账号的 SSH 穿透通道
published: 2026-11-03
description: Tailcat 是 Tailscale 官方拆出来的轻量小工具，免账号、免 root、不开放入站端口，服务端起个进程、本机一条命令就能直连 SSH。这里分享 Linux/macOS/Windows 三端的安装、常驻、固定地址以及指定私钥和隧道身份的实操写法。
tags: [tailcat, ssh, tooling, guide, linux, macos, windows]
category: 环境与系统
draft: false
device: MacBook Pro
---

最近在几台机器之间来回跳，试用了一圈 [Tailcat](https://github.com/tailscale/tailcat)，发现比想象中省事得多。它是 Tailscale 官方从自家开源代码里拆出来的小工具，定位就是「能穿透 NAT 的 netcat」：不用注册 Tailscale 账号，没有控制平面，也不需要 root 权限，进程完全跑在用户态，既不动路由表，也不改 DNS。

它的工作方式非常直白：一端执行 `serve`，吐出一串 `tc...` 地址；另一端拿着这串地址直接 `ssh` 过去就行。底层全走 WireGuard 加密，先借 DERP 中继完成打洞握手，只要双方网络允许直连，就会自动升级成点对点 UDP。

下面把我自己在 Linux 服务器、Windows 服务器和 macOS 本机上配通的完整步骤整理出来，顺便标出几个实际配置时真容易踩到的坑。

## 它和 Tailscale 有什么区别

很多人第一次看到会疑惑：既然都是 Tailscale 出品，那它和 Tailscale 到底差在哪？用一张表就能看明白：

| | Tailscale | Tailcat |
|---|---|---|
| 需要账号 | 是 | 否 |
| 需要控制平面 | 是 | 否，靠带外交换地址 |
| 需要 root | 通常需要（建网卡、改路由） | 不需要，纯用户态 |
| 节点寻址 | 100.x.y.z 稳定 IP | 一次性 `tc...` 地址或 DNS TXT |
| 典型用法 | 组网、访问内网全部服务 | 把某个端口 / SSH 打通 |

所以它并不是用来替代整套内网组网方案的，而是专门服务于「我就想临时或定点连上这一台机器」的场景。另外要记住一件事：**那串地址本身就是凭证**，后面配安全策略时会反复绕回这一点。

## 三端安装方式

### Linux 服务器

动手前先确认一下机器架构，`x86_64` 对应 `amd64`，`aarch64` 对应 `arm64`：

```bash
uname -m
```

Debian / Ubuntu 直接拉 Release 里的 `.deb` 包安装：

```bash
curl -LO https://github.com/tailscale/tailcat/releases/download/v0.7.0/tailcat_0.7.0_linux_amd64.deb
sudo apt install ./tailcat_0.7.0_linux_amd64.deb
```

其他发行版或环境按习惯选一种就行：

- Fedora / RHEL：下载对应 `.rpm`，执行 `sudo dnf install ./tailcat_*.rpm`
- Arch：`yay -S tailcat`（AUR）
- 装了 snapd：`sudo snap install tailcat`
- 有 Go 工具链：`go install github.com/tailscale/tailcat/cmd/tailcat@latest`

注意这里的 `sudo` 只是装系统包时用一下，后面真正跑 `tailcat` 全程不需要 root。

### Windows 服务器

如果机器上已经装了 Scoop，在 PowerShell 里一行就能搞定：

```powershell
scoop install tailcat
```

没有 Scoop 也没关系，直接下压缩包解压出来：

```powershell
# ARM 机器把 amd64 换成 arm64
curl.exe -LO https://github.com/tailscale/tailcat/releases/download/v0.7.0/tailcat_0.7.0_windows_amd64.zip
Expand-Archive tailcat_0.7.0_windows_amd64.zip -DestinationPath $env:USERPROFILE\bin -Force
```

解压完记得把 `%USERPROFILE%\bin` 加进用户环境变量 `Path`，方便后续直接调用。

### 本机（macOS）

macOS 上直接走 Homebrew 最省心：

```bash
brew install tailcat
```

## 先跑通最简路径

第一次上手可以先跑一遍无认证模式验证链路。在服务器上启动：

```bash
tailcat serve no-auth-ssh
```

终端会吐出类似下面这样一串地址：

```text
🐈 Server listening with new address: tcFwWCCcjS5nKNqAod034nWoJZW0LZqDhhC8U_dKdnDRYQ8uNGFpGQEu
```

回到本机，拿这串地址直接连：

```bash
tailcat ssh tcFwWCCcjS5nKNqAod034nWoJZW0LZqDhhC8U_dKdnDRYQ8uNGFpGQEu
```

敲完回车直接就拿到 shell 了，连 Windows 服务器进去默认就是 PowerShell。

这一步用的是 tailcat **自带的 SSH 服务端**，所以目标机器上根本不用装、也不用跑 sshd，防火墙更不需要放行 22 端口。

> [!WARNING]
> 用 `no-auth-ssh` 时，地址本身就是密码。任何拿到这串 `tc...` 的人都能直接以运行 tailcat 的用户身份登进机器，Windows 上还会直接拿到一个 PowerShell。只通过私密渠道传给自己，千万别写进 DNS TXT、发到群里，更别顺手贴进公开 issue。

## 日常推荐：加上公钥认证

真正长期用肯定不能裸奔。我们依然用内置的 SSH 服务端，但改成要求客户端出示公钥：

```bash
tailcat serve --ssh-authorized-keys=~/.ssh/authorized_keys ssh
```

`--ssh-authorized-keys` 这个参数挺灵活，支持用逗号分隔同时指定多种来源：

- 本地 `authorized_keys` 文件路径
- 直接内联写一行 OpenSSH 公钥
- `用户名@github`，启动时自动去 `https://github.com/用户名.keys` 拉取公钥

比如这样混着写也没问题：

```bash
tailcat serve --ssh-authorized-keys=bradfitz@github,./contractor.pub ssh
```

而且它做得很严谨：每个来源在启动时都必须存在且能正常解析，只要有一个不对，进程会直接退出——这可比「静默起了一个谁也登不上去的服务」好排查多了。

> [!NOTE]
> 这里只认**普通公钥行**。`authorized_keys` 里带 `command=`、`from=` 这类限制选项的行会被直接拒绝，因为内置服务端并没有实现这些特性。OpenSSH CA 签发的证书目前也没有文档支持，老老实实用普通公钥就行。

客户端连法和之前完全一样，不用多加参数：

```bash
tailcat ssh tcFwWCCcjS5nKNqAod034n...
```

## 让服务端在后台常驻

### Linux：配一个 systemd 用户服务

Linux 下完全不用动系统级配置，也不用 root，直接写一份 user unit 挂起来就好：

```bash
mkdir -p ~/.config/systemd/user
cat > ~/.config/systemd/user/tailcat-ssh.service <<'EOF'
[Unit]
Description=Tailcat SSH
After=network-online.target

[Service]
ExecStart=%h/.local/bin/tailcat serve --ssh-authorized-keys=%h/.ssh/authorized_keys ssh
Restart=always

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable --now tailcat-ssh
loginctl enable-linger $USER
```

如果你前面是用 `.deb` 或 `.rpm` 装的，把 `ExecStart` 里的路径换成 `/usr/bin/tailcat`。

这里最容易漏掉的是最后那句 `loginctl enable-linger $USER`：不开 linger 的话，你一退出当前登录会话，用户级 systemd 就会被系统回收，服务也跟着停了。

平时看运行日志直接敲 `journalctl --user -u tailcat-ssh -f`。

### Windows：用任务计划程序，别注册成系统服务

Windows 这边有一个实打实的坑：**千万别把它注册成 Windows 服务**。tailcat 内置的 SSH 服务端跑交互式会话依赖 ConPTY，必须挂在真实的用户会话上；系统服务跑在隔离的 Session 0 里，既拿不到控制台，也拿不到用户的环境变量和家目录，就算连上也是残废的 shell，缺一堆东西。

正确做法是用「任务计划程序」，并且务必勾选 **「只在用户登录时运行」**：

- 触发器：登录时
- 操作：程序填 `C:\Users\你\scoop\shims\tailcat.exe`，参数填 `serve --ssh-authorized-keys=C:\Users\你\.ssh\authorized_keys ssh`
- 不要勾选「不管用户是否登录都要运行」，勾了同样会破坏交互式会话

## 固定住这串 `tc...` 地址

默认每次重启 `serve` 都会生成一把新的一次性密钥，进程一退，老地址就永久作废。如果你想把地址固定下来，先生成一把持久化密钥：

```bash
tailcat genkey --key=default --fixed-region
```

命令会打印出固定的地址，同时把密钥存到 `~/.config/tailcat/keys/default.private.json`。以后再起 `serve` 就会自动复用它，启动日志也会变成：

```text
🐈 Server listening with saved key "default": tcXXXXXXXXX
```

这里的 `default` 是个有特殊含义的名字：只要它存在，裸跑 `tailcat serve` 就会默认加载它。哪天想临时切回一次性地址，带上 `--key=new` 就行。

> [!CAUTION]
> 固定地址就意味着它成了长期凭证——任何曾经见过这串地址的人，以后每次 `serve` 都能尝试连上来。因此固定地址时务必配好 `--ssh-authorized-keys`，或者再在隧道层用 `--allow` 锁死允许接入的客户端公钥。

想作废重来也很干脆，直接删掉或列出检查：

```bash
tailcat genkey --delete --key=default
tailcat genkey --list
```

## 怎么指定特定的 SSH 私钥

这一块是我实际配置时卡得最久的地方。原因在于 `tailcat ssh` 的参数语法长这样：

```text
tailcat ssh [-p <port|ip:port>] [user@]<tc-addr> [<command> [args...]]
```

它会把目标地址（destination）**后面的所有参数原样转交给远端命令**，而且内部在 destination 之前就已经插了 `--`。所以顺手按平时用 `ssh` 的习惯去加 `-i`，下面这两种写法全都会翻车：

```bash
tailcat ssh tcXXX -i ~/.ssh/work_ed25519   # ✗ 被当作远端命令
tailcat ssh -i ~/.ssh/work_ed25519 tcXXX   # ✗ tailcat 不认 -i
```

顺便提醒一句，`-p` 在 `tailcat ssh` 里也不是普通 SSH 客户端的含义，它指代的是 **tailcat 服务端侧的端口**（默认 22），或者在 exit-node 模式下指向服务器所在网络里的 `ip:port`。

要指定私钥，有三种稳妥的写法，按场景挑就行：

### 方法一：丢给 ssh-agent

`tailcat ssh` 底层最终调的还是系统自带的 `ssh`，所以只要私钥加载进了 agent，认证时自然会被带上：

```bash
ssh-add ~/.ssh/work_ed25519
tailcat ssh tcXXX
```

临时连一下的时候，这是最省事的办法。

### 方法二：写进 `~/.ssh/config`（长期用最顺手）

既然 `tailcat ssh` 本质上就是「系统 ssh + 一条 ProxyCommand」，我们完全可以自己把这条 `ProxyCommand` 写进 `~/.ssh/config`，这样 OpenSSH 的所有参数就全解锁了：

```ini
Host mybox
    HostName tailcat                    # 只是个标签，不参与解析
    ProxyCommand tailcat tcFwWCCcjS5nKNqAod034n... 22
    IdentityFile ~/.ssh/work_ed25519
    IdentitiesOnly yes
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
```

配好之后，日常所有基于 SSH 的操作都能无缝衔接：

```bash
ssh mybox
ssh mybox "uname -a"
scp file mybox:/tmp/
```

连 `scp` 也能直接跑通，因为它走的就是同一条 ProxyCommand。另外强烈建议顺手把 `IdentitiesOnly yes` 加上，不然 ssh 会把你本地一堆 key 挨个拿去试，很容易撞上服务端的认证次数上限。

### 方法三：单条命令临时内联

不想改配置文件的话，直接把 `-o` 选项全拼在命令行里也行：

```bash
ssh -i ~/.ssh/work_ed25519 \
    -o IdentitiesOnly=yes \
    -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    -o "ProxyCommand=tailcat tcFwWCCcjS5nKNqAod034n... 22" \
    mybox
```

末尾的 `mybox` 随便写什么名字都行，实际连接目标完全由 `ProxyCommand` 决定。

## 隧道身份：再加一层独立的「密钥」

前面讲的都是「SSH 层认证」，其实 tailcat 在底层还有一层「隧道层认证」，两层彼此独立，可以叠加。

先在客户端生成一对客户端身份密钥：

```bash
tailcat genkey --client --key=client-default
```

生成后会打印出对应的公钥，格式类似 `nodekey:cfb6bfa77a...`。接着在服务器端用 `--allow` 指定只放行这个客户端：

```bash
tailcat serve --allow=nodekey:cfb6bfa77a... --ssh-authorized-keys=~/.ssh/authorized_keys ssh
```

客户端这边平时不用多打参数——只要 `client-default` 存在就会自动启用。如果你建了别的名称或者想显式指向某个密钥文件，可以这样写：

```bash
tailcat --key=myclient ssh tcXXX
tailcat --key=~/.config/tailcat/keys/myclient.private.json ssh tcXXX
```

踩坑提醒：`--key` 是一个**全局 flag，必须放在子命令前面**，放到 `ssh` 后面不会生效。

想随时确认当前生效的是哪把公钥，敲一句：

```bash
tailcat printpub
```

把这两层认证叠起来之后，就算 `tc...` 地址不小心漏了，对方也必须同时手握被允许的隧道客户端身份和 SSH 私钥才能进来，安全水位才算真正立得住。

## 几个容易忽略的实操细节

实际用了一阵子，这几个行为特点我觉得很有必要提前心里有数：

**默认不做 host key 校验。** `tailcat ssh` 在内部固定塞了这三项参数：

```text
-o StrictHostKeyChecking no
-o UserKnownHostsFile /dev/null
-o UpdateHostKeys no
```

在它自己的信任模型里这么做是说得通的——毕竟 WireGuard 层已经对对端做了加密认证，host key 不再是唯一凭据。但如果你平时习惯盯着指纹确认服务器身份，至少要知道这里跳过了这一步。

**只要能出站，不用动入站防火墙。** 网络层面只需要放行出站 UDP（给 NAT 打洞用）和 TCP 443（连 DERP 中继用），大多数云厂商的默认安全组根本不用改。

**连不上或者觉得卡，先测一下链路。**

```bash
tailcat ping tcXXX
```

输出会明确告诉你当前走的是 `direct` 还是 `DERP`。如果一直落回 DERP，吞吐会被共享中继的限速卡住，不过敲敲终端的延迟通常还能接受。

**公共中继是有速率限制的。** 打洞失败后默认会回退到 `tailcat.dev` 提供的官方公共 DERP，属于共享限速资源。如果你对带宽有硬需求，可以自己搭一个 [derper](https://github.com/tailscale/tailscale/tree/main/cmd/derper)，然后两端统一用 `--derpmap-url` 指过去。

**Windows 里的权限跟着启动方式走。** 你用普通 PowerShell 起 `tailcat`，连进去就是普通用户；用「以管理员身份运行」起，远程拿到的会话就是提权状态。因为远程终端里没法弹 UAC，想要管理员权限只能在启动那一步就决定好。

**登录身份直接绑定运行进程的用户。** 家目录、环境变量全是跑 `tailcat` 那个账户的。Linux 上想要 root 就得用 root 跑；Windows 上如果试图用 SYSTEM 跑，就别指望能拿到正常的交互式 shell 了。

## 顺手还能用来干别的

除了 SSH，同一条隧道顺手就能包办端口转发和传文件，省得再搭别的工具：

```bash
# 把服务器 8080 映射到本地 18080
tailcat forward tcXXX 18080:8080

# 打开服务器上的网页
tailcat browse tcXXX

# 传文件（服务器端先 tailcat recv ~/inbox）
tailcat cp report.pdf tcXXX:

# 测吞吐和延迟
tailcat perf tcXXX
```

比如连 Windows 服务器时，顺手把 RDP 3389 映射出来就特别方便：

```bash
tailcat forward tcXXX 13389:3389
```

要是你连这台 Windows 主要就是为了远程桌面操作，直接在服务端跑 `tailcat serve 3389`，其实比绕 SSH 更直接。

## 我现在在用的一套完整配置

最后给出一套可以直接照抄的落地方案。服务端（Linux 和 Windows 命令通用）：

```bash
tailcat genkey --key=default --fixed-region
tailcat serve --allow=nodekey:<客户端公钥> \
              --ssh-authorized-keys=~/.ssh/authorized_keys ssh
```

本机 `~/.ssh/config`：

```ini
Host mybox
    ProxyCommand tailcat tc固定地址 22
    IdentityFile ~/.ssh/work_ed25519
    IdentitiesOnly yes
```

配完之后，日常就只剩一句 `ssh mybox`。固定地址、隧道身份白名单、SSH 公钥认证三层叠齐，不再指望「没人猜得到这串地址」来保平安。

对个人手里就几台机器的场景来说，这套东西的心智负担比拉整套 VPN 或者折腾 frp 小太多了：服务端一个监听端口都不用开，客户端平时没有常驻进程，地址用完或者怀疑泄露，随时删掉重来就是了。
