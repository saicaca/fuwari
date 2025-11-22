import { SVG } from './index.cjs';
import { AnalyseSVGStructureOptions, AnalyseSVGStructureResult } from './analyse/types.cjs';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '../misc/cheerio.cjs';
import 'domhandler';

/**
 * Find all IDs, links, which elements use palette, which items aren't used
 *
 * Before running this function run cleanup functions to change inline style to attributes and fix attributes
 */
declare function analyseSVGStructure(svg: SVG, options?: AnalyseSVGStructureOptions): AnalyseSVGStructureResult;

export { analyseSVGStructure };
