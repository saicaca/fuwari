---
title: 对Fuwari进行一些小的改动（二）
published: 2025-03-18
description: '图片标题'
image: ''
tags: [Fuwari, Astro, 博客]
category: '前端'
draft: false 
lang: ''
series: '改造博客'
---

## 图片标题

> 参考了《Astro Blog記事の画像にキャプションを付ける》文章中的第一种方式

https://www.neputa-note.net/2024/07/astro-image-caption/

### 操作步骤
1. 安装两个插件

```cmd
pnpm add -D @microflash/remark-figure-caption remark-gfm
```

2. 导入两个插件

```js title="astro.config.mjs" ins={1-2, 9-10}
import remarkGfm from 'remark-gfm'
import remarkFigureCaption from '@microflash/remark-figure-caption'

export default defineConfig({
    // ...
    markdown: {
        remarkPlugins: [
            // ...
            remarkFigureCaption,
            remarkGfm,
        ]
    }
})
```

3. 添加样式

```css title="src\styles\main.css"
figure {
  width: fit-content;
}

figure > figcaption {
  text-align: center;
}
```


### 测试

```md title="demo1.md"
![シオン(诗音)](/avatar.webp)
```

![シオン(诗音)](/avatar.webp)

```md title="demo2.md"
| ![シオン(诗音)](/avatar.webp) | ![シオン(诗音)](/avatar.webp) |
|------------------------------|------------------------------|
```

| ![シオン(诗音)](/avatar.webp) | ![シオン(诗音)](/avatar.webp) |
|------------------------------|------------------------------|