import Scanner, { isNumber, isQuote as isQuote$1, isSpace, isAlpha, isAlphaNumericWord, isUmlaut, ScannerError } from '@emmetio/scanner';

function tokenScanner(tokens) {
    return {
        tokens,
        start: 0,
        pos: 0,
        size: tokens.length
    };
}
function peek(scanner) {
    return scanner.tokens[scanner.pos];
}
function next(scanner) {
    return scanner.tokens[scanner.pos++];
}
function slice(scanner, from = scanner.start, to = scanner.pos) {
    return scanner.tokens.slice(from, to);
}
function readable(scanner) {
    return scanner.pos < scanner.size;
}
function consume(scanner, test) {
    const token = peek(scanner);
    if (token && test(token)) {
        scanner.pos++;
        return true;
    }
    return false;
}
function error(scanner, message, token = peek(scanner)) {
    if (token && token.start != null) {
        message += ` at ${token.start}`;
    }
    const err = new Error(message);
    err['pos'] = token && token.start;
    return err;
}

function abbreviation(abbr, options = {}) {
    const scanner = tokenScanner(abbr);
    const result = statements(scanner, options);
    if (readable(scanner)) {
        throw error(scanner, 'Unexpected character');
    }
    return result;
}
function statements(scanner, options) {
    const result = {
        type: 'TokenGroup',
        elements: []
    };
    let ctx = result;
    let node;
    const stack = [];
    while (readable(scanner)) {
        if (node = element(scanner, options) || group(scanner, options)) {
            ctx.elements.push(node);
            if (consume(scanner, isChildOperator)) {
                stack.push(ctx);
                ctx = node;
            }
            else if (consume(scanner, isSiblingOperator)) {
                continue;
            }
            else if (consume(scanner, isClimbOperator)) {
                do {
                    if (stack.length) {
                        ctx = stack.pop();
                    }
                } while (consume(scanner, isClimbOperator));
            }
        }
        else {
            break;
        }
    }
    return result;
}
/**
 * Consumes group from given scanner
 */
function group(scanner, options) {
    if (consume(scanner, isGroupStart)) {
        const result = statements(scanner, options);
        const token = next(scanner);
        if (isBracket(token, 'group', false)) {
            result.repeat = repeater$1(scanner);
        }
        return result;
    }
}
/**
 * Consumes single element from given scanner
 */
function element(scanner, options) {
    let attr;
    const elem = {
        type: 'TokenElement',
        name: void 0,
        attributes: void 0,
        value: void 0,
        repeat: void 0,
        selfClose: false,
        elements: []
    };
    if (elementName(scanner, options)) {
        elem.name = slice(scanner);
    }
    while (readable(scanner)) {
        scanner.start = scanner.pos;
        if (!elem.repeat && !isEmpty(elem) && consume(scanner, isRepeater)) {
            elem.repeat = scanner.tokens[scanner.pos - 1];
        }
        else if (!elem.value && text(scanner)) {
            elem.value = getText(scanner);
        }
        else if (attr = shortAttribute(scanner, 'id', options) || shortAttribute(scanner, 'class', options) || attributeSet(scanner)) {
            if (!elem.attributes) {
                elem.attributes = Array.isArray(attr) ? attr.slice() : [attr];
            }
            else {
                elem.attributes = elem.attributes.concat(attr);
            }
        }
        else {
            if (!isEmpty(elem) && consume(scanner, isCloseOperator)) {
                elem.selfClose = true;
                if (!elem.repeat && consume(scanner, isRepeater)) {
                    elem.repeat = scanner.tokens[scanner.pos - 1];
                }
            }
            break;
        }
    }
    return !isEmpty(elem) ? elem : void 0;
}
/**
 * Consumes attribute set from given scanner
 */
function attributeSet(scanner) {
    if (consume(scanner, isAttributeSetStart)) {
        const attributes = [];
        let attr;
        while (readable(scanner)) {
            if (attr = attribute(scanner)) {
                attributes.push(attr);
            }
            else if (consume(scanner, isAttributeSetEnd)) {
                break;
            }
            else if (!consume(scanner, isWhiteSpace)) {
                throw error(scanner, `Unexpected "${peek(scanner).type}" token`);
            }
        }
        return attributes;
    }
}
/**
 * Consumes attribute shorthand (class or id) from given scanner
 */
