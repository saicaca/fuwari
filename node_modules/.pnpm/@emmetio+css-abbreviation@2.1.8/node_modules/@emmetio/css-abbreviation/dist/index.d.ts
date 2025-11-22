import tokenize, { getToken, type AllTokens } from './tokenizer/index.js';
import parser, { type CSSProperty, type ParseOptions } from './parser/index.js';
export { tokenize, getToken, parser };
export * from './tokenizer/tokens.js';
export type { CSSProperty, CSSValue, ParseOptions, FunctionCall, Value } from './parser/index.js';
export type CSSAbbreviation = CSSProperty[];
/**
 * Parses given abbreviation into property set
 */
export default function parse(abbr: string | AllTokens[], options?: ParseOptions): CSSAbbreviation;
