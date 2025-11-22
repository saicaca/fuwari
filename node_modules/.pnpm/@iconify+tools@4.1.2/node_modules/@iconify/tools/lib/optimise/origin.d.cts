import { SVG } from '../svg/index.cjs';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';

/**
 * Reset origin to 0 0
 */
declare function resetSVGOrigin(svg: SVG): void;

export { resetSVGOrigin };
