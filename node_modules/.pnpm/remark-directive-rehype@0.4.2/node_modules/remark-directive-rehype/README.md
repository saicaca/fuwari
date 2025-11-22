# remark-directive-rehype

**[remark][]** plugin to integrate [remark-directive][] with [remark-rehype][].

## What is this?

This package is a [unified][] ([remark][]) plugin to enable Markdown directives to be parsed as HTML
when using [remark-rehype][]. Markdown directives are first parsed with [remark-directive][] 
which needs to be used before this plugin.

**unified** is a project that transforms content with abstract syntax trees
(ASTs).
**remark** adds support for markdown to unified.
**rehype** adds support for HTML to unified.
**mdast** is the markdown AST that remark uses.
**hast** is the markdown AST that rehype uses.
This is a remark plugin that transforms mdast.

## When should I use this?

This project is useful when you want directives parsed by [remark-directive][] to be later parsed as
HTML ([hast][] nodes) when using [remark-rehype][]. This is specifically useful when one wants to
convert Markdown directives into HTML tags that can be outputted as components with 
[react-markdown][].

## Installation

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [yarn][] or [npm][] :

```sh
yarn add remark-directive-rehype
npm install remark-directive-rehype
```

In Deno with [Skypack][]:

```js
import remarkDirectiveRehype from 'https://cdn.skypack.dev/remark-directive-rehype'
```

In browsers with [Skypack][]:

```html
<script type="module">
  import remarkDirectiveRehype from 'https://cdn.skypack.dev/remark-directive-rehype?min'
</script>
```

## Usage

Say we have the following file, `example.md`:

```markdown
:::documentation-page{title="Welcome"}

Please install :inline-code[unified]!

::copyright-notice{year="2020"}

:::
```

And our module `example.js` looks as follows:

```js
import {read} from 'to-vfile'
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkDirective from 'remark-directive'
import remarkDirectiveRehype from 'remark-directive-rehype'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

main()

async function main() {
  const file = await unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkDirectiveRehype)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(await read('example.md'))

  console.log(String(file))
}
```

Now running `node example` yields:

```html
<documentation-page title="Welcome">
  <p>Please install <inline-code>unified</inline-code>!</p>
  <copyright-notice year="2020"></copyright-notice>
</documentation-page>
```

## Examples

### Example: `react-markdown`

You can use it with [react-markdown][] to render custom React components for each defined directive.

```js
import React from 'react'
import ReactDom from 'react-dom'
import ReactMarkdown from 'react-markdown'
import remarkDirective from 'remark-directive'
import remarkDirectiveRehype from 'remark-directive-rehype'

const markdown = `
# Cat videos

::youtube-video[Video of a cat in a box]{#01ab2cd3efg}
`

const YouTubeVideo = ({id, children}) => (
  <iframe
    src={'https://www.youtube.com/embed/' + id}
    width="200"
    height="200"
  >
    {children}
  </iframe>
)

ReactDom.render(
  <ReactMarkdown
    children={markdown}
    remarkPlugins={[remarkDirective, remarkDirectiveRehype]}
    components={{
      'youtube-video': YouTubeVideo
    }}
  />,
  document.body
)
```

Yields:

```html
<h1>Cat videos</h1>
<iframe src="https://www.youtube.com/embed/01ab2cd3efg" width="200" height="200">Video of a cat in a box</iframe>
```

### Example: `rehype-components`

You can use in conjunction with [rehype-components][] to render components made with [hastscript][].

```js
// …

const file = await unified()
  .use(remarkParse)
  .use(remarkDirective)
  .use(remarkDirectiveRehype)
  .use(remarkRehype)
  .use(rehypeComponents, {
    components: {
      'documentation-page': DocumentationPage,
      'inline-code': InfoBox,
      'copyright-notice': CopyrightNotice,
    },
  })
  .use(rehypeStringify)
  .process(await read('example.md'))

console.log(String(file))
```

See [rehype-components][] for more information on how to implement the components.

## Contributing

Contributions are always welcome!

See [`./docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md) for ways to get started.

<!-- Definitions -->

[remark]: https://github.com/remarkjs/remark

[remark-directive]: https://github.com/remarkjs/remark-directive

[remark-rehype]: https://github.com/remarkjs/remark-rehype

[unified]: https://github.com/unifiedjs/unified

[hast]: https://github.com/syntax-tree/hast

[yarn]: https://yarnpkg.com/lang/en/docs/install/

[npm]: https://docs.npmjs.com/cli/install

[skypack]: https://www.skypack.dev/

[react-markdown]: https://github.com/remarkjs/react-markdown

[rehype-components]: https://github.com/marekweb/rehype-components

[hastscript]: https://github.com/syntax-tree/hastscript
