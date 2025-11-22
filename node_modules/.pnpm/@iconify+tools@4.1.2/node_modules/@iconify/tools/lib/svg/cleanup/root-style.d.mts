import { SVG } from '../index.mjs';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';

interface CleanupRootStyleResult {
    animations?: Set<string>;
    removedAtRules?: Set<string>;
}
/**
 * Clean up root style
 *
 * This function removes all at-rule tokens, such as `@font-face`, `@media`
 */
declare function cleanupRootStyle(svg: SVG): CleanupRootStyleResult;

export { cleanupRootStyle };
