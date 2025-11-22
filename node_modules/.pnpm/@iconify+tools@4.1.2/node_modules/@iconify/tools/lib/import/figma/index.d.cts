import { DocumentNotModified } from '../../download/types/modified.cjs';
import { FigmaIfModifiedSinceOption, FigmaImportOptions } from './types/options.cjs';
import { FigmaImportResult } from './types/result.cjs';
import '../../icon-set/index.cjs';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '../../icon-set/types.cjs';
import '../../svg/index.cjs';
import 'cheerio';
import '@iconify/utils/lib/icon-set/tree';
import './types/nodes.cjs';
import './types/api.cjs';

/**
 * Import icon set from Figma
 */
declare function importFromFigma<T extends FigmaIfModifiedSinceOption & FigmaImportOptions>(options: T): Promise<FigmaImportResult | DocumentNotModified>;
declare function importFromFigma(options: FigmaImportOptions): Promise<FigmaImportResult>;

export { importFromFigma };
