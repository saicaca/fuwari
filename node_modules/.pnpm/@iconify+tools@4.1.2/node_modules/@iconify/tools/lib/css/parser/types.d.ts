/**
 * Text tokens, to be split combined into correct tokens later
 */
interface TextToken {
    type: 'chunk' | 'url' | 'quoted-string';
    index: number;
    text: string;
}
/**
 * Values
 */
type CSSATValue = string | string[];
/**
 * Tokens
 */
interface CSSRuleToken {
    type: 'rule';
    index: number;
    prop: string;
    value: string;
    important?: boolean;
}
interface CSSSelectorToken {
    type: 'selector';
    index: number;
    code: string;
    selectors: string[];
}
interface CSSAtRuleToken {
    type: 'at-rule';
    index: number;
    rule: string;
    value: string;
}
interface CSSCloseToken {
    type: 'close';
    index: number;
}
type CSSTokenWithSelector = CSSSelectorToken | CSSAtRuleToken;
type CSSToken = CSSRuleToken | CSSSelectorToken | CSSAtRuleToken | CSSCloseToken;
/**
 * Tree tokens
 */
interface CSSSelectorTreeToken extends CSSSelectorToken {
    children: CSSTreeToken[];
}
interface CSSAtRuleTreeToken extends CSSAtRuleToken {
    children: CSSTreeToken[];
}
type CSSTreeToken = CSSRuleToken | CSSSelectorTreeToken | CSSAtRuleTreeToken;

export type { CSSATValue, CSSAtRuleToken, CSSAtRuleTreeToken, CSSCloseToken, CSSRuleToken, CSSSelectorToken, CSSSelectorTreeToken, CSSToken, CSSTokenWithSelector, CSSTreeToken, TextToken };
