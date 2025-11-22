import { IconSet } from '../icon-set/index.cjs';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '../icon-set/types.cjs';
import '../svg/index.cjs';
import 'cheerio';
import '@iconify/utils/lib/icon-set/tree';

/**
 * Detect palette
 *
 * Returns null if icon set has mixed colors
 */
declare function detectIconSetPalette(iconSet: IconSet): boolean | null;

export { detectIconSetPalette };
