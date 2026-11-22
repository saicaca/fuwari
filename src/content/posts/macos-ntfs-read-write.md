---
title: macOS 读写 NTFS 移动硬盘：从只读 FSKit 到 macFUSE
published: 2026-07-17
description: 记录一次在 macOS 上识别只读 NTFS 移动硬盘，并通过 macFUSE 与 NTFS-3G 手动切换为可写挂载的完整实操与避坑经验。
tags: [macos, ntfs, storage, env-setup]
category: 环境与系统
draft: false
aigc: Codex
device: Mac
---

经常在 Windows 和 Mac 之间倒腾大文件的朋友大概都遇过这事：Windows 常用的 NTFS 移动硬盘插上 macOS 后，里面的文件都能正常看，但既不能新建、也不能修改和删除。前阵子我就把手里一块 `WD elements` 移动硬盘从系统默认的只读挂载，手动切成了 NTFS-3G 的可写挂载，这里把完整的操作链路和踩坑注意事项整理出来。

> [!IMPORTANT]
> 先划个重点：这不是“开启 macOS 原生 NTFS 写入”。我这次实测用的 `mount_ntfs` 来自 Homebrew 安装的 `ntfs-3g-mac`，底层依赖 macFUSE；macOS 系统自带的 NTFS 支持目前依然以只读为主。

## 这次实测的环境

先交代一下我手头的软硬件状态，方便你对照自己的机器：

- macOS 26.5.1
- Apple FSKit 默认只读挂载
- `ntfs-3g-mac 2022.10.3`
- macFUSE
- NTFS 分区：`/dev/disk8s1`
- 卷标：`WD elements`

这里一定要先提醒一句：磁盘编号会随着外设插拔顺序动态变化，`/dev/disk8s1` 只是我这次实测时的设备号。动手前务必先查清自己硬盘对应的编号，千万别照抄。

## 先确认 `mount_ntfs` 到底来自哪里

网上不少老教程写于较早的 macOS 版本（比如后面参考的那篇知乎文章测试于 macOS 10.13.6），那时候的写法容易让人误以为 `mount_ntfs` 是系统原生自带的可写驱动。在较新的 macOS 上，可千万别再这么理解了。

动手前先检查一下当前终端里 `mount_ntfs` 实际指向谁：

```bash
command -v mount_ntfs
readlink "$(command -v mount_ntfs)"
```

我这台机器的输出是：

```text
/opt/homebrew/sbin/mount_ntfs
../Cellar/ntfs-3g-mac/2022.10.3/sbin/mount_ntfs
```

可以看到，它实际上是 Homebrew 装出来的 NTFS-3G 包装脚本。等后面重新挂载完成，用 `mount` 查看时，文件系统类型也会从原来的 `ntfs` 变成 `macfuse`。

如果你执行上面命令时提示 `command not found: mount_ntfs`，说明还没装环境，先通过 Homebrew 把 macFUSE 和 NTFS-3G 装上：

```bash
brew tap gromgit/fuse
brew install --cask macfuse
brew install gromgit/fuse/ntfs-3g-mac
```

