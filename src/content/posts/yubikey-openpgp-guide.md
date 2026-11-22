---
title: 使用 YubiKey 配置 OpenPGP：密钥生成、备份与日常使用
published: 2026-08-11
description: 记录我从零配置 YubiKey 及兼容 OpenPGP 智能卡的完整实操流程，涵盖 GnuPG 安装、密钥结构规划、离线备份与验证、卡槽迁移、Git 与 SSH 接入，以及丢卡后的恢复和吊销策略。
tags: [openpgp, yubikey, gnupg, security, ssh, guide]
category: 环境与系统
draft: false
aigc: Codex
device: MacBook Pro
---

很多人以为把 OpenPGP 私钥塞进 YubiKey 这类智能卡是为了「免输密码」，其实恰恰相反——它的核心价值在于让私钥彻底离开硬盘，不再以可直接复制的文件形态长期躺在电脑里。以后不管是签名、解密还是 SSH 认证，计算都在芯片内部完成，就算电脑哪天真中招了，攻击者也很难顺手把私钥拷走。

这篇文章把我实际配置这套 OpenPGP 智能卡的完整流程理了一遍：从最初的密钥结构设计、离线备份与恢复验证，到把三把私钥迁进卡槽、打通 Git commit 签名和 SSH 登录，最后把丢卡或损坏时的灾难恢复也一并交代清楚。文中出现的身份、邮箱、指纹、文件名和公钥地址都做了脱敏占位，你照着操作时替换成自己的真实信息就行：

```text
Example User <user@example.com>
```

主密钥指纹在后面统一用下面这个占位符代替：

```text
<PRIMARY_KEY_FINGERPRINT>
```

> [!IMPORTANT]
> OpenPGP 公钥、完整指纹和卡片序列号完全是三回事。公钥和完整指纹大方公开没问题；私钥、PIN、Reset Code 和私钥备份则绝对不能外泄。这里也不会留下任何真实的 PIN、Reset Code 或设备序列号。

## 先想清楚最终要得到什么结构

一块标准的 OpenPGP 智能卡提供了三个彼此独立的私钥槽：

| 卡槽 | 能力 | 用途 |
| --- | --- | --- |
| Signature | `S` | 文件、邮件和 Git commit 签名 |
| Encryption | `E` | 解密发给自己的数据 |
| Authentication | `A` | SSH 等身份认证 |

我现在跑通并沿用的就是下面这套经典分配：

```text
主密钥      [SC]  → Signature 槽
加密子密钥   [E]  → Encryption 槽
认证子密钥   [A]  → Authentication 槽
```

其中 `S`、`C`、`E`、`A` 分别对应 Sign（签名）、Certify（认证/签发子密钥）、Encrypt（加密）和 Authenticate（身份认证）。

当然，社区里还有一种隔离更彻底的玩法：让主密钥只保留 `[C]` 能力并且永久离线封存，日常另建 `[S]`、`[E]`、`[A]` 三把子密钥塞进卡片。这样做的好处是，随身带着的卡片就算出事，也没法直接签发新子密钥或篡改身份信息，很适合打算长期维护的核心身份。我这套笔记先采用 `[SC] + [E] + [A]`，胜在结构干净、便于复现现有配置；如果你以后准备从头建一个用十年的长期身份，可以再把离线 `[C]` 方案拉出来评估一遍。

> [!WARNING]
> 执行 `keytocard` 并 `save` 之后，本地钥匙环里的私钥材料就会被替换成智能卡引用。卡里的私钥是只进不出的，所以**迁移前一定要先把完整私钥做好离线备份，并且亲手验证它真的能恢复**。

## 1. 准备 GnuPG 环境与检查卡片

### macOS

用 Homebrew 把 GnuPG 和图形化的 PIN 输入弹窗一并装好：

```bash
brew install gnupg pinentry-mac
```

装完确认一下版本：

```bash
gpg --version
```

如果你后面在终端里发现弹不出 PIN 输入框，十有八九是 agent 没指对 `pinentry-mac`。打开 `~/.gnupg/gpg-agent.conf` 补上实际路径：

