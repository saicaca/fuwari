import { SVG } from '../svg/index.cjs';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';

/**
 * Expand global style
 */
declare function cleanupGlobalStyle(svg: SVG): void;

export { cleanupGlobalStyle };
