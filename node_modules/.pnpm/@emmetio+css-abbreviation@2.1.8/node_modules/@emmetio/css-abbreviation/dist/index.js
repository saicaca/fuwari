import Scanner, { isNumber, isAlpha, isAlphaWord, isQuote, isSpace, isAlphaNumericWord, ScannerError } from '@emmetio/scanner';

var OperatorType;
(function (OperatorType) {
    OperatorType["Sibling"] = "+";
    OperatorType["Important"] = "!";
    OperatorType["ArgumentDelimiter"] = ",";
    OperatorType["ValueDelimiter"] = "-";
    OperatorType["PropertyDelimiter"] = ":";
})(OperatorType || (OperatorType = {}));

var Chars;
(function (Chars) {
    /** `#` character */
    Chars[Chars["Hash"] = 35] = "Hash";
    /** `$` character */
    Chars[Chars["Dollar"] = 36] = "Dollar";
    /** `-` character */
    Chars[Chars["Dash"] = 45] = "Dash";
    /** `.` character */
    Chars[Chars["Dot"] = 46] = "Dot";
    /** `:` character */
    Chars[Chars["Colon"] = 58] = "Colon";
    /** `,` character */
    Chars[Chars["Comma"] = 44] = "Comma";
    /** `!` character */
    Chars[Chars["Excl"] = 33] = "Excl";
    /** `@` character */
    Chars[Chars["At"] = 64] = "At";
    /** `%` character */
    Chars[Chars["Percent"] = 37] = "Percent";
    /** `_` character */
    Chars[Chars["Underscore"] = 95] = "Underscore";
    /** `(` character */
    Chars[Chars["RoundBracketOpen"] = 40] = "RoundBracketOpen";
    /** `)` character */
    Chars[Chars["RoundBracketClose"] = 41] = "RoundBracketClose";
    /** `{` character */
    Chars[Chars["CurlyBracketOpen"] = 123] = "CurlyBracketOpen";
    /** `}` character */
    Chars[Chars["CurlyBracketClose"] = 125] = "CurlyBracketClose";
    /** `+` character */
    Chars[Chars["Sibling"] = 43] = "Sibling";
    /** `'` character */
    Chars[Chars["SingleQuote"] = 39] = "SingleQuote";
    /** `"` character */
    Chars[Chars["DoubleQuote"] = 34] = "DoubleQuote";
    /** `t` character */
    Chars[Chars["Transparent"] = 116] = "Transparent";
    /** `/` character */
    Chars[Chars["Slash"] = 47] = "Slash";
})(Chars || (Chars = {}));

function tokenize(abbr, isValue) {
    let brackets = 0;
    let token;
    const scanner = new Scanner(abbr);
    const tokens = [];
    while (!scanner.eof()) {
        token = getToken(scanner, brackets === 0 && !isValue);
        if (!token) {
            throw scanner.error('Unexpected character');
        }
        if (token.type === 'Bracket') {
            if (!brackets && token.open) {
                mergeTokens(scanner, tokens);
            }
            brackets += token.open ? 1 : -1;
            if (brackets < 0) {
                throw scanner.error('Unexpected bracket', token.start);
            }
        }
        tokens.push(token);
        // Forcibly consume next operator after unit-less numeric value or color:
        // next dash `-` must be used as value delimiter
        if (shouldConsumeDashAfter(token) && (token = operator(scanner))) {
            tokens.push(token);
        }
    }
    return tokens;
}
/**
 * Returns next token from given scanner, if possible
 */
