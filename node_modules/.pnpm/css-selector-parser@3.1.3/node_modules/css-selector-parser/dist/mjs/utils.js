export function isIdentStart(c) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '-' || c === '_' || c === '\\' || c >= '\u00a0';
}
export function isIdent(c) {
    return ((c >= 'a' && c <= 'z') ||
        (c >= 'A' && c <= 'Z') ||
        (c >= '0' && c <= '9') ||
        c === '-' ||
        c === '_' ||
        c >= '\u00a0');
}
export function isHex(c) {
    return (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F') || (c >= '0' && c <= '9');
}
export var identEscapeChars = {
    '!': true,
    '"': true,
    '#': true,
    $: true,
    '%': true,
    '&': true,
    "'": true,
    '(': true,
    ')': true,
    '*': true,
    '+': true,
    ',': true,
    '.': true,
    '/': true,
    ';': true,
    '<': true,
    '=': true,
    '>': true,
    '?': true,
    '@': true,
    '[': true,
    '\\': true,
    ']': true,
    '^': true,
    '`': true,
    '{': true,
    '|': true,
    '}': true,
    '~': true
};
export var stringRenderEscapeChars = {
    '\n': true,
    '\r': true,
    '\t': true,
    '\f': true,
    '\v': true
};
export var whitespaceChars = {
    ' ': true,
    '\t': true,
    '\n': true,
    '\r': true,
    '\f': true
};
export var quoteChars = {
    '"': true,
    "'": true
};
export var digitsChars = {
    0: true,
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
    9: true
};
export var maxHexLength = 6;
export function escapeIdentifier(s) {
    var len = s.length;
    var result = '';
    var i = 0;
    while (i < len) {
        var chr = s.charAt(i);
        if (identEscapeChars[chr] || (chr === '-' && i === 1 && s.charAt(0) === '-')) {
            result += '\\' + chr;
        }
        else {
            if (chr === '-' ||
                chr === '_' ||
                (chr >= 'A' && chr <= 'Z') ||
                (chr >= 'a' && chr <= 'z') ||
                (chr >= '0' && chr <= '9' && i !== 0 && !(i === 1 && s.charAt(0) === '-'))) {
                result += chr;
            }
            else {
                var charCode = chr.charCodeAt(0);
                if ((charCode & 0xf800) === 0xd800) {
                    var extraCharCode = s.charCodeAt(i++);
                    if ((charCode & 0xfc00) !== 0xd800 || (extraCharCode & 0xfc00) !== 0xdc00) {
                        throw Error('UCS-2(decode): illegal sequence');
                    }
                    charCode = ((charCode & 0x3ff) << 10) + (extraCharCode & 0x3ff) + 0x10000;
                }
                result += '\\' + charCode.toString(16) + ' ';
            }
        }
        i++;
    }
    return result.trim();
}
export function escapeString(s) {
    var len = s.length;
    var result = '';
    var i = 0;
    while (i < len) {
        var chr = s.charAt(i);
        if (chr === '"') {
            chr = '\\"';
        }
        else if (chr === '\\') {
            chr = '\\\\';
        }
        else if (stringRenderEscapeChars[chr]) {
            chr = '\\' + chr.charCodeAt(0).toString(16) + (i === len - 1 ? '' : ' ');
        }
        result += chr;
        i++;
    }
    return "\"".concat(result, "\"");
}