function shortAttribute(scanner, type, options) {
    if (isOperator(peek(scanner), type)) {
        scanner.pos++;
        // Consume multiple operators
        let count = 1;
        while (isOperator(peek(scanner), type)) {
            scanner.pos++;
            count++;
        }
        const attr = {
            name: [createLiteral(type)]
        };
        if (count > 1) {
            attr.multiple = true;
        }
        // Consume expression after shorthand start for React-like components
        if (options.jsx && text(scanner)) {
            attr.value = getText(scanner);
            attr.expression = true;
        }
        else {
            attr.value = literal$1(scanner) ? slice(scanner) : void 0;
        }
        return attr;
    }
}
/**
 * Consumes single attribute from given scanner
 */
function attribute(scanner) {
    if (quoted(scanner)) {
        // Consumed quoted value: it’s a value for default attribute
        return {
            value: slice(scanner)
        };
    }
    if (literal$1(scanner, true)) {
        const name = slice(scanner);
        let value;
        if (consume(scanner, isEquals)) {
            if (quoted(scanner) || literal$1(scanner, true)) {
                value = slice(scanner);
            }
        }
        return { name, value };
    }
}
function repeater$1(scanner) {
    return isRepeater(peek(scanner))
        ? scanner.tokens[scanner.pos++]
        : void 0;
}
/**
 * Consumes quoted value from given scanner, if possible
 */
function quoted(scanner) {
    const start = scanner.pos;
    const quote = peek(scanner);
    if (isQuote(quote)) {
        scanner.pos++;
        while (readable(scanner)) {
            if (isQuote(next(scanner), quote.single)) {
                scanner.start = start;
                return true;
            }
        }
        throw error(scanner, 'Unclosed quote', quote);
    }
    return false;
}
/**
 * Consumes literal (unquoted value) from given scanner
 */
function literal$1(scanner, allowBrackets) {
    const start = scanner.pos;
    const brackets = {
        attribute: 0,
        expression: 0,
        group: 0
    };
    while (readable(scanner)) {
        const token = peek(scanner);
        if (brackets.expression) {
            // If we’re inside expression, we should consume all content in it
            if (isBracket(token, 'expression')) {
                brackets[token.context] += token.open ? 1 : -1;
            }
        }
        else if (isQuote(token) || isOperator(token) || isWhiteSpace(token) || isRepeater(token)) {
            break;
        }
        else if (isBracket(token)) {
            if (!allowBrackets) {
                break;
            }
            if (token.open) {
                brackets[token.context]++;
            }
            else if (!brackets[token.context]) {
                // Stop if found unmatched closing brace: it must be handled
                // by parent consumer
                break;
            }
            else {
                brackets[token.context]--;
            }
        }
        scanner.pos++;
    }
    if (start !== scanner.pos) {
        scanner.start = start;
        return true;
    }
    return false;
}
/**
 * Consumes element name from given scanner
 */
function elementName(scanner, options) {
    const start = scanner.pos;
    if (options.jsx && consume(scanner, isCapitalizedLiteral)) {
        // Check for edge case: consume immediate capitalized class names
        // for React-like components, e.g. `Foo.Bar.Baz`
        while (readable(scanner)) {
            const { pos } = scanner;
            if (!consume(scanner, isClassNameOperator) || !consume(scanner, isCapitalizedLiteral)) {
                scanner.pos = pos;
                break;
            }
        }
    }
    while (readable(scanner) && consume(scanner, isElementName$1)) {
        // empty
    }
    if (scanner.pos !== start) {
        scanner.start = start;
        return true;
    }
    return false;
}
/**
 * Consumes text value from given scanner
 */
