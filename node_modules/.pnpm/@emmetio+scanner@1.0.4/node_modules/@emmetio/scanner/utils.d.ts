import type Scanner from './scanner.js';
interface QuotedOptions {
    /** A character code of quote-escape symbol */
    escape?: number;
    /** Throw error if quotes string can’t be properly consumed */
    throws?: boolean;
}
/**
 * Check if given code is a number
 */
export declare function isNumber(code: number): boolean;
/**
 * Check if given character code is alpha code (letter through A to Z)
 */
export declare function isAlpha(code: number, from?: number, to?: number): boolean;
/**
 * Check if given character code is alpha-numeric (letter through A to Z or number)
 */
export declare function isAlphaNumeric(code: number): boolean;
export declare function isAlphaNumericWord(code: number): boolean;
export declare function isAlphaWord(code: number): boolean;
/**
 * Check for Umlauts i.e. ä, Ä, ö, Ö, ü and Ü
 */
export declare function isUmlaut(code: number): boolean;
/**
 * Check if given character code is a white-space character: a space character
 * or line breaks
 */
export declare function isWhiteSpace(code: number): boolean;
/**
 * Check if given character code is a space character
 */
export declare function isSpace(code: number): boolean;
/**
 * Consumes 'single' or "double"-quoted string from given string, if possible
 * @return `true` if quoted string was consumed. The contents of quoted string
 * will be available as `stream.current()`
 */
export declare function eatQuoted(stream: Scanner, options?: QuotedOptions): boolean;
/**
 * Check if given character code is a quote character
 */
export declare function isQuote(code: number): boolean;
/**
 * Eats paired characters substring, for example `(foo)` or `[bar]`
 * @param open Character code of pair opening
 * @param close Character code of pair closing
 * @return Returns `true` if character pair was successfully consumed, it’s
 * content will be available as `stream.current()`
 */
export declare function eatPair(stream: Scanner, open: number, close: number, options?: QuotedOptions): boolean;
export {};
