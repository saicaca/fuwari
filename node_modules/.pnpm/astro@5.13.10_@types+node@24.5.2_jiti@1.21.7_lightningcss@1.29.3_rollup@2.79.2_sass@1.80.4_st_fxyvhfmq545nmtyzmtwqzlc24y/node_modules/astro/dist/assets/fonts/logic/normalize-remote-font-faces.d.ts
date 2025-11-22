import type * as unifont from 'unifont';
import type { FontTypeExtractor, UrlProxy } from '../definitions.js';
export declare function normalizeRemoteFontFaces({ fonts, urlProxy, fontTypeExtractor, }: {
    fonts: Array<unifont.FontFaceData>;
    urlProxy: UrlProxy;
    fontTypeExtractor: FontTypeExtractor;
}): Array<unifont.FontFaceData>;
