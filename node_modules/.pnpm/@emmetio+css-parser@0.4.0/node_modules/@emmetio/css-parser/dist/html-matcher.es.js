import StreamReader from '@emmetio/stream-reader';
import { isAlpha, isNumber, isQuote, isSpace } from '@emmetio/stream-reader-utils';

/**
 * A structure describing text fragment in content stream
 */
class Token {
	/**
	 * @param {StreamReader} stream
	 * @param {Point}        start  Tokens’ start location in content stream
	 * @param {Point}        end    Tokens’ end location in content stream
	 */
	constructor(stream, start, end) {
		this.stream = stream;
		this.start  = start != null ? start : stream.start;
		this.end    = end   != null ? end   : stream.pos;
		this._value = null;
	}

	/**
	 * Returns token textual representation
	 * @return {String}
	 */
	toString() {
		return `${this.valueOf()}: ${this.start}, ${this.end}`;
	}

	valueOf() {
		if (this._value === null) {
			const start = this.stream.start;
			const end = this.stream.pos;

			this.stream.start = this.start;
			this.stream.pos = this.end;
			this._value = this.stream.current();

			this.stream.start = start;
			this.stream.pos = end;
		}

		return this._value;
	}
}

/**
 * A token that contains a list of tokens
 */
class FragmentsToken extends Token {
	constructor(stream, tokens) {
		let start = stream.pos;
		let end = stream.pos;

		if (tokens && tokens.length) {
			start = tokens[0].start;
			end = tokens[tokens.length - 1].end;
		}

		super(stream, start, end);
		this.type = 'fragments';
		this.fragments = tokens;
	}
}

const COMMA           = 44;  // ,
const PROP_DELIMITER  = 58;  // :
const PROP_TERMINATOR = 59;  // ;
const RULE_START      = 123; // {
const RULE_END        = 125; // }

/**
 * Consumes separator token from given string
 */
var separator = function(stream) {
	if (isSeparator(stream.peek())) {
		const start = stream.pos;
		return new SeparatorToken(stream.next(), stream, start);
	}
};

function isSeparator(code) {
	return code === COMMA
		|| code === PROP_DELIMITER || code === PROP_TERMINATOR
		|| code === RULE_START || code === RULE_END;
}

class SeparatorToken extends Token {
	constructor(code, stream, start, end) {
		super(stream, start, end);
		this.type = 'separator';
		this.code = code;

		this.comma = code === COMMA;
		this.propertyDelimiter = code === PROP_DELIMITER;
		this.propertyTerminator = code === PROP_TERMINATOR;
		this.ruleStart = code === RULE_START;
		this.ruleEnd = code === RULE_END;
	}
}

const ARGUMENTS_START = 40;  // (
const ARGUMENTS_END   = 41;  // )

var args = function(stream, tokenConsumer) {
	const start = stream.pos;

	if (stream.eat(ARGUMENTS_START)) {
		const tokens = [];
		let t, ch;
		// in LESS, it’s possible to separate arguments list either by `;` or `,`.
		// In first case, we should keep comma-separated item as a single argument
		let usePropTerminator = false;

		while (!stream.eof()) {
			if (isUnexpectedTerminator(stream.peek()) || stream.eat(ARGUMENTS_END)) {
				break;
			}

			t = tokenConsumer(stream);
			if (!t) {
				break;
			}

			if (t.propertyTerminator) {
				usePropTerminator = true;
			}

			tokens.push(t);
		}

		return createArguments(stream, tokens, start, usePropTerminator);
	}
};

function isUnexpectedTerminator(code) {
	return code === RULE_START || code === RULE_END;
}

function createArguments(stream, tokens, start, usePropTerminator) {
	const sep = usePropTerminator ? semicolonSeparator : commaSeparator;
	const list = [];
	let arg = [];

	for (let i = 0, il = tokens.length, token; i < il; i++) {
		token = tokens[i];
		if (sep(token)) {
			if (arg.length) {
				list.push(new FragmentsToken(stream, arg));
				arg = [];
			} else {
				list.push(new Token(stream, token.start, token.start));
			}
		} else {
			arg.push(token);
		}
	}

	if (arg.length) {
		list.push(new FragmentsToken(stream, arg));
	}

	return new ArgumentsToken(list, stream, start);
}

