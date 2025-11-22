import Scanner from '@emmetio/scanner';
export declare type FastScanCallback = (name: string, type: ElementType, start: number, end: number) => false | any;
export declare const enum ElementType {
    Open = 1,
    Close = 2,
    SelfClose = 3,
    CData = 4,
    ProcessingInstruction = 5,
    Comment = 6,
    ERB = 7
}
export interface SpecialType {
    [tagName: string]: string[] | null;
}
export declare const enum Chars {
    /** `-` character */
    Dash = 45,
    /** `.` character */
    Dot = 46,
    /** `/` character */
    Slash = 47,
    /** `:` character */
    Colon = 58,
    /** `<` character */
    LeftAngle = 60,
    /** `>` character */
    RightAngle = 62,
    /** `(` character */
    LeftRound = 40,
    /** `)` character */
    RightRound = 41,
    /** `[` character */
    LeftSquare = 91,
    /** `]` character */
    RightSquare = 93,
    /** `{` character */
    LeftCurly = 123,
    /** `}` character */
    RightCurly = 125,
    /** `_` character */
    Underscore = 95,
    /** `=` character */
    Equals = 61,
    /** `*` character */
    Asterisk = 42,
    /** `#` character */
    Hash = 35
}
export interface ScannerOptions {
    /**
     * Parses given source as XML document. It alters how should-be-empty
     * elements are treated: for example, in XML mode parser will try to locate
     * closing pair for `<br>` tag
     */
    xml: boolean;
    /**
     * List of tags that should have special parsing rules, e.g. should not parse
     * inner content and skip to closing tag. Key is a tag name that should be
     * considered special and value is either empty (always mark element as special)
     * or list of `type` attribute values, which, if present with one of this value,
     * make element special
     */
    special: SpecialType;
    /**
     * List of elements that should be treated as empty (e.g. without closing tag)
     * in non-XML syntax
     */
    empty: string[];
    /**
     * If enabled, scanner callback will receive XML tokes, including comment, cdata
     * and processing instructions. If disabled, only tags are emitted
     */
    allTokens: boolean;
}
/** Options for `Scanner` utils */
export declare const opt: {
    throws: boolean;
};
export declare function createOptions(options?: Partial<ScannerOptions>): ScannerOptions;
/**
 * Converts given string into array of character codes
 */
export declare function toCharCodes(str: string): number[];
/**
 * Consumes array of character codes from given scanner
 */
export declare function consumeArray(scanner: Scanner, codes: number[]): boolean;
/**
 * Consumes section from given string which starts with `open` character codes
 * and ends with `close` character codes
 * @return Returns `true` if section was consumed
 */
export declare function consumeSection(scanner: Scanner, open: number[], close: number[], allowUnclosed?: boolean): boolean;
/**
 * Check if given character can be used as a start of tag name or attribute
 */
export declare function nameStartChar(ch: number): boolean;
/**
 * Check if given character can be used in a tag or attribute name
 */
export declare function nameChar(ch: number): boolean;
/**
 * Consumes identifier from given scanner
 */
export declare function ident(scanner: Scanner): boolean;
/**
 * Check if given code is tag terminator
 */
export declare function isTerminator(code: number): boolean;
/**
 * Check if given character code is valid unquoted value
 */
export declare function isUnquoted(code: number): boolean;
/**
 * Consumes paired tokens (like `[` and `]`) with respect of nesting and embedded
 * quoted values
 * @return `true` if paired token was consumed
 */
export declare function consumePaired(scanner: Scanner): boolean;
/**
 * Returns unquoted value of given string
 */
export declare function getUnquotedValue(value: string): string;
