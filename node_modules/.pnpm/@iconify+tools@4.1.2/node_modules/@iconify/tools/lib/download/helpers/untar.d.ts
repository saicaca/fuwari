/**
 * Unpack .tgz archive
 */
declare function untar(file: string, path: string): Promise<void>;

export { untar };
