---
title: 对Fuwari进行一些小的改动（二）
published: 2025-03-18
updated: 2025-03-19
description: '图片标题、调整图片大小、更新时间'
image: ''
tags: [Fuwari, Astro, 博客]
category: '前端'
draft: false 
lang: ''
series: '改造博客'
---

## 图片标题

> 可在图片的下方显示标题<br>
> 参考了 **《Astro Blog記事の画像にキャプションを付ける》** 文章中的第一种方式

https://www.neputa-note.net/2024/07/astro-image-caption/

### 例1

```md title="demo1.md"
![シオン(诗音)](/avatar.webp)
```

![シオン(诗音)](/avatar.webp)

### 例2

```md title="demo2.md"
![シオン(诗音)](/avatar.webp) | ![シオン(诗音)](/avatar.webp)
-----------------------------|----------------------------
```

![シオン(诗音)](/avatar.webp) | ![シオン(诗音)](/avatar.webp)
-----------------------------|-----------------------------

:::tip[补充]
表格的边界可通过`thead`调整
```css title="src\styles\main.css"
thead:has(figure) {
  border: none;
}
```
:::

### 改动点
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

## 调整图片大小

> 参考了`remark-figure-caption`的代码

https://github.com/Microflash/remark-figure-caption

### 例

```md title="demo3.md" " width:50%"
![シオン(诗音) w:50%](/avatar.webp)
```

![シオン(诗音) w:50%](/avatar.webp)

### 改动点

1. 在`📁src\plugins`里新增`remark-image-width.js`

```js title="src\plugins\remark-image-width.js"
import { visit } from "unist-util-visit";

export default function remarkImageWidth() {
    return (tree) => {
        var regex = / w:([0-9]+)%/;
        
        visit(
			tree,
			(node) => node.type === "image",
			(node, index, parent) => {
                var alt = node.alt;
                if (alt.search(regex) != -1) {
                    var width = `${alt.match(regex)[1]}%`;
                    node.data = {hProperties: {width: width}};
                    node.alt = alt.replace(regex, "");
                }
			}
		);

        visit(
			tree,
			(node) => node.type === 'figcaption',
			(node, index, parent) => {
                var text = node.children[0].value
                if (text.search(regex) != -1) {
                    var width = `${text.match(regex)[1]}%`;
                    node.data = {hName: "figcaption", hProperties: {style: `width: ${width};`}};
                    node.children[0].value = text.replace(regex, "");
                }
			}
		);

    }
}
```

2. 导入

```js title="astro.config.mjs" ins={1, 10}
import remarkImageWidth from './src/plugins/remark-image-width.js'

export default defineConfig({
    // ...
    markdown: {
        remarkPlugins: [
            // ...
            remarkFigureCaption,
            remarkGfm,
            remarkImageWidth,
        ]
    }
})
```

## 更新时间

> 在主页的文章卡片列表里添加每篇文章的更新时间

### 改动点

```astro title="src\components\PostCard.astro" /hideUpdateDate={[a-z]*}/ ins={3-4} del={1-2}
<PostMetadata published={published} updated={updated} tags={tags}
    category={category} hideTagsForMobile={true} hideUpdateDate={false} class="mb-4"></PostMetadata>
<PostMetadata published={published} updated={updated} tags={tags} 
    category={category} hideTagsForMobile={true} hideUpdateDate={true} class="mb-4"></PostMetadata>
```