function text(scanner) {
    const start = scanner.pos;
    if (consume(scanner, isTextStart)) {
        let brackets = 0;
        while (readable(scanner)) {
            const token = next(scanner);
            if (isBracket(token, 'expression')) {
                if (token.open) {
                    brackets++;
                }
                else if (!brackets) {
                    break;
                }
                else {
                    brackets--;
                }
            }
        }
        scanner.start = start;
        return true;
    }
    return false;
}
function getText(scanner) {
    let from = scanner.start;
    let to = scanner.pos;
    if (isBracket(scanner.tokens[from], 'expression', true)) {
        from++;
    }
    if (isBracket(scanner.tokens[to - 1], 'expression', false)) {
        to--;
    }
    return slice(scanner, from, to);
}
function isBracket(token, context, isOpen) {
    return Boolean(token && token.type === 'Bracket'
        && (!context || token.context === context)
        && (isOpen == null || token.open === isOpen));
}
function isOperator(token, type) {
    return Boolean(token && token.type === 'Operator' && (!type || token.operator === type));
}
function isQuote(token, isSingle) {
    return Boolean(token && token.type === 'Quote' && (isSingle == null || token.single === isSingle));
}
function isWhiteSpace(token) {
    return Boolean(token && token.type === 'WhiteSpace');
}
function isEquals(token) {
    return isOperator(token, 'equal');
}
function isRepeater(token) {
    return Boolean(token && token.type === 'Repeater');
}
function isLiteral(token) {
    return token.type === 'Literal';
}
function isCapitalizedLiteral(token) {
    if (isLiteral(token)) {
        const ch = token.value.charCodeAt(0);
        return ch >= 65 && ch <= 90;
    }
    return false;
}
function isElementName$1(token) {
    return token.type === 'Literal' || token.type === 'RepeaterNumber' || token.type === 'RepeaterPlaceholder';
}
function isClassNameOperator(token) {
    return isOperator(token, 'class');
}
function isAttributeSetStart(token) {
    return isBracket(token, 'attribute', true);
}
function isAttributeSetEnd(token) {
    return isBracket(token, 'attribute', false);
}
function isTextStart(token) {
    return isBracket(token, 'expression', true);
}
function isGroupStart(token) {
    return isBracket(token, 'group', true);
}
function createLiteral(value) {
    return { type: 'Literal', value };
}
function isEmpty(elem) {
    return !elem.name && !elem.value && !elem.attributes;
}
function isChildOperator(token) {
    return isOperator(token, 'child');
}
function isSiblingOperator(token) {
    return isOperator(token, 'sibling');
}
function isClimbOperator(token) {
    return isOperator(token, 'climb');
}
function isCloseOperator(token) {
    return isOperator(token, 'close');
}

var Chars;
(function (Chars) {
    /** `{` character */
    Chars[Chars["CurlyBracketOpen"] = 123] = "CurlyBracketOpen";
    /** `}` character */
    Chars[Chars["CurlyBracketClose"] = 125] = "CurlyBracketClose";
    /** `\\` character */
    Chars[Chars["Escape"] = 92] = "Escape";
    /** `=` character */
    Chars[Chars["Equals"] = 61] = "Equals";
    /** `[` character */
    Chars[Chars["SquareBracketOpen"] = 91] = "SquareBracketOpen";
    /** `]` character */
    Chars[Chars["SquareBracketClose"] = 93] = "SquareBracketClose";
    /** `*` character */
    Chars[Chars["Asterisk"] = 42] = "Asterisk";
    /** `#` character */
    Chars[Chars["Hash"] = 35] = "Hash";
    /** `$` character */
    Chars[Chars["Dollar"] = 36] = "Dollar";
    /** `-` character */
    Chars[Chars["Dash"] = 45] = "Dash";
    /** `.` character */
    Chars[Chars["Dot"] = 46] = "Dot";
    /** `/` character */
    Chars[Chars["Slash"] = 47] = "Slash";
    /** `:` character */
    Chars[Chars["Colon"] = 58] = "Colon";
    /** `!` character */
    Chars[Chars["Excl"] = 33] = "Excl";
    /** `@` character */
    Chars[Chars["At"] = 64] = "At";
    /** `_` character */
    Chars[Chars["Underscore"] = 95] = "Underscore";
    /** `(` character */
    Chars[Chars["RoundBracketOpen"] = 40] = "RoundBracketOpen";
    /** `)` character */
    Chars[Chars["RoundBracketClose"] = 41] = "RoundBracketClose";
    /** `+` character */
    Chars[Chars["Sibling"] = 43] = "Sibling";
    /** `>` character */
    Chars[Chars["Child"] = 62] = "Child";
    /** `^` character */
    Chars[Chars["Climb"] = 94] = "Climb";
    /** `'` character */
    Chars[Chars["SingleQuote"] = 39] = "SingleQuote";
    /** `""` character */
    Chars[Chars["DoubleQuote"] = 34] = "DoubleQuote";
})(Chars || (Chars = {}));
/**
 * If consumes escape character, sets current stream range to escaped value
 */
