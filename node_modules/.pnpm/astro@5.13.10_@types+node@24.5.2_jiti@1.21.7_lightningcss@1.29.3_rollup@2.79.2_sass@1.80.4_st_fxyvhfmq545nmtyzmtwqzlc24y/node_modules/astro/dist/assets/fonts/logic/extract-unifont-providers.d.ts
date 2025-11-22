import type * as unifont from 'unifont';
import type { Hasher } from '../definitions.js';
import type { ResolvedFontFamily } from '../types.js';
export declare function extractUnifontProviders({ families, hasher, }: {
    families: Array<ResolvedFontFamily>;
    hasher: Hasher;
}): {
    families: Array<ResolvedFontFamily>;
    providers: Array<unifont.Provider>;
};
