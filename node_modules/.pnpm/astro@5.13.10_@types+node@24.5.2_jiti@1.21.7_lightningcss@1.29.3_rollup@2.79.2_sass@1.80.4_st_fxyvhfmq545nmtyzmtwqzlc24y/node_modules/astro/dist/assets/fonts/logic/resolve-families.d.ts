import type { Hasher, LocalProviderUrlResolver, RemoteFontProviderResolver } from '../definitions.js';
import type { FontFamily, ResolvedFontFamily } from '../types.js';
/**
 * Dedupes properties if applicable and resolves entrypoints.
 */
export declare function resolveFamily({ family, hasher, remoteFontProviderResolver, localProviderUrlResolver, }: {
    family: FontFamily;
    hasher: Hasher;
    remoteFontProviderResolver: RemoteFontProviderResolver;
    localProviderUrlResolver: LocalProviderUrlResolver;
}): Promise<ResolvedFontFamily>;
/**
 * A function for convenience. The actual logic lives in resolveFamily
 */
export declare function resolveFamilies({ families, ...dependencies }: {
    families: Array<FontFamily>;
} & Omit<Parameters<typeof resolveFamily>[0], 'family'>): Promise<Array<ResolvedFontFamily>>;
