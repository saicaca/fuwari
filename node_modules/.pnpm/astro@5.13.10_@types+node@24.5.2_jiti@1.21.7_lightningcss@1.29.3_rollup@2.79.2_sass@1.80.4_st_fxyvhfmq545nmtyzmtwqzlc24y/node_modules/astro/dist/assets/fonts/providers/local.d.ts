import type * as unifont from 'unifont';
import type { FontFileReader, FontTypeExtractor, UrlProxy } from '../definitions.js';
import type { ResolvedLocalFontFamily } from '../types.js';
interface Options {
    family: ResolvedLocalFontFamily;
    urlProxy: UrlProxy;
    fontTypeExtractor: FontTypeExtractor;
    fontFileReader: FontFileReader;
}
export declare function resolveLocalFont({ family, urlProxy, fontTypeExtractor, fontFileReader, }: Options): {
    fonts: Array<unifont.FontFaceData>;
};
export {};
