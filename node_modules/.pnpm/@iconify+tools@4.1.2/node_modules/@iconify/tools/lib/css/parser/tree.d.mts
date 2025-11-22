import { CSSToken, CSSTreeToken } from './types.mjs';

/**
 * Convert tokens list to tree
 */
declare function tokensTree(tokens: CSSToken[]): CSSTreeToken[];

export { tokensTree };
