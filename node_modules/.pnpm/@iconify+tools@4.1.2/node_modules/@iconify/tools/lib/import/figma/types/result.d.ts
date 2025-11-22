import { IconSet } from '../../../icon-set/index.js';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '../../../icon-set/types.js';
import '../../../svg/index.js';
import 'cheerio';
import '@iconify/utils/lib/icon-set/tree';

/**
 * Result for found icons
 */
interface FigmaIconNode {
    id: string;
    name: string;
    keyword: string;
    url?: string;
    content?: string;
}
/**
 * Nodes count
 */
interface FigmaNodesCount {
    nodesCount: number;
    generatedIconsCount: number;
    downloadedIconsCount: number;
}
/**
 * Import result for icons
 */
interface FigmaNodesImportResult extends Partial<FigmaNodesCount> {
    icons: Record<string, FigmaIconNode>;
}
/**
 * Import result
 */
interface FigmaImportResult extends FigmaNodesCount {
    name: string;
    version: string;
    lastModified: string;
    iconSet: IconSet;
    missing: FigmaIconNode[];
}

export type { FigmaIconNode, FigmaImportResult, FigmaNodesCount, FigmaNodesImportResult };
