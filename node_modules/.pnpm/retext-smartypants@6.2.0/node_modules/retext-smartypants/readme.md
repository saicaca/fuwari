# retext-smartypants

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[retext][]** plugin to apply [SmartyPants][].

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`unified().use(retextSmartypants[, options])`](#unifieduseretextsmartypants-options)
  * [`Options`](#options)
  * [`QuoteCharacterMap`](#quotecharactermap)
* [Types](#types)
* [Compatibility](#compatibility)
* [Contribute](#contribute)
* [License](#license)

## What is this?

This package is a [unified][] ([retext][]) plugin to apply [SmartyPants][] to
the syntax tree.
It replaces straight/typewriter punctuation marks and symbols with smart/curly
marks and symbols.

## When should I use this?

You can use this plugin any time there straight marks and symbols in prose,
but you want to use smart ones instead.

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

```sh
npm install retext-smartypants
```

In Deno with [`esm.sh`][esmsh]:

```js
import retextSmartypants from 'https://esm.sh/retext-smartypants@6'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import retextSmartypants from 'https://esm.sh/retext-smartypants@6?bundle'
</script>
```

## Use

```js
import {retext} from 'retext'
import retextSmartypants from 'retext-smartypants'

const file = await retext()
  .use(retextSmartypants)
  .process('He said, "A \'simple\' english sentence. . ."')

console.log(String(file))
```

Yields:

```txt
He said, “A ‘simple’ english sentence…”
```

## API

This package exports no identifiers.
The default export is [`retextSmartypants`][api-retext-smartypants].

### `unified().use(retextSmartypants[, options])`

Replace straight punctuation marks with curly ones.

###### Parameters

* `options` ([`Options`][api-options], optional)
  — configuration

###### Returns

Transform ([`Transformer`][unified-transformer]).

### `Options`

Configuration (TypeScript type).

###### Fields

* `backticks` (`boolean` or `'all'`, default: `true`)
  — transform backticks;
  when `true`, turns double backticks into an opening double quote and
  double straight single quotes into a closing double quote;
  when `'all'`, does that and turns single backticks into an opening
  single quote and a straight single quotes into a closing single smart
  quote;
  `quotes: false` must be used with `backticks: 'all'`
* `closingQuotes` ([`QuoteCharacterMap`][api-quote-character-map], default:
  `{double: '”', single: '’'}`)
  — closing quotes to use
* `dashes` (`'inverted'` or `'oldschool'` or `boolean`, default: `true`)
  — transform dashes;
  when `true`, turns two dashes into an em dash character;
  when `'oldschool'`, turns three dashes into an em dash and two into an en
  dash;
  when `'inverted'`, turns three dashes into an en dash and two into an em
  dash
* `ellipses` (`'spaced'` or `'unspaced'` or `boolean`, default: `true`)
  — transform triple dots;
  when `'spaced'`, turns triple dots with spaces into ellipses;
  when `'unspaced'`, turns triple dots without spaces into ellipses;
  when `true`, turns triple dots with or without spaces into ellipses
* `openingQuotes` ([`QuoteCharacterMap`][api-quote-character-map], default:
  `{double: '“', single: '‘'}`)
  — opening quotes to use
* `quotes` (`boolean`, default: `true`)
  — transform straight quotes into smart quotes

### `QuoteCharacterMap`

Quote characters (TypeScript type).

###### Fields

* `double` (`string`)
  — character to use for double quotes
* `single` (`string`)
  — character to use for single quotes

## Types

This package is fully typed with [TypeScript][].
It exports the additional types [`Options`][api-options] and
[`QuoteCharacterMap`][api-quote-character-map].

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line, `retext-smartypants@^6`,
compatible with Node.js 16.

## Contribute

See [`contributing.md`][contributing] in [`retextjs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/retextjs/retext-smartypants/workflows/main/badge.svg

[build]: https://github.com/retextjs/retext-smartypants/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/retextjs/retext-smartypants.svg

[coverage]: https://codecov.io/github/retextjs/retext-smartypants

[downloads-badge]: https://img.shields.io/npm/dm/retext-smartypants.svg

[downloads]: https://www.npmjs.com/package/retext-smartypants

[size-badge]: https://img.shields.io/bundlejs/size/retext-smartypants

[size]: https://bundlejs.com/?q=retext-smartypants

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/retextjs/retext/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[health]: https://github.com/retextjs/.github

[contributing]: https://github.com/retextjs/.github/blob/main/contributing.md

[support]: https://github.com/retextjs/.github/blob/main/support.md

[coc]: https://github.com/retextjs/.github/blob/main/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[smartypants]: https://daringfireball.net/projects/smartypants

[retext]: https://github.com/retextjs/retext

[unified]: https://github.com/unifiedjs/unified

[unified-transformer]: https://github.com/unifiedjs/unified#transformer

[api-options]: #options

[api-quote-character-map]: #quotecharactermap

[api-retext-smartypants]: #unifieduseretextsmartypants-options
