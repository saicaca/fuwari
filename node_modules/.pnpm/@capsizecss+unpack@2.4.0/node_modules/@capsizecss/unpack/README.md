<img src="https://raw.githubusercontent.com/seek-oss/capsize/HEAD/images/capsize-header.png" alt="Capsize" title="Capsize" width="443px" />
<br/>

# @capsizecss/unpack

Unpack the capsize font metrics directly from a font file.

```bash
npm install @capsizecss/unpack
```

- [Usage](#usage)
  - [fromBuffer](#frombuffer)
  - [fromBlob](#fromblob)
  - [fromUrl](#fromurl)
  - [fromFile](#fromfile)
- [Options](#options)
  - [postscriptName](#postscriptname)
- [Font Metrics](#font-metrics)

## Usage

### `fromBuffer`

Takes a buffer and returns the resolved [font metrics](#font-metrics).

```ts
import { fromBuffer } from '@capsizecss/unpack';

const metrics = await fromBuffer(buffer);
```

### `fromBlob`

Takes a file blob and returns the resolved [font metrics](#font-metrics).

```ts
import { fromBlob } from '@capsizecss/unpack';

const metrics = await fromBlob(file);
```

### `fromUrl`

Takes a url string and returns the resolved [font metrics](#font-metrics).

```ts
import { fromUrl } from '@capsizecss/unpack';

const metrics = await fromUrl(url);
```

### `fromFile`

Takes a file path string and returns the resolved [font metrics](#font-metrics).

```ts
import { fromFile } from '@capsizecss/unpack';

const metrics = await fromFile(filePath);
```

## Options

All of the above APIs accept an optional second parameter with the following options:

#### `postscriptName`

Capsize can extract the metrics for a single font from a TrueType Collection (TTC) file by providing the `postscriptName`.

```ts
import { fromFile } from '@capsizecss/unpack';

const metrics = await fromFile('AvenirNext.ttc', {
  postscriptName: 'AvenirNext-Bold',
});
```

## Font metrics

The font metrics object returned contains the following properties:

| Property       | Type                                        | Description                                                                                                                                                                                                       |
| -------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| familyName     | string                                      | The font’s family name as authored by font creator                                                                                                                                                                |
| fullName       | string                                      | The font’s full name as authored by font creator                                                                                                                                                                  |
| postscriptName | string                                      | The font’s unique PostScript name as authored by font creator                                                                                                                                                     |
| category       | string                                      | The style of the font: serif, sans-serif, monospace, display, or handwriting.                                                                                                                                     |
| capHeight      | number                                      | The height of capital letters above the baseline                                                                                                                                                                  |
| ascent         | number                                      | The height of the ascenders above baseline                                                                                                                                                                        |
| descent        | number                                      | The descent of the descenders below baseline                                                                                                                                                                      |
| lineGap        | number                                      | The amount of space included between lines                                                                                                                                                                        |
| unitsPerEm     | number                                      | The size of the font’s internal coordinate grid                                                                                                                                                                   |
| xHeight        | number                                      | The height of the main body of lower case letters above baseline                                                                                                                                                  |
| xWidthAvg      | number                                      | The average width of character glyphs in the font for the selected unicode subset. Calculated [based on character frequencies in written text], falling back to the built in `xAvgCharWidth` from the OS/2 table. |
| subsets        | {<br/>[subset]: { xWidthAvg: number }<br/>} | A lookup of the `xWidthAvg` metric by subset (see [supported subsets])                                                                                                                                            |

[based on character frequencies in written text]: ../metrics/README.md#how-xwidthavg-is-calculated
[supported subsets]: ../metrics/README.md#subsets

## Thanks

- [Devon Govett](https://github.com/devongovett) for creating [Fontkit](https://github.com/foliojs/fontkit), which does all the heavy lifting of extracting the font metrics under the covers.
- [SEEK](https://www.seek.com.au) for giving us the space to do interesting work.

## License

MIT.
