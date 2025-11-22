/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createScanner } from './parser/htmlScanner';
import { HTMLParser } from './parser/htmlParser';
import { HTMLCompletion } from './services/htmlCompletion';
import { HTMLHover } from './services/htmlHover';
import { format } from './services/htmlFormatter';
import { HTMLDocumentLinks } from './services/htmlLinks';
import { findDocumentHighlights } from './services/htmlHighlighting';
import { findDocumentSymbols, findDocumentSymbols2 } from './services/htmlSymbolsProvider';
import { doRename } from './services/htmlRename';
import { findMatchingTagPosition } from './services/htmlMatchingTagPosition';
import { findLinkedEditingRanges } from './services/htmlLinkedEditing';
import { HTMLFolding } from './services/htmlFolding';
import { HTMLSelectionRange } from './services/htmlSelectionRange';
import { HTMLDataProvider } from './languageFacts/dataProvider';
import { HTMLDataManager } from './languageFacts/dataManager';
import { htmlData } from './languageFacts/data/webCustomData';
export * from './htmlLanguageTypes';
const defaultLanguageServiceOptions = {};
export function getLanguageService(options = defaultLanguageServiceOptions) {
    const dataManager = new HTMLDataManager(options);
    const htmlHover = new HTMLHover(options, dataManager);
    const htmlCompletion = new HTMLCompletion(options, dataManager);
    const htmlParser = new HTMLParser(dataManager);
    const htmlSelectionRange = new HTMLSelectionRange(htmlParser);
    const htmlFolding = new HTMLFolding(dataManager);
    const htmlDocumentLinks = new HTMLDocumentLinks(dataManager);
    return {
        setDataProviders: dataManager.setDataProviders.bind(dataManager),
        createScanner,
        parseHTMLDocument: htmlParser.parseDocument.bind(htmlParser),
        doComplete: htmlCompletion.doComplete.bind(htmlCompletion),
        doComplete2: htmlCompletion.doComplete2.bind(htmlCompletion),
        setCompletionParticipants: htmlCompletion.setCompletionParticipants.bind(htmlCompletion),
        doHover: htmlHover.doHover.bind(htmlHover),
        format,
        findDocumentHighlights,
        findDocumentLinks: htmlDocumentLinks.findDocumentLinks.bind(htmlDocumentLinks),
        findDocumentSymbols,
        findDocumentSymbols2,
        getFoldingRanges: htmlFolding.getFoldingRanges.bind(htmlFolding),
        getSelectionRanges: htmlSelectionRange.getSelectionRanges.bind(htmlSelectionRange),
        doQuoteComplete: htmlCompletion.doQuoteComplete.bind(htmlCompletion),
        doTagComplete: htmlCompletion.doTagComplete.bind(htmlCompletion),
        doRename,
        findMatchingTagPosition,
        findOnTypeRenameRanges: findLinkedEditingRanges,
        findLinkedEditingRanges
    };
}
export function newHTMLDataProvider(id, customData) {
    return new HTMLDataProvider(id, customData);
}
export function getDefaultHTMLDataProvider() {
    return newHTMLDataProvider('default', htmlData);
}
