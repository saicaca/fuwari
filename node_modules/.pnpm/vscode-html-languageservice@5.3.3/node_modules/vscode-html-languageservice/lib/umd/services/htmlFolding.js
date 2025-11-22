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
        define(["require", "exports", "../htmlLanguageTypes", "../parser/htmlScanner"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTMLFolding = void 0;
    const htmlLanguageTypes_1 = require("../htmlLanguageTypes");
    const htmlScanner_1 = require("../parser/htmlScanner");
    class HTMLFolding {
        constructor(dataManager) {
            this.dataManager = dataManager;
        }
        limitRanges(ranges, rangeLimit) {
            ranges = ranges.sort((r1, r2) => {
                let diff = r1.startLine - r2.startLine;
                if (diff === 0) {
                    diff = r1.endLine - r2.endLine;
                }
                return diff;
            });
            // compute each range's nesting level in 'nestingLevels'.
            // count the number of ranges for each level in 'nestingLevelCounts'
            let top = void 0;
            const previous = [];
            const nestingLevels = [];
            const nestingLevelCounts = [];
            const setNestingLevel = (index, level) => {
                nestingLevels[index] = level;
                if (level < 30) {
                    nestingLevelCounts[level] = (nestingLevelCounts[level] || 0) + 1;
                }
            };
            // compute nesting levels and sanitize
            for (let i = 0; i < ranges.length; i++) {
                const entry = ranges[i];
                if (!top) {
                    top = entry;
                    setNestingLevel(i, 0);
                }
                else {
                    if (entry.startLine > top.startLine) {
                        if (entry.endLine <= top.endLine) {
                            previous.push(top);
                            top = entry;
                            setNestingLevel(i, previous.length);
                        }
                        else if (entry.startLine > top.endLine) {
                            do {
                                top = previous.pop();
                            } while (top && entry.startLine > top.endLine);
                            if (top) {
                                previous.push(top);
                            }
                            top = entry;
                            setNestingLevel(i, previous.length);
                        }
                    }
                }
            }
            let entries = 0;
            let maxLevel = 0;
            for (let i = 0; i < nestingLevelCounts.length; i++) {
                const n = nestingLevelCounts[i];
                if (n) {
                    if (n + entries > rangeLimit) {
                        maxLevel = i;
                        break;
                    }
                    entries += n;
                }
            }
            const result = [];
            for (let i = 0; i < ranges.length; i++) {
                const level = nestingLevels[i];
                if (typeof level === 'number') {
                    if (level < maxLevel || (level === maxLevel && entries++ < rangeLimit)) {
                        result.push(ranges[i]);
                    }
                }
            }
            return result;
        }
        getFoldingRanges(document, context) {
            const scanner = (0, htmlScanner_1.createScanner)(document.getText());
            let token = scanner.scan();
            const ranges = [];
            const stack = [];
            let lastTagName = null;
            let prevStart = -1;
            let voidElements;
            function addRange(range) {
                ranges.push(range);
                prevStart = range.startLine;
            }
            while (token !== htmlLanguageTypes_1.TokenType.EOS) {
                switch (token) {
                    case htmlLanguageTypes_1.TokenType.StartTag: {
                        const tagName = scanner.getTokenText();
                        const startLine = document.positionAt(scanner.getTokenOffset()).line;
                        stack.push({ startLine, tagName });
                        lastTagName = tagName;
                        break;
                    }
                    case htmlLanguageTypes_1.TokenType.EndTag: {
                        lastTagName = scanner.getTokenText();
                        break;
                    }
                    case htmlLanguageTypes_1.TokenType.StartTagClose:
                        if (!lastTagName) {
                            break;
                        }
                        voidElements ?? (voidElements = this.dataManager.getVoidElements(document.languageId));
                        if (!this.dataManager.isVoidElement(lastTagName, voidElements)) {
                            break;
                        }
                    // fallthrough
                    case htmlLanguageTypes_1.TokenType.EndTagClose:
                    case htmlLanguageTypes_1.TokenType.StartTagSelfClose: {
                        let i = stack.length - 1;
                        while (i >= 0 && stack[i].tagName !== lastTagName) {
                            i--;
                        }
                        if (i >= 0) {
                            const stackElement = stack[i];
                            stack.length = i;
                            const line = document.positionAt(scanner.getTokenOffset()).line;
                            const startLine = stackElement.startLine;
                            const endLine = line - 1;
                            if (endLine > startLine && prevStart !== startLine) {
                                addRange({ startLine, endLine });
                            }
                        }
                        break;
                    }
                    case htmlLanguageTypes_1.TokenType.Comment: {
                        let startLine = document.positionAt(scanner.getTokenOffset()).line;
                        const text = scanner.getTokenText();
                        const m = text.match(/^\s*#(region\b)|(endregion\b)/);
                        if (m) {
                            if (m[1]) { // start pattern match
                                stack.push({ startLine, tagName: '' }); // empty tagName marks region
                            }
                            else {
                                let i = stack.length - 1;
                                while (i >= 0 && stack[i].tagName.length) {
                                    i--;
                                }
                                if (i >= 0) {
                                    const stackElement = stack[i];
                                    stack.length = i;
                                    const endLine = startLine;
                                    startLine = stackElement.startLine;
                                    if (endLine > startLine && prevStart !== startLine) {
                                        addRange({ startLine, endLine, kind: htmlLanguageTypes_1.FoldingRangeKind.Region });
                                    }
                                }
                            }
                        }
                        else {
                            const endLine = document.positionAt(scanner.getTokenOffset() + scanner.getTokenLength()).line;
                            if (startLine < endLine) {
                                addRange({ startLine, endLine, kind: htmlLanguageTypes_1.FoldingRangeKind.Comment });
                            }
                        }
                        break;
                    }
                }
                token = scanner.scan();
            }
            const rangeLimit = context && context.rangeLimit || Number.MAX_VALUE;
            if (ranges.length > rangeLimit) {
                return this.limitRanges(ranges, rangeLimit);
            }
            return ranges;
        }
    }
    exports.HTMLFolding = HTMLFolding;
});
