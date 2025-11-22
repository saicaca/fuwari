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
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.doRename = doRename;
    function doRename(document, position, newName, htmlDocument) {
        const offset = document.offsetAt(position);
        const node = htmlDocument.findNodeAt(offset);
        if (!node.tag) {
            return null;
        }
        if (!isWithinTagRange(node, offset, node.tag)) {
            return null;
        }
        const edits = [];
        const startTagRange = {
            start: document.positionAt(node.start + '<'.length),
            end: document.positionAt(node.start + '<'.length + node.tag.length)
        };
        edits.push({
            range: startTagRange,
            newText: newName
        });
        if (node.endTagStart) {
            const endTagRange = {
                start: document.positionAt(node.endTagStart + '</'.length),
                end: document.positionAt(node.endTagStart + '</'.length + node.tag.length)
            };
            edits.push({
                range: endTagRange,
                newText: newName
            });
        }
        const changes = {
            [document.uri.toString()]: edits
        };
        return {
            changes
        };
    }
    function toLocString(p) {
        return `(${p.line}, ${p.character})`;
    }
    function isWithinTagRange(node, offset, nodeTag) {
        // Self-closing tag
        if (node.endTagStart) {
            if (node.endTagStart + '</'.length <= offset && offset <= node.endTagStart + '</'.length + nodeTag.length) {
                return true;
            }
        }
        return node.start + '<'.length <= offset && offset <= node.start + '<'.length + nodeTag.length;
    }
});
