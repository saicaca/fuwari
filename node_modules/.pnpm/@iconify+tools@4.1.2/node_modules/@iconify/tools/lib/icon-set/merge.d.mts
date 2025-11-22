import { IconSet } from './index.mjs';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import './types.mjs';
import '../svg/index.mjs';
import 'cheerio';
import '@iconify/utils/lib/icon-set/tree';

/**
 * Merge icon sets
 */
declare function mergeIconSets(oldIcons: IconSet, newIcons: IconSet): IconSet;

export { mergeIconSets };
