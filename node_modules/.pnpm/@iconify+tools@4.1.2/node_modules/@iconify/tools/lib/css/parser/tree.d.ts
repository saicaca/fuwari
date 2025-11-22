import { CSSToken, CSSTreeToken } from './types.js';

/**
 * Convert tokens list to tree
 */
declare function tokensTree(tokens: CSSToken[]): CSSTreeToken[];

export { tokensTree };
