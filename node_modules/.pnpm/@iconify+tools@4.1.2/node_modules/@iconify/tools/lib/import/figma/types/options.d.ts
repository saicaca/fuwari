import { IconSet } from '../../../icon-set/index.js';
import { FigmaImportParentNodeFilter, FigmaImportNodeFilter } from './nodes.js';
import { FigmaIconNode } from './result.js';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '../../../icon-set/types.js';
import '../../../svg/index.js';
import 'cheerio';
import '@iconify/utils/lib/icon-set/tree';
import './api.js';

/**
 * Options for importing SVG
 */
interface FigmaImportSVGOptions {
    includeID?: boolean;
    simplifyStroke?: boolean;
    useAbsoluteBounds?: boolean;
}
/**
 * Options
 */
interface FigmaImportCommonOptions {
    token: string;
    file: string;
    version?: string;
}
interface FigmaIfModifiedSinceOption {
    ifModifiedSince: string | Date | true;
}
interface FigmaFilesQueryOptions extends FigmaImportCommonOptions, Partial<FigmaIfModifiedSinceOption> {
    ids?: string[];
    depth?: number;
}
interface FigmaImagesQueryOptions extends FigmaImportCommonOptions {
    svgOptions?: FigmaImportSVGOptions;
}
interface FigmaGetIconNodesOptions {
    pages?: string[];
    filterParentNode?: FigmaImportParentNodeFilter;
    iconNameForNode: FigmaImportNodeFilter;
}
/**
 * Callback to call before or after importing icon
 */
type FigmaImportedIconCallback = (node: FigmaIconNode, iconSet: IconSet) => void | Promise<void>;
/**
 * Options for main import function
 */
interface FigmaImportOptions extends FigmaFilesQueryOptions, FigmaImagesQueryOptions, FigmaGetIconNodesOptions {
    prefix: string;
    cacheDir?: string;
    cacheAPITTL?: number;
    cacheSVGTTL?: number;
    beforeImportingIcon?: FigmaImportedIconCallback;
    afterImportingIcon?: FigmaImportedIconCallback;
}

export type { FigmaFilesQueryOptions, FigmaGetIconNodesOptions, FigmaIfModifiedSinceOption, FigmaImagesQueryOptions, FigmaImportOptions, FigmaImportSVGOptions };
