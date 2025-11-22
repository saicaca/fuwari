import { FigmaDocument } from './types/api.cjs';
import { FigmaGetIconNodesOptions } from './types/options.cjs';
import { FigmaNodesImportResult } from './types/result.cjs';
import '../../icon-set/index.cjs';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '../../icon-set/types.cjs';
import '../../svg/index.cjs';
import 'cheerio';
import '@iconify/utils/lib/icon-set/tree';
import './types/nodes.cjs';

/**
 * Get node ids for icons
 */
declare function getFigmaIconNodes(document: FigmaDocument, options: FigmaGetIconNodesOptions): FigmaNodesImportResult;

export { getFigmaIconNodes };
