# rehype-components

`rehype-components` is a [**rehype**][rehype] plugin to render components, which
are actually custom elements in HTML that get replaced by the output of a
component rendering function.

This lets you process HTML that contains custom elements like `<info-box>` (for
example), and it allows you to provide a custom component function that renders
the contents of that element.

It's like the idea of React components except that it works on static HTML trees
in [rehype][] and it operates on plain HAST nodes. You can use tools from the
HAST ecosystem, like [hastscript][], to create and manipulate the content that
your components render.

A component's rendering function receives the custom element's attributes and
children, and it produces a new HTML tree as its output.

## Installation

```sh
npm install rehype-components
```

```js
import rehypeComponents from "rehype-components";
```

## Example

Attach the plugin. In this example we're initializing a [unified][] processor
and we attach the plugin into its pipeline. Typically you would have some
plugins placed before this one, to ingest or pre-process the document, and some
other plugins after it to post-process and output the result (for example by
rendering the HTML to a string at the end).

```js
unified()
  // ...
  .use(rehypeComponents, {
    // The `components` field is an object that maps the custom element names to their component rendering
    // functions.
    components: {
      "documentation-page": DocumentationPage,
      "info-box": InfoBox,
      "copyright-notice": CopyrightNotice,
    },
  });
// ...
```

Here's some sample input HTML content, with custom elements
`documentation-page`, `info-box`, and `copyright-notice`:

```html
<documentation-page title="Welcome">
  <info-box title="Reminder">Don't forget to run npm install</info-box>
  <p>Lorem ipsum...</p>
  <copyright-notice year="2020"></copyright-notice>
</documentation-page>
```

Here's the implementation of the above components, using [hastscript][] to
create a new HAST tree.

Components receive properties (elements attributes) and children as function
arguments and they can wrap or modify the children tree.

```js
const h = require("hastscript");

const DocumentationPage = (properties, children) =>
  h("article.documentation", [h("h1", properties.title), ...children]);

const CopyrightNotice = (properties, children) =>
  h("footer.notice", `© ${properties.year}`);

const InfoBox = (properties, children) =>
  h(
    ".infobox",
    h(".infobox-title", properties.title || "Info"),
    h(".infobox-body", children),
  );
```

Output:

```html
<article class="documentation">
  <h1>Welcome</h1>
  <div class="infobox">
    <div class="infobox-title">Reminder</div>
    <div class="infobox-body">Don't forget to run npm install</div>
  </div>
  <p>Lorem ipsum...</p>
  <footer class="notice">© 2020</footer>
</article>
```

[rehype]: https://github.com/rehypejs/rehype
[hastscript]: https://github.com/syntax-tree/hastscript
[unified]: https://github.com/unifiedjs/unified
