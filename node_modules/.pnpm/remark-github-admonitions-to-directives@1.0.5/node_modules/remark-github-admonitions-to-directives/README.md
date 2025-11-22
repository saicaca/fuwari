<div align="center">
  <h1 align="center">Remark Github Alerts to Directives</h1>

  <a href="https://www.npmjs.com/package/remark-github-admonitions-to-directives">
    <img alt="NPM version" src="https://img.shields.io/npm/v/remark-github-admonitions-to-directives?logo=npm&style=flat-square">
  </a>
  <a href="https://github.com/incentro-dc/remark-github-admonitions-to-directives/actions/workflows/build.yml">
    <img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/incentro-dc/remark-github-admonitions-to-directives/build.yml?label=Builds&logo=github&style=flat-square">
  </a>
  <a href="https://github.com/incentro-dc/remark-github-admonitions-to-directives/actions/workflows/test.yml">
    <img alt="Test status" src="https://img.shields.io/github/actions/workflow/status/incentro-dc/remark-github-admonitions-to-directives/test.yml?label=Tests&logo=vitest&style=flat-square">
  </a>
  <a href="https://prettier.io/">
    <img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?logo=prettier&style=flat-square">
  </a>
</div>

## 💫 Introduction

Github introduced [alerts in markdown files](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts) with their own proprietary syntax [instead of using Remark directives](https://github.com/orgs/community/discussions/16925#discussioncomment-2791869). This plugin converts Github's blockquote alert style to [Remark admonitions](https://github.com/elviswolcott/remark-admonitions) syntax.

It will transform this:

```markdown
> [!NOTE]
> Content
```

Into this:

```markdown
:::note
Content
:::
```

## 💾 Installation

You can install this plugin with:

```bash
pnpm add -D remark-github-admonitions-to-directives
```

## 🪛 Usage

This plugin is just a generic [unified](https://github.com/unifiedjs/unified) ([remark](https://github.com/remarkjs/remark)) plugin to transform one syntax into another. Below are some examples of how to use it with various plugins / systems:

### 📃 With Remark (and Directives)

```typescript
import { remark } from "remark";
import remarkDirective from "remark-directive";
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";

const processor = remark()
  .use(remarkGithubAdmonitionsToDirectives)
  .use(remarkDirective);

const result = processor.processSync(`
> [!NOTE]
> content
`);

console.log(result.toString());

// should output:
// :::note
// content
// :::
```

### 🦖 With Docusaurus

[Admonitions](https://docusaurus.io/docs/markdown-features/admonitions) are a core feature of Docusaurus and this plugin was actually built with the use case of reusing markdown files, written with Github's syntax, in Docusaurus.

To use this plugin, just use [the instructions for adding MDX plugins](https://docusaurus.io/docs/markdown-features/plugins) and add this plugin to the `beforeDefaultRemarkPlugins` section of your `docusaurus.config.js` file:

```javascript
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";

export default {
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          path: "docs",
          beforeDefaultRemarkPlugins: [remarkGithubAdmonitionsToDirectives],
        },
      },
    ],
  ],
};
```

> [!IMPORTANT]
> Because this plugin converts Github's syntax to the directives syntax, and Docusaurus then uses the directives syntax to create the adminitions, this plugin has to be processed before any of the Docusaurus plugins. This is why it's added to the `beforeDefaultRemarkPlugins` array and not the `remarkPlugins` array.

# 🙌 Contributing

This plugin was created and is maintained by [Incentro](https://www.incentro.com/). If you're running into issues, please [open an issue](https://github.com/incentro-dc/remark-github-admonitions-to-directives/issues/new). If you want to contribute, please read our [contributing guidelines](./CONTRIBUTING.md).
