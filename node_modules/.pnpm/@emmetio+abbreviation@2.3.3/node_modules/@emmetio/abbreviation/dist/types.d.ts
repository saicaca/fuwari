import { Field, Repeater } from './tokenizer/index.js';
export interface ParserOptions {
    /** Text strings to insert into implicitly repeated elements */
    text?: string | string[];
    /** Variable values for `${var}` tokens */
    variables?: {
        [name: string]: string;
    };
    /** Max amount of repeated elements in abbreviation */
    maxRepeat?: number;
    /** Enabled JSX parsing mode */
    jsx?: boolean;
    /** Enable inserting text into href attribute of links */
    href?: boolean;
}
export interface ConvertState {
    inserted: boolean;
    text?: string | string[];
    cleanText?: string | string[];
    repeatGuard: number;
    /** Context repeaters, e.g. all actual repeaters from parent */
    repeaters: Repeater[];
    getText(pos?: number): string;
    getVariable(name: string): string;
}
export type Value = string | Field;
export type AttributeType = 'raw' | 'singleQuote' | 'doubleQuote' | 'expression';
export interface Abbreviation {
    type: 'Abbreviation';
    children: AbbreviationNode[];
}
export interface AbbreviationNode {
    type: 'AbbreviationNode';
    name?: string;
    value?: Value[];
    repeat?: Repeater;
    attributes?: AbbreviationAttribute[];
    children: AbbreviationNode[];
    /**  Indicates current element is self-closing, e.g. should not contain closing pair */
    selfClosing?: boolean;
}
export interface AbbreviationAttribute {
    name?: string;
    value?: Value[];
    /** Indicates type of value stored in `.value` property */
    valueType: AttributeType;
    /** Attribute is boolean (e.g.name equals value) */
    boolean?: boolean;
    /** Attribute is implied (e.g.must be outputted only if contains non-null value) */
    implied?: boolean;
    /**
     * Internal property that indicates that given attribute was specified
     * more than once as a shorthand. E.g. `..` is a multiple `class` attribute
     */
    multiple?: boolean;
}
