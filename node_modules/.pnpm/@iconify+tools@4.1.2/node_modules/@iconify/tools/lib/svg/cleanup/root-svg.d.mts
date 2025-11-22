import { SVG } from '../index.mjs';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';

/**
 * Clean up SVG
 */
declare function cleanupSVGRoot(svg: SVG): void;

export { cleanupSVGRoot };