function commaSeparator(token) {
	return token.comma;
}

function semicolonSeparator(token) {
	return token.propertyTerminator;
}

/**
 * A token that represents a set of arguments between `(` and `)`
 */
class ArgumentsToken extends Token {
	constructor(list, stream, start, end) {
		super(stream, start, end);
		this.list = list;
		this.type = 'arguments';
	}
}

const HYPHEN     = 45;
const UNDERSCORE = 95;

function eatIdent(stream) {
	const start = stream.pos;

	stream.eat(HYPHEN);
	if (stream.eat(isIdentStart)) {
		stream.eatWhile(isIdent);
		return new IdentToken(stream, start);
	}

	stream.pos = start;
	return false;
}

class IdentToken extends Token {
	constructor(stream, start, end) {
		super(stream, start, end);
		this.type = 'ident';
	}
}

function isIdentStart(code) {
	return code === UNDERSCORE || isAlpha(code) || code >= 128;
}

function isIdent(code) {
	return isNumber(code) || isIdentStart(code);
}

/**
 * Consumes at-keyword from given stream
 */
var atKeyword = function(stream) {
	const start = stream.pos;

	if (stream.eatWhile(64 /* @ */)) {
		const name = eatIdent(stream);
		if (name) {
			return new AtKeywordToken(name, stream, start);
		}
	}

	stream.pos = start;
};

class AtKeywordToken extends Token {
	constructor(name, stream, start, end) {
		super(stream, start, end);
		this.type = 'at-keyword';
		this.name = name;
	}
}

/**
 * Consumes quoted string from current string and returns token with consumed
 * data or `null`, if string wasn’t consumed
 * @param  {StreamReader} stream
 * @return {StringToken}
 */
function eatString(stream) {
	const start = stream.pos;
	let ch = stream.peek(), pos;

	if (isQuote(ch)) {
		stream.next();
		const quote = ch;
		const valueStart = stream.pos;

		while (!stream.eof()) {
			pos = stream.pos;
			if (stream.eat(quote) || stream.eat(isNewline)) {
				// found end of string or newline without preceding '\',
				// which is not allowed (don’t throw error, for now)
				break;
			} else if (stream.eat(92) /* \ */) {
				// backslash allows newline in string
				stream.eat(isNewline);
			}

			stream.next();
		}

		// either reached EOF or explicitly stopped at string end
		return new StringToken(
			String.fromCharCode(quote),
			new Token(stream, valueStart, pos),
			stream,
			start
		);
	}

	stream.pos = start;
	return null;
}

class StringToken extends Token {
	constructor(quote, value, stream, start, end) {
		super(stream, start, end);
		this.type = 'string';
		this.quote = quote;
		this.value = value;
	}
}

function isNewline(code) {
	return code === 10  /* LF */ || code === 13 /* CR */;
}

const SINGLE_LINE = 1;
const MULTI_LINE  = 2;

const ASTERISK = 42;
const SLASH    = 47;

/**
 * Consumes comment from given stream: either multi-line or single-line
 * @param  {StreamReader} stream
 * @return {CommentToken}
 */
var eatComment = function(stream) {
	const start = stream.pos;

	switch (isCommentStart(stream, true)) {
		case SINGLE_LINE:
			// single-line comment, consume till the end of line
			stream.eatWhile(notLineBreak);
			stream.eat(isLineBreak);
			return new CommentToken(stream, start);

		case MULTI_LINE:
			while (!stream.eof()) {
				if (stream.next() === ASTERISK && stream.eat(SLASH)) {
					break;
				}
			}

			return new CommentToken(stream, start);
	}

	stream.pos = start;
};

/**
 * Eats comment start, if possible
 * @param  {StreamReader} stream
 * @param  {Boolean}      consume Keep tream position at the end of comment start,
 *                                if matched
 * @return {Number} Returns type of comment, if consumed
 */
