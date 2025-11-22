import { FullIconifyIcon } from '@iconify/utils/lib/icon/defaults';
import { IconSet } from './index.mjs';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import './types.mjs';
import '../svg/index.mjs';
import 'cheerio';
import '@iconify/utils/lib/icon-set/tree';

/**
 * Find matching icon in icon set
 */
declare function findMatchingIcon(iconSet: IconSet, icon: FullIconifyIcon): string | null;

export { findMatchingIcon };
