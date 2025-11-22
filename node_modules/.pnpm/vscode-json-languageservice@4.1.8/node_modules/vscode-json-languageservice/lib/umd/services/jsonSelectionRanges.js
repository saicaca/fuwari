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
        define(["require", "exports", "../jsonLanguageTypes", "jsonc-parser"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSelectionRanges = void 0;
    var jsonLanguageTypes_1 = require("../jsonLanguageTypes");
    var jsonc_parser_1 = require("jsonc-parser");
    function getSelectionRanges(document, positions, doc) {
        function getSelectionRange(position) {
            var offset = document.offsetAt(position);
            var node = doc.getNodeFromOffset(offset, true);
            var result = [];
            while (node) {
                switch (node.type) {
                    case 'string':
                    case 'object':
                    case 'array':
                        // range without ", [ or {
                        var cStart = node.offset + 1, cEnd = node.offset + node.length - 1;
                        if (cStart < cEnd && offset >= cStart && offset <= cEnd) {
                            result.push(newRange(cStart, cEnd));
                        }
                        result.push(newRange(node.offset, node.offset + node.length));
                        break;
                    case 'number':
                    case 'boolean':
                    case 'null':
                    case 'property':
                        result.push(newRange(node.offset, node.offset + node.length));
                        break;
                }
                if (node.type === 'property' || node.parent && node.parent.type === 'array') {
                    var afterCommaOffset = getOffsetAfterNextToken(node.offset + node.length, 5 /* CommaToken */);
                    if (afterCommaOffset !== -1) {
                        result.push(newRange(node.offset, afterCommaOffset));
                    }
                }
                node = node.parent;
            }
            var current = undefined;
            for (var index = result.length - 1; index >= 0; index--) {
                current = jsonLanguageTypes_1.SelectionRange.create(result[index], current);
            }
            if (!current) {
                current = jsonLanguageTypes_1.SelectionRange.create(jsonLanguageTypes_1.Range.create(position, position));
            }
            return current;
        }
        function newRange(start, end) {
            return jsonLanguageTypes_1.Range.create(document.positionAt(start), document.positionAt(end));
        }
        var scanner = jsonc_parser_1.createScanner(document.getText(), true);
        function getOffsetAfterNextToken(offset, expectedToken) {
            scanner.setPosition(offset);
            var token = scanner.scan();
            if (token === expectedToken) {
                return scanner.getTokenOffset() + scanner.getTokenLength();
            }
            return -1;
        }
        return positions.map(getSelectionRange);
    }
    exports.getSelectionRanges = getSelectionRanges;
});
