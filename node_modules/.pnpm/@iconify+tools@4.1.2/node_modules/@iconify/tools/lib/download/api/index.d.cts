import { APIQueryParams, APICacheOptions } from './types.cjs';

/**
 * Send API query
 */
declare function sendAPIQuery(query: APIQueryParams, cache?: APICacheOptions): Promise<number | string>;

export { sendAPIQuery };
