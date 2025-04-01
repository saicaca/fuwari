---
title: git使用笔记
description: git备忘录
image: https://s21.ax1x.com/2025/03/27/pEDxjnP.png 
published: 2025-03-27
tags: [组件库]
category: 学习笔记
draft: false
 
---

## 记一次coding代码提交时推送github

我在coding上有一个项目想要同步推送到github上,正好coding有持续集成,那就搞起来;

### 获取github的token

登录GitHub

        ⬇️

 `settings/profile`

        ⬇️

  `Developer settings`

        ⬇️

新建token (记得勾选`repo`) ;

### 设置coding持续集成脚本

直接新建一个空的就可以,然后覆盖

```Groovy
pipeline {
 agent any
 stages {
   stage('检出') {
     steps {
       checkout([
         $class: 'GitSCM',
         branches: [[name: env.GIT_BUILD_REF]],
         userRemoteConfigs: [[url: env.GIT_REPO_URL, credentialsId: env.CREDENTIALS_ID]]
       ])
     }
   }
   stage('推送部署') {
     steps {
       echo '正在推送文件...'
       sh 'git fetch $FETCH'
       sh 'git push -f $FETCH HEAD:master'
       echo '已完成推送.'
     }
   }
 }
}
```

然后设置环境变量

key : `FETCH`

value : `https://用户名:token@github.com/用户名/仓库名.git`

> 注意一下分支名称, git分支默认mian,coding 默认分支上master;

搞定~

## 删除长时间没更新的分支

新建个.sh文件

```bash
#!/bin/bash
git checkout master

beforeDay=150 # 天数修改

tarBranch=$(git branch -r )
for branch in $tarBranch
do
 echo $branch
 lastDate=$(git show -s --format=%ci origin/$branch)
 convertDate=$(echo $lastDate | cut -d' ' -f 1)
 Todate=$(date -d "$convertDate" +'%s')
 current=$(date +'%s')
 day=$(( ( $current - $Todate )/60/60/24 ))
 echo "last commit on $branch branch was $day days ago"
 if [ "$day" -gt $beforeDay ]; then  
    git push origin :$branch
    echo "delete the old branch $branch"
 fi
done

git checkout develop
#deleted merged branches on developer branch
tarBranch=$(git branch -r)
for branch in $tarBranch
do
 echo $branch
 lastDate=$(git show -s --format=%ci origin/$branch)
 convertDate=$(echo $lastDate | cut -d' ' -f 1)
 Todate=$(date -d "$convertDate" +'%s')
 current=$(date +'%s')
 day=$(( ( $current - $Todate )/60/60/24 ))
 echo "last commit on $branch branch was $day days ago"
 if [ "$day" -gt $beforeDay ]; then
    git push origin :$branch
    echo "delete the old branch $branch"
 fi
done  
```

## 导出提交记录

`git log --pretty=format:"%ai , %an: %s"  --encoding=“GBK” >> ./wxmaster-240904.csv`

## tauri github Action跨平台编译

先给项目中的action权限改成读写;

然后根目录新建 .github/workflows/release.yml

```yml
# 可选，将显示在 GitHub 存储库的“操作”选项卡中的工作流名称
name: Release CI

# 指定此工作流的触发器
on:
  push:
    # 匹配特定标签 (refs/tags)
    tags:
      - 'v*' # 推送事件匹配 v*, 例如 v1.0，v20.15.10 等来触发工作流

# 需要运行的作业组合
jobs:
  # 任务：创建 release 版本
  create-release:
    runs-on: ubuntu-latest
    outputs:
      RELEASE_UPLOAD_ID: ${{ steps.create_release.outputs.id }}

    steps:
      - uses: actions/checkout@v2
      # 查询版本号（tag）
      - name: Query version number
        id: get_version
        shell: bash
        run: |
          echo "using version tag ${GITHUB_REF:10}"
          echo ::set-output name=version::"${GITHUB_REF:10}"

      # 根据查询到的版本号创建 release
      - name: Create Release
        id: create_release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: '${{ steps.get_version.outputs.VERSION }}'
          release_name: 'SGP ${{ steps.get_version.outputs.VERSION }}'
          body: '直接下载安装就可;'
  
  # 编译 Tauri
  build-tauri:
    needs: create-release
    strategy:
      fail-fast: false
      matrix:
        platform: [macos-latest, ubuntu-latest, windows-latest]

    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v2

     # 安装 Node.js
      - name: Setup node
        uses: actions/setup-node@v1
        with:
          node-version: 21

      # 安装 Rust
      - name: Install Rust stable
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable

      # 使用 Rust 缓存，加快安装速度
      - uses: Swatinem/rust-cache@v1

      - name: install dependencies (ubuntu only)
        if: matrix.platform == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev webkit2gtk-4.0 libappindicator3-dev librsvg2-dev patchelf

      # 获取 yarn 缓存路径
      - name: Get yarn cache directory path
        id: yarn-cache-dir-path
        run: echo "::set-output name=dir::$(yarn config get cacheFolder)"

      # 使用 yarn 缓存
      - name: Yarn cache
        uses: actions/cache@v2
        id: yarn-cache # use this to check for `cache-hit` (`steps.yarn-cache.outputs.cache-hit != 'true'`)
        with:
          path: ${{ steps.yarn-cache-dir-path.outputs.dir }}
          key: ${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}
          restore-keys: |
            ${{ runner.os }}-yarn-

      # 安装依赖执行构建，以及推送 github release
      - name: Install app dependencies and build it
        run: yarn && yarn tauri build
      - uses: tauri-apps/tauri-action@v0.3
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          releaseId: ${{ needs.create-release.outputs.RELEASE_UPLOAD_ID }}
```
