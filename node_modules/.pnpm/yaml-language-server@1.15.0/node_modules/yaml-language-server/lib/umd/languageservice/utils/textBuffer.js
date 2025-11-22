/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "vscode-languageserver-types"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextBuffer = void 0;
    const vscode_languageserver_types_1 = require("vscode-languageserver-types");
    class TextBuffer {
        constructor(doc) {
            this.doc = doc;
        }
        getLineCount() {
            return this.doc.lineCount;
        }
        getLineLength(lineNumber) {
            const lineOffsets = this.doc.getLineOffsets();
            if (lineNumber >= lineOffsets.length) {
                return this.doc.getText().length;
            }
            else if (lineNumber < 0) {
                return 0;
            }
            const nextLineOffset = lineNumber + 1 < lineOffsets.length ? lineOffsets[lineNumber + 1] : this.doc.getText().length;
            return nextLineOffset - lineOffsets[lineNumber];
        }
        getLineContent(lineNumber) {
            const lineOffsets = this.doc.getLineOffsets();
            if (lineNumber >= lineOffsets.length) {
                return this.doc.getText();
            }
            else if (lineNumber < 0) {
                return '';
            }
            const nextLineOffset = lineNumber + 1 < lineOffsets.length ? lineOffsets[lineNumber + 1] : this.doc.getText().length;
            return this.doc.getText().substring(lineOffsets[lineNumber], nextLineOffset);
        }
        getLineCharCode(lineNumber, index) {
            return this.doc.getText(vscode_languageserver_types_1.Range.create(lineNumber - 1, index, lineNumber - 1, index + 1)).charCodeAt(0);
        }
        getText(range) {
            return this.doc.getText(range);
        }
        getPosition(offest) {
            return this.doc.positionAt(offest);
        }
    }
    exports.TextBuffer = TextBuffer;
});
//# sourceMappingURL=textBuffer.js.map