function isCommentStart(stream, consume) {
	const start = stream.start;
	const pos = stream.pos;
	let result = 0;

	if (stream.eat(SLASH)) {
		if (stream.eat(SLASH)) {
			result = SINGLE_LINE;
		} else if (stream.eat(ASTERISK)) {
			result = MULTI_LINE;
		}
	}

	if (result && consume) {
		stream.start = pos;
	} else {
		stream.pos = pos;
	}

	return result;
}

class CommentToken extends Token {
	constructor(stream, start, end) {
		super(stream, start, end);
		this.type = 'comment';
	}
}

function isLineBreak(code) {
	return code === 10 /* LF */ || code === 13 /* CR */;
}

function notLineBreak(code) {
	return !isLineBreak(code);
}

const ATTR_START = 91; // [
const ATTR_END   = 93; // ]

/**
 * Consumes attribute from given string, e.g. value between [ and ]
 * @param  {StreamReader} stream
 * @return {AttributeToken}
 */
function eatAttribuite(stream) {
	const start = stream.pos;

	if (stream.eat(ATTR_START)) {
		skip(stream);
		const name = eatIdent(stream);

		skip(stream);
		const opStart = stream.pos;
		stream.eatWhile(isOperator);
		const operator = new Token(stream, opStart);

		skip(stream);
		const value = eatString(stream) || eatIdent(stream);

		// in case of invalid attribute definition, consume till the end of attribute
		while (!stream.eof()) {
			if (stream.eat(ATTR_END)) {
				break;
			} else if (!skip(stream) && !eatIdent(stream) && !eatString(stream)) {
				stream.next();
			}
		}

		return new AttributeToken(name, value, operator, stream, start);
	}
}

class AttributeToken extends Token {
	constructor(name, value, operator, stream, start, end) {
		super(stream, start, end);
		this.type = 'attribute';
		this.name = name;
		this.value = value;
		this.operator = operator;
	}
}

function skip(stream) {
	while (!stream.eof()) {
		if (!stream.eatWhile(isSpace) || !eatComment(stream)) {
			return true;
		}
	}
}

function isOperator(code) {
	return code === 126 /* ~ */
		|| code === 124 /* | */
		|| code === 94  /* ^ */
		|| code === 36  /* $ */
		|| code === 42  /* * */
		|| code === 61; /* = */
}

/**
 * Consumes class fragment from given stream, e.g. `.foo`
 * @param  {StreamReader} stream
 * @return {ClassToken}
 */
function eatClass(stream) {
	const start = stream.pos;

	if (stream.eat(46 /* . */)) {
		return new ClassToken(eatIdent(stream), stream, start);
	}
}

class ClassToken extends Token {
	constructor(name, stream, start, end) {
		super(stream, start, end);
		this.type = 'class';
		this.name = name;
	}
}

const ADJACENT_SIBLING = 43;  // +
const GENERAL_SIBLING  = 126; // ~
const CHILD            = 62;  // >
const NESTING          = 38;  // &

/**
 * Consumes combinator token from given string
 */
var combinator = function(stream) {
	if (isCombinator(stream.peek())) {
		const start = stream.pos;
		return new CombinatorToken(stream.next(), stream, start);
	}
};

function isCombinator(code) {
	return code === ADJACENT_SIBLING || code === GENERAL_SIBLING
		|| code === NESTING || code === CHILD;
}

class CombinatorToken extends Token {
	constructor(code, stream, start, end) {
		super(stream, start, end);
		this.type = 'combinator';
		this.code = code;

		this.adjacentSibling = code === ADJACENT_SIBLING;
		this.generalSibling = code === GENERAL_SIBLING;
		this.child = code === CHILD;
		this.nesting = code === NESTING;
	}
}

function eatHash(stream) {
	const start = stream.pos;

	if (stream.eat(35 /* # */)) {
		stream.start = stream.pos;
		stream.eatWhile(isHashValue);
		return new HashToken(new Token(stream), stream, start);
	}

	stream.pos = start;
}

function isHashValue(code) {
	return isNumber(code) || isAlpha(code, 65 /* A */, 70 /* F */)
		|| code === 95 /* _ */ || code === 45 /* - */
		|| code > 128 /* non-ASCII */
}

class HashToken extends Token {
	constructor(value, stream, start, end) {
		super(stream, start, end);
		this.type = 'hash';
		this.value = value;
	}
}