装完 macFUSE 后，按系统弹窗去“系统设置 → 隐私与安全性”里批准它的系统扩展，并在需要时重启电脑。千万别为了省事直接去关 SIP；如果 Apple 芯片 Mac 提示需要调整启动安全策略，老老实实以 [macFUSE 官方说明](https://github.com/macfuse/macfuse/wiki) 为准来操作。

## 第一步：识别 NTFS 分区与当前挂载状态

插上移动硬盘后，先列出外置磁盘，核对清楚目标分区的编号和信息：

```bash
diskutil list external
diskutil info /dev/disk8s1
```

确认 `/dev/disk8s1` 确实是那块移动硬盘后，再看一眼系统是怎么挂载它的：

```bash
mount | grep ntfs
```

我这边拿到的输出如下：

```text
/dev/disk8s1 on /Volumes/WD elements (ntfs, local, nodev, nosuid, read-only, noowners, noatime, fskit)
```

括号里这几个标记很关键：`ntfs` 说明文件系统类型，`read-only` 明确表示当前只读，`fskit` 说明走的是 macOS 的 FSKit 挂载路径，而 `noowners` 则表示不在该卷上做常规的所有者权限检查。

## 第二步：先卸载系统默认的只读挂载

要重新挂载，得先把系统自动挂上的只读卷卸下来。放心，卸载分区不会删数据，但动手前记得关掉正在读写或浏览这块硬盘的 Finder 窗口、终端和软件：

```bash
sudo umount /dev/disk8s1
```

也可以交给 Disk Utility 框架来卸：

```bash
diskutil unmount /dev/disk8s1
```

注意这只是把文件系统卸下来，并没有把物理硬盘弹出。设备节点依然在，紧接着就能重新挂载。

## 第三步：建一个空的挂载目录

我习惯在桌面上临时建一个挂载点，这里命名为 `md1`：

```bash
mkdir -p "$HOME/Desktop/md1"
```

挂载目录必须先建好且保持为空；如果路径里带空格，记得用双引号包起来。

## 第四步：以可写模式重新挂载

接下来用 `mount_ntfs` 把分区重新挂到刚才的目录下：

```bash
sudo mount_ntfs -o rw,nobrowse /dev/disk8s1 "$HOME/Desktop/md1"
```

简单解释下这几个参数：`rw` 表示请求读写模式；`nobrowse` 会阻止它作为普通外置卷出现在 Finder 侧边栏里；后面跟着要挂载的分区 `/dev/disk8s1` 以及新的入口路径 `"$HOME/Desktop/md1"`。

这条命令执行成功时通常什么都不会输出，别慌，这正是正常现象。因为加了 `nobrowse`，直接用命令行把目录弹出来就行：

```bash
open "$HOME/Desktop/md1"
```

## 第五步：双保险验证是否真的可写

别看到 `mount_ntfs` 没报错就默认万事大吉，我习惯分两步验证。先查一下 `mount` 列表里的实际挂载状态：

```bash
mount | grep '/Desktop/md1'
```

我这边重新挂载后的输出变成了这样：

```text
/dev/disk8s1 on /Users/<username>/Desktop/md1 (macfuse, local, synchronous, noatime, nobrowse)
```

可以看到，原先的 `read-only` 已经没了，文件系统类型也切换成了 `macfuse`。但这还不够，最后顺手建一个临时文件再删掉，实打实测一次写入：

```bash
test_file="$HOME/Desktop/md1/.ntfs-write-test"
touch "$test_file" && rm "$test_file" && echo "NTFS 写入测试通过"
```

看到“NTFS 写入测试通过”冒出来，才算真正确认可写。

## 用完怎么安全卸载，或者恢复默认挂载

拷完文件之后，千万别直接拔线。先把 macFUSE 的挂载点卸掉：

```bash
sudo umount "$HOME/Desktop/md1"
```

再把整块物理磁盘弹出——注意这里传的是整盘 `disk8`，不是分区 `disk8s1`：

```bash
diskutil eject /dev/disk8
```

如果你并不打算拔硬盘，只是想退出可写模式、切回 macOS 原来的只读挂载，依次执行下面三条命令就行：

```bash
sudo umount "$HOME/Desktop/md1"
rmdir "$HOME/Desktop/md1"
diskutil mount /dev/disk8s1
```

整个手动挂载过程不会永久改动 NTFS 分区，下次把硬盘拔了重插，macOS 还是会乖乖按默认的只读方式去挂。

## 容易遇到的几个坑

### Finder 侧边栏里看不到移动硬盘

这是挂 `nobrowse` 参数后的正常表现，不是挂载失败，直接用下面这句打开挂载目录即可：

```bash
open "$HOME/Desktop/md1"
```

如果你更希望它像普通外置硬盘那样显示在侧边栏，可以试着去掉 `nobrowse`，不过手动挂载点在 Finder 里的展示效果会随系统版本有所不同。

### 提示 `Resource busy`

多半是原来的只读卷还没彻底卸干净，或者还有 Finder 窗口、终端、软件占着里面的文件。把相关窗口关掉后查一下：

```bash
mount | grep disk8s1
```

确认旧的挂载记录彻底消失了，再重新跑 `mount_ntfs`。

### 提示 macFUSE 不可用

回头检查三件事：macFUSE 装好没有、系统扩展在设置里批准没有、装完后重启过电脑没有。也可以顺手核对下 NTFS-3G 是否就位：

```bash
brew list --versions ntfs-3g-mac
command -v mount_ntfs
```

### Windows 休眠或快速启动导致拒绝写入

要是 NTFS-3G 报错提示卷处于 `hibernated`、`unclean` 或 `unsafe state`，千万别硬着头皮强制挂载。把硬盘插回 Windows 电脑，关掉“快速启动”和休眠并执行完整关机；保险起见还可以先跑一遍磁盘修复：

```powershell
chkdsk X: /f
```

把里面的 `X:` 换成移动硬盘在 Windows 下的盘符，修完并安全弹出后再插回 Mac。

### 这套方案适合长期主力使用吗

说实话，NTFS-3G + macFUSE 更适合偶尔应急、兼容手头已有的 NTFS 硬盘。它的读写性能、跟着 macOS 大版本升级时的兼容性，以及意外断电后的恢复能力，都需要留个心眼。重要资料一定要留备份；如果平时确实需要长期高频往 NTFS 盘里写数据，花点钱上成熟的商业 NTFS 驱动会踏实很多；而如果这块盘允许重新格式化、主要用来在 Windows 和 macOS 间倒数据，换成 exFAT 往往最省心——当然，格式化前切记先把全部数据备出来。

## 回顾一下状态流转

整个操作折腾下来，硬盘挂载状态的切换其实很清晰：

```text
macOS FSKit 只读挂载
        ↓ 卸载
NTFS-3G + macFUSE 可写挂载
        ↓ 安全卸载
重新插入后恢复系统默认行为
```

最后再啰嗦一句心得：每次动手最重要的都不是死记 `disk8s1`，而是先确认当次插入后的设备编号；也别因为 `mount_ntfs` 没打印报错就以为搞定了，老老实实用 `mount` 核对一眼、再 `touch` 个临时文件测一次写入，心里才真正有底。

## 参考资料

- [怎样在苹果电脑上用移动硬盘（使用 NTFS 格式硬盘）？](https://zhuanlan.zhihu.com/p/82665550)：原文测试于 macOS 10.13.6，提供了“卸载后重新挂载”的基本思路。
- [macFUSE](https://github.com/macfuse/macfuse)
- [NTFS-3G](https://github.com/tuxera/ntfs-3g)
- [gromgit/homebrew-fuse](https://github.com/gromgit/homebrew-fuse)
