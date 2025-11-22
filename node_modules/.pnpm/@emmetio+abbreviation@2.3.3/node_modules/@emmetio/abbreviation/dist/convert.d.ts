import { TokenGroup } from './parser/index.js';
import { Abbreviation, ParserOptions } from './types.js';
/**
 * Converts given token-based abbreviation into simplified and unrolled node-based
 * abbreviation
 */
export default function convert(abbr: TokenGroup, options?: ParserOptions): Abbreviation;
export declare function isGroup(node: any): node is TokenGroup;
