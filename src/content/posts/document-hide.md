---
title: 夹带私货：简单文件隐写
published: 2025-08-20
description: 试试用 cat 把压缩包拼到图片末尾，再用 binwalk 扫描和拆解，演示一种利用文件格式解析差异的简单隐写玩法。
tags: [security, steganography, file]
category: Web 与工具
draft: false
device: Windows
---

分享一个挺有意思的小玩法：利用不同软件解析文件格式时的差异，直接把一个 ZIP 压缩包拼到图片末尾。这么做之后，普通图片查看器照样会把它当正常图片打开，看不出异样；而用 `binwalk` 这类工具一扫，就能把藏在后面的压缩包识别并拎出来。

思路参考了这篇知乎文章：[文件隐写示例](https://zhuanlan.zhihu.com/p/590378572)。

> [!WARNING]
> 这不是加密。任何知道文件结构的人都可以扫描并提取追加内容，不适合保护敏感数据。

## 动手试试

### 把压缩包塞进图片

先把想藏进去的文件打包成 `a.zip`，然后直接用 `cat` 追加到 `b.png` 末尾：

```shell
cat a.zip >> b.png
```

执行完打开图片看，外观上完全没变化，但如果你瞄一眼文件属性，会发现体积已经变大了：

<p align="center">
    <img src="https://ipfs.pinellia.uk/ipfs/QmTMVbJQhP77CQm4bT5BEudQBCEbExLsDT2ybNQFHTTzGZ" alt="" width="40%" />
    <br/>
    <img src="https://ipfs.pinellia.uk/ipfs/QmXrvW7ob9uXPcmQcdCFBXXX7hbnH6KeXin3kXtyXdcJLZ" alt="" width="40%" />
</p>

### 用 `binwalk` 把它拆出来

拆解这里我借用的是 `binwalk` 命令，当然也有其他工具可以干这事，感兴趣可以翻一下开头贴的那篇知乎文章。

先用 `binwalk b.png` 扫一眼文件内部结构：

![](https://ipfs.pinellia.uk/ipfs/QmaJNcm8N1shbqZRBbURjCsLh5WfQ9Tc4yLbBPMxr93S5G)

正常情况下，输出里会同时标出前面的图片数据和后面的 ZIP 压缩包。

确认结构没问题，直接加 `-e` 参数让 `binwalk -e b.png` 自动提取：

![](https://ipfs.pinellia.uk/ipfs/QmcY28Q3CDDAEphWpiNH7gYr85r6oXFE3TiC8gp8Vn4unp)

提取出来的目录会以 ZIP 数据的起始偏移命名，点进去就能看到解压还原出来的文件：

![](https://ipfs.pinellia.uk/ipfs/QmasDZYXmVZMc14CeqJChtWjiMfTa1mviaSLT3c1GGFRUt)
![](https://ipfs.pinellia.uk/ipfs/QmbqUQSSxruM84e4qZTswg9KbaD4YD5ZbLipGmGXDJHd2J)

## 踩坑提醒

实际玩的时候，建议不管藏什么文件，都先打个包再拼接。像 Word、PDF 这类格式本身内部就嵌套了多个数据结构，直接裸拼上去会让 `binwalk` 的判断和提取麻烦不少：

![](https://ipfs.pinellia.uk/ipfs/QmddebmCSkKv33jM7X1BVrZPP3QwKyeWp3KaqJrH6r5Cv4)

> 如果自动提取翻车了，也可以对照扫描出的起止偏移，用 `dd` 手动把对应区间截出来。不过还是那句话，先打包只是为了让结构更干净、更好识别，并不会带来任何加密保护。
