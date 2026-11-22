---
title: 2026 年 iOS 侧载实战：SideStore 与 LiveContainer 的七个坑
published: 2026-11-03
description: 记录在 iOS 27.2 上从零配通 SideStore 与 LiveContainer 嵌合体的完整踩坑实录：-80045 登录报错、配对文件格式歧义、证书团队 ID 不匹配的原理与解法，以及免 JIT、多开和自动续期配置。
tags: [sidestore, livecontainer, ios, sideload, guide]
category: 环境与系统
draft: false
device: iPhone
aigc: Kimi
---

<style>
	.custom-md img {
		display: block;
		margin-left: auto;
		margin-right: auto;
	}
</style>

十月中旬苹果动了 Apple ID 登录的校验逻辑，侧载圈子里一片 `-80045`。我本来只是打算把 SideStore 重装一遍，结果一路从登录报错排查到免 JIT 签名，硬生生折腾了好几个晚上。

好在每个坑的成因都挺具体。配对文件、Anisette 身份、签名证书、App Group 里焊死的团队 ID，表面看着零散，追到底其实是三条一致性没对上：**身份要一致、协议要单一、账号要统一**。把这三条理顺，后面的操作基本就是按步骤复制粘贴。

先交代下我的环境：iPhone、iOS 27.2、免费 Apple ID，手里只有一台 Windows 电脑用来做初始安装。文中的 Apple ID、团队 ID、配对文件名都做过脱敏，你照着配置时具体数值肯定和我的不一样。

## 先把工具分工认清楚

这套组合里每个工具各司其职，先搞明白谁管哪一段，后面真报错了才知道往哪查：

| 工具 | 作用 |
|---|---|
| SideStore | 无线侧载工具，用 Apple ID 证书给应用签名，免费证书 7 天到期需要刷新续期 |
| LiveContainer | 应用容器，在自身内部运行 IPA，支持免 JIT 模式（借 SideStore 的证书签名） |
| 嵌合体 | LiveContainer 与 SideStore 打包成一个 IPA，只占 1 个应用槽 |
| iloader | 电脑端侧载工具，负责把 IPA 装进手机 |
| idevice_pair | 生成 SideStore 需要的配对文件（`.mobiledevicepairing`） |
| LocalDevVPN | App Store 上的免费 VPN 应用，为无线刷新提供本地隧道 |
| Anisette | 苹果的设备身份验证数据，登录 Apple ID 时必须携带 |

免费账号还有三条硬红线，后面几乎所有坑都能追回到这三条上：

- **证书槽位只有 2 到 3 个**，占满就装不了新应用；
- **App ID 每周上限 10 个**，应用里的每个扩展也要算一个；
- **证书 7 天过期**，到期不续期，整个应用会直接打不开。

心里先挂住这三条，很多看起来「莫名其妙的失败」就能瞬间对上号。

## 坑 1：登录直接弹 -80045

输完 Apple ID 和密码，屏幕上直接甩出一个 `Failed to Sign In: This action cannot be completed at this time. (-80045)`。这个报错最磨人的地方在于它发生在密码校验之前——苹果在设备身份验证这一关就把请求拍死了，所以你改密码、换网络、反复重装 SideStore 全都白搭，纯属浪费时间。

![SideStore 登录页弹出 -80045](./sidestore-80045/01.jpg)

根因在于两条信息对不上号。SideStore 登录时要向苹果递交两份东西：一份是自称身份的 headers（Client Info 与 User Agent），另一份是 Anisette 服务生成的设备验证数据。从 2026 年 10 月 12 日起，苹果开始严格校验这两者是否一致。默认配置里，headers 自称自己是一台跑 macOS 的 Mac，Anisette 数据却是 iPhone 本地生成的，两边牛头不对马嘴，请求自然被当场驳回。

界面上还藏着一个视觉陷阱：那两个输入框里的文字是白色的，初看像空着一样，其实里面早就填了默认值。「我明明什么都没填」纯属错觉，我们要换掉的正是这套默认身份。

<div style="display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; justify-content: center;">

![User Customizations 里 On-Device Anisette 处于开启状态](./sidestore-80045/05.png)

![Anisette Client Configuration 的两个输入框，看起来空白其实有默认值](./sidestore-80045/06.png)

</div>

解法分两条路，先看你手里装的是哪个版本。

**路线 A：直接升级 Nightly。** SideStore 官方在 10 月 26 日合并了登录修复（PR #1683），把客户端身份硬编码成了苹果目前认可的 Windows + iTunes 组合，并优先走 Windows ADI 服务器——本质上就是帮我们自动做完了下面那串手动配置。直接换上 10 月 26 日之后的 Nightly，`-80045` 大概率当场消失。

**路线 B：手动修改身份。** 如果你暂时不想升级，或者升完依然报错，就按下面这个顺序一步不跳地操作：

