import { ExtendedTagElement } from './types.cjs';
import '../../misc/cheerio.cjs';
import 'domhandler';
import 'cheerio';

/**
 * Get tag for error message
 */
declare function analyseTagError(element: ExtendedTagElement): string;

export { analyseTagError };
