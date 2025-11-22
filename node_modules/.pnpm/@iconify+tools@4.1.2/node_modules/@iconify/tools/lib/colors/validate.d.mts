import { SVG } from '../svg/index.mjs';
import { ParseColorsOptions, FindColorsResult } from './parse.mjs';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '@iconify/utils/lib/colors/types';
import './attribs.mjs';
import '../svg/analyse/types.mjs';
import '../misc/cheerio.mjs';
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
