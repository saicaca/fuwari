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
        define(["require", "exports", "../parser/htmlScanner", "../htmlLanguageTypes", "../utils/object", "../languageFacts/dataProvider", "../parser/htmlEntities", "../utils/strings", "@vscode/l10n"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTMLHover = void 0;
    const htmlScanner_1 = require("../parser/htmlScanner");
    const htmlLanguageTypes_1 = require("../htmlLanguageTypes");
    const object_1 = require("../utils/object");
    const dataProvider_1 = require("../languageFacts/dataProvider");
    const htmlEntities_1 = require("../parser/htmlEntities");
    const strings_1 = require("../utils/strings");
    const l10n = require("@vscode/l10n");
    class HTMLHover {
        constructor(lsOptions, dataManager) {
            this.lsOptions = lsOptions;
            this.dataManager = dataManager;
        }
        doHover(document, position, htmlDocument, options) {
            const convertContents = this.convertContents.bind(this);
            const doesSupportMarkdown = this.doesSupportMarkdown();
            const offset = document.offsetAt(position);
            const node = htmlDocument.findNodeAt(offset);
            const text = document.getText();
            if (!node || !node.tag) {
                return null;
            }
            const dataProviders = this.dataManager.getDataProviders().filter(p => p.isApplicable(document.languageId));
            function getTagHover(currTag, range, open) {
                for (const provider of dataProviders) {
                    let hover = null;
                    provider.provideTags().forEach(tag => {
                        if (tag.name.toLowerCase() === currTag.toLowerCase()) {
                            let markupContent = (0, dataProvider_1.generateDocumentation)(tag, options, doesSupportMarkdown);
                            if (!markupContent) {
                                markupContent = {
                                    kind: doesSupportMarkdown ? 'markdown' : 'plaintext',
                                    value: ''
                                };
                            }
                            hover = { contents: markupContent, range };
                        }
                    });
                    if (hover) {
                        hover.contents = convertContents(hover.contents);
                        return hover;
                    }
                }
                return null;
            }
            function getAttrHover(currTag, currAttr, range) {
                for (const provider of dataProviders) {
                    let hover = null;
                    provider.provideAttributes(currTag).forEach(attr => {
                        if (currAttr === attr.name && attr.description) {
                            const contentsDoc = (0, dataProvider_1.generateDocumentation)(attr, options, doesSupportMarkdown);
                            if (contentsDoc) {
                                hover = { contents: contentsDoc, range };
                            }
                            else {
                                hover = null;
                            }
                        }
                    });
                    if (hover) {
                        hover.contents = convertContents(hover.contents);
                        return hover;
                    }
                }
                return null;
            }
            function getAttrValueHover(currTag, currAttr, currAttrValue, range) {
                for (const provider of dataProviders) {
                    let hover = null;
                    provider.provideValues(currTag, currAttr).forEach(attrValue => {
                        if (currAttrValue === attrValue.name && attrValue.description) {
                            const contentsDoc = (0, dataProvider_1.generateDocumentation)(attrValue, options, doesSupportMarkdown);
                            if (contentsDoc) {
                                hover = { contents: contentsDoc, range };
                            }
                            else {
                                hover = null;
                            }
                        }
                    });
                    if (hover) {
                        hover.contents = convertContents(hover.contents);
                        return hover;
                    }
                }
                return null;
            }
            function getEntityHover(text, range) {
                let currEntity = filterEntity(text);
                for (const entity in htmlEntities_1.entities) {
                    let hover = null;
                    const label = '&' + entity;
                    if (currEntity === label) {
                        let code = htmlEntities_1.entities[entity].charCodeAt(0).toString(16).toUpperCase();
                        let hex = 'U+';
                        if (code.length < 4) {
                            const zeroes = 4 - code.length;
                            let k = 0;
                            while (k < zeroes) {
                                hex += '0';
                                k += 1;
                            }
                        }
                        hex += code;
                        const contentsDoc = l10n.t('Character entity representing \'{0}\', unicode equivalent \'{1}\'', htmlEntities_1.entities[entity], hex);
                        if (contentsDoc) {
                            hover = { contents: contentsDoc, range };
                        }
                        else {
                            hover = null;
                        }
                    }
                    if (hover) {
                        hover.contents = convertContents(hover.contents);
                        return hover;
                    }
                }
                return null;
            }
            function getTagNameRange(tokenType, startOffset) {
                const scanner = (0, htmlScanner_1.createScanner)(document.getText(), startOffset);
                let token = scanner.scan();
                while (token !== htmlLanguageTypes_1.TokenType.EOS && (scanner.getTokenEnd() < offset || scanner.getTokenEnd() === offset && token !== tokenType)) {
                    token = scanner.scan();
                }
                if (token === tokenType && offset <= scanner.getTokenEnd()) {
                    return { start: document.positionAt(scanner.getTokenOffset()), end: document.positionAt(scanner.getTokenEnd()) };
                }
                return null;
            }
            function getEntityRange() {
                let k = offset - 1;
                let characterStart = position.character;
                while (k >= 0 && (0, strings_1.isLetterOrDigit)(text, k)) {
                    k--;
                    characterStart--;
                }
                let n = k + 1;
                let characterEnd = characterStart;
                while ((0, strings_1.isLetterOrDigit)(text, n)) {
                    n++;
                    characterEnd++;
                }
                if (k >= 0 && text[k] === '&') {
                    let range = null;
                    if (text[n] === ';') {
                        range = htmlLanguageTypes_1.Range.create(htmlLanguageTypes_1.Position.create(position.line, characterStart), htmlLanguageTypes_1.Position.create(position.line, characterEnd + 1));
                    }
                    else {
                        range = htmlLanguageTypes_1.Range.create(htmlLanguageTypes_1.Position.create(position.line, characterStart), htmlLanguageTypes_1.Position.create(position.line, characterEnd));
                    }
                    return range;
                }
                return null;
            }
            function filterEntity(text) {
                let k = offset - 1;
                let newText = '&';
                while (k >= 0 && (0, strings_1.isLetterOrDigit)(text, k)) {
                    k--;
                }
                k = k + 1;
                while ((0, strings_1.isLetterOrDigit)(text, k)) {
                    newText += text[k];
                    k += 1;
                }
                newText += ';';
                return newText;
            }
            if (node.endTagStart && offset >= node.endTagStart) {
                const tagRange = getTagNameRange(htmlLanguageTypes_1.TokenType.EndTag, node.endTagStart);
                if (tagRange) {
                    return getTagHover(node.tag, tagRange, false);
                }
                return null;
            }
            const tagRange = getTagNameRange(htmlLanguageTypes_1.TokenType.StartTag, node.start);
            if (tagRange) {
                return getTagHover(node.tag, tagRange, true);
            }
            const attrRange = getTagNameRange(htmlLanguageTypes_1.TokenType.AttributeName, node.start);
            if (attrRange) {
                const tag = node.tag;
                const attr = document.getText(attrRange);
                return getAttrHover(tag, attr, attrRange);
            }
            const entityRange = getEntityRange();
            if (entityRange) {
                return getEntityHover(text, entityRange);
            }
            function scanAttrAndAttrValue(nodeStart, attrValueStart) {
                const scanner = (0, htmlScanner_1.createScanner)(document.getText(), nodeStart);
                let token = scanner.scan();
                let prevAttr = undefined;
                while (token !== htmlLanguageTypes_1.TokenType.EOS && (scanner.getTokenEnd() <= attrValueStart)) {
                    token = scanner.scan();
                    if (token === htmlLanguageTypes_1.TokenType.AttributeName) {
                        prevAttr = scanner.getTokenText();
                    }
                }
                return prevAttr;
            }
            const attrValueRange = getTagNameRange(htmlLanguageTypes_1.TokenType.AttributeValue, node.start);
            if (attrValueRange) {
                const tag = node.tag;
                const attrValue = trimQuotes(document.getText(attrValueRange));
                const matchAttr = scanAttrAndAttrValue(node.start, document.offsetAt(attrValueRange.start));
                if (matchAttr) {
                    return getAttrValueHover(tag, matchAttr, attrValue, attrValueRange);
                }
            }
            return null;
        }
        convertContents(contents) {
            if (!this.doesSupportMarkdown()) {
                if (typeof contents === 'string') {
                    return contents;
                }
                // MarkupContent
                else if ('kind' in contents) {
                    return {
                        kind: 'plaintext',
                        value: contents.value
                    };
                }
                // MarkedString[]
                else if (Array.isArray(contents)) {
                    contents.map(c => {
                        return typeof c === 'string' ? c : c.value;
                    });
                }
                // MarkedString
                else {
                    return contents.value;
                }
            }
            return contents;
        }
        doesSupportMarkdown() {
            if (!(0, object_1.isDefined)(this.supportsMarkdown)) {
                if (!(0, object_1.isDefined)(this.lsOptions.clientCapabilities)) {
                    this.supportsMarkdown = true;
                    return this.supportsMarkdown;
                }
                const contentFormat = this.lsOptions.clientCapabilities?.textDocument?.hover?.contentFormat;
                this.supportsMarkdown = Array.isArray(contentFormat) && contentFormat.indexOf(htmlLanguageTypes_1.MarkupKind.Markdown) !== -1;
            }
            return this.supportsMarkdown;
        }
    }
    exports.HTMLHover = HTMLHover;
    function trimQuotes(s) {
        if (s.length <= 1) {
            return s.replace(/['"]/, ''); // CodeQL [SM02383] False positive: The string length is at most one, so we don't need the global flag.
        }
        if (s[0] === `'` || s[0] === `"`) {
            s = s.slice(1);
        }
        if (s[s.length - 1] === `'` || s[s.length - 1] === `"`) {
            s = s.slice(0, -1);
        }
        return s;
    }
});
