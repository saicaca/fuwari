---
title: 在Fuwari中添加评论功能(带黑暗模式)
published: 2025-02-28
description: '使用Giscus实现评论功能'
image: 'https://img.ikamusume7.org/%E9%89%84%E8%A1%80%E5%85%AC%E5%9B%BD%E3%81%AE%E6%8A%80%E8%A1%93%E3%81%8C%E4%B8%96%E7%95%8C%E4%B8%80%E3%82%A3%EF%BC%81.webp'
tags: [Astro, Fuwari, Giscus, 博客]
category: '前端'
draft: false 
lang: ''
series: '改造博客'
---

> 封面图来源：[てつぶた(鉄血公国の技術が世界一ィ！)🔗](https://www.pixiv.net/artworks/66965429)

:::note[前言]
首先感谢下面两位博主的文章，本博文是在此基础上编写的<br>
**《利用giscus给你的网站添加评论功能》** by AULyPc<br>
**《How to integrate Giscus to your Astro Blog》** by Maxence Poutord
:::

https://blog.aulypc0x0.online/posts/add_comment_for_your_website_in_fuwari/

https://www.maxpou.fr/blog/giscus-with-astro/

:::important[前提条件]
导入Giscus的部分请参考[《利用giscus给你的网站添加评论功能》](https://blog.aulypc0x0.online/posts/add_comment_for_your_website_in_fuwari/)<br>
本文中写的改动点只涉及到增加**黑暗模式**
:::

## 改动点

1. 在`src\components\widget`目录下新建`Comments.svelte`文件<br>
标注的部分需要替换为读者自己的giscus代码，**注意第12行不能替换**
```svelte title="src\components\widget\Comments.svelte" {2-11, 13-16}
<section>
    <script src="https://giscus.app/client.js"
        data-repo="[在此输入仓库]"
        data-repo-id="[在此输入仓库 ID]"
        data-category="[在此输入分类名]"
        data-category-id="[在此输入分类 ID]"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme={$mode === DARK_MODE ? 'dark' : 'light'}
        data-lang="zh-CN"
        crossorigin="anonymous"
        async>
    </script>
</section>

<script>
import { AUTO_MODE, DARK_MODE } from '@constants/constants.ts'
import { onMount } from 'svelte'
import { writable } from 'svelte/store';
import { getStoredTheme } from '@utils/setting-utils.ts'
const mode = writable(AUTO_MODE)
onMount(() => {
  mode.set(getStoredTheme())
})

function updateGiscusTheme() {
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  const iframe = document.querySelector('iframe.giscus-frame')
  if (!iframe) return
  iframe.contentWindow.postMessage({ giscus: { setConfig: { theme } } }, 'https://giscus.app')
}

const observer = new MutationObserver(updateGiscusTheme)
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

window.onload = () => {
  updateGiscusTheme()
}
</script>
```

2. 修改文件`src\pages\friends.astro`中的代码

引入`Comments`组件
```astro title="src\pages\friends.astro" ins={8}
---
import MainGridLayout from '../layouts/MainGridLayout.astro' 

import { getEntry } from 'astro:content'
import { i18n } from '../i18n/translation'
import I18nKey from '../i18n/i18nKey'
import Markdown from '@components/misc/Markdown.astro'
import Comments from '@components/widget/Comments.svelte'

const friendsPost = await getEntry('spec', 'friends')
```
用组件代码代替原先的代码
```astro title="src\pages\friends.astro" ins={18} del={3-17}
    </div>

<script src="https://giscus.app/client.js"
        data-repo="[在此输入仓库]"
        data-repo-id="[在此输入仓库 ID]"
        data-category="[在此输入分类名]"
        data-category-id="[在此输入分类 ID]"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="zh-CN"
        crossorigin="anonymous"
        async>
</script>
<Comments client:only="svelte"></Comments>

</MainGridLayout>
```

文件`src\pages\posts\[...slug].astro`中也是相同的操作，就不重复了