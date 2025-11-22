import { SVG } from '../svg/index.cjs';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';

/**
 * De-optimise paths. Compressed paths are still not supported by some software.
 */
declare function deOptimisePaths(svg: SVG): void;

export { deOptimisePaths };