```text
pinentry-program /opt/homebrew/bin/pinentry-mac
```

如果是 Intel Mac，路径一般是 `/usr/local/bin/pinentry-mac`，稳妥起见直接拿 `command -v pinentry-mac` 的输出为准。改完记得重启一下 agent 让配置生效：

```bash
gpgconf --kill gpg-agent
```

### Linux

Debian / Ubuntu 系直接用 apt 安装这几个包：

```bash
sudo apt update
sudo apt install gnupg scdaemon pcscd
```

部分发行版默认没起 PC/SC 读卡器服务，顺手把它启用起来：

```bash
sudo systemctl enable --now pcscd
```

### 确认卡片的 OpenPGP 应用状态

把设备插上电脑，跑一条：

```bash
gpg --card-status
```

如果是一块空卡，正常能看到这几行：

```text
Application type .: OpenPGP
Signature key ....: [none]
Encryption key....: [none]
Authentication key: [none]
```

要是卡槽里已经躺着指纹了，先停手别覆盖，确认清楚里面是不是还在服役的旧密钥。

顺带提一句我自己的设备情况：我手里这块卡在 Reader 字段里报的是 `LibreKeys ... yubikey`，并非标准 Yubico 原厂标识。踩过兼容卡的坑就会知道，支持的算法、触摸确认（UIF）以及 KDF 这类特性，**一律要以 `gpg --card-status` 的实测输出和固件文档为准**，千万别光看 USB 名称里带个 yubikey 就想当然。

## 2. 动手前先定好算法与有效期

先瞄一眼当前卡片报出来的密钥属性：

```text
Key attributes ...: rsa2048 rsa2048 rsa2048
```

既然卡槽默认就是 RSA-2048，我这次干脆统一用 RSA-2048，优先保导入一次成功以及各种客户端的兼容性。在没吃透固件支持列表前，不要贸然去改 `key-attr`。当然，如果你手里是明确支持 RSA-3072、RSA-4096 或 ECC 的新卡，可以在建身份前自己换算法，只要记住三把准备入卡的密钥必须和各自卡槽的属性对得上就行。

有效期我这里设成了 `0`，也就是 OpenPGP 元数据里的「永不过期」。注意这绝不意味着这套算法和这块硬件能安全到天荒地老，它只是告诉 GnuPG 别按日期自动把密钥标成失效；作为长期身份，每隔一阵子自己审视一下算法强度、硬件状态和备份介质还是少不了的。

## 3. 生成主密钥与两把子密钥

先建一把带认证和签名能力的主密钥：

```bash
gpg --quick-generate-key \
  "Example User <user@example.com>" \
  rsa2048 cert,sign 0
```

弹窗让你设本地私钥的保护密码时，给一条足够强、而且和卡片 PIN 区分开的密码。

建好后拉出完整指纹看看：

```bash
gpg --list-secret-keys \
  --keyid-format long \
  --with-subkey-fingerprint \
  "user@example.com"
```

把 `sec` 下面那行 40 位的完整主密钥指纹复制出来，存成环境变量，后面所有命令直接引用它：

```bash
FPR='<PRIMARY_KEY_FINGERPRINT>'
```

这里顺手养成个好习惯：始终用 40 位完整指纹，别图省事用 8 位或 16 位的短 Key ID。先验证一下这个变量确实指向了我们刚建的身份：

```bash
gpg --list-secret-keys --keyid-format long "$FPR"
```

确认无误后，依次把加密子密钥和认证子密钥挂上去：

```bash
gpg --quick-add-key "$FPR" rsa2048 encrypt 0
gpg --quick-add-key "$FPR" rsa2048 auth 0
```

再列出完整结构核对一遍：

```bash
gpg --list-secret-keys \
  --keyid-format long \
  --with-subkey-fingerprint \
  "$FPR"
```

这时候看到的结构大概长这样：

```text
sec   rsa2048/... [SC]
ssb   rsa2048/... [E]
ssb   rsa2048/... [A]
```

## 4. 迁移入卡前，先做好完整离线备份

