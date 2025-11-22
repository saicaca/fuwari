import { SVG } from '../svg/index.cjs';
import { ParseColorsOptions, FindColorsResult } from './parse.cjs';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '@iconify/utils/lib/colors/types';
import './attribs.cjs';
import '../svg/analyse/types.cjs';
import '../misc/cheerio.cjs';
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
