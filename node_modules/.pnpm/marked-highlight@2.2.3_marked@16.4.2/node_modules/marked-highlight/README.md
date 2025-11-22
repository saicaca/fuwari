# marked-highlight

Highlight code blocks

## Installation

```sh
npm install marked-highlight
```

## Usage

You will need to provide a function that transforms the `code` to html.

```js
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';

// or UMD script
// <script src="https://cdn.jsdelivr.net/npm/marked/lib/marked.umd.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/marked-highlight/lib/index.umd.js"></script>
// const { Marked } = globalThis.marked;
// const { markedHighlight } = globalThis.markedHighlight;
const marked = new Marked(
  markedHighlight({
	emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang, info) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);


marked.parse(`
\`\`\`javascript
const highlight = "code";
\`\`\`
`);
// <pre><code class="hljs language-javascript">
//   <span class="hljs-keyword">const</span> highlight = <span class="hljs-string">&quot;code&quot;</span>;
// </code></pre>
```

The `async` option should be set to `true` if the `highlight` function returns a `Promise`.

```js
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import pygmentize from 'pygmentize-bundled';

const marked = new Marked(
  markedHighlight({
    async: true,
    highlight(code, lang, info) {
      return new Promise((resolve, reject) => {
        pygmentize({ lang, format: 'html' }, code, function (err, result) {
          if (err) {
            reject(err);
            return;
          }

          resolve(result.toString());
        });
      });
    }
  })
)

await marked.parse(`
\`\`\`javascript
const highlight = "code";
\`\`\`
`);
// <pre><code class="language-javascript">
//   <div class="highlight">
//     <pre>
//       <span class="kr">const</span> <span class="nx">highlight</span> <span class="o">=</span> <span class="s2">&quot;code&quot;</span><span class="p">;</span>
//     </pre>
//   </div>
// </code></pre>
```

### `options`

| option |  type  | default | description |
|--------|--------|---------|:------------|
| async  | boolean | `false` | If the highlight function returns a promise set this to `true`. Don't forget to `await` the call to `marked.parse` |
| langPrefix | string | `'language-'` | A prefix to add to the class of the `code` tag. |
| emptyLangClass | string | `''` | The class to add to the `code` tag if the language is empty. |
| highlight | function | `(code: string, lang: string) => {}` | Required. The function to transform the code to html. |
