import { APICacheOptions } from '../../download/api/types.mjs';
import { DocumentNotModified } from '../../download/types/modified.mjs';
import { FigmaDocument } from './types/api.mjs';
import { FigmaIfModifiedSinceOption, FigmaFilesQueryOptions, FigmaImagesQueryOptions } from './types/options.mjs';
import { FigmaNodesImportResult, FigmaIconNode } from './types/result.mjs';
import '../../icon-set/index.mjs';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '../../icon-set/types.mjs';
import '../../svg/index.mjs';
import 'cheerio';
import '@iconify/utils/lib/icon-set/tree';
import './types/nodes.mjs';

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
