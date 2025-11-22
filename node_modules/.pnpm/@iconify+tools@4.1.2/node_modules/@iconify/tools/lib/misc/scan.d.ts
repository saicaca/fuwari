import { Stats } from 'fs';

/**
 * Callback
 *
 * Extension starts with '.' (can be empty)
 * File does not include extension
 * Subdir ends with '/' (can be empty)
 *
 * Should return:
 * - false, null or undefined to skip file
 * - true to include file (subdir + file + extension)
 * - string to include custom string (such as file without extension)
 * - custom object to return custom object
 */
type ScanDirectoryCallbackFalseResult = boolean | null | undefined;
type ScanDirectoryCallbackStringResult = ScanDirectoryCallbackFalseResult | string;
type Callback<T> = (ext: string, file: string, subdir: string, path: string, stat: Stats) => T;
type AsyncCallback<T> = Callback<T | Promise<T>>;
type ScanDirectoryCallback = AsyncCallback<ScanDirectoryCallbackStringResult | undefined>;
type ScanDirectorySyncCallback = Callback<ScanDirectoryCallbackStringResult | undefined>;
/**
 * Find all files in directory
 */
declare function scanDirectory(path: string, callback?: AsyncCallback<ScanDirectoryCallbackStringResult>, subdirs?: boolean): Promise<string[]>;
declare function scanDirectory<T>(path: string, callback: AsyncCallback<T | ScanDirectoryCallbackFalseResult>, subdirs?: boolean): Promise<T[]>;
/**
 * Find all files in directory, synchronously
 */
declare function scanDirectorySync(path: string, callback?: Callback<ScanDirectoryCallbackStringResult>, subdirs?: boolean): string[];
declare function scanDirectorySync<T>(path: string, callback: Callback<T | ScanDirectoryCallbackFalseResult>, subdirs?: boolean): T[];

export { type ScanDirectoryCallback, type ScanDirectorySyncCallback, scanDirectory, scanDirectorySync };
