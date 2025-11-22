import { IconSet } from './index.mjs';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import './types.mjs';
import '../svg/index.mjs';
import 'cheerio';
import '@iconify/utils/lib/icon-set/tree';

/**
 * Check if icons in an icon set were updated.
 *
 * This function checks only icons, not metadata. It also ignores icon visibility.
 */
declare function hasIconDataBeenModified(set1: IconSet, set2: IconSet): boolean;

export { hasIconDataBeenModified };
