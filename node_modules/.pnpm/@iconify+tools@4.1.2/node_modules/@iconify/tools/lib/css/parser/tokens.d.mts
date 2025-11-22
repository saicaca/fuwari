import { StyleParseError } from './error.mjs';
import { CSSToken } from './types.mjs';

/**
 * Get tokens
 */
declare function getTokens(css: string): CSSToken[] | StyleParseError;

export { getTokens };
