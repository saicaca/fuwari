import type { Storage } from 'unstorage';
import type { ErrorHandler, FontFetcher } from '../definitions.js';
export declare function createCachedFontFetcher({ storage, errorHandler, fetch, readFile, }: {
    storage: Storage;
    errorHandler: ErrorHandler;
    fetch: (url: string, init?: RequestInit) => Promise<Response>;
    readFile: (url: string) => Promise<Buffer>;
}): FontFetcher;
