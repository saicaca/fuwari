import { APICacheOptions } from '../../download/api/types.cjs';
import { DocumentNotModified } from '../../download/types/modified.cjs';
import { FigmaDocument } from './types/api.cjs';
import { FigmaIfModifiedSinceOption, FigmaFilesQueryOptions, FigmaImagesQueryOptions } from './types/options.cjs';
import { FigmaNodesImportResult, FigmaIconNode } from './types/result.cjs';
import '../../icon-set/index.cjs';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '../../icon-set/types.cjs';
import '../../svg/index.cjs';
import 'cheerio';
import '@iconify/utils/lib/icon-set/tree';
import './types/nodes.cjs';

/**
 * Extra parameters added to runConcurrentQueries()
 *
 * Can be used to identify failed items in onfail callback
 */
interface FigmaIconNodeWithURL extends FigmaIconNode {
    url: string;
}
type FigmaConcurrentQueriesParamsFunction = 'figmaImagesQuery' | 'figmaDownloadImages';
interface FigmaConcurrentQueriesParams<T extends FigmaConcurrentQueriesParamsFunction> {
    function: T;
    payload: T extends 'figmaImagesQuery' ? string[][] : FigmaIconNodeWithURL[];
}
/**
 * Get Figma files
 */
declare function figmaFilesQuery<T extends FigmaIfModifiedSinceOption & FigmaFilesQueryOptions>(options: T, cache?: APICacheOptions): Promise<FigmaDocument | DocumentNotModified>;
declare function figmaFilesQuery(options: FigmaFilesQueryOptions, cache?: APICacheOptions): Promise<FigmaDocument>;
/**
 * Generate all images
 */
declare function figmaImagesQuery(options: FigmaImagesQueryOptions, nodes: FigmaNodesImportResult, cache?: APICacheOptions): Promise<FigmaNodesImportResult>;
/**
 * Download all images
 */
declare function figmaDownloadImages(nodes: FigmaNodesImportResult, cache?: APICacheOptions): Promise<FigmaNodesImportResult>;

export { type FigmaConcurrentQueriesParams, type FigmaConcurrentQueriesParamsFunction, figmaDownloadImages, figmaFilesQuery, figmaImagesQuery };