在把私钥迁进卡槽之前，必须先留好退路。把下面命令里的目录路径替换成你自己的加密移动硬盘或其他离线存储介质：

```bash
BACKUP_DIR="/Volumes/EncryptedBackup/openpgp-backup"
install -d -m 700 "$BACKUP_DIR"
```

接着把公钥、完整私钥、子密钥以及信任记录（ownertrust）一口气全导出来：

```bash
gpg --armor \
  --output "$BACKUP_DIR/example-public.asc" \
  --export "$FPR"

gpg --armor \
  --output "$BACKUP_DIR/example-secret-full.asc" \
  --export-secret-keys "$FPR"

gpg --armor \
  --output "$BACKUP_DIR/example-secret-subkeys.asc" \
  --export-secret-subkeys "$FPR"

gpg --export-ownertrust \
  > "$BACKUP_DIR/ownertrust.txt"
```

这里有个小坑：`--export-ownertrust` 记得用 Shell 重定向 `>` 来写文件。某些版本的 GnuPG 压根不理 `--output` 参数，直接把内容刷在终端里，所以导完最好顺眼看下 `ownertrust.txt` 是不是真落盘了。

新版 GnuPG 在建主密钥时已经自动生成好吊销证书了，一并拷进备份目录并收紧文件权限：

```bash
cp "$HOME/.gnupg/openpgp-revocs.d/$FPR.rev" \
  "$BACKUP_DIR/example-revocation-certificate.rev"

chmod 600 "$BACKUP_DIR"/*
ls -la "$BACKUP_DIR"
```

检查一下，备份目录里至少要有这 5 个文件：

```text
example-public.asc
example-secret-full.asc
example-secret-subkeys.asc
example-revocation-certificate.rev
ownertrust.txt
```

条件允许的话，强烈建议留两份加密离线备份，分开放到不同地点；同时别把私钥保护密码、卡片 PIN 和 Reset Code 和备份盘塞在同一个抽屉里。

### 别光看文件存在，亲手验证一次恢复

备份界有一句老话：没验证过的备份约等于没备份。我们起一个彻底隔离的临时 GnuPG 目录，实地演练一遍导入：

```bash
VERIFY_HOME="$(mktemp -d)"
chmod 700 "$VERIFY_HOME"
```

把刚才导出的完整私钥塞进这个临时目录：

```bash
gpg --homedir "$VERIFY_HOME" \
  --import "$BACKUP_DIR/example-secret-full.asc"

gpg --homedir "$VERIFY_HOME" \
  --list-secret-keys \
  --keyid-format long \
  --with-subkey-fingerprint \
  "$FPR"
```

紧接着拿它真实签一份文件。注意实操中**别用管道把待签名内容喂给 GnuPG**，否则 pinentry 往往抓不到当前终端的 tty，直接给你甩个 `Inappropriate ioctl for device` 报错：

```bash
export GPG_TTY="$(tty)"

VERIFY_FILE="$(mktemp /tmp/openpgp-backup-verification.XXXXXX)"
VERIFY_SIGNATURE="$BACKUP_DIR/$(basename "$VERIFY_FILE").asc"
printf 'OpenPGP backup verification\n' > "$VERIFY_FILE"

gpg --homedir "$VERIFY_HOME" \
  --local-user "$FPR" \
  --armor \
  --clearsign \
  --output "$VERIFY_SIGNATURE" \
  "$VERIFY_FILE"

gpg --homedir "$VERIFY_HOME" \
  --verify "$VERIFY_SIGNATURE"
```

必须亲眼看到 `Good signature`，并且确认临时钥匙环里 `[SC]`、`[E]`、`[A]` 三把完整私钥都在，才算过关。顺便一提，临时环境里 UID 旁边显示 `[未知]` 纯粹是因为我们没导入 `ownertrust.txt`，不代表备份坏了，也完全不影响验签。

## 5. 先把卡片的默认 PIN 全改掉

正式往卡里写密钥前，先把出厂默认 PIN 换掉。进卡片编辑模式：

```bash
gpg --card-edit
```

