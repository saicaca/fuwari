export type AllTokens = Bracket | Literal | Operator | WhiteSpace | ColorValue | NumberValue | StringValue | CustomProperty | Field;
export declare const enum OperatorType {
    Sibling = "+",
    Important = "!",
    ArgumentDelimiter = ",",
    ValueDelimiter = "-",
    PropertyDelimiter = ":"
}
export interface Token {
    type: string;
    /** Location of token start in source */
    start?: number;
    /** Location of token end in source */
    end?: number;
}
export interface Operator extends Token {
    type: 'Operator';
    operator: OperatorType;
}
export interface Bracket extends Token {
    type: 'Bracket';
    open: boolean;
}
export interface Literal extends Token {
    type: 'Literal';
    value: string;
}
export interface CustomProperty extends Token {
    type: 'CustomProperty';
    value: string;
}
export interface NumberValue extends Token {
    type: 'NumberValue';
    value: number;
    unit: string;
    rawValue: string;
}
export interface ColorValue extends Token {
    type: 'ColorValue';
    r: number;
    g: number;
    b: number;
    a: number;
    raw: string;
}
export interface StringValue extends Token {
    type: 'StringValue';
    value: string;
    quote: 'single' | 'double';
}
export interface WhiteSpace extends Token {
    type: 'WhiteSpace';
}
export interface Field extends Token {
    type: 'Field';
    index?: number;
    name: string;
}
