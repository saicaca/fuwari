---
title: 静态页面服务商比较+智能网关测速脚本
published: 2024-11-28
description: '将你的静态网站发布到不同的服务商，并且自动在客户端测速并且选择最快那一个进入'
image: "https://oss.onani.cn/fuwari-blog/img/2024-11-28-08-37-49-image.png"
tags: [Vercel, Render, Cloudflare Pages, EdgeOne, Github Pages, Fleek, Surge]
category: '运维'
draft: false 
lang: ''
---

### 一文了解：7款静态网站服务商的优缺点比较

在构建个人博客、项目展示或者静态网站时，选择合适的托管服务商非常重要。不同的服务商提供不同的功能和特性，有的支持自定义域名，有的提供更快的访问速度，有的适合自动化部署。今天我们将介绍7款流行的静态网站服务商，帮助你选择最适合的方案。

#### 1. [Vercel](https://vercel.app/)

**优点**：

- 支持与 Git 集成，自动部署
- 提供自构建功能，支持动态内容生成
- 部署和访问速度都非常快
- 注册过程简便，易于上手
- 可绑定自定义域名，支持 HTTPS

**缺点**：

- 免费版有一定限制，如带宽和构建时间

**总结**：
Vercel 是一个非常受欢迎的静态网站托管平台，尤其适用于前端开发者。通过与 Git 集成，Vercel 可以自动部署和更新项目，构建速度非常快，支持大多数现代前端框架。

#### 2. [Render](https://render.com/)

**优点**：

- 支持与 Git 集成，自动部署
- 提供自构建功能
- 注册简单，快速上手
- 支持自定义域名绑定

**缺点**：

- 免费套餐功能相对有限

**总结**：
Render 是一个新兴的静态网站托管服务，提供了自动化部署和自构建的功能，适合想要快速搭建静态站点的用户。它的操作简单，易于上手。

#### 3. [Cloudflare Pages](https://dash.cloudflare.com/)

**优点**：

- 支持与 Git 集成，自动化部署
- 注册简单，快速上手
- 提供自构建功能，适合静态网站
- 支持自定义域名绑定
- 强大的抗 DDoS 防护

**缺点**：

- 适用于静态网站，动态功能受限

**总结**：
Cloudflare Pages 是一个由 Cloudflare 提供的静态网站托管平台，它的抗 DDoS 防护非常强大，适合对安全性要求较高的网站。借助 Cloudflare 的全球 CDN，站点访问速度也很快。

#### 4. [TencentCloud EdgeOne](https://edgeone.ai/)
### 别用，会吞Github提交，导致你的网站卡在旧版，我已经跑路了
**优点**：

- 支持与 Git 集成，自动部署
- 提供自构建功能
- 支持自定义域名绑定

**缺点**：

- 网站访问速度较慢
- 服务相对复杂，适用范围较窄

**总结**：
腾讯云 EdgeOne 适合企业级用户，提供高效的边缘计算服务，虽然功能完备，但在国内访问时速度较慢，因此不适合对速度有较高要求的个人站点。

#### 5. [Github Pages](https://github.com/)

**优点**：

- 与 Git 集成，直接通过 GitHub 仓库进行部署

- 速度非常快，不需要从零构建

- 可以通过 GitHub Actions 实现 CI/CD 自动化

- 支持自定义域名绑定

- 完全免费

- 示例Github Action创建静态分支workflow（gh-pages）：

- ```yaml
  name: Build and Deploy to GitHub Pages
  
  on:
    push:
      branches:
        - main # 监听 main 分支的推送事件
  
  permissions:
    contents: write
  
  jobs:
    build-and-deploy:
      runs-on: ubuntu-latest
  
      steps:
        # 检出代码仓库
        - name: Checkout repository
          uses: actions/checkout@v3
  
        # 安装 pnpm
        - name: Install pnpm
          run: corepack enable && corepack prepare pnpm@latest --activate
  
        # 验证 pnpm 安装
        - name: Verify pnpm version
          run: pnpm --version
  
        # 安装依赖并构建项目
        - name: Install dependencies and build
          run: |
            pnpm install
            pnpm build
  
        # 确保 CNAME 文件存在
        - name: Add CNAME file
          run: echo "github-blog.acofork.us.kg" > dist/CNAME
  
        # 获取 main 分支的提交信息
        - name: Get latest commit message from main branch
          run: |
            COMMIT_MESSAGE=$(git log -1 --pretty=%B)
            echo "Commit message: $COMMIT_MESSAGE"
            echo "COMMIT_MESSAGE=$COMMIT_MESSAGE" >> $GITHUB_ENV
  
        # 部署到 gh-pages
        - name: Deploy to gh-pages
          uses: peaceiris/actions-gh-pages@v3
          with:
            github_token: ${{ secrets.GITHUB_TOKEN }}
            publish_dir: ./dist
            destination_branch: gh-pages
            commit_message: ${{ env.COMMIT_MESSAGE }} # 使用 main 分支的提交信息
  
        # 触发 surge 部署
        - name: Trigger Deploy to Surge
          run: |
            curl -X POST \
            -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
            -H "Accept: application/vnd.github.v3+json" \
            https://api.github.com/repos/${{ github.repository }}/dispatches \
            -d '{"event_type":"deploy_surge"}'
  ```

