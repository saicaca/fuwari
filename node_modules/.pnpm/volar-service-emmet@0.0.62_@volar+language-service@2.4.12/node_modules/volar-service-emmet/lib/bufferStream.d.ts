import type { TextDocument } from '@volar/language-service';
/**
 * A stream reader for VSCode's `TextDocument`
 * Based on @emmetio/stream-reader and @emmetio/atom-plugin
 */
export declare class DocumentStreamReader {
    private document;
    private start;
    private _eof;
    private _sof;
    pos: number;
    constructor(document: TextDocument, pos?: number, limit?: [number, number]);
    /**
     * Returns true only if the stream is at the start of the file.
     */
    sof(): boolean;
    /**
     * Returns true only if the stream is at the end of the file.
     */
    eof(): boolean;
    /**
     * Creates a new stream instance which is limited to given range for given document
     */
    limit(start: number, end: number): DocumentStreamReader;
    /**
     * Returns the next character code in the stream without advancing it.
     * Will return NaN at the end of the file.
     */
    peek(): number;
    /**
     * Returns the next character in the stream and advances it.
     * Also returns NaN when no more characters are available.
     */
    next(): number;
    /**
     * Backs up the stream n characters. Backing it up further than the
     * start of the current token will cause things to break, so be careful.
     */
    backUp(n: number): number;
    /**
     * Get the string between the start of the current token and the
     * current stream position.
     */
    current(): string;
    /**
     * Returns contents for given range
     */
    substring(from: number, to: number): string;
    /**
     * Creates error object with current stream state
     */
    error(message: string): Error;
    /**
     * `match` can be a character code or a function that takes a character code
     * and returns a boolean. If the next character in the stream 'matches'
     * the given argument, it is consumed and returned.
     * Otherwise, `false` is returned.
     */
    eat(match: number | Function): boolean;
    /**
     * Repeatedly calls <code>eat</code> with the given argument, until it
     * fails. Returns <code>true</code> if any characters were eaten.
     */
    eatWhile(match: number | Function): boolean;
}
//# sourceMappingURL=bufferStream.d.ts.map