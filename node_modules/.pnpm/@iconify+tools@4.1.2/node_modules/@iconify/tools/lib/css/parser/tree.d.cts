import { CSSToken, CSSTreeToken } from './types.cjs';

/**
 * Convert tokens list to tree
 */
declare function tokensTree(tokens: CSSToken[]): CSSTreeToken[];

export { tokensTree };
