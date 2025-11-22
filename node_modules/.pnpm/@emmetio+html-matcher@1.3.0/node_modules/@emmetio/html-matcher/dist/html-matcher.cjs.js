'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Scanner = require('@emmetio/scanner');
var Scanner__default = _interopDefault(Scanner);

const defaultOptions = {
    xml: false,
    allTokens: false,
    special: {
        style: null,
        script: ['', 'text/javascript', 'application/x-javascript', 'javascript', 'typescript', 'ts', 'coffee', 'coffeescript']
    },
    empty: ['img', 'meta', 'link', 'br', 'base', 'hr', 'area', 'wbr', 'col', 'embed', 'input', 'param', 'source', 'track']
};
/** Options for `Scanner` utils */
const opt = { throws: false };
function createOptions(options = {}) {
    return Object.assign(Object.assign({}, defaultOptions), options);
}
/**
 * Converts given string into array of character codes
 */
function toCharCodes(str) {
    return str.split('').map(ch => ch.charCodeAt(0));
}
/**
 * Consumes array of character codes from given scanner
 */
function consumeArray(scanner, codes) {
    const start = scanner.pos;
    for (let i = 0; i < codes.length; i++) {
        if (!scanner.eat(codes[i])) {
            scanner.pos = start;
            return false;
        }
    }
    scanner.start = start;
    return true;
}
/**
 * Consumes section from given string which starts with `open` character codes
 * and ends with `close` character codes
 * @return Returns `true` if section was consumed
 */
function consumeSection(scanner, open, close, allowUnclosed) {
    const start = scanner.pos;
    if (consumeArray(scanner, open)) {
        // consumed `<!--`, read next until we find ending part or reach the end of input
        while (!scanner.eof()) {
            if (consumeArray(scanner, close)) {
                scanner.start = start;
                return true;
            }
            scanner.pos++;
        }
        // unclosed section is allowed
        if (allowUnclosed) {
            scanner.start = start;
            return true;
        }
        scanner.pos = start;
        return false;
    }
    // unable to find section, revert to initial position
    scanner.pos = start;
    return false;
}
/**
 * Check if given character can be used as a start of tag name or attribute
 */
function nameStartChar(ch) {
    // Limited XML spec: https://www.w3.org/TR/xml/#NT-NameStartChar
    return Scanner.isAlpha(ch) || ch === 58 /* Colon */ || ch === 95 /* Underscore */
        || (ch >= 0xC0 && ch <= 0xD6)
        || (ch >= 0xD8 && ch <= 0xF6)
        || (ch >= 0xF8 && ch <= 0x2FF)
        || (ch >= 0x370 && ch <= 0x37D)
        || (ch >= 0x37F && ch <= 0x1FFF);
}
/**
 * Check if given character can be used in a tag or attribute name
 */
function nameChar(ch) {
    // Limited XML spec: https://www.w3.org/TR/xml/#NT-NameChar
    return nameStartChar(ch) || ch === 45 /* Dash */ || ch === 46 /* Dot */ || Scanner.isNumber(ch)
        || ch === 0xB7
        || (ch >= 0x0300 && ch <= 0x036F);
}
/**
 * Consumes identifier from given scanner
 */
function ident(scanner) {
    const start = scanner.pos;
    if (scanner.eat(nameStartChar)) {
        scanner.eatWhile(nameChar);
        scanner.start = start;
        return true;
    }
    return false;
}
/**
 * Check if given code is tag terminator
 */
function isTerminator(code) {
    return code === 62 /* RightAngle */ || code === 47 /* Slash */;
}
/**
 * Check if given character code is valid unquoted value
 */
function isUnquoted(code) {
    return !isNaN(code) && !Scanner.isQuote(code) && !Scanner.isSpace(code) && !isTerminator(code);
}
/**
 * Consumes paired tokens (like `[` and `]`) with respect of nesting and embedded
 * quoted values
 * @return `true` if paired token was consumed
 */