1. 在 SideStore 设置里滑到底进 **Anisette Servers**，选 **SideStore (New)**（社区反馈里 Jkcoxson 也可以当备选），同时关掉 **Enable Auto Rotation**，防止它自己切回旧服务器；
2. 回到 **User Customizations**，关闭 **On-Device Anisette**；
3. 进 **Anisette Client Configuration**，切到 **Raw JSON** 标签，把旧的覆盖配置彻底清空——不清空的话下一步会被它挡住；
4. 切回 **Interactive** 标签点 **Fetch**，从服务器拉取一份苹果认可的身份，再点 **Save as Overrides**；
5. 返回后点 **Reset adi.pb**，这一步只会清掉本地 Anisette 缓存，不会动已经装好的应用；
6. 把 SideStore 从后台彻底划掉，重新打开，再输账号密码。

如果你装的版本里没有 Fetch 按钮，就在 Interactive 页手动填进这两行：

```text
Client Info : <PC> <Windows;6.2(0,0);9200> <com.apple.AuthKit/1 (com.apple.iTunes/12.12.4.1)>
User Agent  : akd/1.0 CFNetwork/808.1.4
```

填完同样走一遍 Save as Overrides、Reset adi.pb、杀后台重开的流程。

![Reset adi.pb 确认弹窗，注意 Keep header customizations 的勾选](./sidestore-80045/07.png)

> [!IMPORTANT]
> 这一步的核心原则就一句话：headers 自称是什么身份，Anisette 数据就必须是什么身份。上面所有操作都在保证这两边严丝合缝。

重新登录时还有两个小细节得稳住：**Sign in 只点一次**，连续狂点会直接撞上苹果的风控，越急越登不进去；如果名下其他苹果设备弹出了 6 位验证码，先记下来再填，那个码只显示一次。

另外，**卡在 503 并不是失败**。如果你走到这一步、验证码也都输完了，屏幕却弹出一坨没解析的 HTML，里面夹着 `503 Service Temporarily Unavailable` 和 `Apple`，其实说明你的身份校验已经过了，只是苹果自家的登录服务器正在限流。那两周大量用户扎堆重试，风控卡得很死。这时候唯一管用的操作就是收手，等 30 到 60 分钟再试一次；等待期间可以顺手在 Safari 里登一下 `appleid.apple.com`，确认账号本身没有「需要验证」或者新条款确认的弹窗拦路。

![验证码通过后，苹果服务器返回 503](./sidestore-80045/08.png)

## 坑 2：配对文件格式不明确

导入配对文件时，我撞上了 `The pairing file format is ambiguous`。原因是文件里同时塞了 Remote Pairing 和 Lockdown 两套凭证，而 2026 年 9 月 20 日之后的 Nightly 改成只接受单一协议了。更棘手的是，iOS 27 改了 Lockdown 的配对格式，在设备上根本跑不起来，SideStore 真正需要的其实只有 Remote Pairing 这一份。

![配对文件格式歧义的报错](./sidestore-80045/02.jpg)

解决思路就是重新打一个只含 Remote Pairing 的干净配对文件：

1. 在电脑上装 **idevice_pair**（当时 iloader 的配对功能带 bug，社区普遍建议改用这个）；
2. iPhone 解锁并保持亮屏，插上 USB 点信任电脑——只要界面显示 `device locked`，Create 按钮就会一直是灰的；
3. 协议只勾选 **Remote pairing**，然后点 Create。选 Lockdown 虽然能糊弄着导入进去，但后面刷新应用必报 `Broken Pipe`；
4. 把导出的 `.mobiledevicepairing` 传回手机（AirDrop 最快），在 SideStore 里重新选中。

![idevice_pair 里 device locked 时 Create 是灰的](./sidestore-80045/03.png)

如果你手边没电脑，也可以用 StikDebug 或 StikPair 直接在手机上生成，再分享给 SideStore。

> [!NOTE]
> 配对文件是长期有效的。只要不在手机上点「还原位置与隐私」或重置网络设置，就算重装 SideStore 它也会保留，不用每次重打一份。

## 坑 3：Revoke Certificates 到底点不点

登录成功后，SideStore 会扫描你这个 Apple ID 名下现有的开发证书，弹出提示问要不要吊销。这里没有一刀切的答案，全看那台旧设备你现在还用不用：

- **还在别的电脑上装过侧载应用**：点 **Cancel**，一旦吊销，那边签过的应用会全部打不开；
- **确认是早就淘汰的旧设备**：放心点 **Revoke**，顺便把宝贵的证书名额清出来。

实在拿不准就先点 Cancel 往下走。真到后面装应用时弹出「证书数量超限」，再回头清理也不晚。

