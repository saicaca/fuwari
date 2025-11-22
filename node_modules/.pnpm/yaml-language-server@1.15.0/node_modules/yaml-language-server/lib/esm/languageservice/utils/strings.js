/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export function startsWith(haystack, needle) {
    if (haystack.length < needle.length) {
        return false;
    }
    for (let i = 0; i < needle.length; i++) {
        if (haystack[i] !== needle[i]) {
            return false;
        }
    }
    return true;
}
/**
 * Determines if haystack ends with needle.
 */
export function endsWith(haystack, needle) {
    const diff = haystack.length - needle.length;
    if (diff > 0) {
        return haystack.lastIndexOf(needle) === diff;
    }
    else if (diff === 0) {
        return haystack === needle;
    }
    else {
        return false;
    }
}
export function convertSimple2RegExp(pattern) {
    const match = pattern.match(new RegExp('^/(.*?)/([gimy]*)$'));
    return match ? convertRegexString2RegExp(match[1], match[2]) : convertGlobalPattern2RegExp(pattern);
}
function convertGlobalPattern2RegExp(pattern) {
    return new RegExp(pattern.replace(/[-\\{}+?|^$.,[\]()#\s]/g, '\\$&').replace(/[*]/g, '.*') + '$');
}
function convertRegexString2RegExp(pattern, flag) {
    return new RegExp(pattern, flag);
}
export function convertSimple2RegExpPattern(pattern) {
    return pattern.replace(/[-\\{}+?|^$.,[\]()#\s]/g, '\\$&').replace(/[*]/g, '.*');
}
export function getIndentation(lineContent, position) {
    if (lineContent.length < position) {
        return 0;
    }
    for (let i = 0; i < position; i++) {
        const char = lineContent.charCodeAt(i);
        if (char !== 32 /* CharCode.Space */ && char !== 9 /* CharCode.Tab */) {
            return i;
        }
    }
    // assuming that current position is indentation
    return position;
}
export function safeCreateUnicodeRegExp(pattern) {
    // fall back to regular regexp if we cannot create Unicode one
    try {
        return new RegExp(pattern, 'u');
    }
    catch (ignore) {
        return new RegExp(pattern);
    }
}
export function getFirstNonWhitespaceCharacterAfterOffset(str, offset) {
    offset++;
    for (let i = offset; i < str.length; i++) {
        const char = str.charAt(i);
        if (char === ' ' || char === '\t') {
            offset++;
        }
        else {
            return offset;
        }
    }
    return offset;
}
//# sourceMappingURL=strings.js.map