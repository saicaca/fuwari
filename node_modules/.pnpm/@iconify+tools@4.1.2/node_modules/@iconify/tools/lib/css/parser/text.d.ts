import { TextToken, CSSRuleToken, CSSTokenWithSelector } from './types.js';

/**
 * Merge text tokens to string
 */
declare function mergeTextTokens(tokens: TextToken[]): string;
/**
 * Get list of selectors from list of words
 */
declare function getSelectors(tokens: TextToken[]): string[];
/**
 * Convert text token to rule
 */
declare function textTokensToRule(tokens: TextToken[]): CSSRuleToken | null;
/**
 * Create at-rule or selector token from text tokens
 */
declare function textTokensToSelector(tokens: TextToken[]): CSSTokenWithSelector | null;

export { getSelectors, mergeTextTokens, textTokensToRule, textTokensToSelector };
