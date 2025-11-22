# direction

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Detect the direction of text: left-to-right, right-to-left, or neutral.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`direction(value)`](#directionvalue)
*   [CLI](#cli)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package detects whether text is written left-to-right or right-to-left.

## When should I use this?

This is a simple and fast algorithm.
It looks at the first strong left-to-right or right-to-left character (for
example, the letter `a` is LTR, the letter `ى` is RTL).
That’s often enough but might be too naïve as it doesn’t take percentages or so
into account.

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install direction
```

In Deno with [Skypack][]:

```js
import {direction} from 'https://cdn.skypack.dev/direction@2?dts'
```

In browsers with [Skypack][]:

```html
<script type="module">
  import {direction} from 'https://cdn.skypack.dev/direction@2?min'
</script>
```

## Use

```js
import {direction} from 'direction'

direction('A') // => 'ltr'
direction('anglais') // => 'ltr'
direction('بسيطة') // => 'rtl'
direction('@') // => 'neutral'
```

## API

This package exports the following identifier: `direction`.
There is no default export.

### `direction(value)`

Detect the direction of `value` (`string?`).
Returns `'ltr'`, `'rtl'`, or `'neutral'`.

## CLI

```txt
Usage: direction [options] <words...>

Detect the direction of text: left-to-right, right-to-left, or neutral

Options:

  -h, --help           output usage information
  -v, --version        output version number

Usage:

# output directionality
$ direction @
# neutral

# output directionality from stdin
$ echo 'الانجليزية' | direction
# rtl
```

## Types

This package is fully typed with [TypeScript][].
There are no extra exported types.

## Compatibility

This package is at least compatible with all maintained versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
It also works in Deno and modern browsers.

## Security

This package is safe.

## Contribute

Yes please!
See [How to Contribute to Open Source][contribute].

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/wooorm/direction/workflows/main/badge.svg

[build]: https://github.com/wooorm/direction/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/wooorm/direction.svg

[coverage]: https://codecov.io/github/wooorm/direction

[downloads-badge]: https://img.shields.io/npm/dm/direction.svg

[downloads]: https://www.npmjs.com/package/direction

[size-badge]: https://img.shields.io/bundlephobia/minzip/direction.svg

[size]: https://bundlephobia.com/result?p=direction

[npm]: https://docs.npmjs.com/cli/install

[skypack]: https://www.skypack.dev

[license]: license

[author]: https://wooorm.com

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[typescript]: https://www.typescriptlang.org

[contribute]: https://opensource.guide/how-to-contribute/
