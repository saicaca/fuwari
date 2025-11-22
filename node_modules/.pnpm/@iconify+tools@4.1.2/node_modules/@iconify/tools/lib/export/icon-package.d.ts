import { IconSet } from '../icon-set/index.js';
import { ExportTargetOptions } from './helpers/prepare.js';
import { ExportOptionsWithCustomFiles } from './helpers/custom-files.js';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '../icon-set/types.js';
import '../svg/index.js';
import 'cheerio';
import '@iconify/utils/lib/icon-set/tree';

/**
 * Options
 */
interface ExportIconPackageOptions extends ExportTargetOptions, ExportOptionsWithCustomFiles {
    package?: Record<string, unknown>;
    module?: boolean;
    typesContent?: string;
}
/**
 * Export icon set as single icon packages
 *
 * Was used for exporting `@iconify-icons/{prefix}` packages
 */
declare function exportIconPackage(iconSet: IconSet, options: ExportIconPackageOptions): Promise<string[]>;

export { type ExportIconPackageOptions, exportIconPackage };
