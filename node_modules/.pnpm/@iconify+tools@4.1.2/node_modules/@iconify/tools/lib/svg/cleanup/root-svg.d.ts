import { SVG } from '../index.js';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';

/**
 * Clean up SVG
 */
declare function cleanupSVGRoot(svg: SVG): void;

export { cleanupSVGRoot };
