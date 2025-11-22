import type { RuntimeCache } from "@vercel/functions";
export interface VercelCacheOptions {
    /**
     * Optional prefix to use for all keys. Can be used for namespacing.
     */
    base?: string;
    /**
     * Default TTL for all items in seconds.
     */
    ttl?: number;
    /**
     * Default tags to apply to all cache entries.
     */
    tags?: string[];
}
declare const _default: (opts: VercelCacheOptions) => import("..").Driver<VercelCacheOptions, RuntimeCache>;
export default _default;