function getToken(scanner, short) {
    return field(scanner)
        || customProperty(scanner)
        || numberValue(scanner)
        || colorValue(scanner)
        || stringValue(scanner)
        || bracket(scanner)
        || operator(scanner)
        || whiteSpace(scanner)
        || literal(scanner, short);
}
function field(scanner) {
    const start = scanner.pos;
    if (scanner.eat(Chars.Dollar) && scanner.eat(Chars.CurlyBracketOpen)) {
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
 * Consumes literal from given scanner
 * @param short Use short notation for consuming value.
 * The difference between “short” and “full” notation is that first one uses
 * alpha characters only and used for extracting keywords from abbreviation,
 * while “full” notation also supports numbers and dashes
 */
function literal(scanner, short) {
    const start = scanner.pos;
    if (scanner.eat(isIdentPrefix)) {
        // SCSS or LESS variable
        // NB a bit dirty hack: if abbreviation starts with identifier prefix,
        // consume alpha characters only to allow embedded variables
        scanner.eatWhile(start ? isKeyword : isLiteral$1);
    }
    else if (scanner.eat(isAlphaWord)) {
        scanner.eatWhile(short ? isLiteral$1 : isKeyword);
    }
    else {
        // Allow dots only at the beginning of literal
        scanner.eat(Chars.Dot);
        scanner.eatWhile(isLiteral$1);
    }
    if (start !== scanner.pos) {
        scanner.start = start;
        return createLiteral(scanner, scanner.start = start);
    }
}
function createLiteral(scanner, start = scanner.start, end = scanner.pos) {
    return {
        type: 'Literal',
        value: scanner.substring(start, end),
        start,
        end
    };
}
/**
 * Consumes numeric CSS value (number with optional unit) from current stream,
 * if possible
 */
function numberValue(scanner) {
    const start = scanner.pos;
    if (consumeNumber(scanner)) {
        scanner.start = start;
        const rawValue = scanner.current();
        // eat unit, which can be a % or alpha word
        scanner.start = scanner.pos;
        scanner.eat(Chars.Percent) || scanner.eatWhile(isAlphaWord);
        return {
            type: 'NumberValue',
            value: Number(rawValue),
            rawValue,
            unit: scanner.current(),
            start,
            end: scanner.pos
        };
    }
}
/**
 * Consumes quoted string value from given scanner
 */
function stringValue(scanner) {
    const ch = scanner.peek();
    const start = scanner.pos;
    let finished = false;
    if (isQuote(ch)) {
        scanner.pos++;
        while (!scanner.eof()) {
            // Do not throw error on malformed string
            if (scanner.eat(ch)) {
                finished = true;
                break;
            }
            else {
                scanner.pos++;
            }
        }
        scanner.start = start;
        return {
            type: 'StringValue',
            value: scanner.substring(start + 1, scanner.pos - (finished ? 1 : 0)),
            quote: ch === Chars.SingleQuote ? 'single' : 'double',
            start,
            end: scanner.pos
        };
    }
}
/**
 * Consumes a color token from given string
 */
function colorValue(scanner) {
    // supported color variations:
    // #abc   → #aabbccc
    // #0     → #000000
    // #fff.5 → rgba(255, 255, 255, 0.5)
    // #t     → transparent
    const start = scanner.pos;
    if (scanner.eat(Chars.Hash)) {
        const valueStart = scanner.pos;
        let color = '';
        let alpha = '';
        if (scanner.eatWhile(isHex)) {
            color = scanner.substring(valueStart, scanner.pos);
            alpha = colorAlpha(scanner);
        }
        else if (scanner.eat(Chars.Transparent)) {
            color = '0';
            alpha = colorAlpha(scanner) || '0';
        }
        else {
            alpha = colorAlpha(scanner);
        }
        if (color || alpha || scanner.eof()) {
            const { r, g, b, a } = parseColor(color, alpha);
            return {
                type: 'ColorValue',
                r, g, b, a,
                raw: scanner.substring(start + 1, scanner.pos),
                start,
                end: scanner.pos
            };
        }
        else {
            // Consumed # but no actual value: invalid color value, treat it as literal
            return createLiteral(scanner, start);
        }
    }
    scanner.pos = start;
}
/**
 * Consumes alpha value of color: `.1`
 */
function colorAlpha(scanner) {
    const start = scanner.pos;
    if (scanner.eat(Chars.Dot)) {
        scanner.start = start;
        if (scanner.eatWhile(isNumber)) {
            return scanner.current();
        }
        return '1';
    }
    return '';
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
            end: scanner.pos
        };
    }
}
/**
 * Consumes custom CSS property: --foo-bar
 */
function customProperty(scanner) {
    const start = scanner.pos;
    if (scanner.eat(Chars.Dash) && scanner.eat(Chars.Dash)) {
        scanner.start = start;
        scanner.eatWhile(isKeyword);
        return {
            type: 'CustomProperty',
            value: scanner.current(),
            start,
            end: scanner.pos
        };
    }
    scanner.pos = start;
}
/**
 * Consumes bracket from given scanner
 */
