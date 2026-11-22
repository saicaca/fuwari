---
title: VS Code macOS C++ 环境配置
published: 2025-08-27
description: 分享一套在 macOS 上用 VS Code 写单文件 C++ 的配置，整理了必备扩展和编译、运行、调试的配置文件。
tags: [vscode, cpp, macos, env-setup]
category: 环境与系统
draft: false
device: Windows
---

平时在 macOS 上用 VS Code 写单文件 C++ 程序（比如刷题或者写点小工具），其实不需要配太复杂的工程构建系统，直接用系统自带的 Clang 搭配 LLDB 调试就够顺手。这里把我自己在用的一套精简配置记下来，开箱即用。

## 必备扩展

在 VS Code 扩展商店里装好下面三个就行：

- **C/C++**：提供基础的语言支持、补全与跳转；
- **CodeLLDB**：在 macOS 上配合 LLDB 做断点调试用；
- **Code Runner**：只用来顺手一键跑代码，别拿它代替正式的调试配置。

## 三个核心配置文件

把下面三个配置文件放进工作区的 `.vscode/` 目录，分工很明确：

- `tasks.json` 负责调用 `g++`（macOS 下默认指向系统 Clang）按 C++17 标准编译，并把可执行文件统一输出到当前目录下的 `bin/` 文件夹里，省得源码目录到处都是编译产物；
- `launch.json` 负责接管 `F5` 调试入口，启动前先跑一遍上面的 `build` 任务，再用 LLDB 在集成终端里拉起程序；
- `settings.json` 负责配齐头文件搜索路径（含自定义 `cpp_includes`）、IntelliSense 模式、文件关联，同时把 Code Runner 的编译命令和 C++ 扩展保持一致。

下面直接贴完整配置，按需微调路径和标准即可：

```json
<!-- launch.json -->
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug C++",
            "type": "lldb",
            "request": "launch",
            "program": "${fileDirname}/bin/${fileBasenameNoExtension}",
            "args": [],
            "cwd": "${workspaceFolder}",
            "preLaunchTask": "build",
            "console": "integratedTerminal"
        }
    ]
}
```

```json
<!-- tasks.json -->
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "build",
            "type": "shell",
            "command": "mkdir",
            "args": [
                "-p",
                "${fileDirname}/bin",
                "&&",
                "g++",
                "-std=c++17",
                "-g",
                "${file}",
                "-o",
                "${fileDirname}/bin/${fileBasenameNoExtension}"
            ],
            "group": "build",
            "problemMatcher": [
                "$gcc"
            ]
        }
    ]
}
```

```
<!--settings.json ->
{
    // C++扩展配置
    "C_Cpp.default.includePath": [
        "${workspaceFolder}/cpp_includes",
        "${workspaceFolder}/**"
    ],
    "C_Cpp.default.compilerPath": "/usr/bin/g++",
    "C_Cpp.default.cppStandard": "c++17",
    "C_Cpp.default.intelliSenseMode": "macos-gcc-arm64",

    // Code Runner配置 - 与C++扩展保持一致的头文件路径
    "code-runner.executorMap": {
        "cpp": "cd$workspaceRoot && mkdir -p bin && g++ -std=c++17 -O2 -g -I cpp_includes $fullFileName -o ./bin/$fileNameWithoutExt && ./bin/$fileNameWithoutExt"
    },
    "code-runner.runInTerminal": true,
    "code-runner.saveFileBeforeRun": true,
    "code-runner.clearPreviousOutput": false,
    "code-runner.preserveFocus": false,
    "code-runner.showExecutionMessage": true,

    // 文件关联
    "files.associations": {
        "*.h": "cpp",
        "*.hpp": "cpp",
        "*.cpp": "cpp",
        "*.cc": "cpp",
        "*.cxx": "cpp"
    }
}
```