- 

**缺点**：

- 国内访问可能会遇到 GitHub 阻断问题
- 对于复杂的动态功能支持较差

**总结**：
Github Pages 是一个免费的静态网站托管平台，特别适合与 GitHub 仓库紧密结合的项目。对于个人博客和小型项目，它非常实用，尤其是通过 GitHub Actions 自动化部署，操作便捷，且无需配置复杂。

#### 6. [Fleek](https://fleek.xyz/)

**优点**：

- 支持与 Git 集成，自动化部署
- 提供自构建功能
- 支持自定义域名绑定
- 基于 IPFS，支持去中心化存储

**缺点**：

- 访问速度相对适中

**总结**：
Fleek 是一个基于 IPFS 的去中心化托管平台，适合希望利用区块链技术的开发者。虽然其访问速度适中，但对于一些追求去中心化存储解决方案的项目，Fleek 是一个不错的选择。

#### 7. [Surge](https://surge.sh/)

**优点**：

- 快速部署，支持 CLI 命令行操作

- 简单易用，部署无需太多配置

- 示例Github Action进行CI/CD自动化（将gh-pages发布到Surge）：

- ```yaml
  name: Deploy to Surge
  
  on:
    repository_dispatch:
      types: [deploy_surge]  # 监听来自 build.yml 的自定义事件
  
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - name: Checkout code
          uses: actions/checkout@v3
          with:
            ref: gh-pages  # 检出 gh-pages 分支
  
        - name: Deploy to Surge
          run: |
            npm install -g surge
            surge ./ https://acofork-blog.surge.sh --token ${{ secrets.SURGE_TOKEN }}
          env:
            SURGE_TOKEN: ${{ secrets.SURGE_TOKEN }}
  ```

**缺点**：

- 无法直接与 Git 集成
- 无法绑定自定义域名

**总结**：
Surge 提供了一个简单的静态网站部署解决方案，虽然它不支持 Git 集成，但可以通过 GitHub Actions 实现 CI/CD 自动化部署。对于简单的静态网站，Surge 是一个快速且方便的选择，尤其适合开发者使用。

#### 8. [Netlify](https://netlify.com/)

**优点**：

- 注册门槛较高，但速度非常快
- 支持自部署，便于自动化流程
- 支持自定义域名绑定
- 提供全球加速，性能非常好
- 支持与 Git 集成，自动化部署

**缺点**：

- 注册时需要使用纯净IP和谷歌邮箱
- 对某些区域的访问可能存在限制

**总结**：
Netlify 是一个高性能的静态网站托管平台，特别适合那些对访问速度有较高要求的用户。尽管注册门槛较高，但它支持自部署和自动化部署，操作非常方便。对于希望拥有自定义域名且对加速有较高需求的站点，Netlify 是一个非常不错的选择。

---

---

### 总结

选择一个合适的静态网站托管平台，需要根据你的需求来决定。以下是一些简要的推荐：

- **Vercel**：如果你需要快速部署和全球加速，Vercel 是一个理想的选择。
- **Render**：如果你喜欢简单易用的界面和部署，Render 非常适合。
- **Cloudflare Pages**：如果你的站点对安全性有较高需求，Cloudflare Pages 提供了强大的 DDoS 防护。
- **Github Pages**：对于 GitHub 用户，Github Pages 是一个免费的静态网站托管平台。
- **Fleek**：如果你想尝试去中心化技术，Fleek 提供基于 IPFS 的托管服务。
- **Surge**：对于简单项目，Surge 提供了非常快速的部署方案，尽管没有 Git 集成。

~~根据你的实际需求选择最适合的服务商，为你的项目提供更好的托管和加速支持。~~我的建议是有多少用多少！

---

# 智能网关测速HTML代码：

> 使用了这么多的节点，肯定想要选择最快的或者在用户那边装逼，所以这边给一个智能网关测速HTML代码，它去请求了`https://acofork.us.kg/data.json`并且挨个给里面的`博客`节点测速，然后自动选择最快的那个。如果你只是小项目使用，可以使用硬编码，这里就给出Git仓库

::github{repo="afoim/Smart_Gateway"}

# 简易导航页HTML代码：

> 刚才说了“它去请求了`https://acofork.us.kg/data.json`并且挨个给里面的`博客`节点测速，然后自动选择最快的那个。”这就是`data.json`所在的地方

::github{repo="afoim/Web_test"}