function bracket(scanner) {
    const ch = scanner.peek();
    if (isBracket$1(ch)) {
        return {
            type: 'Bracket',
            open: ch === Chars.RoundBracketOpen,
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
 * Eats number value from given stream
 * @return Returns `true` if number was consumed
 */
function consumeNumber(stream) {
    const start = stream.pos;
    stream.eat(Chars.Dash);
    const afterNegative = stream.pos;
    const hasDecimal = stream.eatWhile(isNumber);
    const prevPos = stream.pos;
    if (stream.eat(Chars.Dot)) {
        // It’s perfectly valid to have numbers like `1.`, which enforces
        // value to float unit type
        const hasFloat = stream.eatWhile(isNumber);
        if (!hasDecimal && !hasFloat) {
            // Lone dot
            stream.pos = prevPos;
        }
    }
    // Edge case: consumed dash only: not a number, bail-out
    if (stream.pos === afterNegative) {
        stream.pos = start;
    }
    return stream.pos !== start;
}
function isIdentPrefix(code) {
    return code === Chars.At || code === Chars.Dollar;
}
/**
 * If given character is an operator, returns it’s type
 */
function operatorType(ch) {
    return (ch === Chars.Sibling && OperatorType.Sibling)
        || (ch === Chars.Excl && OperatorType.Important)
        || (ch === Chars.Comma && OperatorType.ArgumentDelimiter)
        || (ch === Chars.Colon && OperatorType.PropertyDelimiter)
        || (ch === Chars.Dash && OperatorType.ValueDelimiter)
        || void 0;
}
/**
 * Check if given code is a hex value (/0-9a-f/)
 */
function isHex(code) {
    return isNumber(code) || isAlpha(code, 65, 70); // A-F
}
function isKeyword(code) {
    return isAlphaNumericWord(code) || code === Chars.Dash;
}
function isBracket$1(code) {
    return code === Chars.RoundBracketOpen || code === Chars.RoundBracketClose;
}
function isLiteral$1(code) {
    return isAlphaWord(code) || code === Chars.Percent || code === Chars.Slash;
}
/**
 * Parses given color value from abbreviation into RGBA format
 */
function parseColor(value, alpha) {
    let r = '0';
    let g = '0';
    let b = '0';
    let a = Number(alpha != null && alpha !== '' ? alpha : 1);
    if (value === 't') {
        a = 0;
    }
    else {
        switch (value.length) {
            case 0:
                break;
            case 1:
                r = g = b = value + value;
                break;
            case 2:
                r = g = b = value;
                break;
            case 3:
                r = value[0] + value[0];
                g = value[1] + value[1];
                b = value[2] + value[2];
                break;
            default:
                value += value;
                r = value.slice(0, 2);
                g = value.slice(2, 4);
                b = value.slice(4, 6);
        }
    }
    return {
        r: parseInt(r, 16),
        g: parseInt(g, 16),
        b: parseInt(b, 16),
        a
    };
}
/**
 * Check if scanner reader must consume dash after given token.
 * Used in cases where user must explicitly separate numeric values
 */
function shouldConsumeDashAfter(token) {
    return token.type === 'ColorValue' || (token.type === 'NumberValue' && !token.unit);
}
/**
 * Merges last adjacent tokens into a single literal.
 * This function is used to overcome edge case when function name was parsed
 * as a list of separate tokens. For example, a `scale3d()` value will be
 * parsed as literal and number tokens (`scale` and `3d`) which is a perfectly
 * valid abbreviation but undesired result. This function will detect last adjacent
 * literal and number values and combine them into single literal
 */
function mergeTokens(scanner, tokens) {
    let start = 0;
    let end = 0;
    while (tokens.length) {
        const token = last(tokens);
        if (token.type === 'Literal' || token.type === 'NumberValue') {
            start = token.start;
            if (!end) {
                end = token.end;
            }
            tokens.pop();
        }
        else {
            break;
        }
    }
    if (start !== end) {
        tokens.push(createLiteral(scanner, start, end));
    }
}
function last(arr) {
    return arr[arr.length - 1];
}

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
function readable(scanner) {
    return scanner.pos < scanner.size;
}
function consume(scanner, test) {
    if (test(peek(scanner))) {
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

function parser(tokens, options = {}) {
    const scanner = tokenScanner(tokens);
    const result = [];
    let property;
    while (readable(scanner)) {
        if (property = consumeProperty(scanner, options)) {
            result.push(property);
        }
        else if (!consume(scanner, isSiblingOperator)) {
            throw error(scanner, 'Unexpected token');
        }
    }
    return result;
}
/**
 * Consumes single CSS property
 */
function consumeProperty(scanner, options) {
    let name;
    let important = false;
    let valueFragment;
    const value = [];
    const token = peek(scanner);
    const valueMode = !!options.value;
    if (!valueMode && isLiteral(token) && !isFunctionStart(scanner)) {
        scanner.pos++;
        name = token.value;
        // Consume any following value delimiter after property name
        consume(scanner, isValueDelimiter);
    }
    // Skip whitespace right after property name, if any
    if (valueMode) {
        consume(scanner, isWhiteSpace);
    }
    while (readable(scanner)) {
        if (consume(scanner, isImportant)) {
            important = true;
        }
        else if (valueFragment = consumeValue(scanner, valueMode)) {
            value.push(valueFragment);
        }
        else if (!consume(scanner, isFragmentDelimiter)) {
            break;
        }
    }
    if (name || value.length || important) {
        return { name, value, important };
    }
}
/**
 * Consumes single value fragment, e.g. all value tokens before comma
 */
function consumeValue(scanner, inArgument) {
    const result = [];
    let token;
    let args;
    while (readable(scanner)) {
        token = peek(scanner);
        if (isValue(token)) {
            scanner.pos++;
            if (isLiteral(token) && (args = consumeArguments(scanner))) {
                result.push({
                    type: 'FunctionCall',
                    name: token.value,
                    arguments: args
                });
            }
            else {
                result.push(token);
            }
        }
        else if (isValueDelimiter(token) || (inArgument && isWhiteSpace(token))) {
            scanner.pos++;
        }
        else {
            break;
        }
    }
    return result.length
        ? { type: 'CSSValue', value: result }
        : void 0;
}
function consumeArguments(scanner) {
    const start = scanner.pos;
    if (consume(scanner, isOpenBracket)) {
        const args = [];
        let value;
        while (readable(scanner) && !consume(scanner, isCloseBracket)) {
            if (value = consumeValue(scanner, true)) {
                args.push(value);
            }
            else if (!consume(scanner, isWhiteSpace) && !consume(scanner, isArgumentDelimiter)) {
                throw error(scanner, 'Unexpected token');
            }
        }
        scanner.start = start;
        return args;
    }
}
function isLiteral(token) {
    return token && token.type === 'Literal';
}
function isBracket(token, open) {
    return token && token.type === 'Bracket' && (open == null || token.open === open);
}
function isOpenBracket(token) {
    return isBracket(token, true);
}
function isCloseBracket(token) {
    return isBracket(token, false);
}
function isWhiteSpace(token) {
    return token && token.type === 'WhiteSpace';
}
function isOperator(token, operator) {
    return token && token.type === 'Operator' && (!operator || token.operator === operator);
}
function isSiblingOperator(token) {
    return isOperator(token, OperatorType.Sibling);
}
function isArgumentDelimiter(token) {
    return isOperator(token, OperatorType.ArgumentDelimiter);
}
function isFragmentDelimiter(token) {
    return isArgumentDelimiter(token);
}
function isImportant(token) {
    return isOperator(token, OperatorType.Important);
}
function isValue(token) {
    return token.type === 'StringValue'
        || token.type === 'ColorValue'
        || token.type === 'NumberValue'
        || token.type === 'Literal'
        || token.type === 'Field'
        || token.type === 'CustomProperty';
}
function isValueDelimiter(token) {
    return isOperator(token, OperatorType.PropertyDelimiter)
        || isOperator(token, OperatorType.ValueDelimiter);
}
function isFunctionStart(scanner) {
    const t1 = scanner.tokens[scanner.pos];
    const t2 = scanner.tokens[scanner.pos + 1];
    return t1 && t2 && isLiteral(t1) && t2.type === 'Bracket';
}

/**
 * Parses given abbreviation into property set
 */
function parse(abbr, options) {
    try {
        const tokens = typeof abbr === 'string' ? tokenize(abbr, options && options.value) : abbr;
        return parser(tokens, options);
    }
    catch (err) {
        if (err instanceof ScannerError && typeof abbr === 'string') {
            err.message += `\n${abbr}\n${'-'.repeat(err.pos)}^`;
        }
        throw err;
    }
}

export { OperatorType, parse as default, getToken, parser, tokenize };
//# sourceMappingURL=index.js.map
