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
        define(["require", "exports", "../htmlLanguageTypes"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findLinkedEditingRanges = findLinkedEditingRanges;
    const htmlLanguageTypes_1 = require("../htmlLanguageTypes");
    function findLinkedEditingRanges(document, position, htmlDocument) {
        const offset = document.offsetAt(position);
        const node = htmlDocument.findNodeAt(offset);
        const tagLength = node.tag ? node.tag.length : 0;
        if (!node.endTagStart) {
            return null;
        }
        if (
        // Within open tag, compute close tag
        (node.start + '<'.length <= offset && offset <= node.start + '<'.length + tagLength) ||
            // Within closing tag, compute open tag
            node.endTagStart + '</'.length <= offset && offset <= node.endTagStart + '</'.length + tagLength) {
            return [
                htmlLanguageTypes_1.Range.create(document.positionAt(node.start + '<'.length), document.positionAt(node.start + '<'.length + tagLength)),
                htmlLanguageTypes_1.Range.create(document.positionAt(node.endTagStart + '</'.length), document.positionAt(node.endTagStart + '</'.length + tagLength))
            ];
        }
        return null;
    }
});
