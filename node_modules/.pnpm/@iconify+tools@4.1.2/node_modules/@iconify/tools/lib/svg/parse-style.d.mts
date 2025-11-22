import { SVG } from './index.mjs';
import { CSSRuleToken, CSSToken, CSSAtRuleToken } from '../css/parser/types.mjs';
import { ParseSVGCallbackItem } from './parse.mjs';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '../misc/cheerio.mjs';
import 'domhandler';

/**
 * Item in callback
 */
interface ParseSVGStyleCallbackItemCommon {
    prop: string;
    value: string;
}
interface ParseSVGStyleCallbackItemInline extends ParseSVGStyleCallbackItemCommon {
    type: 'inline';
    item: ParseSVGCallbackItem;
}
interface ParseSVGStyleCallbackItemGlobal extends ParseSVGStyleCallbackItemCommon {
    type: 'global';
    token: CSSRuleToken;
    selectors: string[];
    selectorTokens: CSSToken[];
    prevTokens: (CSSToken | null)[];
    nextTokens: CSSToken[];
}
interface ParseSVGStyleCallbackItemGlobalAtRule extends ParseSVGStyleCallbackItemCommon {
    token: CSSAtRuleToken;
    childTokens: CSSToken[];
    prevTokens: (CSSToken | null)[];
    nextTokens: CSSToken[];
}
interface ParseSVGStyleCallbackItemGlobalGenericAtRule extends ParseSVGStyleCallbackItemGlobalAtRule {
    type: 'at-rule';
}
interface ParseSVGStyleCallbackItemGlobalKeyframesAtRule extends ParseSVGStyleCallbackItemGlobalAtRule {
    type: 'keyframes';
    from: Record<string, string>;
}
type ParseSVGStyleCallbackItem = ParseSVGStyleCallbackItemInline | ParseSVGStyleCallbackItemGlobal | ParseSVGStyleCallbackItemGlobalGenericAtRule | ParseSVGStyleCallbackItemGlobalKeyframesAtRule;
/**
 * Result: undefined to remove item, string to change/keep item
 */
type ParseSVGStyleCallbackResult = string | undefined;
/**
 * Callback function
 */
type ParseSVGStyleCallback = (item: ParseSVGStyleCallbackItem) => ParseSVGStyleCallbackResult;
/**
 * Parse styles in SVG
 *
 * This function finds CSS in SVG, parses it, calls callback for each rule.
 * Callback should return new value (string) or undefined to remove rule.
 */
declare function parseSVGStyle(svg: SVG, callback: ParseSVGStyleCallback): void;

export { type ParseSVGStyleCallback, type ParseSVGStyleCallbackItem, type ParseSVGStyleCallbackResult, parseSVGStyle };
