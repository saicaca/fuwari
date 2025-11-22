import type { AssetsPrefix } from '../../../types/public/index.js';
import type { UrlResolver } from '../definitions.js';
export declare function createDevUrlResolver({ base }: {
    base: string;
}): UrlResolver;
export declare function createBuildUrlResolver({ base, assetsPrefix, }: {
    base: string;
    assetsPrefix: AssetsPrefix;
}): UrlResolver;
