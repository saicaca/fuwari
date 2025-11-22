/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./parser/htmlScanner", "./parser/htmlParser", "./services/htmlCompletion", "./services/htmlHover", "./services/htmlFormatter", "./services/htmlLinks", "./services/htmlHighlighting", "./services/htmlSymbolsProvider", "./services/htmlRename", "./services/htmlMatchingTagPosition", "./services/htmlLinkedEditing", "./services/htmlFolding", "./services/htmlSelectionRange", "./languageFacts/dataProvider", "./languageFacts/dataManager", "./languageFacts/data/webCustomData", "./htmlLanguageTypes"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLanguageService = getLanguageService;
    exports.newHTMLDataProvider = newHTMLDataProvider;
    exports.getDefaultHTMLDataProvider = getDefaultHTMLDataProvider;
    const htmlScanner_1 = require("./parser/htmlScanner");
    const htmlParser_1 = require("./parser/htmlParser");
    const htmlCompletion_1 = require("./services/htmlCompletion");
    const htmlHover_1 = require("./services/htmlHover");
    const htmlFormatter_1 = require("./services/htmlFormatter");
    const htmlLinks_1 = require("./services/htmlLinks");
    const htmlHighlighting_1 = require("./services/htmlHighlighting");
    const htmlSymbolsProvider_1 = require("./services/htmlSymbolsProvider");
    const htmlRename_1 = require("./services/htmlRename");
    const htmlMatchingTagPosition_1 = require("./services/htmlMatchingTagPosition");
    const htmlLinkedEditing_1 = require("./services/htmlLinkedEditing");
    const htmlFolding_1 = require("./services/htmlFolding");
    const htmlSelectionRange_1 = require("./services/htmlSelectionRange");
    const dataProvider_1 = require("./languageFacts/dataProvider");
    const dataManager_1 = require("./languageFacts/dataManager");
    const webCustomData_1 = require("./languageFacts/data/webCustomData");
    __exportStar(require("./htmlLanguageTypes"), exports);
    const defaultLanguageServiceOptions = {};
    function getLanguageService(options = defaultLanguageServiceOptions) {
        const dataManager = new dataManager_1.HTMLDataManager(options);
        const htmlHover = new htmlHover_1.HTMLHover(options, dataManager);
        const htmlCompletion = new htmlCompletion_1.HTMLCompletion(options, dataManager);
        const htmlParser = new htmlParser_1.HTMLParser(dataManager);
        const htmlSelectionRange = new htmlSelectionRange_1.HTMLSelectionRange(htmlParser);
        const htmlFolding = new htmlFolding_1.HTMLFolding(dataManager);
        const htmlDocumentLinks = new htmlLinks_1.HTMLDocumentLinks(dataManager);
        return {
            setDataProviders: dataManager.setDataProviders.bind(dataManager),
            createScanner: htmlScanner_1.createScanner,
            parseHTMLDocument: htmlParser.parseDocument.bind(htmlParser),
            doComplete: htmlCompletion.doComplete.bind(htmlCompletion),
            doComplete2: htmlCompletion.doComplete2.bind(htmlCompletion),
            setCompletionParticipants: htmlCompletion.setCompletionParticipants.bind(htmlCompletion),
            doHover: htmlHover.doHover.bind(htmlHover),
            format: htmlFormatter_1.format,
            findDocumentHighlights: htmlHighlighting_1.findDocumentHighlights,
            findDocumentLinks: htmlDocumentLinks.findDocumentLinks.bind(htmlDocumentLinks),
            findDocumentSymbols: htmlSymbolsProvider_1.findDocumentSymbols,
            findDocumentSymbols2: htmlSymbolsProvider_1.findDocumentSymbols2,
            getFoldingRanges: htmlFolding.getFoldingRanges.bind(htmlFolding),
            getSelectionRanges: htmlSelectionRange.getSelectionRanges.bind(htmlSelectionRange),
            doQuoteComplete: htmlCompletion.doQuoteComplete.bind(htmlCompletion),
            doTagComplete: htmlCompletion.doTagComplete.bind(htmlCompletion),
            doRename: htmlRename_1.doRename,
            findMatchingTagPosition: htmlMatchingTagPosition_1.findMatchingTagPosition,
            findOnTypeRenameRanges: htmlLinkedEditing_1.findLinkedEditingRanges,
            findLinkedEditingRanges: htmlLinkedEditing_1.findLinkedEditingRanges
        };
    }
    function newHTMLDataProvider(id, customData) {
        return new dataProvider_1.HTMLDataProvider(id, customData);
    }
    function getDefaultHTMLDataProvider() {
        return newHTMLDataProvider('default', webCustomData_1.htmlData);
    }
});
