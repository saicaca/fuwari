import { APIQueryParams, APICacheOptions } from './types.cjs';

/**
 * Unique key
 */
declare function apiCacheKey(query: APIQueryParams): string;
/**
 * Store cache
 */
declare function storeAPICache(options: APICacheOptions, key: string, data: string): Promise<void>;
/**
 * Get item from cache
 */
declare function getAPICache(dir: string, key: string): Promise<string | null>;
/**
 * Clear cache
 */
declare function clearAPICache(dir: string): Promise<void>;

export { apiCacheKey, clearAPICache, getAPICache, storeAPICache };
