import Scanner from '@emmetio/scanner';
import type { BracketType, AllTokens } from './tokens.js';
export * from './tokens.js';
type Context = {
    [ctx in BracketType]: number;
} & {
    quote: number;
};
export default function tokenize(source: string): AllTokens[];
/**
 * Returns next token from given scanner, if possible
 */
export declare function getToken(scanner: Scanner, ctx: Context): AllTokens | undefined;