function escaped(scanner) {
    if (scanner.eat(Chars.Escape)) {
        scanner.start = scanner.pos;
        if (!scanner.eof()) {
            scanner.pos++;
        }
        return true;
    }
    return false;
}

function tokenize(source) {
    const scanner = new Scanner(source);
    const result = [];
    const ctx = {
        group: 0,
        attribute: 0,
        expression: 0,
        quote: 0
    };
    let ch = 0;
    let token;
    while (!scanner.eof()) {
        ch = scanner.peek();
        token = getToken(scanner, ctx);
        if (token) {
            result.push(token);
            if (token.type === 'Quote') {
                ctx.quote = ch === ctx.quote ? 0 : ch;
            }
            else if (token.type === 'Bracket') {
                ctx[token.context] += token.open ? 1 : -1;
            }
        }
        else {
            throw scanner.error('Unexpected character');
        }
    }
    return result;
}
/**
 * Returns next token from given scanner, if possible
 */
function getToken(scanner, ctx) {
    return field(scanner, ctx)
        || repeaterPlaceholder(scanner)
        || repeaterNumber(scanner)
        || repeater(scanner)
        || whiteSpace(scanner)
        || literal(scanner, ctx)
        || operator(scanner)
        || quote(scanner)
        || bracket(scanner);
}
/**
 * Consumes literal from given scanner
 */
function literal(scanner, ctx) {
    const start = scanner.pos;
    const expressionStart = ctx.expression;
    let value = '';
    while (!scanner.eof()) {
        // Consume escaped sequence no matter of context
        if (escaped(scanner)) {
            value += scanner.current();
            continue;
        }
        const ch = scanner.peek();
        if (ch === Chars.Slash && !ctx.quote && !ctx.expression && !ctx.attribute) {
            // Special case for `/` character between numbers in class names
            const prev = scanner.string.charCodeAt(scanner.pos - 1);
            const next = scanner.string.charCodeAt(scanner.pos + 1);
            if (isNumber(prev) && isNumber(next)) {
                value += scanner.string[scanner.pos++];
                continue;
            }
        }
        if (ch === ctx.quote || ch === Chars.Dollar || isAllowedOperator(ch, ctx)) {
            // 1. Found matching quote
            // 2. The `$` character has special meaning in every context
            // 3. Depending on context, some characters should be treated as operators
            break;
        }
        if (expressionStart) {
            // Consume nested expressions, e.g. span{{foo}}
            if (ch === Chars.CurlyBracketOpen) {
                ctx.expression++;
            }
            else if (ch === Chars.CurlyBracketClose) {
                if (ctx.expression > expressionStart) {
                    ctx.expression--;
                }
                else {
                    break;
                }
            }
        }
        else if (!ctx.quote) {
            // Consuming element name
            if (!ctx.attribute && !isElementName(ch)) {
                break;
            }
            if (isAllowedSpace(ch, ctx) || isAllowedRepeater(ch, ctx) || isQuote$1(ch) || bracketType(ch)) {
                // Stop for characters not allowed in unquoted literal
                break;
            }
        }
        value += scanner.string[scanner.pos++];
    }
    if (start !== scanner.pos) {
        scanner.start = start;
        return {
            type: 'Literal',
            value,
            start,
            end: scanner.pos
        };
    }
}
/**
 * Consumes white space characters as string literal from given scanner
 */
function whiteSpace(scanner) {
    const start = scanner.pos;
    if (scanner.eatWhile(isSpace)) {
        return {
            type: 'WhiteSpace',
            start,
            end: scanner.pos,
            value: scanner.substring(start, scanner.pos)
        };
    }
}
/**
 * Consumes quote from given scanner
 */
function quote(scanner) {
    const ch = scanner.peek();
    if (isQuote$1(ch)) {
        return {
            type: 'Quote',
            single: ch === Chars.SingleQuote,
            start: scanner.pos++,
            end: scanner.pos
        };
    }
}
/**
 * Consumes bracket from given scanner
 */
