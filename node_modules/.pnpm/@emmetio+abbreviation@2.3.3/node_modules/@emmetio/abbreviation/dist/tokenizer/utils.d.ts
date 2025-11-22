import type Scanner from '@emmetio/scanner';
export declare const enum Chars {
    /** `{` character */
    CurlyBracketOpen = 123,
    /** `}` character */
    CurlyBracketClose = 125,
    /** `\\` character */
    Escape = 92,
    /** `=` character */
    Equals = 61,
    /** `[` character */
    SquareBracketOpen = 91,
    /** `]` character */
    SquareBracketClose = 93,
    /** `*` character */
    Asterisk = 42,
    /** `#` character */
    Hash = 35,
    /** `$` character */
    Dollar = 36,
    /** `-` character */
    Dash = 45,
    /** `.` character */
    Dot = 46,
    /** `/` character */
    Slash = 47,
    /** `:` character */
    Colon = 58,
    /** `!` character */
    Excl = 33,
    /** `@` character */
    At = 64,
    /** `_` character */
    Underscore = 95,
    /** `(` character */
    RoundBracketOpen = 40,
    /** `)` character */
    RoundBracketClose = 41,
    /** `+` character */
    Sibling = 43,
    /** `>` character */
    Child = 62,
    /** `^` character */
    Climb = 94,
    /** `'` character */
    SingleQuote = 39,
    /** `""` character */
    DoubleQuote = 34
}
/**
 * If consumes escape character, sets current stream range to escaped value
 */
export declare function escaped(scanner: Scanner): boolean;