切进管理模式并打开密码菜单：

```text
admin
passwd
```

界面会列出这几个选项：

```text
1 - change PIN
2 - unblock PIN
3 - change Admin PIN
4 - set the Reset Code
Q - quit
```

下面三项建议一步到位全改完：

1. 修改用户 PIN；
2. 修改管理员 PIN；
3. 设一个独立的 Reset Code。

标准原厂 YubiKey 的默认用户 PIN 一般是 `123456`，管理员 PIN 一般是 `12345678`，但兼容设备可未必沿用这套默认值。动手前先翻下厂商文档，千万别盲猜——每类 PIN 通常只给 3 次试错机会，试爆了就锁卡。

另外分享两个实际改 PIN 时很容易踩的坑：

第一，`gpg --card-status` 里显示的 `Max. PIN lengths` 是**最大长度**，不是最小长度。标准 OpenPGP 卡一般要求用户 PIN 至少 6 位，管理员 PIN 和 Reset Code 至少 8 位，部分兼容固件对字符集还有额外限制。为了少惹兼容麻烦，我建议用户 PIN 设在 8 位以上，管理员 PIN 和 Reset Code 用 12～16 位纯 ASCII 字母加数字组合，别图省事用 4 位数字 PIN。

第二，pinentry 改 PIN 时的交互流程容易让人误会：它会先把当前 PIN、新 PIN、确认新 PIN 全收齐，最后才打包一次发给卡片校验。也就是说，**弹窗让你输入新 PIN 并不代表你刚才输的当前 PIN 已经对了**。如果最后蹦出 `Bad PIN` 或「损坏的 PIN」，别急着再试，先退出来敲一句 `gpg --card-status` 看 `PIN retry counter`（管理员 PIN 对应最后一位）：要是计数没少，八成是新 PIN 太短或带了不支持的字符；要是计数真的减 1 了，那才是当前 PIN 输错了。

这三类凭据的分工可以这样记：

- **用户 PIN**：日常签名、解密、SSH 认证时用；
- **管理员 PIN**：改卡片配置、往卡里写密钥或删密钥时用；
- **Reset Code**：用户 PIN 不小心输错锁死时的救命解锁码。

## 6. 把三把私钥迁进卡片

现在进入最关键的写入环节。打开密钥编辑界面：

```bash
gpg --edit-key "$FPR"
```

先列一遍确认编号：

```text
list
```

### 主密钥 → Signature 槽

刚进编辑界面时，默认没选中任何子密钥，这时直接操作的就是主密钥。敲：

```text
keytocard
```

选槽位 `1`（也就是 `Signature key`）：

```text
1
```

GnuPG 会再次确认「真的要移动主密钥吗」，确认之后终端通常会提示：

```text
Note: the local copy of the secret key will only be deleted with "save".
```

意思是私钥已经写进卡片了，但硬盘上本地钥匙环里的副本要等你最后敲 `save` 才会删掉。先别急着保存，趁热把剩下两把子密钥一并迁完。

### `[E]` 子密钥 → Encryption 槽

假设 `[E]` 是列表里的第一把子密钥：

```text
key 1
list
```

瞪大眼确认只有 `[E]` 前面带了 `*` 号，再执行迁移：

```text
keytocard
```

这次选槽位 `2`：

```text
2
```

迁完别忘了把 `key 1` 的选中状态取消掉：

```text
key 1
```

### `[A]` 子密钥 → Authentication 槽

同理，假设 `[A]` 是第二把子密钥：

```text
key 2
list
```

确认只有 `[A]` 前面带 `*`，然后迁移到槽位 `3`：

```text
keytocard
```

```text
3
```

最后再敲一遍 `key 2` 取消选中，`list` 确认没误选任何多余项，就可以放心 `save` 退出了：

```text
key 2
list
save
```

