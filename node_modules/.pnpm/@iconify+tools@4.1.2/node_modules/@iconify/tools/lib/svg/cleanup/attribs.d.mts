import { SVG } from '../index.mjs';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';

/**
 * Remove useless attributes
 */
declare function removeBadAttributes(svg: SVG): void;

export { removeBadAttributes };
