import tailwind from "@astrojs/tailwind"
import yaml from "@rollup/plugin-yaml"
import Compress from "astro-compress"
import icon from "astro-icon"
import { defineConfig } from "astro/config"
import Color from "colorjs.io"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeKatex from "rehype-katex"
import rehypeSlug from "rehype-slug"
import remarkMath from "remark-math"
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs"
import vue from "@astrojs/vue"

const oklchToHex = (str) => {
  const DEFAULT_HUE = 250
  const regex = /-?\d+(\.\d+)?/g
  const matches = str.string.match(regex)
  const lch = [matches[0], matches[1], DEFAULT_HUE]
  return new Color("oklch", lch).to("srgb").toString({
    format: "hex",
  })
}

// https://astro.build/config
export default defineConfig({
  site: "https://fuwari.vercel.app/",
  base: "/",
  integrations: [
    tailwind(),
    icon({
      include: {
        "material-symbols": ["*"],
        "fa6-brands": ["*"],
        "fa6-regular": ["*"],
        "fa6-solid": ["*"],
      },
    }),
    Compress({
      Image: false,
    }),
    vue()
  ],
  markdown: {
    remarkPlugins: [remarkMath, remarkReadingTime],
    rehypePlugins: [
      rehypeKatex,
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: {
            className: ["anchor"],
          },
          content: {
            type: "element",
            tagName: "span",
            properties: {
              className: ["anchor-icon"],
              'data-pagefind-ignore': true,
            },
            children: [
              {
                type: "text",
                value: "#",
              },
            ],
          },
        },
      ],
    ],
  },
  redirects: {
    "/": "/page/1",
  },
  vite: {
    plugins: [yaml()],
    css: {
      preprocessorOptions: {
        stylus: {
          define: {
            oklchToHex: oklchToHex,
          },
        },
      },
    },
  },
})
