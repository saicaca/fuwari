import { SVG } from '../index.js';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';

/**
 * Remove useless attributes
 */
declare function removeBadAttributes(svg: SVG): void;

export { removeBadAttributes };