function consumePaired(scanner) {
    return Scanner.eatPair(scanner, 60 /* LeftAngle */, 62 /* RightAngle */, opt)
        || Scanner.eatPair(scanner, 40 /* LeftRound */, 41 /* RightRound */, opt)
        || Scanner.eatPair(scanner, 91 /* LeftSquare */, 93 /* RightSquare */, opt)
        || Scanner.eatPair(scanner, 123 /* LeftCurly */, 125 /* RightCurly */, opt);
}
/**
 * Returns unquoted value of given string
 */
function getUnquotedValue(value) {
    // Trim quotes
    if (Scanner.isQuote(value.charCodeAt(0))) {
        value = value.slice(1);
    }
    if (Scanner.isQuote(value.charCodeAt(value.length - 1))) {
        value = value.slice(0, -1);
    }
    return value;
}

/**
 * Parses given string as list of HTML attributes.
 * @param src A fragment to parse. If `name` argument is provided, it must be an
 * opening tag (`<a foo="bar">`), otherwise it should be a fragment between element
 * name and tag closing angle (`foo="bar"`)
 * @param name Tag name
 */
function attributes(src, name) {
    const result = [];
    let start = 0;
    let end = src.length;
    if (name) {
        start = name.length + 1;
        end -= src.slice(-2) === '/>' ? 2 : 1;
    }
    const scanner = new Scanner__default(src, start, end);
    while (!scanner.eof()) {
        scanner.eatWhile(Scanner.isSpace);
        if (attributeName(scanner)) {
            const token = {
                name: scanner.current(),
                nameStart: scanner.start,
                nameEnd: scanner.pos
            };
            if (scanner.eat(61 /* Equals */) && attributeValue(scanner)) {
                token.value = scanner.current();
                token.valueStart = scanner.start;
                token.valueEnd = scanner.pos;
            }
            result.push(token);
        }
        else {
            // Do not break on invalid attributes: we are not validating parser
            scanner.pos++;
        }
    }
    return result;
}
/**
 * Consumes attribute name from given scanner context
 */
function attributeName(scanner) {
    const start = scanner.pos;
    if (scanner.eat(42 /* Asterisk */) || scanner.eat(35 /* Hash */)) {
        // Angular-style directives: `<section *ngIf="showSection">`, `<video #movieplayer ...>`
        ident(scanner);
        scanner.start = start;
        return true;
    }
    // Attribute name could be a regular name or expression:
    // React-style – `<div {...props}>`
    // Angular-style – `<div [ng-for]>` or `<div *ng-for>`
    return consumePaired(scanner) || ident(scanner);
}
/**
 * Consumes attribute value
 */
function attributeValue(scanner) {
    // Supported attribute values are quoted, React-like expressions (`{foo}`)
    // or unquoted literals
    return Scanner.eatQuoted(scanner, opt) || consumePaired(scanner) || unquoted(scanner);
}
/**
 * Returns clean (unquoted) value of `name` attribute
 */
function getAttributeValue(attrs, name) {
    for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if (attr.name === name) {
            return attr.value && getUnquotedValue(attr.value);
        }
    }
}
/**
 * Consumes unquoted value
 */
function unquoted(scanner) {
    const start = scanner.pos;
    if (scanner.eatWhile(isUnquoted)) {
        scanner.start = start;
        return true;
    }
}

const cdataOpen = toCharCodes('<![CDATA[');
const cdataClose = toCharCodes(']]>');
const commentOpen = toCharCodes('<!--');
const commentClose = toCharCodes('-->');
const piStart = toCharCodes('<?');
const piEnd = toCharCodes('?>');
const erbStart = toCharCodes('<%');
const erbEnd = toCharCodes('%>');
/**
 * Performs fast scan of given source code: for each tag found it invokes callback
 * with tag name, its type (open, close, self-close) and range in original source.
 * Unlike regular scanner, fast scanner doesn’t provide info about attributes to
 * reduce object allocations hence increase performance.
 * If `callback` returns `false`, scanner stops parsing.
 * @param special List of “special” HTML tags which should be ignored. Most likely
 * it’s a "script" and "style" tags.
 */