> [!CAUTION]
> 这里是 GnuPG 界面最反直觉的地方：`key N` 是**反选开关（toggle）**，不是把焦点切过去！你要是不取消 `key 1` 就直接敲 `key 2`，结果就是 `[E]` 和 `[A]` 前面同时亮着 `*`。一旦发现多选了，对不需要的那一把再敲一遍 `key N` 就能消掉。另外子密钥编号以你本地钥匙环的实际 `[E]` / `[A]` 标志为准，别闭眼照抄编号；敲 `save` 前务必再核对一次槽位有没有错位。

## 7. 检查卡片与本地钥匙环状态

迁移保存完，先查卡片状态：

```bash
gpg --card-status
```

如果一切顺利，三个槽位上现在应该都填上了对应指纹：

```text
Signature key ....: <PRIMARY_KEY_FINGERPRINT>
Encryption key....: <ENCRYPTION_SUBKEY_FINGERPRINT>
Authentication key: <AUTH_SUBKEY_FINGERPRINT>
```

再回头看一眼本地钥匙环：

```bash
gpg --list-secret-keys \
  --keyid-format long \
  --with-subkey-fingerprint \
  "$FPR"
```

预期会变成带箭头符号的样式：

```text
sec>  rsa2048/... [SC]
ssb>  rsa2048/... [E]
ssb>  rsa2048/... [A]
```

看到 `sec>` 和 `ssb>` 里的 `>` 就稳了——它代表本地硬盘上只剩一个指向智能卡的桩引用（stub），真正干活的私钥已经待在卡片芯片里，既没被公开，也没法再从卡里导出来。

## 8. 三个卡槽逐一实测

别光看状态输出，三个槽的功能都实际跑通一遍才踏实。

### 实测签名槽（Signature）

```bash
export GPG_TTY="$(tty)"

SIGN_TEST="$(mktemp /tmp/openpgp-card-signing.XXXXXX)"
SIGNATURE="${SIGN_TEST}.sig.asc"
printf 'OpenPGP smartcard signing test: %s\n' \
  "$(date '+%Y-%m-%dT%H:%M:%S%z')" \
  > "$SIGN_TEST"

gpg --local-user "$FPR" \
  --armor \
  --detach-sign \
  --output "$SIGNATURE" \
  "$SIGN_TEST"

gpg --verify "$SIGNATURE" "$SIGN_TEST"

printf '测试文件：%s\n签名文件：%s\n' \
  "$SIGN_TEST" "$SIGNATURE"
```

验签输出里出现下面这句就说明签名槽通了：

```text
Good signature from "Example User <user@example.com>"
```

### 实测加密槽（Encryption）

```bash
printf 'OpenPGP smartcard encryption test\n' \
  > /tmp/openpgp-plaintext.txt

gpg --armor \
  --recipient "$FPR" \
  --output /tmp/openpgp-encrypted.asc \
  --encrypt /tmp/openpgp-plaintext.txt

gpg --decrypt /tmp/openpgp-encrypted.asc
```

这里可以顺手做个对照验证：加密只用到公钥，所以就算把卡拔了照样能加密；但解密必须走卡里的 `[E]` 私钥，拔掉卡再跑 `gpg --decrypt` 应当直接失败，这样才证明解密确实离不开硬件。

### 实测认证槽（Authentication）导出 SSH 公钥

```bash
gpg --export-ssh-key "$FPR"
```

正常会吐出一行标准 OpenSSH 格式的公钥：

```text
ssh-rsa AAAA... openpgp:0x...
```

不过这一步只证明 `[A]` 子密钥能正确转换成 SSH 公钥，要把整条 SSH 登录链路接通，还得看后面第 10 节的 agent 配置。

## 9. 接入 Git commit 签名

把 Git 的全局签名配置指向这把 OpenPGP 密钥：

```bash
git config --global user.signingkey "$FPR"
git config --global commit.gpgsign true
git config --global tag.gpgSign true
git config --global gpg.program "$(command -v gpg)"
```

在 `/tmp` 下建个临时仓库试签一笔提交：

```bash
mkdir /tmp/gpg-git-sign-test
cd /tmp/gpg-git-sign-test
git init
git commit --allow-empty -m "test OpenPGP signing"
git log --show-signature -1
```

