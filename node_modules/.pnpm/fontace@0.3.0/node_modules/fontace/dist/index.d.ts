type FontStyle = 'auto' | 'normal' | 'italic' | 'oblique' | `oblique ${number}deg` | `oblique ${number}deg ${number}deg`;
type FontWeightAbsolute = 'normal' | 'bold' | `${number}`;
type FontWeight = 'auto' | FontWeightAbsolute | `${FontWeightAbsolute} ${FontWeightAbsolute}`;
interface FontMetadata {
    /** The font family name as stored in the font file, e.g. `"Inter"`. */
    family: string;
    /** The range of Unicode code points this font file contains, e.g. `"U+0-10FFFF"`. */
    unicodeRange: string;
    /**
     * Array of Unicode code point ranges this font file contains, e.g. `["U+0-10FFFF"]`,
     * equivalent to `unicodeRange.split(', ')`.
     */
    unicodeRangeArray: string[];
    /** The style of this font file, e.g. `"normal"` or `"italic"`. */
    style: FontStyle;
    /** The font weight(s) this file supports, which can be a range for variable fonts, e.g. `"400"` or `"100 900"`. */
    weight: FontWeight;
    /** Font format compatible with `format()` values in `@font-face` `src` properties. */
    format: 'truetype' | 'woff' | 'woff2';
    /** Whether or not this font is variable. */
    isVariable: boolean;
}

/**
 * Infer font-face properties from a buffer containing font file data.
 * @param fontBuffer Buffer containing font file data.
 * @example
 * import { fontace } from 'fontace';
 * import fs from 'node:fs';
 *
 * const fontBuffer = fs.readFileSync('./Inter.ttf');
 * const fontMetaData = fontace(fontBuffer);
 * // { family: "Inter", style: "normal", weight: "400", unicodeRange: "U+0, U+20-7E...
 */
declare function fontace(fontBuffer: Buffer): FontMetadata;

export { fontace };