![Revoke Certificates 弹窗](./sidestore-80045/09.png)

## 坑 4：No wifi interface satisfied

这个报错直白得很：登录已经过了，但在注册设备这一步卡住，弹出 `Device Registration Error`，底下跟着一行 `Network Connection Error: No wifi interface satisfied`，点再多次 Retry 都过不去。

![No wifi interface satisfied](./sidestore-80045/10.png)

原因在于这一步不走蜂窝数据。SideStore 必须先经由 LocalDevVPN 建起本地隧道，再通过隧道把请求转交给苹果；而 iOS 上这条隧道绑死在 Wi-Fi 接口上。手机一落在 4G/5G 上，这个接口压根不存在，请求还没出门就被拦住了。

解法简单粗暴：连上任意一个 Wi-Fi（哪怕是另一台手机开的热点也算），回到弹窗点 Retry，保持连接直到整套 onboarding 走完。

> [!NOTE]
> 这可不是一次性门槛。以后每次无线刷新续期、Resign 自己或者注册新设备，都要走这条本地隧道。打算长期用的话，Wi-Fi 是刚需，不是装完就能扔的临时条件。

## 坑 5：Resign 与应用扩展的取舍

吊销旧证书或者启用新证书之后，手机里现在跑着的 SideStore 还是旧证书签的，所以必须立刻拿新证书把自己重签重装一遍。点 **Resign Now** 跑完安装，SideStore 自动闪退属于正常现象，回桌面重新点开就行，之前的配对文件和 Anisette 配置都在。

重装途中会弹窗问你怎么处置 App Extensions，这四个选项本质上都是在帮你权衡每周那 10 个 App ID 名额：

| 选项 | 代价 | 适合 |
|---|---|---|
| Keep App Extensions (Use Main Profile) | 用主配置保留全部扩展，占 4 个 App ID | 需要 Multitask 多任务窗口 |
| Keep App Extensions (Register App ID for Each Extension) | 每个扩展单独注册，按扩展个数各占一个 | 极少用到，和上一项没有实质区别 |
| Remove App Extensions | 全部删掉，没有小组件和分享菜单入口 | 名额紧张时的默认选择 |
| Choose App Extensions | 自己勾选保留哪几个 | 只想要小组件这类折中场景 |

<div style="display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; justify-content: center;">

![证书变更后要求 Resign](./sidestore-80045/11.png)

![扩展取舍弹窗，注意四个处理方式](./sidestore-80045/12.png)

</div>

说实话，无论是桌面倒计时小组件，还是分享菜单里的「用 SideStore 打开」，都属于锦上添花。装 IPA、签名、刷新、登录这些核心功能全都在主程序里，所以免费账号下我直接选了 **Remove**，省下名额给正经应用。

> [!WARNING]
> 老版本 SideStore 存在一个已知 bug：刷新应用时会把你之前删掉的扩展悄悄重新注册回来，再次把名额吃满。如果碰上「明明删了扩展怎么又超限」，先升到最新 Nightly 再操作。

## 坑 6：免 JIT 签名无效，团队 ID 对不上

这是整场折腾里耗掉我最多时间的一个坑，也是我最想记下来提醒后人的地方。打开 LiveContainer 的免 JIT 诊断页，「证书团队名」直接标红，和「预期团队 ID」对不上号；容器里刚签好名的应用一启动就提示签名无效。

![免 JIT 签名无效的提示](./sidestore-80045/13.png)

先拆开看这两个值是从哪来的：「预期团队 ID」是 LiveContainer 从 SideStore 的 App Group 名称里读出来的，而这个 App Group 前缀在你往手机安装嵌合体的那一刻就彻底焊死了；「证书团队名」则是当前签名证书里真实的团队 ID。免 JIT 能跑起来的原理，就是借 SideStore 的证书给容器里的应用签名，再塞进同一个 App Group 让 iOS 放行，所以两边必须一模一样。

查到最后发现自己的根因特别蠢：装嵌合体时我用的是 Apple ID A，配签名时在 SideStore 里随手登了 Apple ID B。团队 ID 跟着账号走，两个不同账号的团队 ID 这辈子都不可能相等，在诊断页点一万次刷新也没用。

![免 JIT 诊断页，两个团队 ID 不一致](./sidestore-80045/14.png)

修起来的思路很明确——把账号统一回安装嵌合体用的那一个。不过点 Sign Out 弹出的确认框里，有两个勾必须反着选：

- **取消勾选** `Keep signing certificate`：现在手里这张是另一个账号的证书，必须让它作废；
- **保留勾选** `Keep Anisette data` 和 `Keep Anisette headers`：这可是坑 1 好不容易调顺的登录配置，丢了就得重新面对 `-80045`。

接着用装嵌合体时的那个 Apple ID 重新登录，剩下的按顺序扫尾：