如果你想让推送到 GitHub 的提交都亮起绿色的 `Verified` 徽章，别忘了补齐这三步：

1. 把 `user@example.com` 加进你的 GitHub 账号并完成邮箱验证；
2. 到 GitHub 的 **SSH and GPG keys** 页面，把导出的 ASCII 公钥粘进去；
3. 确保本地 Git 提交用的 author 邮箱确实归属这个账号。

导出可以直接粘贴到 GitHub 的公钥：

```bash
gpg --armor --export "$FPR"
```

## 10. 把认证子密钥接进 SSH

想让 `gpg-agent` 替你接管 SSH 认证，先往 `~/.gnupg/gpg-agent.conf` 里加一行：

```text
enable-ssh-support
```

重启一下 agent：

```bash
gpgconf --kill gpg-agent
gpgconf --launch gpg-agent
```

然后把当前终端的 `SSH_AUTH_SOCK` 指向 GnuPG 暴露出来的 SSH socket：

```bash
export SSH_AUTH_SOCK="$(gpgconf --list-dirs agent-ssh-socket)"
```

验证没问题后，把这行顺手写进 `~/.zshrc` 或 `~/.bashrc`，重开一个终端窗口，跑一下 `ssh-add -L` 看看 agent 有没有认出卡片里的认证密钥：

```bash
ssh-add -L
```

也可以把 SSH 公钥导一份留档备用：

```bash
gpg --export-ssh-key "$FPR" > ~/.ssh/openpgp-backup.pub
```

把这行公钥加到目标服务器的 `~/.ssh/authorized_keys` 或者 GitHub 的 SSH keys 页面，然后实际连一次试试：

```bash
ssh -T git@github.com
```

同样建议做个拔卡验证：把卡片拔掉再跑一次，正常应该无法用这把密钥通过认证。

## 11. 发布公钥与指纹

日常对外分享公钥，单独导出一份干净的公开版本：

```bash
gpg --armor \
  --output example-public.asc \
  --export "$FPR"
```

你可以把它挂到自己的个人网站上，比如：

```text
https://example.com/pgp.asc
```

注意这个 URL 必须直接返回 `example-public.asc` 的纯文本 ASCII 公钥内容。另外 OpenPGP 卡里的公钥 URL 字段只是单个字符串，只能填一个地址；如果你打算做多个镜像，最好在卡里填一个自己可控的长期稳定地址，再在服务端通过 HTTP 重定向指到当前镜像。

把地址写进卡片元数据：

```bash
gpg --card-edit
```

```text
admin
url
https://example.com/pgp.asc
quit
```

上传完后，顺手从公网拉一遍核对指纹对不对得上：

```bash
curl -fsSL https://example.com/pgp.asc |
  gpg --show-keys --fingerprint
```

切记，**往外放的只能是 `example-public.asc`**。千万别手滑把整个备份目录传上去了，`example-secret-full.asc`、`example-secret-subkeys.asc`、吊销证书和 `ownertrust.txt` 统统不能公开；前面做备份校验生成的签名测试文件也不是公钥，别混为一谈。

至于完整指纹，最好通过另一个独立渠道放出来（比如个人主页、GitHub Profile 或社交资料），方便别人交叉核对：

```text
<PRIMARY_KEY_FINGERPRINT>
```

如果你想让别人能直接按邮箱搜到你，也可以把公钥推到密钥服务器：

```bash
gpg --keyserver hkps://keys.openpgp.org \
  --send-keys "$FPR"
```

不过推送前先想清楚：密钥服务器上的记录不像普通文件那样说删就能彻底删掉，以后只能靠发吊销声明作废，所以先确认 UID 里的邮箱确实适合长期公开。另外推到 `keys.openpgp.org` 之后，还需要点一下它发来的验证邮件完成 UID 验证，别人才能按邮箱搜到这把公钥。

## 12. 几个值得按需斟酌的卡片安全开关

基础功能全跑顺了，下面这几个进阶选项可以按自己的使用习惯和固件兼容度逐个评估。

### 每次签名都强制输入 PIN（`forcesig`）

如果 `gpg --card-status` 里这行显示的是：

