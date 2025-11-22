import { default as Scanner } from '@emmetio/scanner';
import type { AllTokens, Literal, NumberValue, ColorValue, WhiteSpace, Operator, Bracket, StringValue, Field, CustomProperty } from './tokens.js';
export * from './tokens.js';
export default function tokenize(abbr: string, isValue?: boolean): AllTokens[];
/**
 * Returns next token from given scanner, if possible
 */
export declare function getToken(scanner: Scanner, short?: boolean): Bracket | Literal | Operator | WhiteSpace | ColorValue | NumberValue | StringValue | CustomProperty | Field | undefined;