function scan(source, callback, options) {
    const scanner = new Scanner__default(source);
    const special = options ? options.special : null;
    const allTokens = options ? options.allTokens : false;
    let type;
    let name;
    let nameStart;
    let nameEnd;
    let nameCodes;
    let found = false;
    let piName = null;
    while (!scanner.eof()) {
        const start = scanner.pos;
        if (cdata(scanner)) {
            if (allTokens && callback('#cdata', 4 /* CData */, scanner.start, scanner.pos) === false) {
                break;
            }
        }
        else if (comment(scanner)) {
            if (allTokens && callback('#comment', 6 /* Comment */, scanner.start, scanner.pos) === false) {
                break;
            }
        }
        else if (erb(scanner)) {
            if (allTokens && callback('#erb', 7 /* ERB */, scanner.start, scanner.pos) === false) {
                break;
            }
        }
        else if (piName = processingInstruction(scanner)) {
            if (allTokens && callback(piName, 5 /* ProcessingInstruction */, scanner.start, scanner.pos) === false) {
                break;
            }
        }
        else if (scanner.eat(60 /* LeftAngle */)) {
            // Maybe a tag name?
            type = scanner.eat(47 /* Slash */) ? 2 /* Close */ : 1 /* Open */;
            nameStart = scanner.pos;
            if (ident(scanner)) {
                // Consumed tag name
                nameEnd = scanner.pos;
                if (type !== 2 /* Close */) {
                    skipAttributes(scanner);
                    scanner.eatWhile(Scanner.isSpace);
                    if (scanner.eat(47 /* Slash */)) {
                        type = 3 /* SelfClose */;
                    }
                }
                if (scanner.eat(62 /* RightAngle */)) {
                    // Tag properly closed
                    name = scanner.substring(nameStart, nameEnd);
                    if (callback(name, type, start, scanner.pos) === false) {
                        break;
                    }
                    if (type === 1 /* Open */ && special && isSpecial(special, name, source, start, scanner.pos)) {
                        // Found opening tag of special element: we should skip
                        // scanner contents until we find closing tag
                        nameCodes = toCharCodes(name);
                        found = false;
                        while (!scanner.eof()) {
                            if (consumeClosing(scanner, nameCodes)) {
                                found = true;
                                break;
                            }
                            scanner.pos++;
                        }
                        if (found && callback(name, 2 /* Close */, scanner.start, scanner.pos) === false) {
                            break;
                        }
                    }
                }
            }
        }
        else {
            scanner.pos++;
        }
    }
}
/**
 * Skips attributes in current tag context
 */
function skipAttributes(scanner) {
    while (!scanner.eof()) {
        scanner.eatWhile(Scanner.isSpace);
        if (attributeName(scanner)) {
            if (scanner.eat(61 /* Equals */)) {
                attributeValue(scanner);
            }
        }
        else if (isTerminator(scanner.peek())) {
            break;
        }
        else {
            scanner.pos++;
        }
    }
}
/**
 * Consumes closing tag with given name from scanner
 */
function consumeClosing(scanner, name) {
    const start = scanner.pos;
    if (scanner.eat(60 /* LeftAngle */) && scanner.eat(47 /* Slash */) && consumeArray(scanner, name) && scanner.eat(62 /* RightAngle */)) {
        scanner.start = start;
        return true;
    }
    scanner.pos = start;
    return false;
}
/**
 * Consumes CDATA from given scanner
 */
function cdata(scanner) {
    return consumeSection(scanner, cdataOpen, cdataClose, true);
}
/**
 * Consumes comments from given scanner
 */
