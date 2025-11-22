import { FigmaDocument } from './types/api.mjs';
import { FigmaGetIconNodesOptions } from './types/options.mjs';
import { FigmaNodesImportResult } from './types/result.mjs';
import '../../icon-set/index.mjs';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '../../icon-set/types.mjs';
import '../../svg/index.mjs';
import 'cheerio';
import '@iconify/utils/lib/icon-set/tree';
import './types/nodes.mjs';

/**
 * Get node ids for icons
 */
declare function getFigmaIconNodes(document: FigmaDocument, options: FigmaGetIconNodesOptions): FigmaNodesImportResult;

export { getFigmaIconNodes };
