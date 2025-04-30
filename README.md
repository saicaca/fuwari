# 🍥Fuwari

A static blog template built with [Astro](https://astro.build).

[**🖥️ Live Demo (Vercel)**](https://fuwari.vercel.app)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;
[**📦 Old Hexo Version**](https://github.com/saicaca/hexo-theme-vivia)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;
[**🌏 中文**](https://github.com/runwezh/fuwari/blob/main/README.zh-CN.md)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;
[**🌏 日本語**](https://github.com/runwezh/fuwari/blob/main/README.ja-JP.md)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;
[**🌏 한국어**](https://github.com/runwezh/fuwari/blob/main/README.ko.md)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;
[**🌏 Español**](https://github.com/runwezh/fuwari/blob/main/README.es.md)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;
[**🌏 ไทย**](https://github.com/runwezh/fuwari/blob/main/README.th.md)

> README version: `2024-09-10`

![Preview Image](https://raw.githubusercontent.com/saicaca/resource/main/fuwari/home.png)

## ✨ Features

- [x] Built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com)
- [x] Smooth animations and page transitions
- [x] Light / dark mode
- [x] Customizable theme colors & banner
- [x] Responsive design
- [ ] Comments
- [x] Search
- [ ] TOC

## 🚀 How to Use

1. [Generate a new repository](https://github.com/runwezh/fuwari/generate) from this template or fork this repository.
2. To edit your blog locally, clone your repository, run `pnpm install` AND `pnpm add sharp` to install dependencies.
   - Install [pnpm](https://pnpm.io) `npm install -g pnpm` if you haven't.
3. Edit the config file `src/config.ts` to customize your blog.
4. Run `pnpm new-post <filename>` to create a new post and edit it in `src/content/posts/`.
5. Deploy your blog to Vercel, Netlify, GitHub Pages, etc. following [the guides](https://docs.astro.build/en/guides/deploy/). You need to edit the site configuration in `astro.config.mjs` before deployment.

## ⚙️ Frontmatter of Posts

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
lang: jp      # Set only if the post's language differs from the site's language in `config.ts`
---
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                             | Action                                           |
|:------------------------------------|:-------------------------------------------------|
| `pnpm install` AND `pnpm add sharp` | Installs dependencies                            |
| `pnpm dev`                          | Starts local dev server at `localhost:4321`      |
| `pnpm build`                        | Build your production site to `./dist/`          |
| `pnpm preview`                      | Preview your build locally, before deploying     |
| `pnpm new-post <filename>`          | Create a new post                                |
| `pnpm astro ...`                    | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro --help`                 | Get help using the Astro CLI                     |
# Fuwari - 一个基于 Astro 和 Svelte 的现代化博客主题

Fuwari 是一个简洁、快速、功能丰富的博客主题，使用 Astro 框架构建，并集成了 Svelte 用于交互式组件。

## ✨ 特性

*   🚀 **极速性能**: 基于 Astro 构建，默认输出零 JavaScript 的静态 HTML。
*   🎨 **Tailwind CSS**: 使用 Tailwind CSS 进行样式设计，易于定制。
*   🧩 **Svelte 组件**: 使用 Svelte 编写交互式 UI 组件。
*   📝 **Markdown/MDX 支持**: 使用 Markdown 或 MDX 编写内容，支持 Frontmatter。
*   🌙 **深色模式**: 内置深色/浅色模式切换。
*   🔍 **全文搜索**: (如果集成了 Pagefind 或类似工具) 集成客户端搜索功能。
*   ⚙️ **SEO 优化**: 自动生成 Sitemap，支持 Open Graph 标签。
*   🖼️ **图片优化**: (如果配置了) 使用 Astro 的图片优化功能。
*   🌐 **国际化 (i18n)**: 支持多语言。
*   📄 **代码高亮**: 使用 Shiki 进行语法高亮。
*   ➕ **数学公式**: 支持 KaTeX。
*   🧭 **页面过渡**: 使用 Swup.js 实现平滑的页面过渡动画。

## 🛠️ 技术栈

*   **框架**: [Astro](https://astro.build/)
*   **UI 组件**: [Svelte](https://svelte.dev/)
*   **样式**: [Tailwind CSS](https://tailwindcss.com/)
*   **包管理器**: [pnpm](https://pnpm.io/)
*   **图标**: [Iconify](https://icones.js.org/)
*   **页面过渡**: [Swup.js](https://swup.js.org/)
*   **Markdown 处理**:
    *   [remark](https://github.com/remarkjs/remark) / [rehype](https://github.com/rehypejs/rehype)
    *   [remark-math](https://github.com/remarkjs/remark-math) / [rehype-katex](https://github.com/remarkjs/remark-math/tree/main/packages/rehype-katex) (数学公式)
    *   [rehype-slug](https://github.com/rehypejs/rehype-slug) (标题锚点)
    *   [rehype-autolink-headings](https://github.com/rehypejs/rehype-autolink-headings) (标题自动链接)
    *   自定义插件 (摘要、阅读时间等)
*   **代码高亮**: [Shiki](https://shiki.matsu.io/) (Astro 内置)
*   **压缩**: [astro-compress](https://github.com/PlayForm/Compress) (可选)
*   **站点地图**: `@astrojs/sitemap`
*   **部署**: 静态站点托管 (Render, Vercel, Netlify, GitHub Pages 等)

## 📁 目录结构

```
.
├── .astro/             # Astro 构建缓存和类型生成
├── .vscode/            # VS Code 编辑器配置
├── dist/               # 构建输出目录
├── node_modules/       # 项目依赖
├── public/             # 静态资源 (直接复制到构建输出)
│   └── assets/
├── src/                # 项目源代码
│   ├── assets/         # 需要 Astro 处理的资源 (图片, 字体等)
│   │   └── images/
│   ├── components/     # 可复用 UI 组件 (.astro, .svelte)
│   │   └── widget/     # 特定的小部件
│   ├── content/        # Astro 内容集合 (Markdown/MDX)
│   │   ├── config.ts   # 内容集合配置和 Schema 定义
│   │   └── posts/      # 博客文章 Markdown 文件
│   ├── i18n/           # 国际化相关文件
│   │   ├── i18nKey.ts  # 翻译键定义
│   │   └── translation/ # 翻译文件
│   ├── layouts/        # 页面布局组件 (.astro)
│   ├── pages/          # 页面路由 (.astro, .md, .ts for API)
│   │   ├── api/        # API 路由 (示例)
│   │   ├── posts/      # 博客文章动态路由
│   │   └── ...         # 其他页面路由 (首页, 归档等)
│   ├── plugins/        # 自定义 remark/rehype 插件
│   ├── styles/         # 全局样式文件 (CSS, SCSS)
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 工具函数
│   ├── config.ts       # 站点核心配置文件 (标题, 导航, Profile 等)
│   └── env.d.ts        # TypeScript 环境类型声明
├── .gitignore          # Git 忽略配置
├── astro.config.mjs    # Astro 配置文件
├── package.json        # 项目元数据和依赖列表
├── pnpm-lock.yaml      # pnpm 锁文件
├── README.md           # 项目说明文件 (本文档)
├── svelte.config.js    # Svelte 配置文件
├── tailwind.config.cjs # Tailwind CSS 配置文件
└── tsconfig.json       # TypeScript 配置文件
```

## 🚀 快速开始

1.  **克隆仓库**:
    ```bash
    git clone https://github.com/runwezh/fuwari.git
    cd fuwari
    ```

2.  **安装依赖**:
    ```bash
    pnpm install
    ```

3.  **启动开发服务器**:
    ```bash
    pnpm dev
    ```

4.  **构建项目**:
    ```bash
    pnpm build
    ```

5.  **预览构建结果**:
    ```bash
    pnpm preview
    ```

## ⚙️ 配置

主要的站点配置在 `src/config.ts` 文件中，你可以在这里修改网站标题、副标题、导航链接、个人信息等。

Astro 的核心配置在 `astro.config.mjs` 文件中，包括集成、Markdown 处理插件等。

Tailwind CSS 的配置在 `tailwind.config.cjs` 文件中。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

##📄 许可证

[MIT](./LICENSE) (如果项目中有 LICENSE 文件) 或者根据实际情况填写。

```# filepath: /Users/zhaohua/study/fuwari/README.md

# Fuwari - 一个基于 Astro 和 Svelte 的现代化博客主题

Fuwari 是一个简洁、快速、功能丰富的博客主题，使用 Astro 框架构建，并集成了 Svelte 用于交互式组件。

## ✨ 特性

*   🚀 **极速性能**: 基于 Astro 构建，默认输出零 JavaScript 的静态 HTML。
*   🎨 **Tailwind CSS**: 使用 Tailwind CSS 进行样式设计，易于定制。
*   🧩 **Svelte 组件**: 使用 Svelte 编写交互式 UI 组件。
*   📝 **Markdown/MDX 支持**: 使用 Markdown 或 MDX 编写内容，支持 Frontmatter。
*   🌙 **深色模式**: 内置深色/浅色模式切换。
*   🔍 **全文搜索**: (如果集成了 Pagefind 或类似工具) 集成客户端搜索功能。
*   ⚙️ **SEO 优化**: 自动生成 Sitemap，支持 Open Graph 标签。
*   🖼️ **图片优化**: (如果配置了) 使用 Astro 的图片优化功能。
*   🌐 **国际化 (i18n)**: 支持多语言。
*   📄 **代码高亮**: 使用 Shiki 进行语法高亮。
*   ➕ **数学公式**: 支持 KaTeX。
*   🧭 **页面过渡**: 使用 Swup.js 实现平滑的页面过渡动画。

## 🛠️ 技术栈

*   **框架**: [Astro](https://astro.build/)
*   **UI 组件**: [Svelte](https://svelte.dev/)
*   **样式**: [Tailwind CSS](https://tailwindcss.com/)
*   **包管理器**: [pnpm](https://pnpm.io/)
*   **图标**: [Iconify](https://icones.js.org/)
*   **页面过渡**: [Swup.js](https://swup.js.org/)
*   **Markdown 处理**:
    *   [remark](https://github.com/remarkjs/remark) / [rehype](https://github.com/rehypejs/rehype)
    *   [remark-math](https://github.com/remarkjs/remark-math) / [rehype-katex](https://github.com/remarkjs/remark-math/tree/main/packages/rehype-katex) (数学公式)
    *   [rehype-slug](https://github.com/rehypejs/rehype-slug) (标题锚点)
    *   [rehype-autolink-headings](https://github.com/rehypejs/rehype-autolink-headings) (标题自动链接)
    *   自定义插件 (摘要、阅读时间等)
*   **代码高亮**: [Shiki](https://shiki.matsu.io/) (Astro 内置)
*   **压缩**: [astro-compress](https://github.com/PlayForm/Compress) (可选)
*   **站点地图**: `@astrojs/sitemap`
*   **部署**: 静态站点托管 (Render, Vercel, Netlify, GitHub Pages 等)

## 📁 目录结构

```
.
├── .astro/             # Astro 构建缓存和类型生成
├── .vscode/            # VS Code 编辑器配置
├── dist/               # 构建输出目录
├── node_modules/       # 项目依赖
├── public/             # 静态资源 (直接复制到构建输出)
│   └── assets/
├── src/                # 项目源代码
│   ├── assets/         # 需要 Astro 处理的资源 (图片, 字体等)
│   │   └── images/
│   ├── components/     # 可复用 UI 组件 (.astro, .svelte)
│   │   └── widget/     # 特定的小部件
│   ├── content/        # Astro 内容集合 (Markdown/MDX)
│   │   ├── config.ts   # 内容集合配置和 Schema 定义
│   │   └── posts/      # 博客文章 Markdown 文件
│   ├── i18n/           # 国际化相关文件
│   │   ├── i18nKey.ts  # 翻译键定义
│   │   └── translation/ # 翻译文件
│   ├── layouts/        # 页面布局组件 (.astro)
│   ├── pages/          # 页面路由 (.astro, .md, .ts for API)
│   │   ├── api/        # API 路由 (示例)
│   │   ├── posts/      # 博客文章动态路由
│   │   └── ...         # 其他页面路由 (首页, 归档等)
│   ├── plugins/        # 自定义 remark/rehype 插件
│   ├── styles/         # 全局样式文件 (CSS, SCSS)
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 工具函数
│   ├── config.ts       # 站点核心配置文件 (标题, 导航, Profile 等)
│   └── env.d.ts        # TypeScript 环境类型声明
├── .gitignore          # Git 忽略配置
├── astro.config.mjs    # Astro 配置文件
├── package.json        # 项目元数据和依赖列表
├── pnpm-lock.yaml      # pnpm 锁文件
├── README.md           # 项目说明文件 (本文档)
├── svelte.config.js    # Svelte 配置文件
├── tailwind.config.cjs # Tailwind CSS 配置文件
└── tsconfig.json       # TypeScript 配置文件
```

## 🚀 快速开始

1.  **克隆仓库**:
    ```bash
    git clone https://github.com/runwezh/fuwari.git
    cd fuwari
    ```

2.  **安装依赖**:
    ```bash
    pnpm install
    ```

3.  **启动开发服务器**:
    ```bash
    pnpm dev
    ```

4.  **构建项目**:
    ```bash
    pnpm build
    ```

5.  **预览构建结果**:
    ```bash
    pnpm preview
    ```

## ⚙️ 配置

主要的站点配置在 `src/config.ts` 文件中，你可以在这里修改网站标题、副标题、导航链接、个人信息等。

Astro 的核心配置在 `astro.config.mjs` 文件中，包括集成、Markdown 处理插件等。

Tailwind CSS 的配置在 `tailwind.config.cjs` 文件中。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

##📄 许可证

[MIT](./LICENSE) (如果项目中有 LICENSE 文件) 或者根据实际情况填写。