function comment(scanner) {
    return consumeSection(scanner, commentOpen, commentClose, true);
}
/**
 * Consumes processing instruction from given scanner. If consumed, returns
 * processing instruction name
 */
function processingInstruction(scanner) {
    const start = scanner.pos;
    if (consumeArray(scanner, piStart) && ident(scanner)) {
        const name = scanner.current();
        while (!scanner.eof()) {
            if (consumeArray(scanner, piEnd)) {
                break;
            }
            Scanner.eatQuoted(scanner) || scanner.pos++;
        }
        scanner.start = start;
        return name;
    }
    scanner.pos = start;
    return null;
}
/**
 * Consumes ERB-style entity: `<% ... %>` or `<%= ... %>`
 */
function erb(scanner) {
    const start = scanner.pos;
    if (consumeArray(scanner, erbStart)) {
        while (!scanner.eof()) {
            if (consumeArray(scanner, erbEnd)) {
                break;
            }
            Scanner.eatQuoted(scanner) || scanner.pos++;
        }
        scanner.start = start;
        return true;
    }
    scanner.pos = start;
    return false;
}
/**
 * Check if given tag name should be considered as special
 */
function isSpecial(special, name, source, start, end) {
    if (name in special) {
        const typeValues = special[name];
        if (!Array.isArray(typeValues)) {
            return true;
        }
        const attrs = attributes(source.substring(start + name.length + 1, end - 1));
        return typeValues.includes(getAttributeValue(attrs, 'type') || '');
    }
    return false;
}

/**
 * Finds matched tag for given `pos` location in XML/HTML `source`
 */
function match(source, pos, opt) {
    // Since we expect large input document, we’ll use pooling technique
    // for storing tag data to reduce memory pressure and improve performance
    const pool = [];
    const stack = [];
    const options = createOptions(opt);
    let result = null;
    scan(source, (name, type, start, end) => {
        if (type === 1 /* Open */ && isSelfClose(name, options)) {
            // Found empty element in HTML mode, mark is as self-closing
            type = 3 /* SelfClose */;
        }
        if (type === 1 /* Open */) {
            // Allocate tag object from pool
            stack.push(allocTag(pool, name, start, end));
        }
        else if (type === 3 /* SelfClose */) {
            if (start < pos && pos < end) {
                // Matched given self-closing tag
                result = {
                    name,
                    attributes: getAttributes(source, start, end, name),
                    open: [start, end]
                };
                return false;
            }
        }
        else {
            const tag = last(stack);
            if (tag && tag.name === name) {
                // Matching closing tag found
                if (tag.start < pos && pos < end) {
                    result = {
                        name,
                        attributes: getAttributes(source, tag.start, tag.end, name),
                        open: [tag.start, tag.end],
                        close: [start, end]
                    };
                    return false;
                }
                else if (stack.length) {
                    // Release tag object for further re-use
                    releaseTag(pool, stack.pop());
                }
            }
        }
    }, options);
    stack.length = pool.length = 0;
    return result;
}
/**
 * Returns balanced tag model: a list of all XML/HTML tags that could possibly match
 * given location when moving in outward direction
 */
function balancedOutward(source, pos, opt) {
    const pool = [];
    const stack = [];
    const options = createOptions(opt);
    const result = [];
    scan(source, (name, type, start, end) => {
        if (type === 2 /* Close */) {
            const tag = last(stack);
            if (tag && tag.name === name) { // XXX check for invalid tag names?
                // Matching closing tag found, check if matched pair is a candidate
                // for outward balancing
                if (tag.start < pos && pos < end) {
                    result.push({
                        name,
                        open: [tag.start, tag.end],
                        close: [start, end]
                    });
                }
                // Release tag object for further re-use
                releaseTag(pool, stack.pop());
            }
        }
        else if (type === 3 /* SelfClose */ || isSelfClose(name, options)) {
            if (start < pos && pos < end) {
                // Matched self-closed tag
                result.push({ name, open: [start, end] });
            }
        }
        else {
            stack.push(allocTag(pool, name, start, end));
        }
    }, options);
    stack.length = pool.length = 0;
    return result;
}
/**
 * Returns balanced tag model: a list of all XML/HTML tags that could possibly match
 * given location when moving in inward direction
 */
