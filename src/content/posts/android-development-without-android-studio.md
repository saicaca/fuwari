---
title: 不安装 Android Studio 也能开发 Android
published: 2026-07-20
description: "分享一套不装 Android Studio 的开发流程：只靠 JDK、Android SDK Command-line Tools、Gradle Wrapper 和 ADB，完成构建、测试与真机安装。"
tags: [android, kotlin, gradle, adb, env-setup]
category: 环境与系统
draft: false
aigc: Codex
device: MacBook Pro
---

写 Android 不一定非得装一个庞大的 Android Studio。拆开来看，真正参与编译和打包的其实就四个东西：

- JDK；
- Android SDK；
- Gradle Wrapper；
- ADB。

至于写代码，用你顺手的 VS Code、Neovim 或者别的文本编辑器就行。下面我以一个 Kotlin 原生 Android 项目为例，分享怎么完全依靠项目内的命令行工具链，跑通测试、打 APK 和装到真机的全流程。

## 准备环境

这里以 `compileSdk = 35` 的项目为例，我们需要提前准备好下面这几样组件：

- JDK 17；
- Android SDK Command-line Tools；
- Platform 35；
- Build-Tools 35.0.0；
- Platform-Tools。

拿到 Android SDK Command-line Tools 后，我习惯把它直接放进项目目录里隔离管理，路径结构长这样：

```text
.android-toolchain/sdk/cmdline-tools/latest/
```

目录摆好后，把 SDK 和 Gradle 的缓存路径也一并收拢到当前项目下，再用 `sdkmanager` 同意协议并拉取所需的 SDK 组件：

```bash
export ANDROID_SDK_ROOT="$PWD/.android-toolchain/sdk"
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export ANDROID_USER_HOME="$PWD/.android-user-home"
export GRADLE_USER_HOME="$PWD/.gradle-user-home"

SDKMANAGER="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager"

yes | "$SDKMANAGER" --sdk_root="$ANDROID_SDK_ROOT" --licenses
"$SDKMANAGER" --sdk_root="$ANDROID_SDK_ROOT" \
  "platforms;android-35" \
  "build-tools;35.0.0" \
  "platform-tools"
```

装完组件，还需要在项目根目录补一份 `local.properties`（注意不要提交到 Git），把刚才的 SDK 绝对路径告诉 Gradle：

```properties
sdk.dir=/absolute/path/to/project/.android-toolchain/sdk
```

## 构建与测试

规范的 Android 项目本身就会提交 Gradle Wrapper，所以我们完全不用在系统里全局安装 Gradle，直接调项目自带的 `./gradlew` 就能一键跑单元测试并打出 Debug 包：

```bash
./gradlew testDebugUnitTest assembleDebug
```

跑完之后，生成的 Debug APK 会落在默认输出目录里：

```text
app/build/outputs/apk/debug/app-debug.apk
```

如果中途改了代码只想快速重新打包、跳过测试，直接执行下面这句就够了：

```bash
./gradlew assembleDebug
```

## 安装到真机

包打好之后，就可以往真机上装了。先在手机里打开「开发者选项」和「USB 调试」，插上数据线并点一下授权弹窗，然后用项目工具链里自带的 `adb` 确认设备已经被识别：

```bash
.android-toolchain/sdk/platform-tools/adb devices -l
```

确认设备在线后，直接用 `-r` 参数覆盖安装刚打好的 APK：

```bash
.android-toolchain/sdk/platform-tools/adb install -r \
  app/build/outputs/apk/debug/app-debug.apk
```

终端吐出 `Success`，就说明已经稳稳装到手机上了。

## 几点注意

实际用这套方案开发时，有两处细节别漏掉：

1. 记得把 `.android-toolchain/`、`.android-user-home/`、`.gradle-user-home/`、`local.properties` 以及构建输出目录都加进 `.gitignore`，免得把工具链和本地路径误提交进仓库。
2. 平时调试用的 Debug APK 不需要额外折腾签名；但真到了要发正式版 APK 或 AAB 时，还是得用 `keytool` 生成 keystore 并配置好 Release 签名。

只要把单测、APK 构建和真机安装这三步跑顺，这套命令行工具链就算验证通过了。当然，Android Studio 在布局预览和性能分析上依然有它的优势，但至少在日常编码和构建这件事上，它并不是非装不可的前置条件。
