import { SVG } from '../svg/index.cjs';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';

/**
 * Scale icon
 */
declare function scaleSVG(svg: SVG, scale: number): void;

export { scaleSVG };
