---
title: 对Fuwari进行一些小的改动（二）
published: 2025-03-18
updated: 2025-03-20
description: '图片标题、调整图片大小、图片居中、更新时间、音乐播放器'
image: ''
tags: [Fuwari, Astro, 博客]
category: '前端'
draft: false 
lang: ''
series: '改造博客'
---

## 一、图片标题

> 可在图片的下方显示标题<br>
> 参考了 **《Astro Blog記事の画像にキャプションを付ける》** 文章中的第一种方式

https://www.neputa-note.net/2024/07/astro-image-caption/

### 1.1 示例

代码：
```md title="demo1.md"
![シオン(诗音)](/avatar.webp)
```

结果：
![シオン(诗音)](/avatar.webp)

代码：
```md title="demo2.md"
![シオン(诗音)](/avatar.webp) | ![シオン(诗音)](/avatar.webp)
-----------------------------|----------------------------
```

结果：
![シオン(诗音)](/avatar.webp) | ![シオン(诗音)](/avatar.webp)
-----------------------------|-----------------------------

:::tip[补充]
表格头的下边界可通过`css`调整
```css title="src\styles\main.css"
thead:has(figure) {
  border: none;
}
```
:::

### 1.2 改动点
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

## 二、调整图片大小与图片居中

> 参考了`remark-figure-caption`的部分代码

https://github.com/Microflash/remark-figure-caption

### 2.1 示例

代码：
```md title="demo3.md" " width:50%"
![シオン(诗音) w-50%](/avatar.webp)
```

结果：
![シオン(诗音) w-50%](/avatar.webp)

代码：
```md title="demo4.md"
![シオン(诗音) m-auto](/avatar.webp)
```

结果：
![シオン(诗音) m-auto](/avatar.webp)

代码：
```md title="demo3.md" " width:50%"
![シオン(诗音) w-30% m-auto](/avatar.webp)
```

结果：
![シオン(诗音) w-30% m-auto](/avatar.webp)

### 2.2 改动点

1. 删除之前在`main.css`中添加的样式（如果有的话）

```css title="src\styles\main.css" del={1-7}
figure {
  width: fit-content;
}

figure > figcaption {
  text-align: center;
}
```

2. 在`📁src\plugins`里新建`remark-image-width.js`，代码如下

```js title="src\plugins\remark-image-width.js"
import { visit } from "unist-util-visit";

export default function remarkImageWidth() {
    return (tree) => {
        var regex1 = / w-([0-9]+)%/;
        var regex2 = / m-auto/;
        
        visit(
			tree,
			(node) => node.type === "image",
			(node, index, parent) => {
                var alt = node.alt;
                node.data = {hProperties: {}};
                if (parent.type === "figure") {
                    parent.data.hProperties = {style: "width: fit-content;"};
                }
                if (alt.search(regex1) != -1) {
                    node.data.hProperties.width = `${alt.match(regex1)[1]}%`;
                    node.alt = node.alt.replace(regex1, "");
                }
                if (alt.search(regex2) != -1) {
                    node.data.hProperties.style = "margin-inline: auto;";
                    node.alt = node.alt.replace(regex2, "");
                    if (parent.type === "figure") {
                        parent.data.hProperties.style = null;
                    }
                }
			}
		);

        visit(
			tree,
			(node) => node.type === 'figcaption',
			(node, index, parent) => {
                var text = node.children[0].value
                node.data.hProperties = { style: "text-align: center;" };
                if (text.search(regex1) != -1) {
                    if (text.search(regex2) == -1) {
                        node.data.hProperties.style = node.data.hProperties.style + `width: ${text.match(regex1)[1]}%;`;
                    }
                    node.children[0].value = node.children[0].value.replace(regex1, "");
                }
                if (text.search(regex2) != -1) {
                    node.children[0].value = node.children[0].value.replace(regex2, "");
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

## 三、更新时间

> 在主页的文章卡片列表里添加每篇文章的更新时间

### 3.1 改动点
更改`PostCard.astro`文件里的`PostMetadata`组件属性设置
```astro title="src\components\PostCard.astro" /hideUpdateDate={[a-z]*}/ ins={3-4} del={1-2}
<PostMetadata published={published} updated={updated} tags={tags}
    category={category} hideTagsForMobile={true} hideUpdateDate={false} class="mb-4"></PostMetadata>
<PostMetadata published={published} updated={updated} tags={tags} 
    category={category} hideTagsForMobile={true} hideUpdateDate={true} class="mb-4"></PostMetadata>
```

## 四、音乐播放器

:::warning[提醒]
目前播放器会有加载不出来或者一次性加载出来多个的问题
:::

### 4.1 改动点

1. 新增`APlayer.svelte`组件和`Music.astro`组件
```svelte title="src\components\widget\APlayer.svelte"
<div class="meting" id="meting">
    <!-- require APlayer -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.css">
    <script src="https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.js"></script>
    <!-- require MetingJS -->
    <script src="https://cdn.jsdelivr.net/npm/meting@2/dist/Meting.min.js"></script>
    <meting-js
        server="netease"
        type="playlist"
        id="7245850391"
        order="random"
        list-folded="true">
    </meting-js>
</div>
```

```astro title="src\components\widget\Music.astro"
---
import WidgetLayout from './WidgetLayout.astro'
import APlayer from './APlayer.svelte'

const COLLAPSED_HEIGHT = '7.5rem'

interface Props {
  class?: string
  style?: string
}
const className = Astro.props.class
const style = Astro.props.style

const isCollapsed = false
---
<WidgetLayout name="音乐" id="music" isCollapsed={isCollapsed} collapsedHeight={COLLAPSED_HEIGHT} class={className} style={style}>
    <div class="flex flex-col gap-1">
        <APlayer client:only="svelte"/>
    </div>
</WidgetLayout>
```

2. 导入`Music.astro`组件
```astro title="src\components\widget\SideBar.astro" ins={8, 31-33} collapse={2-6, 10-18}
---
import Profile from './Profile.astro'
import Tag from './Tags.astro'
import Categories from './Categories.astro'
import type { MarkdownHeading } from 'astro'
import TOC from './TOC.astro'
import Series from './Series.astro'
import Music from './Music.astro'

interface Props {
    class? : string
    headings? : MarkdownHeading[]
    series?: string
}

const className = Astro.props.class
const headings = Astro.props.headings
const series = Astro.props.series

---
<div id="sidebar" class:list={[className, "w-full"]}>
    <div class="flex flex-col w-full gap-4 mb-4">
        <Profile></Profile>
    </div>
    <div id="sidebar-sticky" class="transition-all duration-700 flex flex-col w-full gap-4 top-4 sticky top-4">
        <div id="series" class="flex flex-col w-full gap-4">
            { series && <Series series={ series }></Series> }
        </div>
        <Categories class="onload-animation" style="animation-delay: 150ms"></Categories>
        <Tag class="onload-animation" style="animation-delay: 200ms"></Tag>
        <div id="music" class="flex flex-col w-full gap-4">
            <Music></Music>
        </div>
    </div>
</div>
```