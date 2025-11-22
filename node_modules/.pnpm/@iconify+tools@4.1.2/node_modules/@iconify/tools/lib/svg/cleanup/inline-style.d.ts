import { SVG } from '../index.js';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';

/**
 * Expand inline style
 */
declare function cleanupInlineStyle(svg: SVG): void;

export { cleanupInlineStyle };
