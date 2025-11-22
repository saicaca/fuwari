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
        define(["require", "exports", "../parser/htmlScanner", "../utils/strings", "vscode-uri", "../htmlLanguageTypes"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTMLDocumentLinks = void 0;
    const htmlScanner_1 = require("../parser/htmlScanner");
    const strings = require("../utils/strings");
    const vscode_uri_1 = require("vscode-uri");
    const htmlLanguageTypes_1 = require("../htmlLanguageTypes");
    function normalizeRef(url) {
        const first = url[0];
        const last = url[url.length - 1];
        if (first === last && (first === '\'' || first === '\"')) {
            url = url.substring(1, url.length - 1);
        }
        return url;
    }
    function validateRef(url, languageId) {
        if (!url.length) {
            return false;
        }
        if (languageId === 'handlebars' && /{{|}}/.test(url)) {
            return false;
        }
        return /\b(w[\w\d+.-]*:\/\/)?[^\s()<>]+(?:\([\w\d]+\)|([^[:punct:]\s]|\/?))/.test(url);
    }
    function getWorkspaceUrl(documentUri, tokenContent, documentContext, base) {
        if (/^\s*javascript\:/i.test(tokenContent) || /[\n\r]/.test(tokenContent)) {
            return undefined;
        }
        tokenContent = tokenContent.replace(/^\s*/g, '');
        const match = tokenContent.match(/^(\w[\w\d+.-]*):/);
        if (match) {
            // Absolute link that needs no treatment
            const schema = match[1].toLowerCase();
            if (schema === 'http' || schema === 'https' || schema === 'file') {
                return tokenContent;
            }
            return undefined;
        }
        if (/^\#/i.test(tokenContent)) {
            return documentUri + tokenContent;
        }
        if (/^\/\//i.test(tokenContent)) {
            // Absolute link (that does not name the protocol)
            const pickedScheme = strings.startsWith(documentUri, 'https://') ? 'https' : 'http';
            return pickedScheme + ':' + tokenContent.replace(/^\s*/g, '');
        }
        if (documentContext) {
            return documentContext.resolveReference(tokenContent, base || documentUri);
        }
        return tokenContent;
    }
    function createLink(document, documentContext, attributeValue, startOffset, endOffset, base) {
        const tokenContent = normalizeRef(attributeValue);
        if (!validateRef(tokenContent, document.languageId)) {
            return undefined;
        }
        if (tokenContent.length < attributeValue.length) {
            startOffset++;
            endOffset--;
        }
        const workspaceUrl = getWorkspaceUrl(document.uri, tokenContent, documentContext, base);
        if (!workspaceUrl) {
            return undefined;
        }
        const target = validateAndCleanURI(workspaceUrl, document);
        return {
            range: htmlLanguageTypes_1.Range.create(document.positionAt(startOffset), document.positionAt(endOffset)),
            target
        };
    }
    const _hash = '#'.charCodeAt(0);
    function validateAndCleanURI(uriStr, document) {
        try {
            let uri = vscode_uri_1.URI.parse(uriStr);
            if (uri.scheme === 'file' && uri.query) {
                // see https://github.com/microsoft/vscode/issues/194577 & https://github.com/microsoft/vscode/issues/206238
                uri = uri.with({ query: null });
                uriStr = uri.toString(/* skipEncodig*/ true);
            }
            if (uri.scheme === 'file' && uri.fragment && !(uriStr.startsWith(document.uri) && uriStr.charCodeAt(document.uri.length) === _hash)) {
                return uri.with({ fragment: null }).toString(/* skipEncodig*/ true);
            }
            return uriStr;
        }
        catch (e) {
            return undefined;
        }
    }
    class HTMLDocumentLinks {
        constructor(dataManager) {
            this.dataManager = dataManager;
        }
        findDocumentLinks(document, documentContext) {
            const newLinks = [];
            const scanner = (0, htmlScanner_1.createScanner)(document.getText(), 0);
            let token = scanner.scan();
            let lastAttributeName = undefined;
            let lastTagName = undefined;
            let afterBase = false;
            let base = void 0;
            const idLocations = {};
            while (token !== htmlLanguageTypes_1.TokenType.EOS) {
                switch (token) {
                    case htmlLanguageTypes_1.TokenType.StartTag:
                        lastTagName = scanner.getTokenText().toLowerCase();
                        if (!base) {
                            afterBase = lastTagName === 'base';
                        }
                        break;
                    case htmlLanguageTypes_1.TokenType.AttributeName:
                        lastAttributeName = scanner.getTokenText().toLowerCase();
                        break;
                    case htmlLanguageTypes_1.TokenType.AttributeValue:
                        if (lastTagName && lastAttributeName && this.dataManager.isPathAttribute(lastTagName, lastAttributeName)) {
                            const attributeValue = scanner.getTokenText();
                            if (!afterBase) { // don't highlight the base link itself
                                const link = createLink(document, documentContext, attributeValue, scanner.getTokenOffset(), scanner.getTokenEnd(), base);
                                if (link) {
                                    newLinks.push(link);
                                }
                            }
                            if (afterBase && typeof base === 'undefined') {
                                base = normalizeRef(attributeValue);
                                if (base && documentContext) {
                                    base = documentContext.resolveReference(base, document.uri);
                                }
                            }
                            afterBase = false;
                            lastAttributeName = undefined;
                        }
                        else if (lastAttributeName === 'id') {
                            const id = normalizeRef(scanner.getTokenText());
                            idLocations[id] = scanner.getTokenOffset();
                        }
                        break;
                }
                token = scanner.scan();
            }
            // change local links with ids to actual positions
            for (const link of newLinks) {
                const localWithHash = document.uri + '#';
                if (link.target && strings.startsWith(link.target, localWithHash)) {
                    const target = link.target.substring(localWithHash.length);
                    const offset = idLocations[target];
                    if (offset !== undefined) {
                        const pos = document.positionAt(offset);
                        link.target = `${localWithHash}${pos.line + 1},${pos.character + 1}`;
                    }
                    else {
                        link.target = document.uri;
                    }
                }
            }
            return newLinks;
        }
    }
    exports.HTMLDocumentLinks = HTMLDocumentLinks;
});