function bracket(scanner) {
    const ch = scanner.peek();
    const context = bracketType(ch);
    if (context) {
        return {
            type: 'Bracket',
            open: isOpenBracket(ch),
            context,
            start: scanner.pos++,
            end: scanner.pos
        };
    }
}
/**
 * Consumes operator from given scanner
 */
function operator(scanner) {
    const op = operatorType(scanner.peek());
    if (op) {
        return {
            type: 'Operator',
            operator: op,
            start: scanner.pos++,
            end: scanner.pos
        };
    }
}
/**
 * Consumes node repeat token from current stream position and returns its
 * parsed value
 */
function repeater(scanner) {
    const start = scanner.pos;
    if (scanner.eat(Chars.Asterisk)) {
        scanner.start = scanner.pos;
        let count = 1;
        let implicit = false;
        if (scanner.eatWhile(isNumber)) {
            count = Number(scanner.current());
        }
        else {
            implicit = true;
        }
        return {
            type: 'Repeater',
            count,
            value: 0,
            implicit,
            start,
            end: scanner.pos
        };
    }
}
/**
 * Consumes repeater placeholder `$#` from given scanner
 */
function repeaterPlaceholder(scanner) {
    const start = scanner.pos;
    if (scanner.eat(Chars.Dollar) && scanner.eat(Chars.Hash)) {
        return {
            type: 'RepeaterPlaceholder',
            value: void 0,
            start,
            end: scanner.pos
        };
    }
    scanner.pos = start;
}
/**
 * Consumes numbering token like `$` from given scanner state
 */
function repeaterNumber(scanner) {
    const start = scanner.pos;
    if (scanner.eatWhile(Chars.Dollar)) {
        const size = scanner.pos - start;
        let reverse = false;
        let base = 1;
        let parent = 0;
        if (scanner.eat(Chars.At)) {
            // Consume numbering modifiers
            while (scanner.eat(Chars.Climb)) {
                parent++;
            }
            reverse = scanner.eat(Chars.Dash);
            scanner.start = scanner.pos;
            if (scanner.eatWhile(isNumber)) {
                base = Number(scanner.current());
            }
        }
        scanner.start = start;
        return {
            type: 'RepeaterNumber',
            size,
            reverse,
            base,
            parent,
            start,
            end: scanner.pos
        };
    }
}
function field(scanner, ctx) {
    const start = scanner.pos;
    // Fields are allowed inside expressions and attributes
    if ((ctx.expression || ctx.attribute) && scanner.eat(Chars.Dollar) && scanner.eat(Chars.CurlyBracketOpen)) {
        scanner.start = scanner.pos;
        let index;
        let name = '';
        if (scanner.eatWhile(isNumber)) {
            // It’s a field
            index = Number(scanner.current());
            name = scanner.eat(Chars.Colon) ? consumePlaceholder(scanner) : '';
        }
        else if (isAlpha(scanner.peek())) {
            // It’s a variable
            name = consumePlaceholder(scanner);
        }
        if (scanner.eat(Chars.CurlyBracketClose)) {
            return {
                type: 'Field',
                index, name,
                start,
                end: scanner.pos
            };
        }
        throw scanner.error('Expecting }');
    }
    // If we reached here then there’s no valid field here, revert
    // back to starting position
    scanner.pos = start;
}
/**
 * Consumes a placeholder: value right after `:` in field. Could be empty
 */
function consumePlaceholder(stream) {
    const stack = [];
    stream.start = stream.pos;
    while (!stream.eof()) {
        if (stream.eat(Chars.CurlyBracketOpen)) {
            stack.push(stream.pos);
        }
        else if (stream.eat(Chars.CurlyBracketClose)) {
            if (!stack.length) {
                stream.pos--;
                break;
            }
            stack.pop();
        }
        else {
            stream.pos++;
        }
    }
    if (stack.length) {
        stream.pos = stack.pop();
        throw stream.error(`Expecting }`);
    }
    return stream.current();
}
/**
 * Check if given character code is an operator and it’s allowed in current context
 */
function isAllowedOperator(ch, ctx) {
    const op = operatorType(ch);
    if (!op || ctx.quote || ctx.expression) {
        // No operators inside quoted values or expressions
        return false;
    }
    // Inside attributes, only `equals` is allowed
    return !ctx.attribute || op === 'equal';
}
/**
 * Check if given character is a space character and is allowed to be consumed
 * as a space token in current context
 */
