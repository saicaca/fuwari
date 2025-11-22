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
        define(["require", "exports", "../parser/htmlScanner", "../htmlLanguageTypes"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findDocumentHighlights = findDocumentHighlights;
    const htmlScanner_1 = require("../parser/htmlScanner");
    const htmlLanguageTypes_1 = require("../htmlLanguageTypes");
    function findDocumentHighlights(document, position, htmlDocument) {
        const offset = document.offsetAt(position);
        const node = htmlDocument.findNodeAt(offset);
        if (!node.tag) {
            return [];
        }
        const result = [];
        const startTagRange = getTagNameRange(htmlLanguageTypes_1.TokenType.StartTag, document, node.start);
        const endTagRange = typeof node.endTagStart === 'number' && getTagNameRange(htmlLanguageTypes_1.TokenType.EndTag, document, node.endTagStart);
        if (startTagRange && covers(startTagRange, position) || endTagRange && covers(endTagRange, position)) {
            if (startTagRange) {
                result.push({ kind: htmlLanguageTypes_1.DocumentHighlightKind.Read, range: startTagRange });
            }
            if (endTagRange) {
                result.push({ kind: htmlLanguageTypes_1.DocumentHighlightKind.Read, range: endTagRange });
            }
        }
        return result;
    }
    function isBeforeOrEqual(pos1, pos2) {
        return pos1.line < pos2.line || (pos1.line === pos2.line && pos1.character <= pos2.character);
    }
    function covers(range, position) {
        return isBeforeOrEqual(range.start, position) && isBeforeOrEqual(position, range.end);
    }
    function getTagNameRange(tokenType, document, startOffset) {
        const scanner = (0, htmlScanner_1.createScanner)(document.getText(), startOffset);
        let token = scanner.scan();
        while (token !== htmlLanguageTypes_1.TokenType.EOS && token !== tokenType) {
            token = scanner.scan();
        }
        if (token !== htmlLanguageTypes_1.TokenType.EOS) {
            return { start: document.positionAt(scanner.getTokenOffset()), end: document.positionAt(scanner.getTokenEnd()) };
        }
        return null;
    }
});
