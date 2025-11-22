import type Swup from '../Swup.js';
import { type PageData } from './fetchPage.js';
export interface CacheData extends PageData {
}
/**
 * In-memory page cache.
 */
export declare class Cache {
    /** Swup instance this cache belongs to */
    protected swup: Swup;
    /** Cached pages, indexed by URL */
    protected pages: Map<string, CacheData>;
    constructor(swup: Swup);
    /** Number of cached pages in memory. */
    get size(): number;
    /** All cached pages. */
    get all(): Map<any, any>;
    /** Check if the given URL has been cached. */
    has(url: string): boolean;
    /** Return a shallow copy of the cached page object if available. */
    get(url: string): CacheData | undefined;
    /** Create a cache record for the specified URL. */
    set(url: string, page: CacheData): void;
    /** Update a cache record, overwriting or adding custom data. */
    update(url: string, payload: object): void;
    /** Delete a cache record. */
    delete(url: string): void;
    /** Empty the cache. */
    clear(): void;
    /** Remove all cache entries that return true for a given predicate function.  */
    prune(predicate: (url: string, page: CacheData) => boolean): void;
    /** Resolve URLs by making them local and letting swup resolve them. */
    protected resolve(urlToResolve: string): string;
}
//# sourceMappingURL=Cache.d.ts.map