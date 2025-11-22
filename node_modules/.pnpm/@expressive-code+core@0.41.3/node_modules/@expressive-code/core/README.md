# @expressive-code/core

The core package of [Expressive Code](https://expressive-code.com/), an engine for presenting source code on the web.

## Documentation

[Read the Expressive Code docs](https://expressive-code.com/) to learn more about the features provided by Expressive Code.

## When should I use this?

Using this core package directly is **only recommended for advanced use cases**.

Unless you're a plugin or integration author, you should probably use a higher-level package like [`astro-expressive-code`](https://www.npmjs.com/package/astro-expressive-code) or [`rehype-expressive-code`](https://www.npmjs.com/package/rehype-expressive-code) instead of this one.

## Installation

```bash
npm install @expressive-code/core
```

## Usage example

```js
// File: generate-html-core.mjs

import { ExpressiveCodeEngine } from '@expressive-code/core'
import { toHtml } from '@expressive-code/core/hast'
import fs from 'fs'

const ec = new ExpressiveCodeEngine({
  plugins: [
    // Add your plugins here
  ],
})

// Get base styles that should be included on the page
// (they are independent of the rendered code blocks)
const baseStyles = await ec.getBaseStyles()
const themeStyles = await ec.getThemeStyles()
const jsModules = await ec.getJsModules()

const renderResult = await ec.render({
  code: 'console.log("Hello world!")',
  language: 'js',
  meta: '',
})

// Output results to the console
console.dir({
  baseStyles,
  themeStyles,
  blockStyles: renderResult.styles,
  htmlContent: toHtml(renderResult.renderedGroupAst),
})

// Convert the rendered AST to HTML
let htmlContent = toHtml(renderResult.renderedGroupAst)

// Collect styles and add them before the HTML content
const stylesToPrepend = []
stylesToPrepend.push(baseStyles)
stylesToPrepend.push(themeStyles)
stylesToPrepend.push(...renderResult.styles)

const styleContent = `<style> ${[...stylesToPrepend].join('')} </style>`
const jsContent = `<script type="module"> ${[...jsModules].join('')} </script>`

const htmlDocument = `
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>

    ${styleContent}

    ${jsContent}
</head>
<body>
    ${htmlContent}
</body>
</html>
`

// Output HTML to the console
console.log(htmlDocument)

// Run `node generate-html.mjs` to generate the HTML file
// and open it in the browser
fs.writeFileSync('index.html', htmlDocument)
```