/**
 * Consumes id fragment from given stream, e.g. `#foo`
 * @param  {StreamReader} stream
 * @return {IdToken}
 */
function eatId(stream) {
	const start = stream.pos;

	if (stream.eat(35 /* # */)) {
		return new IdToken(eatIdent(stream), stream, start);
	}
}

class IdToken extends Token {
	constructor(name, stream, start, end) {
		super(stream, start, end);
		this.type = 'id';
		this.name = name;
	}
}

const DOT = 46; // .

/**
 * Consumes number from given string, e.g. `10px`
 * @param  {StreamReader} stream
 * @return {NumberToken}
 */
function eatNumber(stream) {
	const start = stream.pos;
	const num = getNumToken(stream);
	if (num) {
		return new NumberToken(num, eatPercent(stream) || eatIdent(stream), stream, start);
	}
}

function getNumToken(stream) {
	const start = stream.pos;

	stream.eat(isOperator$1);
	if (stream.eatWhile(isNumber)) {
		let end = stream.pos;
		if (stream.eat(DOT) && stream.eatWhile(isNumber)) {
			end = stream.pos;
		} else {
			stream.pos = end;
		}

		return new NumToken(stream, start, end);
	} else if (stream.eat(DOT) && stream.eatWhile(isNumber)) {
		return new NumToken(stream, start);
	}

	stream.pos = start;
}

function eatPercent(stream) {
	if (stream.peek() === 37 /* % */) {
		const start = stream.pos;
		stream.next();
		return new Token(stream, start);
	}
}

function isOperator$1(code) {
	return code === 45 /* - */ || code === 43 /* + */;
}

class NumberToken extends Token {
	constructor(number, unit, stream, start, end) {
		super(stream, start, end);
		this.type = 'number';
		this.number = number;
		this.unit = unit;
	}
}

class NumToken extends Token {
	constructor(stream, start, end) {
		super(stream, start, end);
		this.type = 'num';
	}

	toNumber() {
		return parseFloat(this.valueOf());
	}
}

/**
 * Consumes unquoted value from given stream
 * @param  {StreamReader} stream
 * @return {UnquotedToken}
 */
var unquoted = function(stream) {
	const start = stream.pos;
	if (stream.eatWhile(isUnquoted)) {
		return new UnquotedToken(stream, start);
	}
};

function isUnquoted(code) {
	return !isNaN(code) && !isQuote(code) && !isSpace(code)
		&& code !== 40 /* ( */ && code !== 41 /* ) */ && code !== 92 /* \ */
		&& !isNonPrintable(code);
}

function isNonPrintable(code) {
	return (code >= 0 && code <= 8) || code === 11
	|| (code >= 14 && code <= 31) || code === 127;
}

class UnquotedToken extends Token {
	constructor(stream, start, end) {
		super(stream, start, end);
		this.type = 'unquoted';
	}
}

/**
 * Consumes URL token from given stream
 * @param  {StreamReader} stream
 * @return {UrlToken}
 */
var url = function(stream) {
	const start = stream.pos;

	if (stream.eat(117) && stream.eat(114) && stream.eat(108) && stream.eat(40)) {
		// consumed `url(`
		stream.eatWhile(isSpace);
		const value = eatString(stream) || unquoted(stream);
		stream.eatWhile(isSpace);
		stream.eat(41); // )
		return new UrlToken(value, stream, start);
	}

	stream.pos = start;
};

class UrlToken extends Token {
	constructor(value, stream, start, end) {
		super(stream, start, end);
		this.type = 'url';
		this.value = value;
	}
}

/**
 * Consumes SCSS variable from given stream
 */
var variable = function(stream) {
	const start = stream.pos;

	if (stream.eatWhile(36 /* $ */)) {
		const name = eatIdent(stream);
		if (name) {
			return new VariableToken(name, stream, start);
		}
	}

	stream.pos = start;
};

class VariableToken extends Token {
	constructor(name, stream, start, end) {
		super(stream, start, end);
		this.type = 'variable';
		this.name = name;
	}
}

/**
 * Consumes white-space tokens from given stream
 */
