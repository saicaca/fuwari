# Fuwari

> [!WARNING]
> This project is still very unfinished and the code is quite messy.

Fuwari (not the final name maybe) is a static blog template built with [Astro](https://astro.build), a refactored version of [hexo-theme-vivia](https://github.com/saicaca/hexo-theme-vivia).

[**🖥️Live Demo (Vercel)**](https://fuwari.vercel.app)

## ✨ Features (Compared to the Hexo Version)

- Rebuilt with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com)
- View Transitions between pages
  - [haven't supported by Firefox and Safari yet](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API#browser_compatibility)
- A lot of UI redesign and improvements

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:3000`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
