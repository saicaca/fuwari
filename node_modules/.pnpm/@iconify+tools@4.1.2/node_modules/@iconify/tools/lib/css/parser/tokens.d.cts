import { StyleParseError } from './error.cjs';
import { CSSToken } from './types.cjs';

/**
 * Get tokens
 */
declare function getTokens(css: string): CSSToken[] | StyleParseError;

export { getTokens };
