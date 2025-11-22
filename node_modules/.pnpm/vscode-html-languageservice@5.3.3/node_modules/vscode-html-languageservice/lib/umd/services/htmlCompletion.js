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
        define(["require", "exports", "../parser/htmlScanner", "../htmlLanguageTypes", "../parser/htmlEntities", "@vscode/l10n", "../utils/strings", "../utils/object", "../languageFacts/dataProvider", "./pathCompletion"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTMLCompletion = void 0;
    const htmlScanner_1 = require("../parser/htmlScanner");
    const htmlLanguageTypes_1 = require("../htmlLanguageTypes");
    const htmlEntities_1 = require("../parser/htmlEntities");
    const l10n = require("@vscode/l10n");
    const strings_1 = require("../utils/strings");
    const object_1 = require("../utils/object");
    const dataProvider_1 = require("../languageFacts/dataProvider");
    const pathCompletion_1 = require("./pathCompletion");
    class HTMLCompletion {
        constructor(lsOptions, dataManager) {
            this.lsOptions = lsOptions;
            this.dataManager = dataManager;
            this.completionParticipants = [];
        }
        setCompletionParticipants(registeredCompletionParticipants) {
            this.completionParticipants = registeredCompletionParticipants || [];
        }
        async doComplete2(document, position, htmlDocument, documentContext, settings) {
            if (!this.lsOptions.fileSystemProvider || !this.lsOptions.fileSystemProvider.readDirectory) {
                return this.doComplete(document, position, htmlDocument, settings);
            }
            const participant = new pathCompletion_1.PathCompletionParticipant(this.dataManager, this.lsOptions.fileSystemProvider.readDirectory);
            const contributedParticipants = this.completionParticipants;
            this.completionParticipants = [participant].concat(contributedParticipants);
            const result = this.doComplete(document, position, htmlDocument, settings);
            try {
                const pathCompletionResult = await participant.computeCompletions(document, documentContext);
                return {
                    isIncomplete: result.isIncomplete || pathCompletionResult.isIncomplete,
                    items: pathCompletionResult.items.concat(result.items)
                };
            }
            finally {
                this.completionParticipants = contributedParticipants;
            }
        }
        doComplete(document, position, htmlDocument, settings) {
            const result = this._doComplete(document, position, htmlDocument, settings);
            return this.convertCompletionList(result);
        }
        _doComplete(document, position, htmlDocument, settings) {
            const result = {
                isIncomplete: false,
                items: []
            };
            const completionParticipants = this.completionParticipants;
            const dataProviders = this.dataManager.getDataProviders().filter(p => p.isApplicable(document.languageId) && (!settings || settings[p.getId()] !== false));
            const doesSupportMarkdown = this.doesSupportMarkdown();
            const text = document.getText();
            const offset = document.offsetAt(position);
            const node = htmlDocument.findNodeBefore(offset);
            if (!node) {
                return result;
            }
            const scanner = (0, htmlScanner_1.createScanner)(text, node.start);
            let currentTag = '';
            let currentAttributeName;
            let voidElements;
            function getReplaceRange(replaceStart, replaceEnd = offset) {
                if (replaceStart > offset) {
                    replaceStart = offset;
                }
                return { start: document.positionAt(replaceStart), end: document.positionAt(replaceEnd) };
            }
            function collectOpenTagSuggestions(afterOpenBracket, tagNameEnd) {
                const range = getReplaceRange(afterOpenBracket, tagNameEnd);
                dataProviders.forEach((provider) => {
                    provider.provideTags().forEach(tag => {
                        result.items.push({
                            label: tag.name,
                            kind: htmlLanguageTypes_1.CompletionItemKind.Property,
                            documentation: (0, dataProvider_1.generateDocumentation)(tag, undefined, doesSupportMarkdown),
                            textEdit: htmlLanguageTypes_1.TextEdit.replace(range, tag.name),
                            insertTextFormat: htmlLanguageTypes_1.InsertTextFormat.PlainText
                        });
                    });
                });
                return result;
            }
            function getLineIndent(offset) {
                let start = offset;
                while (start > 0) {
                    const ch = text.charAt(start - 1);
                    if ("\n\r".indexOf(ch) >= 0) {
                        return text.substring(start, offset);
                    }
                    if (!isWhiteSpace(ch)) {
                        return null;
                    }
                    start--;
                }
                return text.substring(0, offset);
            }
            function collectCloseTagSuggestions(afterOpenBracket, inOpenTag, tagNameEnd = offset) {
                const range = getReplaceRange(afterOpenBracket, tagNameEnd);
                const closeTag = isFollowedBy(text, tagNameEnd, htmlLanguageTypes_1.ScannerState.WithinEndTag, htmlLanguageTypes_1.TokenType.EndTagClose) ? '' : '>';
                let curr = node;
                if (inOpenTag) {
                    curr = curr.parent; // don't suggest the own tag, it's not yet open
                }
                while (curr) {
                    const tag = curr.tag;
                    if (tag && (!curr.closed || curr.endTagStart && (curr.endTagStart > offset))) {
                        const item = {
                            label: '/' + tag,
                            kind: htmlLanguageTypes_1.CompletionItemKind.Property,
                            filterText: '/' + tag,
                            textEdit: htmlLanguageTypes_1.TextEdit.replace(range, '/' + tag + closeTag),
                            insertTextFormat: htmlLanguageTypes_1.InsertTextFormat.PlainText
                        };
                        const startIndent = getLineIndent(curr.start);
                        const endIndent = getLineIndent(afterOpenBracket - 1);
                        if (startIndent !== null && endIndent !== null && startIndent !== endIndent) {
                            const insertText = startIndent + '</' + tag + closeTag;
                            item.textEdit = htmlLanguageTypes_1.TextEdit.replace(getReplaceRange(afterOpenBracket - 1 - endIndent.length), insertText);
                            item.filterText = endIndent + '</' + tag;
                        }
                        result.items.push(item);
                        return result;
                    }
                    curr = curr.parent;
                }
                if (inOpenTag) {
                    return result;
                }
                dataProviders.forEach(provider => {
                    provider.provideTags().forEach(tag => {
                        result.items.push({
                            label: '/' + tag.name,
                            kind: htmlLanguageTypes_1.CompletionItemKind.Property,
                            documentation: (0, dataProvider_1.generateDocumentation)(tag, undefined, doesSupportMarkdown),
                            filterText: '/' + tag.name + closeTag,
                            textEdit: htmlLanguageTypes_1.TextEdit.replace(range, '/' + tag.name + closeTag),
                            insertTextFormat: htmlLanguageTypes_1.InsertTextFormat.PlainText
                        });
                    });
                });
                return result;
            }
            const collectAutoCloseTagSuggestion = (tagCloseEnd, tag) => {
                if (settings && settings.hideAutoCompleteProposals) {
                    return result;
                }
                voidElements ?? (voidElements = this.dataManager.getVoidElements(dataProviders));
                if (!this.dataManager.isVoidElement(tag, voidElements)) {
                    const pos = document.positionAt(tagCloseEnd);
                    result.items.push({
                        label: '</' + tag + '>',
                        kind: htmlLanguageTypes_1.CompletionItemKind.Property,
                        filterText: '</' + tag + '>',
                        textEdit: htmlLanguageTypes_1.TextEdit.insert(pos, '$0</' + tag + '>'),
                        insertTextFormat: htmlLanguageTypes_1.InsertTextFormat.Snippet
                    });
                }
                return result;
            };
            function collectTagSuggestions(tagStart, tagEnd) {
                collectOpenTagSuggestions(tagStart, tagEnd);
                collectCloseTagSuggestions(tagStart, true, tagEnd);
                return result;
            }
            function getExistingAttributes() {
                const existingAttributes = Object.create(null);
                node.attributeNames.forEach(attribute => {
                    existingAttributes[attribute] = true;
                });
                return existingAttributes;
            }
            function collectAttributeNameSuggestions(nameStart, nameEnd = offset) {
                let replaceEnd = offset;
                while (replaceEnd < nameEnd && text[replaceEnd] !== '<') { // < is a valid attribute name character, but we rather assume the attribute name ends. See #23236.
                    replaceEnd++;
                }
                const currentAttribute = text.substring(nameStart, nameEnd);
                const range = getReplaceRange(nameStart, replaceEnd);
                let value = '';
                if (!isFollowedBy(text, nameEnd, htmlLanguageTypes_1.ScannerState.AfterAttributeName, htmlLanguageTypes_1.TokenType.DelimiterAssign)) {
                    const defaultValue = settings?.attributeDefaultValue ?? 'doublequotes';
                    if (defaultValue === 'empty') {
                        value = '=$1';
                    }
                    else if (defaultValue === 'singlequotes') {
                        value = '=\'$1\'';
                    }
                    else {
                        value = '="$1"';
                    }
                }
                const seenAttributes = getExistingAttributes();
                // include current typing attribute
                seenAttributes[currentAttribute] = false;
                dataProviders.forEach(provider => {
                    provider.provideAttributes(currentTag).forEach(attr => {
                        if (seenAttributes[attr.name]) {
                            return;
                        }
                        seenAttributes[attr.name] = true;
                        let codeSnippet = attr.name;
                        let command;
                        if (attr.valueSet !== 'v' && value.length) {
                            codeSnippet = codeSnippet + value;
                            if (attr.valueSet || attr.name === 'style') {
                                command = {
                                    title: 'Suggest',
                                    command: 'editor.action.triggerSuggest'
                                };
                            }
                        }
                        result.items.push({
                            label: attr.name,
                            kind: attr.valueSet === 'handler' ? htmlLanguageTypes_1.CompletionItemKind.Function : htmlLanguageTypes_1.CompletionItemKind.Value,
                            documentation: (0, dataProvider_1.generateDocumentation)(attr, undefined, doesSupportMarkdown),
                            textEdit: htmlLanguageTypes_1.TextEdit.replace(range, codeSnippet),
                            insertTextFormat: htmlLanguageTypes_1.InsertTextFormat.Snippet,
                            command
                        });
                    });
                });
                collectDataAttributesSuggestions(range, seenAttributes);
                return result;
            }
            function collectDataAttributesSuggestions(range, seenAttributes) {
                const dataAttr = 'data-';
                const dataAttributes = {};
                dataAttributes[dataAttr] = `${dataAttr}$1="$2"`;
                function addNodeDataAttributes(node) {
                    node.attributeNames.forEach(attr => {
                        if ((0, strings_1.startsWith)(attr, dataAttr) && !dataAttributes[attr] && !seenAttributes[attr]) {
                            dataAttributes[attr] = attr + '="$1"';
                        }
                    });
                    node.children.forEach(child => addNodeDataAttributes(child));
                }
                if (htmlDocument) {
                    htmlDocument.roots.forEach(root => addNodeDataAttributes(root));
                }
                Object.keys(dataAttributes).forEach(attr => result.items.push({
                    label: attr,
                    kind: htmlLanguageTypes_1.CompletionItemKind.Value,
                    textEdit: htmlLanguageTypes_1.TextEdit.replace(range, dataAttributes[attr]),
                    insertTextFormat: htmlLanguageTypes_1.InsertTextFormat.Snippet
                }));
            }
            function collectAttributeValueSuggestions(valueStart, valueEnd = offset) {
                let range;
                let addQuotes;
                let valuePrefix;
                if (offset > valueStart && offset <= valueEnd && isQuote(text[valueStart])) {
                    // inside quoted attribute
                    const valueContentStart = valueStart + 1;
                    let valueContentEnd = valueEnd;
                    // valueEnd points to the char after quote, which encloses the replace range
                    if (valueEnd > valueStart && text[valueEnd - 1] === text[valueStart]) {
                        valueContentEnd--;
                    }
                    const wsBefore = getWordStart(text, offset, valueContentStart);
                    const wsAfter = getWordEnd(text, offset, valueContentEnd);
                    range = getReplaceRange(wsBefore, wsAfter);
                    valuePrefix = offset >= valueContentStart && offset <= valueContentEnd ? text.substring(valueContentStart, offset) : '';
                    addQuotes = false;
                }
                else {
                    range = getReplaceRange(valueStart, valueEnd);
                    valuePrefix = text.substring(valueStart, offset);
                    addQuotes = true;
                }
                if (completionParticipants.length > 0) {
                    const tag = currentTag.toLowerCase();
                    const attribute = currentAttributeName.toLowerCase();
                    const fullRange = getReplaceRange(valueStart, valueEnd);
                    for (const participant of completionParticipants) {
                        if (participant.onHtmlAttributeValue) {
                            participant.onHtmlAttributeValue({ document, position, tag, attribute, value: valuePrefix, range: fullRange });
                        }
                    }
                }
                dataProviders.forEach(provider => {
                    provider.provideValues(currentTag, currentAttributeName).forEach(value => {
                        const insertText = addQuotes ? '"' + value.name + '"' : value.name;
                        result.items.push({
                            label: value.name,
                            filterText: insertText,
                            kind: htmlLanguageTypes_1.CompletionItemKind.Unit,
                            documentation: (0, dataProvider_1.generateDocumentation)(value, undefined, doesSupportMarkdown),
                            textEdit: htmlLanguageTypes_1.TextEdit.replace(range, insertText),
                            insertTextFormat: htmlLanguageTypes_1.InsertTextFormat.PlainText
                        });
                    });
                });
                collectCharacterEntityProposals();
                return result;
            }
            function scanNextForEndPos(nextToken) {
                if (offset === scanner.getTokenEnd()) {
                    token = scanner.scan();
                    if (token === nextToken && scanner.getTokenOffset() === offset) {
                        return scanner.getTokenEnd();
                    }
                }
                return offset;
            }
            function collectInsideContent() {
                for (const participant of completionParticipants) {
                    if (participant.onHtmlContent) {
                        participant.onHtmlContent({ document, position });
                    }
                }
                return collectCharacterEntityProposals();
            }
            function collectCharacterEntityProposals() {
                // character entities
                let k = offset - 1;
                let characterStart = position.character;
                while (k >= 0 && (0, strings_1.isLetterOrDigit)(text, k)) {
                    k--;
                    characterStart--;
                }
                if (k >= 0 && text[k] === '&') {
                    const range = htmlLanguageTypes_1.Range.create(htmlLanguageTypes_1.Position.create(position.line, characterStart - 1), position);
                    for (const entity in htmlEntities_1.entities) {
                        if ((0, strings_1.endsWith)(entity, ';')) {
                            const label = '&' + entity;
                            result.items.push({
                                label,
                                kind: htmlLanguageTypes_1.CompletionItemKind.Keyword,
                                documentation: l10n.t('Character entity representing \'{0}\'', htmlEntities_1.entities[entity]),
                                textEdit: htmlLanguageTypes_1.TextEdit.replace(range, label),
                                insertTextFormat: htmlLanguageTypes_1.InsertTextFormat.PlainText
                            });
                        }
                    }
                }
                return result;
            }
            function suggestDoctype(replaceStart, replaceEnd) {
                const range = getReplaceRange(replaceStart, replaceEnd);
                result.items.push({
                    label: '!DOCTYPE',
                    kind: htmlLanguageTypes_1.CompletionItemKind.Property,
                    documentation: 'A preamble for an HTML document.',
                    textEdit: htmlLanguageTypes_1.TextEdit.replace(range, '!DOCTYPE html>'),
                    insertTextFormat: htmlLanguageTypes_1.InsertTextFormat.PlainText
                });
            }
            let token = scanner.scan();
            while (token !== htmlLanguageTypes_1.TokenType.EOS && scanner.getTokenOffset() <= offset) {
                switch (token) {
                    case htmlLanguageTypes_1.TokenType.StartTagOpen:
                        if (scanner.getTokenEnd() === offset) {
                            const endPos = scanNextForEndPos(htmlLanguageTypes_1.TokenType.StartTag);
                            if (position.line === 0) {
                                suggestDoctype(offset, endPos);
                            }
                            return collectTagSuggestions(offset, endPos);
                        }
                        break;
                    case htmlLanguageTypes_1.TokenType.StartTag:
                        if (scanner.getTokenOffset() <= offset && offset <= scanner.getTokenEnd()) {
                            return collectOpenTagSuggestions(scanner.getTokenOffset(), scanner.getTokenEnd());
                        }
                        currentTag = scanner.getTokenText();
                        break;
                    case htmlLanguageTypes_1.TokenType.AttributeName:
                        if (scanner.getTokenOffset() <= offset && offset <= scanner.getTokenEnd()) {
                            return collectAttributeNameSuggestions(scanner.getTokenOffset(), scanner.getTokenEnd());
                        }
                        currentAttributeName = scanner.getTokenText();
                        break;
                    case htmlLanguageTypes_1.TokenType.DelimiterAssign:
                        if (scanner.getTokenEnd() === offset) {
                            const endPos = scanNextForEndPos(htmlLanguageTypes_1.TokenType.AttributeValue);
                            return collectAttributeValueSuggestions(offset, endPos);
                        }
                        break;
                    case htmlLanguageTypes_1.TokenType.AttributeValue:
                        if (scanner.getTokenOffset() <= offset && offset <= scanner.getTokenEnd()) {
                            return collectAttributeValueSuggestions(scanner.getTokenOffset(), scanner.getTokenEnd());
                        }
                        break;
                    case htmlLanguageTypes_1.TokenType.Whitespace:
                        if (offset <= scanner.getTokenEnd()) {
                            switch (scanner.getScannerState()) {
                                case htmlLanguageTypes_1.ScannerState.AfterOpeningStartTag:
                                    const startPos = scanner.getTokenOffset();
                                    const endTagPos = scanNextForEndPos(htmlLanguageTypes_1.TokenType.StartTag);
                                    return collectTagSuggestions(startPos, endTagPos);
                                case htmlLanguageTypes_1.ScannerState.WithinTag:
                                case htmlLanguageTypes_1.ScannerState.AfterAttributeName:
                                    return collectAttributeNameSuggestions(scanner.getTokenEnd());
                                case htmlLanguageTypes_1.ScannerState.BeforeAttributeValue:
                                    return collectAttributeValueSuggestions(scanner.getTokenEnd());
                                case htmlLanguageTypes_1.ScannerState.AfterOpeningEndTag:
                                    return collectCloseTagSuggestions(scanner.getTokenOffset() - 1, false);
                                case htmlLanguageTypes_1.ScannerState.WithinContent:
                                    return collectInsideContent();
                            }
                        }
                        break;
                    case htmlLanguageTypes_1.TokenType.EndTagOpen:
                        if (offset <= scanner.getTokenEnd()) {
                            const afterOpenBracket = scanner.getTokenOffset() + 1;
                            const endOffset = scanNextForEndPos(htmlLanguageTypes_1.TokenType.EndTag);
                            return collectCloseTagSuggestions(afterOpenBracket, false, endOffset);
                        }
                        break;
                    case htmlLanguageTypes_1.TokenType.EndTag:
                        if (offset <= scanner.getTokenEnd()) {
                            let start = scanner.getTokenOffset() - 1;
                            while (start >= 0) {
                                const ch = text.charAt(start);
                                if (ch === '/') {
                                    return collectCloseTagSuggestions(start, false, scanner.getTokenEnd());
                                }
                                else if (!isWhiteSpace(ch)) {
                                    break;
                                }
                                start--;
                            }
                        }
                        break;
                    case htmlLanguageTypes_1.TokenType.StartTagClose:
                        if (offset <= scanner.getTokenEnd()) {
                            if (currentTag) {
                                return collectAutoCloseTagSuggestion(scanner.getTokenEnd(), currentTag);
                            }
                        }
                        break;
                    case htmlLanguageTypes_1.TokenType.Content:
                        if (offset <= scanner.getTokenEnd()) {
                            return collectInsideContent();
                        }
                        break;
                    default:
                        if (offset <= scanner.getTokenEnd()) {
                            return result;
                        }
                        break;
                }
                token = scanner.scan();
            }
            return result;
        }
        doQuoteComplete(document, position, htmlDocument, settings) {
            const offset = document.offsetAt(position);
            if (offset <= 0) {
                return null;
            }
            const defaultValue = settings?.attributeDefaultValue ?? 'doublequotes';
            if (defaultValue === 'empty') {
                return null;
            }
            const char = document.getText().charAt(offset - 1);
            if (char !== '=') {
                return null;
            }
            const value = defaultValue === 'doublequotes' ? '"$1"' : '\'$1\'';
            const node = htmlDocument.findNodeBefore(offset);
            if (node && node.attributes && node.start < offset && (!node.endTagStart || node.endTagStart > offset)) {
                const scanner = (0, htmlScanner_1.createScanner)(document.getText(), node.start);
                let token = scanner.scan();
                while (token !== htmlLanguageTypes_1.TokenType.EOS && scanner.getTokenEnd() <= offset) {
                    if (token === htmlLanguageTypes_1.TokenType.AttributeName && scanner.getTokenEnd() === offset - 1) {
                        // Ensure the token is a valid standalone attribute name
                        token = scanner.scan(); // this should be the = just written
                        if (token !== htmlLanguageTypes_1.TokenType.DelimiterAssign) {
                            return null;
                        }
                        token = scanner.scan();
                        // Any non-attribute valid tag
                        if (token === htmlLanguageTypes_1.TokenType.Unknown || token === htmlLanguageTypes_1.TokenType.AttributeValue) {
                            return null;
                        }
                        return value;
                    }
                    token = scanner.scan();
                }
            }
            return null;
        }
        doTagComplete(document, position, htmlDocument) {
            const offset = document.offsetAt(position);
            if (offset <= 0) {
                return null;
            }
            const char = document.getText().charAt(offset - 1);
            if (char === '>') {
                const node = htmlDocument.findNodeBefore(offset);
                if (node && node.tag && node.start < offset && (!node.endTagStart || node.endTagStart > offset)) {
                    const voidElements = this.dataManager.getVoidElements(document.languageId);
                    if (!this.dataManager.isVoidElement(node.tag, voidElements)) {
                        const scanner = (0, htmlScanner_1.createScanner)(document.getText(), node.start);
                        let token = scanner.scan();
                        while (token !== htmlLanguageTypes_1.TokenType.EOS && scanner.getTokenEnd() <= offset) {
                            if (token === htmlLanguageTypes_1.TokenType.StartTagClose && scanner.getTokenEnd() === offset) {
                                return `$0</${node.tag}>`;
                            }
                            token = scanner.scan();
                        }
                    }
                }
            }
            else if (char === '/') {
                let node = htmlDocument.findNodeBefore(offset);
                while (node && node.closed && !(node.endTagStart && (node.endTagStart > offset))) {
                    node = node.parent;
                }
                if (node && node.tag) {
                    const scanner = (0, htmlScanner_1.createScanner)(document.getText(), node.start);
                    let token = scanner.scan();
                    while (token !== htmlLanguageTypes_1.TokenType.EOS && scanner.getTokenEnd() <= offset) {
                        if (token === htmlLanguageTypes_1.TokenType.EndTagOpen && scanner.getTokenEnd() === offset) {
                            if (document.getText().charAt(offset) !== '>') {
                                return `${node.tag}>`;
                            }
                            else {
                                return node.tag;
                            }
                        }
                        token = scanner.scan();
                    }
                }
            }
            return null;
        }
        convertCompletionList(list) {
            if (!this.doesSupportMarkdown()) {
                list.items.forEach(item => {
                    if (item.documentation && typeof item.documentation !== 'string') {
                        item.documentation = {
                            kind: 'plaintext',
                            value: item.documentation.value
                        };
                    }
                });
            }
            return list;
        }
        doesSupportMarkdown() {
            if (!(0, object_1.isDefined)(this.supportsMarkdown)) {
                if (!(0, object_1.isDefined)(this.lsOptions.clientCapabilities)) {
                    this.supportsMarkdown = true;
                    return this.supportsMarkdown;
                }
                const documentationFormat = this.lsOptions.clientCapabilities.textDocument?.completion?.completionItem?.documentationFormat;
                this.supportsMarkdown = Array.isArray(documentationFormat) && documentationFormat.indexOf(htmlLanguageTypes_1.MarkupKind.Markdown) !== -1;
            }
            return this.supportsMarkdown;
        }
    }
    exports.HTMLCompletion = HTMLCompletion;
    function isQuote(s) {
        return /^["']*$/.test(s);
    }
    function isWhiteSpace(s) {
        return /^\s*$/.test(s);
    }
    function isFollowedBy(s, offset, intialState, expectedToken) {
        const scanner = (0, htmlScanner_1.createScanner)(s, offset, intialState);
        let token = scanner.scan();
        while (token === htmlLanguageTypes_1.TokenType.Whitespace) {
            token = scanner.scan();
        }
        return token === expectedToken;
    }
    function getWordStart(s, offset, limit) {
        while (offset > limit && !isWhiteSpace(s[offset - 1])) {
            offset--;
        }
        return offset;
    }
    function getWordEnd(s, offset, limit) {
        while (offset < limit && !isWhiteSpace(s[offset])) {
            offset++;
        }
        return offset;
    }
});
