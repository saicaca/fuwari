import { StyleParseError } from './error.js';
import { CSSToken } from './types.js';

/**
 * Get tokens
 */
declare function getTokens(css: string): CSSToken[] | StyleParseError;

export { getTokens };
