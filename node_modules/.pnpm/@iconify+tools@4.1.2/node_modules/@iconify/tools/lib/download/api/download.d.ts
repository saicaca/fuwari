import { APIQueryParams } from './types.js';

/**
 * Download file
 */
declare function downloadFile(query: APIQueryParams, target: string): Promise<void>;

export { downloadFile };
