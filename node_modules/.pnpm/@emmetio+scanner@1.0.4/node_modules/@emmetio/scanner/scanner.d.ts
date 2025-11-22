export * from './utils.js';
type MatchFn = (ch: number) => boolean;
/**
 * A streaming, character code-based string reader
 */
export default class Scanner {
    /** Current string */
    string: string;
    /** Current scanner position */
    pos: number;
    /** Lower range limit where string reader is available */
    start: number;
    /** Upper range limit where string reader is available */
    end: number;
    constructor(str: string, start?: number, end?: number);
    /**
     * Returns true only if the stream is at the end of the file.
     */
    eof(): boolean;
    /**
     * Creates a new stream instance which is limited to given `start` and `end`
     * range. E.g. its `eof()` method will look at `end` property, not actual
     * stream end
     */
    limit(start?: number, end?: number): Scanner;
    /**
     * Returns the next character code in the stream without advancing it.
     * Will return NaN at the end of the file.
     */
    peek(): number;
    /**
     * Returns the next character in the stream and advances it.
     * Also returns <code>undefined</code> when no more characters are available.
     */
    next(): number | undefined;
    /**
     * `match` can be a character code or a function that takes a character code
     * and returns a boolean. If the next character in the stream 'matches'
     * the given argument, it is consumed and returned.
     * Otherwise, `false` is returned.
     */
    eat(match: number | MatchFn): boolean;
    /**
     * Repeatedly calls <code>eat</code> with the given argument, until it
     * fails. Returns <code>true</code> if any characters were eaten.
     */
    eatWhile(match: number | MatchFn): boolean;
    /**
     * Backs up the stream n characters. Backing it up further than the
     * start of the current token will cause things to break, so be careful.
     */
    backUp(n: number): void;
    /**
     * Get the string between the start of the current token and the
     * current stream position.
     */
    current(): string;
    /**
     * Returns substring for given range
     */
    substring(start: number, end?: number): string;
    /**
     * Creates error object with current stream state
     */
    error(message: string, pos?: number): ScannerError;
}
export declare class ScannerError extends Error {
    pos: number;
    string: string;
    constructor(message: string, pos: number, str: string);
}
