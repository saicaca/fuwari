import { APIQueryParams, APICacheOptions } from './types.js';

/**
 * Send API query
 */
declare function sendAPIQuery(query: APIQueryParams, cache?: APICacheOptions): Promise<number | string>;

export { sendAPIQuery };
