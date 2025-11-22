import { DocumentNotModified } from '../../download/types/modified.mjs';
import { FigmaIfModifiedSinceOption, FigmaImportOptions } from './types/options.mjs';
import { FigmaImportResult } from './types/result.mjs';
import '../../icon-set/index.mjs';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '../../icon-set/types.mjs';
import '../../svg/index.mjs';
import 'cheerio';
import '@iconify/utils/lib/icon-set/tree';
import './types/nodes.mjs';
import './types/api.mjs';

/**
 * Import icon set from Figma
 */
declare function importFromFigma<T extends FigmaIfModifiedSinceOption & FigmaImportOptions>(options: T): Promise<FigmaImportResult | DocumentNotModified>;
declare function importFromFigma(options: FigmaImportOptions): Promise<FigmaImportResult>;

export { importFromFigma };
