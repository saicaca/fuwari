import type { LocalProviderUrlResolver } from '../definitions.js';
export declare function createRequireLocalProviderUrlResolver({ root, intercept, }: {
    root: URL;
    intercept?: (path: string) => void;
}): LocalProviderUrlResolver;