function isAllowedSpace(ch, ctx) {
    return isSpace(ch) && !ctx.expression;
}
/**
 * Check if given character can be consumed as repeater in current context
 */
function isAllowedRepeater(ch, ctx) {
    return ch === Chars.Asterisk && !ctx.attribute && !ctx.expression;
}
/**
 * If given character is a bracket, returns it’s type
 */
function bracketType(ch) {
    if (ch === Chars.RoundBracketOpen || ch === Chars.RoundBracketClose) {
        return 'group';
    }
    if (ch === Chars.SquareBracketOpen || ch === Chars.SquareBracketClose) {
        return 'attribute';
    }
    if (ch === Chars.CurlyBracketOpen || ch === Chars.CurlyBracketClose) {
        return 'expression';
    }
}
/**
 * If given character is an operator, returns it’s type
 */
function operatorType(ch) {
    return (ch === Chars.Child && 'child')
        || (ch === Chars.Sibling && 'sibling')
        || (ch === Chars.Climb && 'climb')
        || (ch === Chars.Dot && 'class')
        || (ch === Chars.Hash && 'id')
        || (ch === Chars.Slash && 'close')
        || (ch === Chars.Equals && 'equal')
        || void 0;
}
/**
 * Check if given character is an open bracket
 */
function isOpenBracket(ch) {
    return ch === Chars.CurlyBracketOpen
        || ch === Chars.SquareBracketOpen
        || ch === Chars.RoundBracketOpen;
}
/**
 * Check if given character is allowed in element name
 */
function isElementName(ch) {
    return isAlphaNumericWord(ch)
        || isUmlaut(ch)
        || ch === Chars.Dash
        || ch === Chars.Colon
        || ch === Chars.Excl;
}

const operators = {
    child: '>',
    class: '.',
    climb: '^',
    id: '#',
    equal: '=',
    close: '/',
    sibling: '+'
};
const tokenVisitor = {
    Literal(token) {
        return token.value;
    },
    Quote(token) {
        return token.single ? '\'' : '"';
    },
    Bracket(token) {
        if (token.context === 'attribute') {
            return token.open ? '[' : ']';
        }
        else if (token.context === 'expression') {
            return token.open ? '{' : '}';
        }
        else {
            return token.open ? '(' : '}';
        }
    },
    Operator(token) {
        return operators[token.operator];
    },
    Field(token, state) {
        if (token.index != null) {
            // It’s a field: by default, return TextMate-compatible field
            return token.name
                ? `\${${token.index}:${token.name}}`
                : `\${${token.index}`;
        }
        else if (token.name) {
            // It’s a variable
            return state.getVariable(token.name);
        }
        return '';
    },
    RepeaterPlaceholder(token, state) {
        // Find closest implicit repeater
        let repeater;
        for (let i = state.repeaters.length - 1; i >= 0; i--) {
            if (state.repeaters[i].implicit) {
                repeater = state.repeaters[i];
                break;
            }
        }
        state.inserted = true;
        return state.getText(repeater && repeater.value);
    },
    RepeaterNumber(token, state) {
        let value = 1;
        const lastIx = state.repeaters.length - 1;
        // const repeaterIx = Math.max(0, state.repeaters.length - 1 - token.parent);
        const repeater = state.repeaters[lastIx];
        if (repeater) {
            value = token.reverse
                ? token.base + repeater.count - repeater.value - 1
                : token.base + repeater.value;
            if (token.parent) {
                const parentIx = Math.max(0, lastIx - token.parent);
                if (parentIx !== lastIx) {
                    const parentRepeater = state.repeaters[parentIx];
                    value += repeater.count * parentRepeater.value;
                }
            }
        }
        let result = String(value);
        while (result.length < token.size) {
            result = '0' + result;
        }
        return result;
    },
    WhiteSpace(token) {
        return token.value;
    }
};
/**
 * Converts given value token to string
 */
function stringify(token, state) {
    if (!tokenVisitor[token.type]) {
        throw new Error(`Unknown token ${token.type}`);
    }
    return tokenVisitor[token.type](token, state);
}

const urlRegex = /^((https?:|ftp:|file:)?\/\/|(www|ftp)\.)[^ ]*$/;
const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,5}$/;
/**
 * Converts given token-based abbreviation into simplified and unrolled node-based
 * abbreviation
 */