```text
Signature PIN ....: 非强制
```

就说明只要你在当前会话输过一次 PIN，后面连续签名可能不会再反复弹窗。如果你这张卡主要用来签重要的软件发布包，可以切到强制模式：

```bash
gpg --card-edit
```

输入：

```text
admin
forcesig
quit
```

`forcesig` 本身是个来回切换的开关，再敲一次就切回去了。这里主要看取舍：平时高频签 Git commit，非强制确实顺手不少；如果是签软件发布包或高敏感文件，开强制更让人安心。

### 物理触摸确认（UIF）

如果你的硬件明确支持触摸按键确认，稳妥起见先拿签名槽单独试水：

```bash
gpg --card-edit
```

```text
admin
uif 1 on
quit
```

确认签名确实要摸一下才放行，再决定要不要把解密槽和认证槽也打开：

```text
uif 2 on
uif 3 on
```

三个编号对应关系很简单：

```text
UIF 1 = Sign
UIF 2 = Decrypt
UIF 3 = Auth
```

这里有个实际操作时的细节提前说一下：开了 `Sign=on` 后，签名时照样会先弹用户 PIN 框；输完 PIN 窗口一关，GnuPG 往往只是在终端里静默卡着等，并不会再弹个「请触摸按键」的提示框，这时候直接摸一下卡就行。测试时可以故意先别碰它：如果终端老老实实停在那等，说明 UIF 真起作用了；如果没摸就瞬间签完了，先回头查一下 `gpg --list-secret-keys` 里签名主密钥是不是确实显示 `sec>`。要是已经是 `sec>` 还不触摸就出签名，那说明这块兼容卡的固件只是嘴上报告了个 `Sign=on`，底层压根没执行触摸策略。

> [!CAUTION]
> 兼容卡在触摸行为上未必和原厂 YubiKey 完全一致。测试阶段一律先用 `on`，千万别上来就设成 `permanent`——永久模式通常关不掉，万一固件行为不对，就只能重置整个 OpenPGP 应用并清空所有密钥了。

### KDF 开关

OpenPGP Card KDF 会在客户端先把你的 PIN 加盐迭代派生一遍，再把结果送给卡片，本意是强化 PIN 校验。但它的前提是所有你用到的客户端和固件都老老实实支持 KDF。

我这块兼容卡当前的默认状态是：

```text
KDF setting ......: off
```

在把固件来源、老客户端兼容性和恢复流程全摸透之前，我建议老老实实保持关闭。安全选项不是开得越多越好，乱开 KDF 很容易导致在某些旧环境下直接验不过 PIN。

### 卡片元数据

至于 `name`、`lang`、`login` 和公钥 `url`，这些都只是写在卡面上的元数据，不影响密钥本身的安全性，想写的话在 `gpg --card-edit` 里顺手配一下就行：

```text
gpg --card-edit
admin
name
lang
login
url
quit
```

再次提醒，只有当你已经把 ASCII 公钥稳稳托管在长期 HTTPS 地址上时才建议填 `url`，而且地址指向的只能是公钥，绝不能指向私钥备份。

## 13. 换一台新电脑怎么直接用

以后换新机器时，千万别把完整私钥备份导进联网的新电脑里——那样前面大费周章做的智能卡硬件隔离就白费了。新电脑上只需要导一下公钥，再让 GnuPG 认一下卡就行：

```bash
gpg --import example-public.asc
gpg --card-status
```

如果本地没有自动建出卡片桩引用，手动触发一次学习：

```bash
gpg-connect-agent "scd serialno" "learn --force" /bye
```

然后检查一下是不是已经变成 `sec>` / `ssb>` 了：

```bash
gpg --list-secret-keys \
  --keyid-format long \
  --with-subkey-fingerprint \
  "$FPR"
```

如果新电脑也要走卡片 SSH 登录，再把第 10 节的 `enable-ssh-support` 和 `SSH_AUTH_SOCK` 补上即可。

## 14. 遇到 PIN 锁定、卡片损坏或丢失怎么办

### 用户 PIN 输错锁死了

