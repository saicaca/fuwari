import type { ErrorHandler, RemoteFontProviderModResolver, RemoteFontProviderResolver } from '../definitions.js';
export declare function createRemoteFontProviderResolver({ root, modResolver, errorHandler, }: {
    root: URL;
    modResolver: RemoteFontProviderModResolver;
    errorHandler: ErrorHandler;
}): RemoteFontProviderResolver;
