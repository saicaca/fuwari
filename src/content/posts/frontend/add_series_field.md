---
title: 在博客中添加系列栏
published: 2024-10-23
updated: 2025-02-28
description: 方便查看同系列相关文章
image: ""
tags: [Fuwari, Astro, 博客]
category: "前端"
draft: false
lang: ""
series: "改造博客"
---

> 如果是同一个系列（series）的文章，在名片栏下方增加一个系列栏，显示系列内所有文章的链接

## 改动点

1. 修改`📁i18n`里的文件，增加`series`Key

```ts title="src\i18n\i18nKey.ts" ins={3}
enum I18nKey {
    // ...
    series = 'series',
}

export default I18nKey
```
```ts title="src\i18n\languages\en.ts" ins={3}
export const en: Translation = {
    // ...
    [Key.series]: 'Series',
}
```
```ts title="src\i18n\languages\es.ts" ins={3}
export const es: Translation = {
    // ...
    [Key.series]: 'Serie',
}
```
```ts title="src\i18n\languages\ja.ts" ins={3}
export const ja: Translation = {
    // ...
    [Key.series]: 'シリーズ',
}
```
```ts title="src\i18n\languages\ko.ts" ins={3}
export const ko: Translation = {
    // ...
    [Key.series]: '시리즈',
}
```
```ts title="src\i18n\languages\th.ts" ins={3}
export const ko: Translation = {
    // ...
    [Key.series]: 'ชุด',
}
```
```ts title="src\i18n\languages\zh_CN.ts" ins={3}
export const zh_CN: Translation = {
    // ...
    [Key.series]: '系列',
}
```
```ts title="src\i18n\languages\zh_TW.ts" ins={3}
export const zh_TW: Translation = {
    // ...
    [Key.series]: '系列',
}
```

2. 在两个`config`文件里增加`series`字段

```ts title="src\types\config.ts" ins={3}
export type BlogPostData = {
  // ...
  series?: string
  prevTitle?: string
  prevSlug?: string
  nextTitle?: string
  nextSlug?: string
}
```
```ts title="src\content\config.ts" ins={5}
const postsCollection = defineCollection({
  schema: z.object({
    // ...
    lang: z.string().optional().default(''),
    series: z.string().optional(),

    /* For internal use */
    prevTitle: z.string().default(''),
    // ...
  }),
})
```

3. 修改`[...slug]`页面，将`series`传入`MainGridLayout`组件

```astro title="src\pages\posts\[...slug].astro" ins="series={entry.data.series}"
<MainGridLayout banner={entry.data.image} title={entry.data.title} 
    description={entry.data.description} lang={entry.data.lang} 
    setOGTypeArticle={true} series={entry.data.series}>
    
</MainGridLayout>
```

4. 修改`MainGridLayout`组件里的三处代码，接收`series`并将其传入`SideBar`组件

```astro title="src\layouts\MainGridLayout.astro" ins={8} ins=", series" ins="series={ series }"
---
interface Props {
  title?: string
  banner?: string
  description?: string
  lang?: string
  setOGTypeArticle?: boolean;
  series?: string
}

const { title, banner, description, lang, setOGTypeArticle, series } = Astro.props
---

<SideBar class="mb-4 row-start-2 row-end-3 col-span-2 lg:row-start-1 lg:row-end-2 lg:col-span-1 lg:max-w-[17.5rem] onload-animation" 
    series={ series }>
</SideBar>
```

5. 在`content-utils.ts`里添加`getPostSeries`方法

```ts title="src\utils\content-utils.ts"
export async function getPostSeries(
  seriesName: string,
): Promise<{ body: string; data: BlogPostData; slug: string }[]> {
  const posts = (await getCollection('posts', ({ data }) => {
    return (
      (import.meta.env.PROD ? data.draft !== true : true) &&
      data.series === seriesName
    )
  })) as unknown as { body: string; data: BlogPostData; slug: string }[]

  posts.sort((a, b) => {
    const dateA = new Date(a.data.published)
    const dateB = new Date(b.data.published)
    return dateA > dateB ? 1 : -1
  })

  return posts
}
```

6. `📁widget`里新增`Series`组件

```astro title="src\components\widget\Series.astro"
---
import I18nKey from '../../i18n/i18nKey'
import { i18n } from '../../i18n/translation'
import { getPostSeries } from '../../utils/content-utils'
import { getPostUrlBySlug } from '../../utils/url-utils'
import WidgetLayout from './WidgetLayout.astro'

const COLLAPSED_HEIGHT = '7.5rem'

interface Props {
  class?: string
  style?: string
  series: string
}
const className = Astro.props.class
const style = Astro.props.style
const seriesName = Astro.props.series

const series = await getPostSeries(seriesName)

const isCollapsed = series.length >= 10
---
<WidgetLayout name={i18n(I18nKey.series) + " - " + series[0].data.series} id="series" isCollapsed={isCollapsed} collapsedHeight={COLLAPSED_HEIGHT} class={className} style={style}>
    <div class="flex flex-col gap-1">
        {series.map(t => (
            <a href={getPostUrlBySlug(t.slug)}
                aria-label={t.data.title}
                class="group btn-plain h-10 w-full rounded-lg hover:text-[initial]"
            >
                <!-- dot and line -->
                <div class="w-[15%] md:w-[10%] relative dash-line h-full flex items-center">
                    <div class="transition-all mx-auto w-1 h-1 rounded group-hover:h-5
                    bg-[oklch(0.5_0.05_var(--hue))] group-hover:bg-[var(--primary)]
                    outline outline-4 z-50
                    outline-[var(--card-bg)]
                    group-hover:outline-[var(--btn-plain-bg-hover)]
                    group-active:outline-[var(--btn-plain-bg-active)]
                    "
                    ></div>
                </div>
                <!-- post title -->
                <div class="w-[85%] text-left font-bold
                    group-hover:translate-x-1 transition-all group-hover:text-[var(--primary)]
                    text-75 pr-8 whitespace-nowrap overflow-ellipsis overflow-hidden"
                >
                        {t.data.title}
                </div>
            </a>
        ))}
    </div>
</WidgetLayout>
```

7. 在`SideBar`组件中导入`Series`组件，接收`series`并将其出入`Series`组件

```astro title="src\components\widget\SideBar.astro" ins={7, 12, 17, 25-27}
---
import Profile from './Profile.astro'
import Tag from './Tags.astro'
import Categories from './Categories.astro'
import type { MarkdownHeading } from 'astro'
import TOC from './TOC.astro'
import Series from './Series.astro'

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
    </div>
</div>
```

8. 在 swup 的 containers 配置项里加上`#series`

```js title="astro.config.mjs" ins=", \"#series\""
export default defineConfig({
  integrations: [
    swup({
      theme: false,
      animationClass: "transition-swup-", // see https://swup.js.org/options/#animationselector
      // the default value `transition-` cause transition delay
      // when the Tailwind class `transition-all` is used
      containers: ["main", "#toc", "#series"],
      smoothScrolling: true,
      cache: true,
      preload: true,
      accessibility: true,
      updateHead: true,
      updateBodyClass: false,
      globalInstance: true,
    }),
  ],
});
```
