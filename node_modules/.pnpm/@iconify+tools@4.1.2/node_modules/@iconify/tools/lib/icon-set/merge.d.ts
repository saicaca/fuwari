import { IconSet } from './index.js';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import './types.js';
import '../svg/index.js';
import 'cheerio';
import '@iconify/utils/lib/icon-set/tree';

/**
 * Merge icon sets
 */
declare function mergeIconSets(oldIcons: IconSet, newIcons: IconSet): IconSet;

export { mergeIconSets };