function eatWhitespace(stream) {
	const start = stream.pos;
	if (stream.eatWhile(isSpace)) {
		return new WhiteSpaceToken(stream, start);
	}
}

class WhiteSpaceToken extends Token {
	constructor(stream, start, end) {
		super(stream, start, end);
		this.type = 'whitespace';
	}
}

/**
 * A token that represents a function call or definition
 */
class FunctionToken extends Token {
	constructor(name, args, stream) {
		super(stream, name.start, args.end);
		this.name = name;
		this.arguments = args;
		this.type = 'function';
	}
}

/**
 * Group tokens by commonly used context
 */

function consumeToken(stream) {
	const _token = any(stream) || args(stream, consumeToken);
	if (_token && _token.type === 'ident') {
		const _args = args(stream, consumeToken);
		if (_args) {
			// An identifier followed by arguments – function call
			return new FunctionToken(_token, _args, stream);
		}
	}

	return _token;
}

function any(stream) {
	return url(stream) || selector(stream) || value(stream) || keyword(stream)
		|| separator(stream) || formatting(stream);
}

function selector(stream) {
	return eatIdent(stream) || eatClass(stream) || eatId(stream) || eatAttribuite(stream)
		|| atKeyword(stream) || combinator(stream);
}

function keyword(stream) {
	return variable(stream) || atKeyword(stream) || eatIdent(stream);
}

function value(stream) {
	return eatString(stream) || eatNumber(stream) || eatHash(stream) || url(stream);
}

function formatting(stream) {
	return eatComment(stream) || eatWhitespace(stream);
}

function fragments(stream, items) {
	return new FragmentsToken(stream, items);
}

function unknown(stream) {
	return new Token(stream);
}

/**
 * Consumes pseudo-selector from given stream
 */
class PseudoToken extends Token {
	constructor(name, stream, start, end) {
		super(stream, start, end);
		this.type = 'pseudo';
		this.name = name;
	}
}

/**
 * Separates given list of tokens by specified separator
 * @param  {Token[]}    tokens
 * @param  {*|Function} sep
 * @return {Array[]}
 */
function splitList(tokens, sep) {
	if (!tokens.length) {
		return [];
	}
	
	let itemTokens = [];
	const list = [];
	const test = typeof sep === 'function'
		? sep
		: token => token === sep || token.type === sep;

	for (let i = 0; i < tokens.length; i++) {
		if (test(tokens[i])) {
			if (itemTokens.length) {
				list.push(itemTokens);
			}

			itemTokens = [];
		} else {
			itemTokens.push(tokens[i]);
		}
	}

	if (itemTokens.length) {
		list.push(itemTokens);
	}

	return list;
}

/**
 * Removes tokens that matches given criteria from start and end of given list
 * @param  {Token[]}   tokens
 * @param  {Function}  test
 * @return {Token[]}
 */
function trimTokens(tokens, test) {
	tokens = tokens.slice();

	while (tokens.length) {
		if (!test(tokens[0])) {
			break;
		}
		tokens.shift();
	}

	while (tokens.length) {
		if (!test(tokens[tokens.length - 1])) {
			break;
		}
		tokens.pop();
	}

	return tokens;
}

/**
 * Trims formatting tokens (whitespace and comments) from the beginning and end
 * of given token list
 * @param  {Token[]} tokens
 * @return {Token[]}
 */
function trimFormatting(tokens) {
	return trimTokens(tokens, isFormattingToken);
}

/**
 * Check if given token is a formatting one (whitespace or comment)
 * @param  {Token}  token
 * @return {Boolean}
 */
function isFormattingToken(token) {
	return token.type === 'comment' || token.type === 'whitespace';
}

function commaSeparator$1(token) {
	return token.comma;
}

/**
 * Creates CSS rule frmo given tokens
 * @param  {StreamReader} stream
 * @param  {Token[]} tokens
 * @param  {Token} [contentStart]
 * @param  {Token} [contentEnd]
 * @return {Rule}
 */
function createRule(stream, tokens, contentStart, contentEnd) {
	tokens = replacePseudo(trimFormatting(tokens));

	if (!tokens.length) {
		return null;
	}

	if (tokens[0].type === 'at-keyword') {
		return new AtRule(tokens.shift(), createItemList(stream, tokens),
			contentStart, contentEnd);
	}

	return new Rule(createItemList(stream, tokens), contentStart, contentEnd);
}