function convert(abbr, options = {}) {
    let textInserted = false;
    let cleanText;
    if (options.text) {
        if (Array.isArray(options.text)) {
            cleanText = options.text.filter(s => s.trim());
        }
        else {
            cleanText = options.text;
        }
    }
    const result = {
        type: 'Abbreviation',
        children: convertGroup(abbr, {
            inserted: false,
            repeaters: [],
            text: options.text,
            cleanText,
            repeatGuard: options.maxRepeat || Number.POSITIVE_INFINITY,
            getText(pos) {
                var _a;
                textInserted = true;
                let value;
                if (Array.isArray(options.text)) {
                    if (pos !== undefined && pos >= 0 && pos < cleanText.length) {
                        return cleanText[pos];
                    }
                    value = pos !== undefined ? options.text[pos] : options.text.join('\n');
                }
                else {
                    value = (_a = options.text) !== null && _a !== void 0 ? _a : '';
                }
                return value;
            },
            getVariable(name) {
                const varValue = options.variables && options.variables[name];
                return varValue != null ? varValue : name;
            }
        })
    };
    if (options.text != null && !textInserted) {
        // Text given but no implicitly repeated elements: insert it into
        // deepest child
        const deepest = deepestNode(last(result.children));
        if (deepest) {
            const text = Array.isArray(options.text) ? options.text.join('\n') : options.text;
            insertText(deepest, text);
            if (deepest.name === 'a' && options.href) {
                // Automatically update value of `<a>` element if inserting URL or email
                insertHref(deepest, text);
            }
        }
    }
    return result;
}
/**
 * Converts given statement to abbreviation nodes
 */
function convertStatement(node, state) {
    let result = [];
    if (node.repeat) {
        // Node is repeated: we should create copies of given node
        // and supply context token with actual repeater state
        const original = node.repeat;
        const repeat = Object.assign({}, original);
        repeat.count = repeat.implicit && Array.isArray(state.text)
            ? state.cleanText.length
            : (repeat.count || 1);
        let items;
        state.repeaters.push(repeat);
        for (let i = 0; i < repeat.count; i++) {
            repeat.value = i;
            node.repeat = repeat;
            items = isGroup(node)
                ? convertGroup(node, state)
                : convertElement(node, state);
            if (repeat.implicit && !state.inserted) {
                // It’s an implicit repeater but no repeater placeholders found inside,
                // we should insert text into deepest node
                const target = last(items);
                const deepest = target && deepestNode(target);
                if (deepest) {
                    insertText(deepest, state.getText(repeat.value));
                }
            }
            result = result.concat(items);
            // We should output at least one repeated item even if it’s reached
            // repeat limit
            if (--state.repeatGuard <= 0) {
                break;
            }
        }
        state.repeaters.pop();
        node.repeat = original;
        if (repeat.implicit) {
            state.inserted = true;
        }
    }
    else {
        result = result.concat(isGroup(node) ? convertGroup(node, state) : convertElement(node, state));
    }
    return result;
}
function convertElement(node, state) {
    let children = [];
    const elem = {
        type: 'AbbreviationNode',
        name: node.name && stringifyName(node.name, state),
        value: node.value && stringifyValue(node.value, state),
        attributes: void 0,
        children,
        repeat: node.repeat && Object.assign({}, node.repeat),
        selfClosing: node.selfClose,
    };
    let result = [elem];
    for (const child of node.elements) {
        children = children.concat(convertStatement(child, state));
    }
    if (node.attributes) {
        elem.attributes = [];
        for (const attr of node.attributes) {
            elem.attributes.push(convertAttribute(attr, state));
        }
    }
    // In case if current node is a text-only snippet without fields, we should
    // put all children as siblings
    if (!elem.name && !elem.attributes && elem.value && !elem.value.some(isField)) {
        // XXX it’s unclear that `children` is not bound to `elem`
        // due to concat operation
        result = result.concat(children);
    }
    else {
        elem.children = children;
    }
    return result;
}
function convertGroup(node, state) {
    let result = [];
    for (const child of node.elements) {
        result = result.concat(convertStatement(child, state));
    }
    if (node.repeat) {
        result = attachRepeater(result, node.repeat);
    }
    return result;
}
function convertAttribute(node, state) {
    let implied = false;
    let isBoolean = false;
    let valueType = node.expression ? 'expression' : 'raw';
    let value;
    const name = node.name && stringifyName(node.name, state);
    if (name && name[0] === '!') {
        implied = true;
    }
    if (name && name[name.length - 1] === '.') {
        isBoolean = true;
    }
    if (node.value) {
        const tokens = node.value.slice();
        if (isQuote(tokens[0])) {
            // It’s a quoted value: remove quotes from output but mark attribute
            // value as quoted
            const quote = tokens.shift();
            if (tokens.length && last(tokens).type === quote.type) {
                tokens.pop();
            }
            valueType = quote.single ? 'singleQuote' : 'doubleQuote';
        }
        else if (isBracket(tokens[0], 'expression', true)) {
            // Value is expression: remove brackets but mark value type
            valueType = 'expression';
            tokens.shift();
            if (isBracket(last(tokens), 'expression', false)) {
                tokens.pop();
            }
        }
        value = stringifyValue(tokens, state);
    }
    return {
        name: isBoolean || implied
            ? name.slice(implied ? 1 : 0, isBoolean ? -1 : void 0)
            : name,
        value,
        boolean: isBoolean,
        implied,
        valueType,
        multiple: node.multiple
    };
}
/**
 * Converts given token list to string
 */
