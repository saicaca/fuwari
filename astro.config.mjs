import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import swup from "@swup/astro";
import Compress from "astro-compress";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeComponents from "rehype-components";/* Render the custom directive content */
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";/* Handle directives */
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import remarkMath from "remark-math";
import remarkSectionize from "remark-sectionize";
import { AdmonitionComponent } from "./src/plugins/rehype-component-admonition.mjs";
import { GithubCardComponent } from "./src/plugins/rehype-component-github-card.mjs";
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype.js";
import { remarkExcerpt } from "./src/plugins/remark-excerpt.js";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";

import expressiveCode from "astro-expressive-code";
import rehypeExternalLinks from "rehype-external-links";
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'
import fuwariLinkCard from "./src/plugins/fuwari-link-card.ts";
import { pluginFileIcons } from "@xt0rted/expressive-code-file-icons";
import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  site: "https://ikamusume7.org/",
  base: "/",
  trailingSlash: "always",
  redirects: {
    "/posts/前端/在博客中添加系列栏/":"/posts/frontend/add_series_field/",
    "/posts/前端/改造博客的代码块/":"/posts/frontend/old_code_block/",
    "/posts/前端/增强代码块功能/":"/posts/frontend/code_block_ex/",
    "/posts/前端/从头开整Fuwari/":"/posts/frontend/recreate_repository/",
    "/posts/前端/带黑暗模式的评论功能/":"/posts/frontend/comments_with_darkmode/",
  },
  integrations: [tailwind(
      {
        nesting: true,
      }
  ), swup({
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
  }), icon({
    include: {
      "preprocess: vitePreprocess(),": ["*"],
      "fa6-brands": ["*"],
      "fa6-regular": ["*"],
      "fa6-solid": ["*"],
       "mdi": ["*"],
    },
  }), svelte(), sitemap(), Compress({
    CSS: false,
    Image: false,
    Action: {
      Passed: async () => true, // https://github.com/PlayForm/Compress/issues/376
    },
  }), expressiveCode({
    themes: ["catppuccin-frappe", "light-plus"],
    plugins: [pluginCollapsibleSections(), pluginLineNumbers(), 
      pluginFileIcons({
        iconClass: "text-4 w-5 inline mr-1 mb-1",
        titleClass: ""
      })
    ],
  }), fuwariLinkCard({
    internalLink: { enabled: true },
  }), partytown({
    config: {
      forward: ["dataLayer.push"],
    },
  }),],
  markdown: {
    remarkPlugins: [
      remarkMath,
      remarkReadingTime,
      remarkExcerpt,
      remarkGithubAdmonitionsToDirectives,
      remarkDirective,
      remarkSectionize,
      parseDirectiveNode,
    ],
    rehypePlugins: [
      rehypeKatex,
      rehypeSlug,
      [
        rehypeComponents,
        {
          components: {
            github: GithubCardComponent,
            note: (x, y) => AdmonitionComponent(x, y, "note"),
            tip: (x, y) => AdmonitionComponent(x, y, "tip"),
            important: (x, y) => AdmonitionComponent(x, y, "important"),
            caution: (x, y) => AdmonitionComponent(x, y, "caution"),
            warning: (x, y) => AdmonitionComponent(x, y, "warning"),
          },
        },
      ],
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
              "data-pagefind-ignore": true,
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
      [
        rehypeExternalLinks,
        {
          // content: { type: 'text', value: '🔗' },
          target: '_blank',
          rel: ['noopener', 'noreferrer'],
        },
      ],
    ],
  },
  vite: {
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          // temporarily suppress this warning
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
  },
});