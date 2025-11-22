/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../htmlLanguageTypes", "../beautify/beautify-html", "../utils/strings"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.format = format;
    const htmlLanguageTypes_1 = require("../htmlLanguageTypes");
    const beautify_html_1 = require("../beautify/beautify-html");
    const strings_1 = require("../utils/strings");
    function format(document, range, options) {
        let value = document.getText();
        let includesEnd = true;
        let initialIndentLevel = 0;
        const tabSize = options.tabSize || 4;
        if (range) {
            let startOffset = document.offsetAt(range.start);
            // include all leading whitespace iff at the beginning of the line
            let extendedStart = startOffset;
            while (extendedStart > 0 && isWhitespace(value, extendedStart - 1)) {
                extendedStart--;
            }
            if (extendedStart === 0 || isEOL(value, extendedStart - 1)) {
                startOffset = extendedStart;
            }
            else {
                // else keep at least one whitespace
                if (extendedStart < startOffset) {
                    startOffset = extendedStart + 1;
                }
            }
            // include all following whitespace until the end of the line
            let endOffset = document.offsetAt(range.end);
            let extendedEnd = endOffset;
            while (extendedEnd < value.length && isWhitespace(value, extendedEnd)) {
                extendedEnd++;
            }
            if (extendedEnd === value.length || isEOL(value, extendedEnd)) {
                endOffset = extendedEnd;
            }
            range = htmlLanguageTypes_1.Range.create(document.positionAt(startOffset), document.positionAt(endOffset));
            // Do not modify if substring starts in inside an element
            // Ending inside an element is fine as it doesn't cause formatting errors
            const firstHalf = value.substring(0, startOffset);
            if (new RegExp(/.*[<][^>]*$/).test(firstHalf)) {
                //return without modification
                value = value.substring(startOffset, endOffset);
                return [{
                        range: range,
                        newText: value
                    }];
            }
            includesEnd = endOffset === value.length;
            value = value.substring(startOffset, endOffset);
            if (startOffset !== 0) {
                const startOfLineOffset = document.offsetAt(htmlLanguageTypes_1.Position.create(range.start.line, 0));
                initialIndentLevel = computeIndentLevel(document.getText(), startOfLineOffset, options);
            }
        }
        else {
            range = htmlLanguageTypes_1.Range.create(htmlLanguageTypes_1.Position.create(0, 0), document.positionAt(value.length));
        }
        const htmlOptions = {
            indent_size: tabSize,
            indent_char: options.insertSpaces ? ' ' : '\t',
            indent_empty_lines: getFormatOption(options, 'indentEmptyLines', false),
            wrap_line_length: getFormatOption(options, 'wrapLineLength', 120),
            unformatted: getTagsFormatOption(options, 'unformatted', void 0),
            content_unformatted: getTagsFormatOption(options, 'contentUnformatted', void 0),
            indent_inner_html: getFormatOption(options, 'indentInnerHtml', false),
            preserve_newlines: getFormatOption(options, 'preserveNewLines', true),
            max_preserve_newlines: getFormatOption(options, 'maxPreserveNewLines', 32786),
            indent_handlebars: getFormatOption(options, 'indentHandlebars', false),
            end_with_newline: includesEnd && getFormatOption(options, 'endWithNewline', false),
            extra_liners: getTagsFormatOption(options, 'extraLiners', void 0),
            wrap_attributes: getFormatOption(options, 'wrapAttributes', 'auto'),
            wrap_attributes_indent_size: getFormatOption(options, 'wrapAttributesIndentSize', void 0),
            eol: '\n',
            indent_scripts: getFormatOption(options, 'indentScripts', 'normal'),
            templating: getTemplatingFormatOption(options, 'all'),
            unformatted_content_delimiter: getFormatOption(options, 'unformattedContentDelimiter', ''),
        };
        let result = (0, beautify_html_1.html_beautify)(trimLeft(value), htmlOptions);
        if (initialIndentLevel > 0) {
            const indent = options.insertSpaces ? (0, strings_1.repeat)(' ', tabSize * initialIndentLevel) : (0, strings_1.repeat)('\t', initialIndentLevel);
            result = result.split('\n').join('\n' + indent);
            if (range.start.character === 0) {
                result = indent + result; // keep the indent
            }
        }
        return [{
                range: range,
                newText: result
            }];
    }
    function trimLeft(str) {
        return str.replace(/^\s+/, '');
    }
    function getFormatOption(options, key, dflt) {
        if (options && options.hasOwnProperty(key)) {
            const value = options[key];
            if (value !== null) {
                return value;
            }
        }
        return dflt;
    }
    function getTagsFormatOption(options, key, dflt) {
        const list = getFormatOption(options, key, null);
        if (typeof list === 'string') {
            if (list.length > 0) {
                return list.split(',').map(t => t.trim().toLowerCase());
            }
            return [];
        }
        return dflt;
    }
    function getTemplatingFormatOption(options, dflt) {
        const value = getFormatOption(options, 'templating', dflt);
        if (value === true) {
            return ['auto'];
        }
        if (value === false || value === dflt || Array.isArray(value) === false) {
            return ['none'];
        }
        return value;
    }
    function computeIndentLevel(content, offset, options) {
        let i = offset;
        let nChars = 0;
        const tabSize = options.tabSize || 4;
        while (i < content.length) {
            const ch = content.charAt(i);
            if (ch === ' ') {
                nChars++;
            }
            else if (ch === '\t') {
                nChars += tabSize;
            }
            else {
                break;
            }
            i++;
        }
        return Math.floor(nChars / tabSize);
    }
    function isEOL(text, offset) {
        return '\r\n'.indexOf(text.charAt(offset)) !== -1;
    }
    function isWhitespace(text, offset) {
        return ' \t'.indexOf(text.charAt(offset)) !== -1;
    }
});