function stringifyName(tokens, state) {
    let str = '';
    for (let i = 0; i < tokens.length; i++) {
        str += stringify(tokens[i], state);
    }
    return str;
}
/**
 * Converts given token list to value list
 */
function stringifyValue(tokens, state) {
    const result = [];
    let str = '';
    for (let i = 0, token; i < tokens.length; i++) {
        token = tokens[i];
        if (isField(token)) {
            // We should keep original fields in output since some editors has their
            // own syntax for field or doesn’t support fields at all so we should
            // capture actual field location in output stream
            if (str) {
                result.push(str);
                str = '';
            }
            result.push(token);
        }
        else {
            str += stringify(token, state);
        }
    }
    if (str) {
        result.push(str);
    }
    return result;
}
function isGroup(node) {
    return node.type === 'TokenGroup';
}
function isField(token) {
    return typeof token === 'object' && token.type === 'Field' && token.index != null;
}
function last(arr) {
    return arr[arr.length - 1];
}
function deepestNode(node) {
    return node.children.length ? deepestNode(last(node.children)) : node;
}
function insertText(node, text) {
    if (node.value) {
        const lastToken = last(node.value);
        if (typeof lastToken === 'string') {
            node.value[node.value.length - 1] += text;
        }
        else {
            node.value.push(text);
        }
    }
    else {
        node.value = [text];
    }
}
function insertHref(node, text) {
    var _a;
    let href = '';
    if (urlRegex.test(text)) {
        href = text;
        if (!/\w+:/.test(href) && !href.startsWith('//')) {
            href = `http://${href}`;
        }
    }
    else if (emailRegex.test(text)) {
        href = `mailto:${text}`;
    }
    const hrefAttribute = (_a = node.attributes) === null || _a === void 0 ? void 0 : _a.find(attr => attr.name === 'href');
    if (!hrefAttribute) {
        if (!node.attributes) {
            node.attributes = [];
        }
        node.attributes.push({ name: 'href', value: [href], valueType: 'doubleQuote' });
    }
    else if (!hrefAttribute.value) {
        hrefAttribute.value = [href];
    }
}
function attachRepeater(items, repeater) {
    for (const item of items) {
        if (!item.repeat) {
            item.repeat = Object.assign({}, repeater);
        }
    }
    return items;
}

/**
 * Parses given abbreviation into node tree
 */
function parseAbbreviation(abbr, options) {
    try {
        const tokens = typeof abbr === 'string' ? tokenize(abbr) : abbr;
        return convert(abbreviation(tokens, options), options);
    }
    catch (err) {
        if (err instanceof ScannerError && typeof abbr === 'string') {
            err.message += `\n${abbr}\n${'-'.repeat(err.pos)}^`;
        }
        throw err;
    }
}

export { convert, parseAbbreviation as default, getToken, abbreviation as parse, tokenize };
//# sourceMappingURL=index.js.map
