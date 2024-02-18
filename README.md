# Fuwari

Fuwari is a static blog template built with [Astro](https://astro.build), a refactored version of [hexo-theme-vivia](https://github.com/saicaca/hexo-theme-vivia).

[**🖥️Live Demo (Vercel)**](https://fuwari.vercel.app)

![Preview Image](https://raw.githubusercontent.com/saicaca/resource/main/fuwari/home.png)

## ✨ Features

- [x] **Built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com)**
- [x] **View Transitions between pages**
  - [is not supported by Firefox and Safari yet](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API#browser_compatibility)
- [x] Light / dark mode
- [x] Customizable theme colors & banner
- [x] Responsive design
- [ ] Comments
- [x] Search
- [ ] TOC

## 🚀 How to Use

1. [Generate a new repository](https://github.com/saicaca/fuwari/generate) from this template.
2. Edit the config file `src/config.ts` to customize your blog.
3. Run `npm run new-post -- <filename>` or `pnpm run new-post <filename>` to create a new post and edit it in `src/content/posts/`.
4. Deploy your blog to Vercel, Netlify, GitHub Pages, etc. following [the guides](https://docs.astro.build/en/guides/deploy/).

## ⚙️ Frontmatter of Posts

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: /images/cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
---
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                                                           | Action                                           |
|:------------------------------------------------------------------|:-------------------------------------------------|
| `npm install`                                                     | Installs dependencies                            |
| `npm run dev`                                                     | Starts local dev server at `localhost:4321`      |
| `npm run build`                                                   | Build your production site to `./dist/`          |
| `npm run preview`                                                 | Preview your build locally, before deploying     |
| `npm run astro ...`                                               | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help`                                         | Get help using the Astro CLI                     |
| `npm run new-post -- <filename>`<br/>`pnpm run new-post <filename>` | Create a new post                                |
