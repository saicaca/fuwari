export type OperatorType = 'child' | 'sibling' | 'climb' | 'class' | 'id' | 'close' | 'equal';
export type BracketType = 'group' | 'attribute' | 'expression';
export type AllTokens = Bracket | Field | Literal | Operator | Quote | Repeater | RepeaterNumber | RepeaterPlaceholder | WhiteSpace;
export type NameToken = Literal | RepeaterNumber;
export type ValueToken = Literal | Quote | Bracket | Field | RepeaterPlaceholder | RepeaterNumber;
export interface Token {
    type: string;
    /** Location of token start in source */
    start?: number;
    /** Location of token end in source */
    end?: number;
}
export interface Repeater extends Token {
    type: 'Repeater';
    /** How many times context element should be repeated */
    count: number;
    /** Position of context element in its repeating sequence */
    value: number;
    /** Repeater is implicit, e.g. repeated by the amount of text lines selected by user */
    implicit: boolean;
}
export interface RepeaterNumber extends Token {
    type: 'RepeaterNumber';
    /** Size of repeater content, e.g. the amount consequent numbering characters */
    size: number;
    /** Should output numbering in reverse order? */
    reverse: boolean;
    /** Base value to start numbering from */
    base: number;
    /** Parent offset from which numbering should be used */
    parent: number;
}
export interface RepeaterPlaceholder extends Token {
    type: 'RepeaterPlaceholder';
    /** Value to insert instead of placeholder */
    value?: string;
}
export interface Field extends Token {
    type: 'Field';
    index?: number;
    name: string;
}
export interface Operator extends Token {
    type: 'Operator';
    operator: OperatorType;
}
export interface Bracket extends Token {
    type: 'Bracket';
    open: boolean;
    context: BracketType;
}
export interface Quote extends Token {
    type: 'Quote';
    single: boolean;
}
export interface Literal extends Token {
    type: 'Literal';
    value: string;
}
export interface WhiteSpace extends Token {
    type: 'WhiteSpace';
    value: string;
}
