import type { NameToken, ValueToken, Repeater, AllTokens, BracketType, Bracket, Operator, OperatorType, Quote } from '../tokenizer/index.js';
import type { ParserOptions } from '../types.js';
export type TokenStatement = TokenElement | TokenGroup;
export interface TokenAttribute {
    name?: ValueToken[];
    value?: ValueToken[];
    expression?: boolean;
    /**
     * Indicates that current attribute was repeated multiple times in a row.
     * Used to alter output of multiple shorthand attributes like `..` (double class)
     */
    multiple?: boolean;
}
export interface TokenElement {
    type: 'TokenElement';
    name?: NameToken[];
    attributes?: TokenAttribute[];
    value?: ValueToken[];
    repeat?: Repeater;
    selfClose: boolean;
    elements: TokenStatement[];
}
export interface TokenGroup {
    type: 'TokenGroup';
    elements: TokenStatement[];
    repeat?: Repeater;
}
export default function abbreviation(abbr: AllTokens[], options?: ParserOptions): TokenGroup;
export declare function isBracket(token: AllTokens | undefined, context?: BracketType, isOpen?: boolean): token is Bracket;
export declare function isOperator(token: AllTokens | undefined, type?: OperatorType): token is Operator;
export declare function isQuote(token: AllTokens | undefined, isSingle?: boolean): token is Quote;
