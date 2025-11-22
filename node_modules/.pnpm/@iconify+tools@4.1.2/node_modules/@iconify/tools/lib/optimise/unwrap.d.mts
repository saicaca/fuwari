import { SVG } from '../svg/index.mjs';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';

/**
 * Removes empty group from SVG root element
 */
declare function unwrapEmptyGroup(svg: SVG): void;

export { unwrapEmptyGroup };