/**
 * Represents CSS rule
 * @type {Node}
 */
class Rule {
	/**
	 * @param  {Token} name         Rule name token
	 * @param  {Token} contentStart Rule’s content start token
	 * @param  {Token} [contentEnd] Rule’s content end token
	 */
	constructor(name, contentStart, contentEnd) {
		this.type = 'rule';
		this.nameToken = name;
		this.contentStart = contentStart;
		this.contentEnd = contentEnd;

		this.children = [];
		this.parent = null;
	}

	/**
	 * Returns node name
	 * @return {String}
	 */
	get name() {
		return this.nameToken && this.nameToken.valueOf();
	}

	/**
	 * Returns node’s start position in stream
	 * @return {*}
	 */
	get start() {
		return this.nameToken && this.nameToken.start;
	}

	/**
	 * Returns node’s end position in stream
	 * @return {*}
	 */
	get end() {
		if (this.contentEnd) {
			return this.contentEnd.end;
		}
		return this.contentStart ? this.contentStart.end : this.nameToken.end;
	}

	get firstChild() {
		return this.children[0];
	}

	get nextSibling() {
		const ix = this.getIndex();
		return ix !== -1 ? this.parent.children[ix + 1] : null;
	}

	get previousSibling() {
		const ix = this.getIndex();
		return ix !== -1 ? this.parent.children[ix - 1] : null;
	}

	/**
	 * Returns current element’s index in parent list of child nodes
	 * @return {Number}
	 */
	getIndex() {
		return this.parent ? this.parent.children.indexOf(this) : -1;
	}

	/**
	 * Adds given node as a child
	 * @param {Node} node
	 * @return {Node} Current node
	 */
	addChild(node) {
		if (node) {
			this.removeChild(node);
			this.children.push(node);
			node.parent = this;
		}
		return this;
	}

	/**
	 * Removes given node from current node’s child list
	 * @param  {Node} node
	 * @return {Node} Current node
	 */
	removeChild(node) {
		if (node) {
			const ix = this.children.indexOf(node);
			if (ix !== -1) {
				this.children.splice(ix, 1);
				node.parent = null;
			}
		}

		return this;
	}
}

class AtRule extends Rule {
	constructor(name, expressions, contentStart, contentEnd) {
		super(name, contentStart, contentEnd);
		this.type = 'at-rule';
		this.expressionsToken = expressions;
	}

	get expressions() {
		return this.expressionsToken ? this.expressionsToken.fragments : [];
	}
}

/**
 * Replaces `:` separator and following ident token with pseudo token
 * @param  {StreamReader} stream
 * @param  {Token[]} tokens
 * @return {Token[]}
 */
function replacePseudo(tokens) {
	let result = [];
	let pseudoStart = [];

	for (let i = 0, il = tokens.length, token; i < il; i++) {
		token = tokens[i];
		if (token.propertyDelimiter) {
			pseudoStart.push(token);
		} else if (token.type === 'ident' && pseudoStart.length) {
			result.push(new PseudoToken(token, token.stream, pseudoStart[0].start, token.end));
			pseudoStart.length = 0;
		} else {
			if (pseudoStart.length) {
				result = result.concat(pseudoStart);
				pseudoStart.length = 0;
			}

			result.push(token);
		}
	}

	return result.concat(pseudoStart);
}

function createItemList(stream, tokens) {
	const items = splitList(tokens, commaSeparator$1)
		.map(item => fragments(stream, trimFormatting(item)));

	return fragments(stream, items);
}

class Stylesheet extends Rule {
	constructor() {
		super();
		this.type = 'stylesheet';
	}

	/**
	 * Returns node name
	 * @return {String}
	 */
	get name() {
		return null;
	}

	/**
	 * Returns node’s start position in stream
	 * @return {*}
	 */
	get start() {
		const node = this.children[0];
		return node && node.start;
	}

	/**
	 * Returns node’s end position in stream
	 * @return {*}
	 */
	get end() {
		const node = this.children[this.children.length - 1];
		return node && node.end;
	}
}

