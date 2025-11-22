import { SVG } from '../index.cjs';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';

/**
 * Options
 */
interface CheckBadTagsOptions {
    keepTitles?: boolean;
}
/**
 * Test for bag tags
 */
declare function checkBadTags(svg: SVG, options?: CheckBadTagsOptions): void;

export { type CheckBadTagsOptions, checkBadTags };
