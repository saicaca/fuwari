import { IconSet } from '../icon-set/index.mjs';
import { ExportTargetOptions } from './helpers/prepare.mjs';
import { ExportOptionsWithCustomFiles } from './helpers/custom-files.mjs';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '../icon-set/types.mjs';
import '../svg/index.mjs';
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