function balancedInward(source, pos, opt) {
    // Collecting tags for inward balancing is a bit trickier: we have to store
    // first child of every matched tag until we find the one that matches given
    // location
    const pool = [];
    const stack = [];
    const options = createOptions(opt);
    const result = [];
    const alloc = (name, start, end) => {
        if (pool.length) {
            const tag = pool.pop();
            tag.name = name;
            tag.ranges.push(start, end);
            return tag;
        }
        return { name, ranges: [start, end] };
    };
    const release = (tag) => {
        tag.ranges.length = 0;
        tag.firstChild = void 0;
        pool.push(tag);
    };
    scan(source, (name, type, start, end) => {
        if (type === 2 /* Close */) {
            if (!stack.length) {
                // Some sort of lone closing tag, ignore it
                return;
            }
            let tag = last(stack);
            if (tag.name === name) { // XXX check for invalid tag names?
                // Matching closing tag found, check if matched pair is a candidate
                // for outward balancing
                if (tag.ranges[0] <= pos && pos <= end) {
                    result.push({
                        name,
                        open: tag.ranges.slice(0, 2),
                        close: [start, end]
                    });
                    while (tag.firstChild) {
                        const child = tag.firstChild;
                        const res = {
                            name: child.name,
                            open: child.ranges.slice(0, 2)
                        };
                        if (child.ranges.length > 2) {
                            res.close = child.ranges.slice(2, 4);
                        }
                        result.push(res);
                        release(tag);
                        tag = child;
                    }
                    return false;
                }
                else {
                    stack.pop();
                    const parent = last(stack);
                    if (parent && !parent.firstChild) {
                        // No first child in parent node: store current tag
                        tag.ranges.push(start, end);
                        parent.firstChild = tag;
                    }
                    else {
                        release(tag);
                    }
                }
            }
        }
        else if (type === 3 /* SelfClose */ || isSelfClose(name, options)) {
            if (start < pos && pos < end) {
                // Matched self-closed tag, no need to look further
                result.push({ name, open: [start, end] });
                return false;
            }
            const parent = last(stack);
            if (parent && !parent.firstChild) {
                parent.firstChild = alloc(name, start, end);
            }
        }
        else {
            stack.push(alloc(name, start, end));
        }
    }, options);
    stack.length = pool.length = 0;
    return result;
}
function allocTag(pool, name, start, end) {
    if (pool.length) {
        const tag = pool.pop();
        tag.name = name;
        tag.start = start;
        tag.end = end;
        return tag;
    }
    return { name, start, end };
}
function releaseTag(pool, tag) {
    pool.push(tag);
}
/**
 * Returns parsed attributes from given source
 */
function getAttributes(source, start, end, name) {
    const tokens = attributes(source.slice(start, end), name);
    tokens.forEach(attr => {
        attr.nameStart += start;
        attr.nameEnd += start;
        if (attr.value != null) {
            attr.valueStart += start;
            attr.valueEnd += start;
        }
    });
    return tokens;
}
/**
 * Check if given tag is self-close for current parsing context
 */
function isSelfClose(name, options) {
    return !options.xml && options.empty.includes(name);
}
function last(arr) {
    return arr.length ? arr[arr.length - 1] : null;
}

exports.attributes = attributes;
exports.balancedInward = balancedInward;
exports.balancedOutward = balancedOutward;
exports.createOptions = createOptions;
exports.default = match;
exports.scan = scan;
//# sourceMappingURL=html-matcher.cjs.js.map
