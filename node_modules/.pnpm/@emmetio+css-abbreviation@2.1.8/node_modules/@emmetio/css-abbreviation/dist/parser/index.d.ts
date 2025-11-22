import type { StringValue, NumberValue, ColorValue, Literal, AllTokens, Field, CustomProperty } from '../tokenizer/tokens.js';
export type Value = StringValue | NumberValue | ColorValue | Literal | FunctionCall | Field | CustomProperty;
export interface FunctionCall {
    type: 'FunctionCall';
    name: string;
    arguments: CSSValue[];
}
export interface CSSValue {
    type: 'CSSValue';
    value: Value[];
}
export interface CSSProperty {
    name?: string;
    value: CSSValue[];
    important: boolean;
    /** Snippet matched with current property */
    snippet?: any;
}
export interface ParseOptions {
    /** Consumes given abbreviation tokens as value */
    value?: boolean;
}
export default function parser(tokens: AllTokens[], options?: ParseOptions): CSSProperty[];