/**
 * Factory method that creates property node from given tokens
 * @param  {StreamReader} stream
 * @param  {Token[]}      tokens
 * @return {Property}
 */
function createProperty(stream, tokens) {
	// NB in LESS, fragmented properties without value like `.foo.bar;` must be
	// treated like mixin call
	tokens = trimFormatting(tokens);

	if (!tokens.length) {
		return null;
	}

	// Property terminator should be at the end of token list
	let terminator = tokens[tokens.length - 1].propertyTerminator ? tokens.pop() : null;
	let name = tokens, value$$1, separator$$1;
	let sepIx = -1;

	for (let i = 0, il = tokens.length; i < il; i++) {
		if (tokens[i].propertyDelimiter) {
			sepIx = i;
			break;
		}
	}

	if (sepIx !== -1) {
		// Has explicit property separator
		name = tokens.slice(0, sepIx);
		value$$1 = tokens.slice(sepIx + 1);
		separator$$1 = tokens[sepIx];
	} else if (tokens[0] && tokens[0].type === 'at-keyword') {
		// Edge case for properties like `@import "foo";`: treat at-keyword as
		// property name, the rest tokens are value
		name = [tokens[0]];
		value$$1 = tokens.slice(1);
	} else {
		// Check for `color:red;` edge case where `:red` is parsed as pseudo-selector
		for (let i = 0; i < tokens.length; i++) {
			if (tokens[i].type === 'pseudo') {
				name = tokens.slice(0, i);
				value$$1 = [tokens[i].name].concat(tokens.slice(i + 1));
				break;
			}
		}
	}

	if (value$$1) {
		value$$1 = splitList(value$$1, commaSeparator$1)
		.map(item => fragments(stream, trimFormatting(item)));
	}

	return new Property(
		fragments(stream, trimFormatting(name)),
		value$$1 && value$$1.length ? fragments(stream, value$$1) : null,
		separator$$1,
		terminator
	);
}

class Property {
	constructor(name, value$$1, separator$$1, terminator) {
		this.type = 'property';
		this.nameToken = name;
		this.valueToken = value$$1;

		this.separatorToken = separator$$1;
		this.terminatorToken = terminator;
	}

	get name() {
		return valueOf(this.nameToken);
	}

	get value() {
		return valueOf(this.valueToken);
	}

	get separator() {
		return valueOf(this.separatorToken);
	}

	get terminator() {
		return valueOf(this.terminatorToken);
	}

	get start() {
		return this.nameToken && this.nameToken.start;
	}

	get end() {
		const token = this.terminatorToken || this.valueToken
			|| this.separatorToken || this.nameToken;
		return token && token.end;
	}
}

function valueOf(token) {
	return token && token.valueOf();
}

var index = function(source) {
	const stream = typeof source === 'string' ? new StreamReader(source) : source;
	const root = new Stylesheet();
	let tokens = [];
	let ctx = root, child, t;

	while (!stream.eof()) {
		t = consumeToken(stream);

		if (!t) {
			// unable to identify following character, consume it as unknown token
			stream.start = stream.pos;
			stream.next();
			tokens.push(unknown(stream));
		} else if (t.propertyTerminator) {
			// Tokens consumed before are CSS property
			tokens.push(t);
			ctx.addChild(createProperty(stream, tokens, t));
			tokens = [];
		} else if (t.ruleStart) {
			// Tokens consumed before are CSS rule
			child = createRule(stream, tokens, t);
			if (child) {
				ctx.addChild(child);
				ctx = child;
			}
			tokens = [];
		} else if (t.ruleEnd) {
			// Finalize previously consumed tokens as CSS property
			ctx.addChild(createProperty(stream, tokens));
			tokens = [];

			// In case of invalid stylesheet with redundant `}`,
			// don’t modify root section.
			if (ctx.type !== 'root') {
				ctx.contentEnd = t;
			}

			ctx = ctx.parent || ctx;
		} else {
			tokens.push(t);
		}
	}

	// save unterminated tokens as property
	ctx.addChild(createProperty(stream, tokens));

	return root;
};

export { consumeToken as token, createProperty, createRule, Token };export default index;
