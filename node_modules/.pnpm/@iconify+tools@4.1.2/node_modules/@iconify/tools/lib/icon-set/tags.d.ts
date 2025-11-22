import { IconSet } from './index.js';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import './types.js';
import '../svg/index.js';
import 'cheerio';
import '@iconify/utils/lib/icon-set/tree';

declare const paletteTags: {
    monotone: string;
    palette: string;
};
declare const sizeTags: {
    square: string;
    gridPrefix: string;
    heightPrefix: string;
};
/**
 * Add tags to icon set
 *
 * @deprecated
 */
declare function addTagsToIconSet(iconSet: IconSet, customTags?: string[]): string[];

export { addTagsToIconSet, paletteTags, sizeTags };
