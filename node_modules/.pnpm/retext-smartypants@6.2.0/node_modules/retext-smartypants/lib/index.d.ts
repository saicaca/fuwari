/**
 * Replace straight punctuation marks with curly ones.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
export default function retextSmartypants(options?: Readonly<Options> | null | undefined): (tree: Root) => undefined;
/**
 * Transform.
 */
export type Method = (state: State, node: Punctuation | Symbol, index: number, parent: Parents) => boolean | undefined | void;
/**
 * Configuration.
 */
export type Options = {
    /**
     * Transform backticks (default: `true`); when `true`, turns double
     * backticks into an opening double quote and double straight single quotes
     * into a closing double quote; when `'all'`, does that and turns single
     * backticks into an opening single quote and a straight single quotes into
     * a closing single smart quote; `quotes: false` must be used with
     * `backticks: 'all'`.
     */
    backticks?: "all" | boolean | null | undefined;
    /**
     * Closing quotes to use (default: `{double: '”', single: '’'}`).
     */
    closingQuotes?: QuoteCharacterMap | null | undefined;
    /**
     * Transform dashes (default: `true`);
     * when `true`, turns two dashes into an em dash character;
     * when `'oldschool'`, turns three dashes into an em dash and two into an en
     * dash;
     * when `'inverted'`, turns three dashes into an en dash and two into an em
     * dash.
     */
    dashes?: "inverted" | "oldschool" | boolean | null | undefined;
    /**
     * Transform triple dots (default: `true`).
     * when `'spaced'`, turns triple dots with spaces into ellipses;
     * when `'unspaced'`, turns triple dots without spaces into ellipses;
     * when `true`, turns triple dots with or without spaces into ellipses.
     */
    ellipses?: "spaced" | "unspaced" | boolean | null | undefined;
    /**
     * Opening quotes to use (default: `{double: '“', single: '‘'}`).
     */
    openingQuotes?: QuoteCharacterMap | null | undefined;
    /**
     * Transform straight quotes into smart quotes (default: `true`).
     */
    quotes?: boolean | null | undefined;
};
/**
 * Info passed around.
 */
export type State = {
    /**
     *   Closing quotes.
     */
    close: Quotes;
    /**
     *   Opening quotes.
     */
    open: Quotes;
};
/**
 * Quote characters.
 */
export type QuoteCharacterMap = {
    /**
     *   Character to use for double quotes.
     */
    double: string;
    /**
     *   Character to use for single quotes.
     */
    single: string;
};
/**
 * Quotes.
 */
export type Quotes = [string, string];
import type { Root } from 'nlcst';
import type { Punctuation } from 'nlcst';
import type { Symbol } from 'nlcst';
import type { Parents } from 'nlcst';
//# sourceMappingURL=index.d.ts.map