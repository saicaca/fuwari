import { StyleParseError } from './error.mjs';

/**
 * Find end of quoted string
 *
 * Returns index of character after quote
 */
declare function findEndOfQuotedString(code: string, quote: string, start: number): number | null;
/**
 * Find end of url
 *
 * Returns index of character after end of URL
 */
declare function findEndOfURL(code: string, start: number): number | StyleParseError;

export { findEndOfQuotedString, findEndOfURL };
