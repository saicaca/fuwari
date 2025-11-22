import { DocumentNotModified } from '../../download/types/modified.js';
import { FigmaIfModifiedSinceOption, FigmaImportOptions } from './types/options.js';
import { FigmaImportResult } from './types/result.js';
import '../../icon-set/index.js';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '../../icon-set/types.js';
import '../../svg/index.js';
import 'cheerio';
import '@iconify/utils/lib/icon-set/tree';
import './types/nodes.js';
import './types/api.js';

/**
 * Import icon set from Figma
 */
declare function importFromFigma<T extends FigmaIfModifiedSinceOption & FigmaImportOptions>(options: T): Promise<FigmaImportResult | DocumentNotModified>;
declare function importFromFigma(options: FigmaImportOptions): Promise<FigmaImportResult>;

export { importFromFigma };
