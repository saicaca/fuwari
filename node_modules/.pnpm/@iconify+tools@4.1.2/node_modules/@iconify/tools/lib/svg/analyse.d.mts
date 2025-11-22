import { SVG } from './index.mjs';
import { AnalyseSVGStructureOptions, AnalyseSVGStructureResult } from './analyse/types.mjs';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '../misc/cheerio.mjs';
import 'domhandler';

/**
 * Find all IDs, links, which elements use palette, which items aren't used
 *
 * Before running this function run cleanup functions to change inline style to attributes and fix attributes
 */
declare function analyseSVGStructure(svg: SVG, options?: AnalyseSVGStructureOptions): AnalyseSVGStructureResult;

export { analyseSVGStructure };
