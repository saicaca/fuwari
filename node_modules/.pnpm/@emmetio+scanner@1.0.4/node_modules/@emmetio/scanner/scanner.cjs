'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const defaultQuotedOptions = {
    escape: 92,
    throws: false
};
/**
 * Check if given code is a number
 */
function isNumber(code) {
    return code > 47 && code < 58;
}
/**
 * Check if given character code is alpha code (letter through A to Z)
 */
function isAlpha(code, from, to) {
    from = from || 65; // A
    to = to || 90; // Z
    code &= ~32; // quick hack to convert any char code to uppercase char code
    return code >= from && code <= to;
}
/**
 * Check if given character code is alpha-numeric (letter through A to Z or number)
 */
function isAlphaNumeric(code) {
    return isNumber(code) || isAlpha(code);
}
function isAlphaNumericWord(code) {
    return isNumber(code) || isAlphaWord(code);
}
function isAlphaWord(code) {
    return code === 95 /* _ */ || isAlpha(code);
}
/**
 * Check for Umlauts i.e. ä, Ä, ö, Ö, ü and Ü
 */
function isUmlaut(code) {
    return code === 196
        || code == 214
        || code === 220
        || code === 228
        || code === 246
        || code === 252;
}
/**
 * Check if given character code is a white-space character: a space character
 * or line breaks
 */
function isWhiteSpace(code) {
    return code === 32 /* space */
        || code === 9 /* tab */
        || code === 160; /* non-breaking space */
}
/**
 * Check if given character code is a space character
 */
function isSpace(code) {
    return isWhiteSpace(code)
        || code === 10 /* LF */
        || code === 13; /* CR */
}
/**
 * Consumes 'single' or "double"-quoted string from given string, if possible
 * @return `true` if quoted string was consumed. The contents of quoted string
 * will be available as `stream.current()`
 */
function eatQuoted(stream, options) {
    options = Object.assign(Object.assign({}, defaultQuotedOptions), options);
    const start = stream.pos;
    const quote = stream.peek();
    if (stream.eat(isQuote)) {
        while (!stream.eof()) {
            switch (stream.next()) {
                case quote:
                    stream.start = start;
                    return true;
                case options.escape:
                    stream.next();
                    break;
            }
        }
        // If we’re here then stream wasn’t properly consumed.
        // Revert stream and decide what to do
        stream.pos = start;
        if (options.throws) {
            throw stream.error('Unable to consume quoted string');
        }
    }
    return false;
}
/**
 * Check if given character code is a quote character
 */
function isQuote(code) {
    return code === 39 /* ' */ || code === 34 /* " */;
}
/**
 * Eats paired characters substring, for example `(foo)` or `[bar]`
 * @param open Character code of pair opening
 * @param close Character code of pair closing
 * @return Returns `true` if character pair was successfully consumed, it’s
 * content will be available as `stream.current()`
 */
function eatPair(stream, open, close, options) {
    options = Object.assign(Object.assign({}, defaultQuotedOptions), options);
    const start = stream.pos;
    if (stream.eat(open)) {
        let stack = 1;
        let ch;
        while (!stream.eof()) {
            if (eatQuoted(stream, options)) {
                continue;
            }
            ch = stream.next();
            if (ch === open) {
                stack++;
            }
            else if (ch === close) {
                stack--;
                if (!stack) {
                    stream.start = start;
                    return true;
                }
            }
            else if (ch === options.escape) {
                stream.next();
            }
        }
        // If we’re here then paired character can’t be consumed
        stream.pos = start;
        if (options.throws) {
            throw stream.error(`Unable to find matching pair for ${String.fromCharCode(open)}`);
        }
    }
    return false;
}

/**
 * A streaming, character code-based string reader
 */
class Scanner {
    constructor(str, start, end) {
        if (end == null && typeof str === 'string') {
            end = str.length;
        }
        this.string = str;
        this.pos = this.start = start || 0;
        this.end = end || 0;
    }
    /**
     * Returns true only if the stream is at the end of the file.
     */
    eof() {
        return this.pos >= this.end;
    }
    /**
     * Creates a new stream instance which is limited to given `start` and `end`
     * range. E.g. its `eof()` method will look at `end` property, not actual
     * stream end
     */
    limit(start, end) {
        return new Scanner(this.string, start, end);
    }
    /**
     * Returns the next character code in the stream without advancing it.
     * Will return NaN at the end of the file.
     */
    peek() {
        return this.string.charCodeAt(this.pos);
    }
    /**
     * Returns the next character in the stream and advances it.
     * Also returns <code>undefined</code> when no more characters are available.
     */
    next() {
        if (this.pos < this.string.length) {
            return this.string.charCodeAt(this.pos++);
        }
    }
    /**
     * `match` can be a character code or a function that takes a character code
     * and returns a boolean. If the next character in the stream 'matches'
     * the given argument, it is consumed and returned.
     * Otherwise, `false` is returned.
     */
    eat(match) {
        const ch = this.peek();
        const ok = typeof match === 'function' ? match(ch) : ch === match;
        if (ok) {
            this.next();
        }
        return ok;
    }
    /**
     * Repeatedly calls <code>eat</code> with the given argument, until it
     * fails. Returns <code>true</code> if any characters were eaten.
     */
    eatWhile(match) {
        const start = this.pos;
        while (!this.eof() && this.eat(match)) { /* */ }
        return this.pos !== start;
    }
    /**
     * Backs up the stream n characters. Backing it up further than the
     * start of the current token will cause things to break, so be careful.
     */
    backUp(n) {
        this.pos -= (n || 1);
    }
    /**
     * Get the string between the start of the current token and the
     * current stream position.
     */
    current() {
        return this.substring(this.start, this.pos);
    }
    /**
     * Returns substring for given range
     */
    substring(start, end) {
        return this.string.slice(start, end);
    }
    /**
     * Creates error object with current stream state
     */
    error(message, pos = this.pos) {
        return new ScannerError(`${message} at ${pos + 1}`, pos, this.string);
    }
}
class ScannerError extends Error {
    constructor(message, pos, str) {
        super(message);
        this.pos = pos;
        this.string = str;
    }
}

exports.ScannerError = ScannerError;
exports.default = Scanner;
exports.eatPair = eatPair;
exports.eatQuoted = eatQuoted;
exports.isAlpha = isAlpha;
exports.isAlphaNumeric = isAlphaNumeric;
exports.isAlphaNumericWord = isAlphaNumericWord;
exports.isAlphaWord = isAlphaWord;
exports.isNumber = isNumber;
exports.isQuote = isQuote;
exports.isSpace = isSpace;
exports.isUmlaut = isUmlaut;
exports.isWhiteSpace = isWhiteSpace;
//# sourceMappingURL=scanner.cjs.map