1. 重新登录后大概率会再触发一遍证书流程，旧证书按坑 3 的原则处理；
2. Resign SideStore 时扩展依然选 Remove；
3. 把 SideStore 和 LiveContainer 都从后台划掉重开；
4. 进 LiveContainer 的免 JIT 诊断页点刷新，确认两个团队 ID 一致、红色变绿；
5. 把容器里原本装的应用删掉，重新导入 IPA 再签名——旧签名记录里留着错误的团队 ID，不重签修不好。

> [!CAUTION]
> 嵌合体的安装账号、SideStore 的签名账号、免 JIT 用的证书，三者必须是同一个 Apple ID。这是这一节唯一需要死记的事。

## 坑 7：My Apps 里冒出两条 LiveContainer

如果你一开始用电脑装了一份，后来又在 SideStore 里装了一份，My Apps 列表里就会并排躺着两条记录。标着「Sideloaded」的那条是电脑装的，SideStore 只能看着、没法替它续期；带团队名的那条才是 SideStore 自己装的，支持无线刷新。

建议干脆只留后一条。留着电脑装的那份，7 天一到还得插线连电脑重走一遍流程，之前无线化的功夫就白费了。

## 进阶玩法：一键启动、多开与自动续期

基础链路跑顺之后，下面三个配置能把日常体验拉高一大截。

### 一键启动

在 LiveContainer 里长按应用选「添加到主屏幕」，推荐直接走 **创建 AppClip**。它会生成一个描述文件，装完桌面上就有原生图标，点开直接拉起应用。另外两个选项（复制 `livecontainer://` 链接、保存图标）是留给快捷指令手动拼自定义图标用的，折腾起来麻烦得多。

![长按菜单里的多任务、AppClip 入口](./sidestore-80045/16.png)

### 多开

多开有两条路，看自己的名额预算选：

| 方案 | 做法 | 代价 |
|---|---|---|
| Multitask 多任务窗口 | 长按应用横幅选 Multitask，可缩放、可画中画，多应用同时挂着 | 装 LiveContainer 时必须保留 App Extensions，占 4 个 App ID |
| 多实例 | 设置里「安装另一个 LiveContainer」，生成 IPA 后用 SideStore 装 | 每个实例占一个应用槽，免费账号只有 3 个 |

嵌合体本身已经占掉 1 个槽位，刚好还能再装 2 个独立实例；如果想跨实例跑同一个应用，记得先在里面点「转换为共享 App」。

### 自动续期

免费证书 7 天一过期，全靠人工每周记得点一次迟早翻车。用 iOS 快捷指令可以串起全自动续期，动作按这个顺序排好：

1. 获取网络详细信息（Wi-Fi 名称）
2. 如果「有任何值」（没连 Wi-Fi 就不继续往下跑）
3. 设定 VPN → 连接 **LocalDevVPN**
4. 等待 3 秒
5. 打开 URL `sidestore://`（先把 SideStore 唤到前台，否则后面的刷新动作经常失败）
6. 等待 3 秒
7. **Refresh All Apps**（注意：嵌合体必须选 LiveContainer 提供的刷新动作，SideStore 那个不管用）
8. 等待 30 秒
9. 设定 VPN → 断开
10. 显示通知「续签完成」

配好指令后，在「自动化」里建一个「一天中的时间」触发器，运行时选 **立即运行**，别选「运行前询问」。

> [!NOTE]
> iOS 的定时自动化并不是精确闹钟，锁屏、低电量模式或开启勿扰时可能延后几十分钟。因此设成「每天跑一次」比「每周跑一次」稳妥得多——证书有 7 天缓冲期，偶尔漏跑一天完全不慌。

## 日常维护清单

整套环境配顺以后，平时要盯着的事其实不多，主要就这几项：

- 每周抽空瞄一眼 My Apps 的倒计时有没有回到 `7 DAYS`，别光看通知就以为稳了；
- 牢记三条红线：证书 2 到 3 个、App ID 每周 10 个、证书 7 天过期；
- 换了路由器或者局域网网段后，LocalDevVPN 的地址可能需要重新配一遍，不然刷新会失败；
- 一旦重装 SideStore 或 LiveContainer，记得重新从 SideStore 导出证书给 LiveContainer，并确认团队 ID 与 App Group 一致（见坑 6）；
- 升级优先盯 SideStore 的 Nightly 构建，10 月 26 日之后的版本已经内置了 `-80045` 修复。

这一路折腾下来，真正卡人的从来不是哪一行命令，而是开篇说的那三条一致性——身份对上、协议单一、账号统一。只要有一处没对齐，iOS 绝不会好心告诉你错在哪，只会冷冰冰甩过来一个错误码。把这三条记在心里，下次换设备重搭，大概率一个晚上就能轻松收工。
