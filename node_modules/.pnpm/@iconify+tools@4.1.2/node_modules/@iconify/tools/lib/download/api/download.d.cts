import { APIQueryParams } from './types.cjs';

/**
 * Download file
 */
declare function downloadFile(query: APIQueryParams, target: string): Promise<void>;

export { downloadFile };
