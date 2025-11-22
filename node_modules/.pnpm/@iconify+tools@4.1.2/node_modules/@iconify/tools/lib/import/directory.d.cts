import { IconSet } from '../icon-set/index.cjs';
import { CleanupSVGOptions } from '../svg/cleanup.cjs';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '../icon-set/types.cjs';
import '../svg/index.cjs';
import 'cheerio';
import '@iconify/utils/lib/icon-set/tree';
import '../svg/cleanup/bad-tags.cjs';

/**
 * Entry for file
 */
interface ImportDirectoryFileEntry {
    path: string;
    subdir: string;
    file: string;
    ext: string;
}
/**
 * Callback to get keyword for icon based on file name
 *
 * Returns:
 * - string for new keyword
 * - undefined to skip icon
 *
 * Callback can be asynchronous
 */
type ImportDirectoryKeywordCallbackResult = string | undefined;
type Callback<T> = (file: ImportDirectoryFileEntry, defaultKeyword: string, iconSet: IconSet) => T;
type AsyncCallback<T> = Callback<T | Promise<T>>;
type ImportDirectoryKeywordCallback = AsyncCallback<ImportDirectoryKeywordCallbackResult>;
type ImportDirectoryKeywordSyncCallback = Callback<ImportDirectoryKeywordCallbackResult>;
/**
 * Options
 */
interface ImportDirectoryOptions<K> extends CleanupSVGOptions {
    prefix?: string;
    includeSubDirs?: boolean;
    keyword?: K;
    ignoreImportErrors?: boolean | 'warn';
}
/**
 * Import all icons from directory
 */
declare function importDirectory(path: string, options?: ImportDirectoryOptions<ImportDirectoryKeywordCallback>): Promise<IconSet>;
/**
 * Import all icons from directory synchronously
 */
declare function importDirectorySync(path: string, options?: ImportDirectoryOptions<ImportDirectoryKeywordSyncCallback>): IconSet;

export { type ImportDirectoryFileEntry, type ImportDirectoryKeywordCallback, type ImportDirectoryKeywordSyncCallback, importDirectory, importDirectorySync };