用户 PIN 的重试次数归零后，用第 5 节提前设好的 Reset Code 或者管理员 PIN 就能解锁。千万别上头继续瞎猜，把管理员 PIN 的重试次数也打光就真麻烦了。

### 卡片物理损坏，但这套身份还要继续用

把前面经过恢复验证的完整私钥离线备份拿出来，在一台隔离环境里恢复，再拿一块新卡重新走一遍 `keytocard` 写入即可。正因为私钥不可能从坏卡里抽出来，迁移前那份验证过的离线备份就是整套恢复链路里唯一的救命稻草。

### 卡片丢了，或者怀疑被人动过

只要你没法百分百确认卡片还在自己掌控下，最干脆的做法就是动用离线存着的吊销证书吊销主密钥，然后尽快把更新后的公钥推到各个公开渠道。注意吊销主密钥意味着整套身份彻底作废；如果只是打算轮换其中某一把子密钥，则应该用认证主密钥吊销旧子密钥、签发新子密钥，再重新发布公钥。

另外真到需要用 `.rev` 文件那一天，动手导入前记得先打开文件读一遍顶部的说明文字。GnuPG 自动生成的吊销证书通常会在 Armor 开头故意多加一个冒号防误导入，正式启用时得按文件里的提示把那个冒号删掉，才能正常导入并发布。

> [!WARNING]
> 吊销一旦发布通常不可逆转。只在确认密钥真的必须作废时才动手，千万别抱着「试试吊销证书好不好使」的心态，在真实钥匙环或公共密钥服务器上拿它做实验。

## 15. 留一份日常巡检清单

整套方案配完之后，平时隔三岔五照着下面几条过一眼就行：

- 定期跑一次 `gpg --card-status`，确认三个卡槽的指纹和 PIN 重试次数都正常；
- 每次改动 UID、有效期或子密钥后，记得重新导出并更新公开的公钥；
- 至少每年把两份离线备份拿出来检查一次，确认介质还没坏、依然可读；
- 保持 GnuPG、scdaemon、pinentry 以及卡片固件在较新状态；
- 私钥备份、保护密码、PIN 和 Reset Code 始终分开放置，不放进同一个篮子；
- 条件允许的话备一块空卡，或者至少把验证过的换卡流程记在手边；
- 别被「永不过期」麻痹，隔几年重新审视一下当前算法强度和硬件寿命。

## 最终验收标准

走完全部步骤后，你手里应该有一套和下面对齐的密钥结构：

```text
主密钥 [SC]
<PRIMARY_KEY_FINGERPRINT>

加密子密钥 [E]
<ENCRYPTION_SUBKEY_FINGERPRINT>

认证子密钥 [A]
<AUTH_SUBKEY_FINGERPRINT>
```

不过光看到卡槽里填满三把指纹还不算大功告成。我自己给这套流程定的完整验收门槛是：离线备份已经在隔离钥匙环里实测导入并成功签过名；签名和解密都验证过必须插卡才行；SSH 拿卡片跑通了一次真实登录；本地 `gpg --list-secret-keys` 明确显示为 `sec>` / `ssb>` 的卡片引用；公钥和完整指纹也发到了稳定位置。等这些底子全扎牢了，再去按需拧开 UIF、forcesig 这类进阶安全开关，心里才真正有底。

## 参考资料

- [GnuPG Manual：Smart Card Tool](https://www.gnupg.org/documentation/manuals/gnupg/Smart-Card-Tool.html)
- [GnuPG Manual：OpenPGP Card](https://www.gnupg.org/documentation/manuals/gnupg/OpenPGP-Card.html)
- [GnuPG Manual：GPG Configuration Options](https://www.gnupg.org/documentation/manuals/gnupg/GPG-Configuration-Options.html)
- [Yubico OpenPGP 文档](https://developers.yubico.com/PGP/)
- [GitHub：管理 commit 签名验证](https://docs.github.com/zh/authentication/managing-commit-signature-verification)
- [keys.openpgp.org 使用说明](https://keys.openpgp.org/about/usage)
