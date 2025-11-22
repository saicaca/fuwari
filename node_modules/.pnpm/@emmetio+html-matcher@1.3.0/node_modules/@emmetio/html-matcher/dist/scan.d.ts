import { FastScanCallback, ScannerOptions } from './utils';
/**
 * Performs fast scan of given source code: for each tag found it invokes callback
 * with tag name, its type (open, close, self-close) and range in original source.
 * Unlike regular scanner, fast scanner doesn’t provide info about attributes to
 * reduce object allocations hence increase performance.
 * If `callback` returns `false`, scanner stops parsing.
 * @param special List of “special” HTML tags which should be ignored. Most likely
 * it’s a "script" and "style" tags.
 */
export default function scan(source: string, callback: FastScanCallback, options?: ScannerOptions): void;
