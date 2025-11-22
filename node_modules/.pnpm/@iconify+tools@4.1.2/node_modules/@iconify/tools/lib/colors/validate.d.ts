import { SVG } from '../svg/index.js';
import { ParseColorsOptions, FindColorsResult } from './parse.js';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '@iconify/utils/lib/colors/types';
import './attribs.js';
import '../svg/analyse/types.js';
import '../misc/cheerio.js';
import 'domhandler';

/**
 * Validate colors in icon
 *
 * If icon is monotone,
 *
 * Throws exception on error
 */
declare function validateColors(svg: SVG, expectMonotone: boolean, options?: ParseColorsOptions): FindColorsResult;

export { validateColors };
