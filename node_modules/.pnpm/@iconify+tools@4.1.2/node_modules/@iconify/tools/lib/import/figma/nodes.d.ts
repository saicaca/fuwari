import { FigmaDocument } from './types/api.js';
import { FigmaGetIconNodesOptions } from './types/options.js';
import { FigmaNodesImportResult } from './types/result.js';
import '../../icon-set/index.js';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '../../icon-set/types.js';
import '../../svg/index.js';
import 'cheerio';
import '@iconify/utils/lib/icon-set/tree';
import './types/nodes.js';

/**
 * Get node ids for icons
 */
declare function getFigmaIconNodes(document: FigmaDocument, options: FigmaGetIconNodesOptions): FigmaNodesImportResult;

export { getFigmaIconNodes };
