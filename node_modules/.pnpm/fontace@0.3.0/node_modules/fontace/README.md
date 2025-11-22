<h1 align="center">fontace</h1>
<p align="center">Extract useful information from font files</p>
<p align="center">
  <a href="https://www.npmjs.com/package/fontace"><img alt="fontace on NPM" src="https://img.shields.io/npm/v/fontace"></a>
  <a href="https://github.com/delucis/fontace/actions/workflows/ci.yml"><img src="https://github.com/delucis/fontace/actions/workflows/ci.yml/badge.svg" alt="CI status"></a>
</p>

## Installation

```sh
npm install fontace
```

## Import

```js
import { fontace } from 'fontace';
```

## Why `fontace`?

`fontace` is a small library, which intends to extract data specifically to help generate CSS `@font-face` declarations based on font files.

`fontace` returns the following CSS-compatible values intended for use with `font-family`, `font-style`, `unicode-range`, and `font-weight`:

- `family`: The font family name as stored in the font file, e.g. `"Inter"`.
- `style`: The style of this font file, e.g. `"normal"` or `"italic"`.
- `unicodeRange`: The range of Unicode code points this font file contains, e.g. `"U+0-10FFFF"`.
- `weight`: The font weight(s) this file supports, which can be a range for variable fonts, e.g. `"400"` or `"100 900"`.

In addition it returns:

- `format`: The font file format for use in [`format()`](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/src#format), e.g.`"woff2"` or `"truetype"`.
- `isVariable`: `true` if the font file contains variable axes of some kind.
- `unicodeRangeArray`: An array of the Unicode code point ranges this font file contains, e.g. `["U+0-10FFFF"]`, equivalent to `unicodeRange.split(', ')`. Useful if you need to iterate through the available ranges instead of inlining them directly in CSS.

## Usage

Pass a buffer containing font file data to `fontace()` and get useful information back.

### Example: local font file

Use file-system APIs to read a local font file and then pass it to `fontace()`:

```js
import { fontace } from 'fontace';
import fs from 'node:fs';

const fontBuffer = fs.readFileSync('./Inter.woff2');
const metadata = fontace(fontBuffer);
// { family: "Inter", format: 'woff2', style: "normal", weight: "400", isVariable: false, unicodeRange: "U+0, U+20-7E...", unicodeRangeArray: ["U+0", "U+20-7E", ...] }
```

### Example: remote font file

Fetch a font file over the network and then pass it to `fontace()`:

```js
import { fontace } from 'fontace';

const response = await fetch('https://example.com/Inter-Variable.woff2');
const fontBuffer = Buffer.from(await response.arrayBuffer());
const metadata = fontace(fontBuffer);
// { family: "Inter", format: 'woff2', style: "normal", weight: "100 900", isVariable: true, unicodeRange: "U+0, U+20-7E...", unicodeRangeArray: ["U+0", "U+20-7E", ...] }
```

### Example: using `fontace` data to create CSS

```js
const { family, format, isVariable, style, unicodeRange, weight } = fontace(fontBuffer);

let src = `url(/MyFont.woff2) format('${format}')`;
if (isVariable) src += ' tech(variations)';

const fontFaceDeclaration = `@font-face {
  font-family: ${family};
  font-style: ${style};
  font-weight: ${weight};
  font-display: swap;
  unicode-range: ${unicodeRange};
  src: ${src};
}`;
```

## Acknowledgements

`fontace` uses the [`fontkit`](https://www.npmjs.com/package/fontkit) package to extract data from font files.

## License

[MIT](LICENSE)
