import { AllTokens } from '../tokenizer/index.js';
export interface TokenScanner {
    tokens: AllTokens[];
    start: number;
    pos: number;
    size: number;
}
type TestFn = (token?: AllTokens) => boolean;
export default function tokenScanner(tokens: AllTokens[]): TokenScanner;
export declare function peek(scanner: TokenScanner): AllTokens | undefined;
export declare function next(scanner: TokenScanner): AllTokens | undefined;
export declare function slice(scanner: TokenScanner, from?: number, to?: number): AllTokens[];
export declare function readable(scanner: TokenScanner): boolean;
export declare function consume(scanner: TokenScanner, test: TestFn): boolean;
export declare function error(scanner: TokenScanner, message: string, token?: AllTokens | undefined): Error;
export declare function consumeWhile(scanner: TokenScanner, test: TestFn): boolean;
export {};
