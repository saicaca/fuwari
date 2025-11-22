# esrap

Parse in reverse. AST goes in, code comes out.

## Usage

```js
import { print } from 'esrap';
import ts from 'esrap/languages/ts';

const ast = {
  type: 'Program',
  body: [
    {
      type: 'ExpressionStatement',
      expression: {
        callee: {
          type: 'Identifier',
          name: 'alert'
        },
        arguments: [
          {
            type: 'Literal',
            value: 'hello world!'
          }
        ]
      }
    }
  ]
};

const { code, map } = print(ast, ts());

console.log(code); // alert('hello world!');
```

If the nodes of the input AST have `loc` properties (e.g. the AST was generated with [`acorn`](https://github.com/acornjs/acorn/tree/master/acorn/#interface) with the `locations` option set), sourcemap mappings will be created.

## Built-in languages

`esrap` ships with two built-in languages — `ts()` and `tsx()` (considered experimental at present!) — which can print ASTs conforming to [`@typescript-eslint/types`](https://www.npmjs.com/package/@typescript-eslint/types) (which extends [ESTree](https://github.com/estree/estree)):

```js
import ts from 'esrap/languages/ts';
import tsx from 'esrap/languages/tsx'; // experimental!
```

Both languages accept an options object:

```js
const { code, map } = print(
  ast,
  ts({
    // how string literals should be quoted — `single` (the default) or `double`
    quotes: 'single',

    // an array of `{ type: 'Line' | 'Block', value: string, loc: { start, end } }` objects
    comments: []
  })
);
```

You can generate the `comments` array by, for example, using [Acorn's](https://github.com/acornjs/acorn/tree/master/acorn/#interface) `onComment` option.

## Custom languages

You can also create your own languages:

```ts
import { print, type Visitors } from 'esrap';

const language: Visitors<MyNodeType> = {
  _(node, context, visit) {
    // the `_` visitor handles any node type
    context.write('[');
    visit(node);
    context.write(']');
  },
  List(node, context) {
    // node.type === 'List'
    for (const child of node.children) {
      context.visit(child);
    }
  },
  Foo(node, context) {
    // node.type === 'Foo'
    context.write('foo');
  },
  Bar(node, context) {
    // node.type === 'Bar'
    context.write('bar');
  }
};

const ast: MyNodeType = {
  type: 'List',
  children: [{ type: 'Foo' }, { type: 'Bar' }]
};

const { code, map } = print(ast, language);

code; // `[[foo][bar]]`
```

The `context` API has several methods:

- `context.write(data: string, node?: BaseNode)` — add a string. If `node` is provided and has a standard `loc` property (with `start` and `end` properties each with a `line` and `column`), a sourcemap mapping will be created
- `context.indent()` — increase the indentation level, typically before adding a newline
- `context.newline()` — self-explanatory
- `context.space()` — adds a space character, if it doesn't immediately follow a newline
- `context.margin()` — causes the next newline to be repeated (consecutive newlines are otherwise merged into one)
- `context.dedent()` — decrease the indentation level (again, typically before adding a newline)
- `context.visit(node: BaseNode)` — calls the visitor corresponding to `node.type`
- `context.location(line: number, column: number)` — insert a sourcemap mapping _without_ calling `context.write(...)`
- `context.measure()` — returns the number of characters contained in `context`
- `context.empty()` — returns true if the context has no content
- `context.new()` — creates a child context
- `context.append(child)` — appends a child context

In addition, `context.multiline` is `true` if the context has multiline content. (This is useful for knowing, for example, when to insert newlines between nodes.)

To understand how to wield these methods effectively, read the source code for the built-in languages.

## Options

You can pass the following options:

```js
const { code, map } = print(ast, ts(), {
  // Populate the `sources` field of the resulting sourcemap
  // (note that the AST is assumed to come from a single file)
  sourceMapSource: 'input.js',

  // Populate the `sourcesContent` field of the resulting sourcemap
  sourceMapContent: fs.readFileSync('input.js', 'utf-8'),

  // Whether to encode the `mappings` field of the resulting sourcemap
  // as a VLQ string, rather than an unencoded array. Defaults to `true`
  sourceMapEncodeMappings: false,

  // String to use for indentation — defaults to '\t'
  indent: '  '
});
```

## Why not just use Prettier?

Because it's ginormous.

## Developing

This repo uses [pnpm](https://pnpm.io). Once it's installed, do `pnpm install` to install dependencies, and `pnpm test` to run the tests.

## License

[MIT](LICENSE)
