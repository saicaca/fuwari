---
title: 对Fuwari进行一些小的改动
published: 2025-03-03
description: '字体、置顶文章、链接卡片'
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