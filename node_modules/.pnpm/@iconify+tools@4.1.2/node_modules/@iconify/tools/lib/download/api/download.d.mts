import { APIQueryParams } from './types.mjs';

/**
 * Download file
 */
declare function downloadFile(query: APIQueryParams, target: string): Promise<void>;

export { downloadFile };
