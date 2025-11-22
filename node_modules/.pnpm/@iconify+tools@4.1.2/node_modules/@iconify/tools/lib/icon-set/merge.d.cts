import { IconSet } from './index.cjs';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import './types.cjs';
import '../svg/index.cjs';
import 'cheerio';
import '@iconify/utils/lib/icon-set/tree';

/**
 * Merge icon sets
 */
declare function mergeIconSets(oldIcons: IconSet, newIcons: IconSet): IconSet;

export { mergeIconSets };
