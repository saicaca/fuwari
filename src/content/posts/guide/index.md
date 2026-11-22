---
title: Fuwari 文章编写指南
published: 2024-04-01
description: "分享 Fuwari 博客的日常写作约定，整理了文章 frontmatter 字段、存放目录和配图组织方式。"
image: "./cover.jpeg"
tags: [demo, astro, guide]
category: Guides
draft: true
device: Windows
---
> Cover image source: [Source](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=2048/01651-1456859105-(colour_1.5),girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg)

这个博客基于 [Astro](https://astro.build/) 搭建。每次开新坑写文章时，总有几个 frontmatter 字段和目录约定需要顺手查一下，所以在这里留一份精简备忘；这里只记 Fuwari 项目特有的写法，更通用的配置与机制直接翻 [Astro 文档](https://docs.astro.build/) 会更全。

## 文章 frontmatter

新建文章时，可以在顶部按下面的 YAML 模板填写元信息：

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
---
```

各个基础字段的含义和路径规则对照如下：

| Attribute       | Description                                                                                                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`       | The title of the post.                                                                                                                                                                                                          |
| `published`   | The date the post was published.                                                                                                                                                                                                |
| `description` | A short description of the post. Displayed on index page.                                                                                                                                                                       |
| `image`       | The cover image path of the post.``1. Start with `http://` or `https://`: Use web image``2. Start with `/`: For image in `public` dir``3. With none of the prefixes: Relative to the markdown file |
| `tags`        | The tags of the post.                                                                                                                                                                                                           |
| `category`    | The category of the post.                                                                                                                                                                                                       |
| `draft`       | If this post is still a draft, which won't be displayed.                                                                                                                                                                        |

## 文件位置

所有正文统一放在 `src/content/posts/` 目录下。纯文字或外链配图的文章直接放单个 `.md` 文件就够了；如果一篇文章自带封面或较多本地配图，建一个同名子目录把 `index.md` 和图片收在一起，后续迁移和维护都会清爽很多：

```
src/content/posts/
├── post-1.md
└── post-2/
    ├── cover.png
    └── index.md
```
