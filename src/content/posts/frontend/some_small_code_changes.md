---
title: 对Fuwari进行一些小的改动
published: 2025-03-03
updated: 2025-03-04
description: '字体、置顶文章、链接卡片、代码块标识'
image: ''
tags: [Fuwari, Astro, 博客]
category: '前端'
draft: false 
lang: ''
series: '改造博客'
---

## 字体

字体修改参考了 *《在Fuwari使用自定义字体》* by AULyPc，感谢

https://blog.aulypc0x0.online/posts/use_custom_fonts_in_fuwari/

博主这里引入了两种粗细的`MiSans`字体

https://hyperos.mi.com/font/zh/

```css title="src\styles\main.css" ins={5-18}

.collapsed {
    height: var(--collapsedHeight);
}

@font-face {
    font-family: 'MiSans';
    src: url('/fonts/MiSans-Regular.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
}
@font-face {
    font-family: 'MiSans';
    src: url('/fonts/MiSans-Semibold.woff2') format('woff2');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
}
```

```js title="tailwind.config.cjs" ins={10} del={9}
/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme")
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue,mjs}"],
  darkMode: "class", // allows toggling dark mode manually
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "sans-serif", ...defaultTheme.fontFamily.sans],
        sans: ["MiSans"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}

```

## 置顶文章

参考了[feat: add post pinning feature and fix icon dependencies](https://github.com/saicaca/fuwari/pull/317)

## 链接卡片

参考了[feat: add link-card feature](https://github.com/saicaca/fuwari/pull/324/commits)

## 代码块标识

一个`expressive-code`的插件，增加代码块的语言标识图标

https://github.com/xt0rted/expressive-code-file-icons

这是博主的设置，修改样式后需**删除**项目里的`📁.astro`，并**重启项目**才能看到效果

```js title="astro.config.mjs" ins={1, 10-13}
import { pluginFileIcons } from "@xt0rted/expressive-code-file-icons";

export default defineConfig({
  // ...
  integrations: [
    // ...
    , expressiveCode({
    themes: ["catppuccin-frappe", "light-plus"],
    plugins: [pluginCollapsibleSections(), pluginLineNumbers(), 
      pluginFileIcons({
        iconClass: "text-4 w-5 inline mr-1 mb-1",
        titleClass: ""
      })
    ],
  }),
  ]
})
```

:::warning
不过有些标识图标不适用双主题，比如 Astro<br>
下面是博主的临时解决办法
:::

```svelte title="src\components\widget\Comments.svelte" ins={1-15, 22}
function updateAstroSvg(){
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  const spans = document.querySelectorAll('figcaption > .title')
  spans.forEach(span => {
    if (!span || !span.innerHTML.includes('astro')) return

    const paths = span.querySelectorAll('svg > path')
    if (theme === 'dark'){
      paths[1].setAttribute('fill', '#fff')
    }
    else{
      paths[1].setAttribute('fill', '#000')
    }
  })
}

const observer = new MutationObserver(updateGiscusTheme)
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

window.onload = () => {
  updateGiscusTheme()
  updateAstroSvg()
}
```
```svelte title="src\components\LightDarkSwitch.svelte" ins={9, 36, 39-52} collapse={12-23}
onMount(() => {
  mode = getStoredTheme()

  if (mode === DARK_MODE) {
    document.documentElement.setAttribute("data-theme", "catppuccin-frappe");
  } else {
    document.documentElement.setAttribute("data-theme", "light-plus");
  }
  updateAstroSvg(mode)
  
  const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)')
  const changeThemeWhenSchemeChanged: Parameters<
    typeof darkModePreference.addEventListener<'change'>
  >[1] = e => {
    applyThemeToDocument(mode)
  }
  darkModePreference.addEventListener('change', changeThemeWhenSchemeChanged)
  return () => {
    darkModePreference.removeEventListener(
      'change',
      changeThemeWhenSchemeChanged,
    )
  }
})


function switchScheme(newMode: LIGHT_DARK_MODE) {
  mode = newMode
  setTheme(newMode)
  
  if (mode === DARK_MODE) {
    document.documentElement.setAttribute("data-theme", "catppuccin-frappe");
  } else {
    document.documentElement.setAttribute("data-theme", "light-plus");
  }
  updateAstroSvg(mode)
}

function updateAstroSvg(mode: LIGHT_DARK_MODE) {
  const spans = document.querySelectorAll('figcaption > .title')
  spans.forEach(span => {
    if (!span || !span.innerHTML.includes('astro')) return

    const paths = span.querySelectorAll('svg > path')
    if (mode === DARK_MODE){
      paths[1].setAttribute('fill', '#fff')
    }
    else{
      paths[1].setAttribute('fill', '#000')
    }
  })
}
```

