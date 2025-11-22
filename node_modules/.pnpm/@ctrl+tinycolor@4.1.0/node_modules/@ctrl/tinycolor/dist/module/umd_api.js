import { names } from './css-color-names.js';
import { inputToRGB, isValidCSSUnit, stringInputToObject } from './format-input.js';
import { fromRatio, legacyRandom } from './from-ratio.js';
import { TinyColor } from './index.js';
import { random } from './random.js';
import { mostReadable, readability } from './readability.js';
import { toMsFilter } from './to-ms-filter.js';
const tinycolorumd = {
    TinyColor,
    readability,
    mostReadable,
    random,
    names,
    fromRatio,
    legacyRandom,
    toMsFilter,
    inputToRGB,
    stringInputToObject,
    isValidCSSUnit,
};
export default tinycolorumd;
