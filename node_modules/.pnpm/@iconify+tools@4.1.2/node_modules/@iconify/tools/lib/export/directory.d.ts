import { IconSet } from '../icon-set/index.js';
import { ExportTargetOptions } from './helpers/prepare.js';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '../icon-set/types.js';
import '../svg/index.js';
import 'cheerio';
import '@iconify/utils/lib/icon-set/tree';

/**
 * Options
 */
interface ExportToDirectoryOptions extends ExportTargetOptions {
    autoHeight?: boolean;
    includeAliases?: boolean;
    includeChars?: boolean;
    log?: boolean;
}
/**
 * Export icon set to directory
 *
 * Returns list of stored files
 */
declare function exportToDirectory(iconSet: IconSet, options: ExportToDirectoryOptions): Promise<string[]>;

export { type ExportToDirectoryOptions, exportToDirectory };
