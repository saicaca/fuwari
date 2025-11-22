(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "vscode-languageserver-types", "../parser/yaml-documents"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSelectionRanges = void 0;
    const vscode_languageserver_types_1 = require("vscode-languageserver-types");
    const yaml_documents_1 = require("../parser/yaml-documents");
    function getSelectionRanges(document, positions) {
        const doc = yaml_documents_1.yamlDocumentsCache.getYamlDocument(document);
        return positions.map((position) => {
            const ranges = getRanges(position);
            let current;
            for (const range of ranges) {
                current = vscode_languageserver_types_1.SelectionRange.create(range, current);
            }
            return current ?? vscode_languageserver_types_1.SelectionRange.create({ start: position, end: position });
        });
        function getRanges(position) {
            const offset = document.offsetAt(position);
            const result = [];
            for (const ymlDoc of doc.documents) {
                let currentNode;
                let overrideStartOffset;
                ymlDoc.visit((node) => {
                    const endOffset = node.offset + node.length;
                    // Skip if end offset doesn't even reach cursor position
                    if (endOffset < offset) {
                        return true;
                    }
                    // Skip if we're ending at new line
                    // times:
                    //   - second: 1
                    //     millisecond: 10
                    // | - second: 2
                    // ↑   millisecond: 0
                    // (| is actually part of { second: 1, millisecond: 10 })
                    // \r\n doesn't matter here
                    if (getTextFromOffsets(endOffset - 1, endOffset) === '\n') {
                        if (endOffset - 1 < offset) {
                            return true;
                        }
                    }
                    let startOffset = node.offset;
                    if (startOffset > offset) {
                        // Recheck start offset for some special cases
                        const newOffset = getStartOffsetForSpecialCases(node, position);
                        if (!newOffset || newOffset > offset) {
                            return true;
                        }
                        startOffset = newOffset;
                    }
                    // Allow equal for children to override
                    if (!currentNode || startOffset >= currentNode.offset) {
                        currentNode = node;
                        overrideStartOffset = startOffset;
                    }
                    return true;
                });
                while (currentNode) {
                    const startOffset = overrideStartOffset ?? currentNode.offset;
                    const endOffset = currentNode.offset + currentNode.length;
                    const range = {
                        start: document.positionAt(startOffset),
                        end: document.positionAt(endOffset),
                    };
                    const text = document.getText(range);
                    const trimmedText = trimEndNewLine(text);
                    const trimmedEndOffset = startOffset + trimmedText.length;
                    if (trimmedEndOffset >= offset) {
                        range.end = document.positionAt(trimmedEndOffset);
                    }
                    // Add a jump between '' "" {} []
                    const isSurroundedBy = (startCharacter, endCharacter) => {
                        return trimmedText.startsWith(startCharacter) && trimmedText.endsWith(endCharacter || startCharacter);
                    };
                    if ((currentNode.type === 'string' && (isSurroundedBy("'") || isSurroundedBy('"'))) ||
                        (currentNode.type === 'object' && isSurroundedBy('{', '}')) ||
                        (currentNode.type === 'array' && isSurroundedBy('[', ']'))) {
                        result.push({
                            start: document.positionAt(startOffset + 1),
                            end: document.positionAt(endOffset - 1),
                        });
                    }
                    result.push(range);
                    currentNode = currentNode.parent;
                    overrideStartOffset = undefined;
                }
                // A position can't be in multiple documents
                if (result.length > 0) {
                    break;
                }
            }
            return result.reverse();
        }
        function getStartOffsetForSpecialCases(node, position) {
            const nodeStartPosition = document.positionAt(node.offset);
            if (nodeStartPosition.line !== position.line) {
                return;
            }
            if (node.parent?.type === 'array') {
                // array:
                //   - value
                //    ↑
                if (getTextFromOffsets(node.offset - 2, node.offset) === '- ') {
                    return node.offset - 2;
                }
            }
            if (node.type === 'array' || node.type === 'object') {
                // array:
                //   - value
                // ↑
                const lineBeginning = { line: nodeStartPosition.line, character: 0 };
                const text = document.getText({ start: lineBeginning, end: nodeStartPosition });
                if (text.trim().length === 0) {
                    return document.offsetAt(lineBeginning);
                }
            }
        }
        function getTextFromOffsets(startOffset, endOffset) {
            return document.getText({
                start: document.positionAt(startOffset),
                end: document.positionAt(endOffset),
            });
        }
    }
    exports.getSelectionRanges = getSelectionRanges;
    function trimEndNewLine(str) {
        if (str.endsWith('\r\n')) {
            return str.substring(0, str.length - 2);
        }
        if (str.endsWith('\n')) {
            return str.substring(0, str.length - 1);
        }
        return str;
    }
});
//# sourceMappingURL=yamlSelectionRanges.js.map