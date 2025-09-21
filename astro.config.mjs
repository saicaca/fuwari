import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import swup from "@swup/astro";
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import { typst } from "astro-typst";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeComponents from "rehype-components"; /* Render the custom directive content */
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive"; /* Handle directives */
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import remarkSectionize from "remark-sectionize";
import { expressiveCodeConfig } from "./src/config.ts";
import { componentMap } from "./src/plugins/components-map.mjs";
import {
  ecAstroPlugins,
  ecDefaultProps,
  ecStyleOverrides,
} from "./src/plugins/expressive-code/shared-config.ts";
import { rehypeTypstEc } from "./src/plugins/rehype-typst-ec.mjs";
import { rehypeTypstFootnotes } from "./src/plugins/rehype-typst-footnotes.mjs";
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype.js";
import { remarkExcerpt } from "./src/plugins/remark-excerpt.js";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";
import { typstOptions, typstTarget } from "./src/typst/targets.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://fuwari.vercel.app/",
  base: "/",
  trailingSlash: "ignore",
  integrations: [
    tailwind({ nesting: true }),
    typst({ target: typstTarget, options: typstOptions }),
    swup({
      theme: false,
      animationClass: "transition-swup-",
      containers: ["main", "#toc"],
      smoothScrolling: true,
      cache: true,
      preload: true,
      accessibility: true,
      updateHead: true,
      updateBodyClass: false,
      globalInstance: true,
    }),
    // Reduce icon bundle size: include only the icons actually used
    icon({
      // Only include required icons to minimize bundle size
      include: {
        "material-symbols": [
          "home-outline-rounded",
          "palette-outline",
          "menu-rounded",
          "keyboard-arrow-up-rounded",
          "calendar-today-outline-rounded",
          "edit-calendar-outline-rounded",
          "book-2-outline-rounded",
          "tag-rounded",
          "chevron-left-rounded",
          "more-horiz",
          "chevron-right-rounded",
          "notes-rounded",
          "schedule-outline-rounded",
          "copyright-outline-rounded",
          "wb-sunny-outline-rounded",
          "dark-mode-outline-rounded",
          "radio-button-partial-outline",
          "search",
        ],
        "fa6-solid": ["arrow-up-right-from-square", "arrow-rotate-left", "chevron-right"],
        "fa6-regular": ["address-card"],
        "fa6-brands": ["creative-commons", "twitter", "steam", "github"],
      },
    }),
    expressiveCode({
      themes: [expressiveCodeConfig.theme, expressiveCodeConfig.theme],
      plugins: ecAstroPlugins(),
      defaultProps: ecDefaultProps,
      styleOverrides: ecStyleOverrides,
      frames: { showCopyToClipboardButton: false },
    }),
    svelte(),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [
      remarkReadingTime,
      remarkExcerpt,
      remarkGithubAdmonitionsToDirectives,
      remarkDirective,
      remarkSectionize,
      parseDirectiveNode,
    ],
    rehypePlugins: [
      rehypeSlug,
      [rehypeComponents, { components: componentMap }],
      // Transform Typst <ec> nodes to fully rendered Expressive Code blocks
      rehypeTypstEc,
      // Normalize simple Typst footnotes paragraph to a semantic footnotes section
      rehypeTypstFootnotes,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: { className: ["anchor"] },
          content: {
            type: "element",
            tagName: "span",
            properties: {
              className: ["anchor-icon"],
              "data-pagefind-ignore": true,
            },
            children: [{ type: "text", value: "#" }],
          },
        },
      ],
    ],
  },
  vite: {
    plugins: [],
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          if (
            warning.message.includes("is dynamically imported by") &&
            warning.message.includes("but also statically imported by")
          ) {
            return;
          }
          warn(warning);
        },
      },
    },
    ssr: { external: ["@myriaddreamin/typst-ts-node-compiler"] },
  },
});
