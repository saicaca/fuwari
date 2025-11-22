import { SVG } from './index.js';
import { CheckBadTagsOptions } from './cleanup/bad-tags.js';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';

/**
 * Options
 */
type CleanupSVGOptions = CheckBadTagsOptions;
/**
 * Clean up SVG before parsing/optimising it
 */
declare function cleanupSVG(svg: SVG, options?: CleanupSVGOptions): void;

export { type CleanupSVGOptions, cleanupSVG };
