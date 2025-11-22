import type { ErrorHandler, UrlProxyContentResolver } from '../definitions.js';
export declare function createLocalUrlProxyContentResolver({ errorHandler, }: {
    errorHandler: ErrorHandler;
}): UrlProxyContentResolver;
export declare function createRemoteUrlProxyContentResolver(): UrlProxyContentResolver;
