# parse-latin

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Natural language parser, for Latin-script languages, that produces [nlcst][].

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`ParseLatin()`](#parselatin)
*   [Algorithm](#algorithm)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package exposes a parser that takes Latin-script natural language and
produces a syntax tree.

## When should I use this?

If you want to handle natural language as syntax trees manually, use this.

Alternatively, you can use the retext plugin [`retext-latin`][retext-latin],
which wraps this project to also parse natural language at a higher-level
(easier) abstraction.

Whether Old-English (“þā gewearþ þǣm hlāforde and þǣm hȳrigmannum wiþ ānum
penninge”), Icelandic (“Hvað er að frétta”), French (“Où sont les toilettes?”),
this project does a good job at tokenizing it.

For English and Dutch, you can instead use [`parse-english`][parse-english] and
[`parse-dutch`][parse-dutch].

You can somewhat use this for Latin-like scripts, such as Cyrillic (“привет”),
Georgian (“გამარჯობა”), Armenian (“Բարեւ”), and such.

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install parse-latin
```

In Deno with [`esm.sh`][esmsh]:

```js
import {ParseLatin} from 'https://esm.sh/parse-latin@7'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {ParseLatin} from 'https://esm.sh/parse-latin@7?bundle'
</script>
```

## Use

```js
import {ParseLatin} from 'parse-latin'
import {inspect} from 'unist-util-inspect'

const tree = new ParseLatin().parse('A simple sentence.')

console.log(inspect(tree))
```

Yields:

```txt
RootNode[1] (1:1-1:19, 0-18)
└─0 ParagraphNode[1] (1:1-1:19, 0-18)
    └─0 SentenceNode[6] (1:1-1:19, 0-18)
        ├─0 WordNode[1] (1:1-1:2, 0-1)
        │   └─0 TextNode "A" (1:1-1:2, 0-1)
        ├─1 WhiteSpaceNode " " (1:2-1:3, 1-2)
        ├─2 WordNode[1] (1:3-1:9, 2-8)
        │   └─0 TextNode "simple" (1:3-1:9, 2-8)
        ├─3 WhiteSpaceNode " " (1:9-1:10, 8-9)
        ├─4 WordNode[1] (1:10-1:18, 9-17)
        │   └─0 TextNode "sentence" (1:10-1:18, 9-17)
        └─5 PunctuationNode "." (1:18-1:19, 17-18)
```

## API

This package exports the identifier [`ParseLatin`][api-parse-latin].
There is no default export.

### `ParseLatin()`

Create a new parser.

#### `ParseLatin#parse(value)`

Turn natural language into a syntax tree.

###### Parameters

*   `value` (`string`, optional)
    — value to parse

###### Returns

Tree ([`RootNode`][root]).

## Algorithm

> 👉 **Note**:
> The easiest way to see how `parse-latin` parses, is by using the
> [online parser demo][demo], which shows the syntax tree corresponding to
> the typed text.

`parse-latin` splits text into white space, punctuation, symbol, and word
tokens:

*   “word” is one or more unicode letters or numbers
*   “white space” is one or more unicode white space characters
*   “punctuation” is one or more unicode punctuation characters
*   “symbol” is one or more of anything else

Then, it manipulates and merges those tokens into a syntax tree, adding
sentences and paragraphs where needed.

*   some punctuation marks are part of the word they occur in, such as
    `non-profit`, `she’s`, `G.I.`, `11:00`, `N/A`, `&c`, `nineteenth- and…`
*   some periods do not mark a sentence end, such as `1.`, `e.g.`, `id.`
*   although periods, question marks, and exclamation marks (sometimes) end a
    sentence, that end might not occur directly after the mark, such as `.)`,
    `."`
*   …and many more exceptions

## Types

This package is fully typed with [TypeScript][].
It exports no additional types.

## Compatibility

Projects maintained by me are compatible with maintained versions of Node.js.

When I cut a new major release, I drop support for unmaintained versions of
Node.
This means I try to keep the current release line, `parse-latin@^7`, compatible
with Node.js 16.

## Security

This package is safe.

## Related

*   [`parse-english`](https://github.com/wooorm/parse-english)
    — English (natural language) parser
*   [`parse-dutch`](https://github.com/wooorm/parse-dutch)
    — Dutch (natural language) parser

## Contribute

Yes please!
See [How to Contribute to Open Source][contribute].

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/wooorm/parse-latin/workflows/main/badge.svg

[build]: https://github.com/wooorm/parse-latin/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/parse-latin.svg

[coverage]: https://codecov.io/github/wooorm/parse-latin

[downloads-badge]: https://img.shields.io/npm/dm/parse-latin.svg

[downloads]: https://www.npmjs.com/package/parse-latin

[size-badge]: https://img.shields.io/badge/dynamic/json?label=minzipped%20size&query=$.size.compressedSize&url=https://deno.bundlejs.com/?q=parse-latin

[size]: https://bundlejs.com/?q=parse-latin

[npm]: https://docs.npmjs.com/cli/install

[demo]: https://wooorm.com/parse-latin/

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[contribute]: https://opensource.guide/how-to-contribute/

[license]: license

[author]: https://wooorm.com

[nlcst]: https://github.com/syntax-tree/nlcst

[root]: https://github.com/syntax-tree/nlcst#root

[retext-latin]: https://github.com/retextjs/retext/tree/main/packages/retext-latin

[parse-english]: https://github.com/wooorm/parse-english

[parse-dutch]: https://github.com/wooorm/parse-dutch

[api-parse-latin]: #parselatin
