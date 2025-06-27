# Fuwari 项目结构

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