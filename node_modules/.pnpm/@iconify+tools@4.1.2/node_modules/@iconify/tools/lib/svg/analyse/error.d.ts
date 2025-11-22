import { ExtendedTagElement } from './types.js';
import '../../misc/cheerio.js';
import 'domhandler';
import 'cheerio';

/**
 * Get tag for error message
 */
declare function analyseTagError(element: ExtendedTagElement): string;

export { analyseTagError };
