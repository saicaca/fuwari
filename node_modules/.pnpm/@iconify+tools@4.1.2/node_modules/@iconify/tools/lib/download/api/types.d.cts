/**
 * API Cache
 */
interface APICacheOptions {
    dir: string;
    ttl: number;
}
/**
 * Params
 */
interface APIQueryParams {
    uri: string;
    params?: URLSearchParams;
    headers?: Record<string, string>;
}

export type { APICacheOptions, APIQueryParams };
