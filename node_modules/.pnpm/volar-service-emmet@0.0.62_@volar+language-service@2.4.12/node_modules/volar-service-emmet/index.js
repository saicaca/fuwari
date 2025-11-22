"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
const vscode_uri_1 = require("vscode-uri");
const abbreviationActions_1 = require("./lib/abbreviationActions");
const parseDocument_1 = require("./lib/parseDocument");
const util_1 = require("./lib/util");
function create({ mappedLanguages = {}, } = {}) {
    return {
        name: 'emmet',
        capabilities: {
            completionProvider: {
                // https://docs.emmet.io/abbreviations/syntax/
                triggerCharacters: '>+^*()#.[]$@-{}'.split(''),
            },
        },
        create(context) {
            let lastCompletionType;
            return {
                isAdditionalCompletion: true,
                provideCompletionItems(document, position, completionContext) {
                    const completionResult = provideCompletionItemsInternal(document, position, completionContext);
                    if (!completionResult) {
                        lastCompletionType = undefined;
                        return;
                    }
                    return completionResult.then(completionList => {
                        if (!completionList || !completionList.items.length) {
                            lastCompletionType = undefined;
                            return completionList;
                        }
                        const item = completionList.items[0];
                        const expandedText = item.documentation ? item.documentation.toString() : '';
                        if (expandedText.startsWith('<')) {
                            lastCompletionType = 'html';
                        }
                        else if (expandedText.indexOf(':') > 0 && expandedText.endsWith(';')) {
                            lastCompletionType = 'css';
                        }
                        else {
                            lastCompletionType = undefined;
                        }
                        return completionList;
                    });
                },
            };
            async function provideCompletionItemsInternal(document, position, completionContext) {
                const emmetConfig = await context.env.getConfiguration?.('emmet') ?? {};
                const excludedLanguages = emmetConfig['excludeLanguages'] ?? [];
                if (excludedLanguages.includes(document.languageId)) {
                    return;
                }
                const isSyntaxMapped = mappedLanguages[document.languageId] ? true : false;
                const emmetMode = (0, util_1.getEmmetMode)(mappedLanguages[document.languageId] ?? document.languageId, mappedLanguages, excludedLanguages);
                if (!emmetMode
                    || emmetConfig['showExpandedAbbreviation'] === 'never'
                    || ((isSyntaxMapped || emmetMode === 'jsx') && emmetConfig['showExpandedAbbreviation'] !== 'always')) {
                    return;
                }
                let syntax = emmetMode;
                let validateLocation = syntax === 'html' || syntax === 'jsx' || syntax === 'xml';
                let rootNode;
                let currentNode;
                // Don't show completions if there's a comment at the beginning of the line
                const lineRange = {
                    start: { line: position.line, character: 0 },
                    end: position,
                };
                if (document.getText(lineRange).trimStart().startsWith('//')) {
                    return;
                }
                const helper = (0, util_1.getEmmetHelper)();
                if (syntax === 'html') {
                    if (completionContext.triggerKind === 3) {
                        switch (lastCompletionType) {
                            case 'html':
                                validateLocation = false;
                                break;
                            case 'css':
                                validateLocation = false;
                                syntax = 'css';
                                break;
                            default:
                                break;
                        }
                    }
                    if (validateLocation) {
                        const positionOffset = document.offsetAt(position);
                        const emmetRootNode = (0, parseDocument_1.getRootNode)(document, true);
                        const foundNode = (0, util_1.getHtmlFlatNode)(document.getText(), emmetRootNode, positionOffset, false);
                        if (foundNode) {
                            if (foundNode.name === 'script') {
                                const typeNode = foundNode.attributes.find(attr => attr.name.toString() === 'type');
                                if (typeNode) {
                                    const typeAttrValue = typeNode.value.toString();
                                    if (typeAttrValue === 'application/javascript' || typeAttrValue === 'text/javascript') {
                                        if (!await (0, abbreviationActions_1.getSyntaxFromArgs)(context, { language: 'javascript' })) {
                                            return;
                                        }
                                        else {
                                            validateLocation = false;
                                        }
                                    }
                                    else if (util_1.allowedMimeTypesInScriptTag.includes(typeAttrValue)) {
                                        validateLocation = false;
                                    }
                                }
                                else {
                                    return;
                                }
                            }
                            else if (foundNode.name === 'style') {
                                syntax = 'css';
                                validateLocation = false;
                            }
                            else {
                                const styleNode = foundNode.attributes.find(attr => attr.name.toString() === 'style');
                                if (styleNode && styleNode.value.start <= positionOffset && positionOffset <= styleNode.value.end) {
                                    syntax = 'css';
                                    validateLocation = false;
                                }
                            }
                        }
                    }
                }
                const expandOptions = (0, util_1.isStyleSheet)(syntax) ?
                    { lookAhead: false, syntax: 'stylesheet' } :
                    { lookAhead: true, syntax: 'markup' };
                const extractAbbreviationResults = helper.extractAbbreviation(document, position, expandOptions);
                if (!extractAbbreviationResults || !helper.isAbbreviationValid(syntax, extractAbbreviationResults.abbreviation)) {
                    return;
                }
                const offset = document.offsetAt(position);
                if ((0, util_1.isStyleSheet)(document.languageId) && completionContext.triggerKind !== 3) {
                    validateLocation = true;
                    const usePartialParsing = await context.env.getConfiguration?.('emmet.optimizeStylesheetParsing') === true;
                    rootNode = usePartialParsing && document.lineCount > 1000 ? (0, util_1.parsePartialStylesheet)(document, position) : (0, parseDocument_1.getRootNode)(document, true);
                    if (!rootNode) {
                        return;
                    }
                    currentNode = (0, util_1.getFlatNode)(rootNode, offset, true);
                }
                // Fix for https://github.com/microsoft/vscode/issues/107578
                // Validate location if syntax is of styleSheet type to ensure that location is valid for emmet abbreviation.
                // For an html document containing a <style> node, compute the embeddedCssNode and fetch the flattened node as currentNode.
                if (!(0, util_1.isStyleSheet)(document.languageId) && (0, util_1.isStyleSheet)(syntax) && completionContext.triggerKind !== 3) {
                    validateLocation = true;
                    rootNode = (0, parseDocument_1.getRootNode)(document, true);
                    if (!rootNode) {
                        return;
                    }
                    const flatNode = (0, util_1.getFlatNode)(rootNode, offset, true);
                    const embeddedCssNode = (0, util_1.getEmbeddedCssNodeIfAny)(document, flatNode, position);
                    currentNode = (0, util_1.getFlatNode)(embeddedCssNode, offset, true);
                }
                if (validateLocation && !await (0, abbreviationActions_1.isValidLocationForEmmetAbbreviation)(context, document, rootNode, currentNode, syntax, offset, extractAbbreviationResults.abbreviationRange)) {
                    return;
                }
                let isNoisePromise = Promise.resolve(false);
                // Fix for https://github.com/microsoft/vscode/issues/32647
                // Check for document symbols in js/ts/jsx/tsx and avoid triggering emmet for abbreviations of the form symbolName.sometext
                // Presence of > or * or + in the abbreviation denotes valid abbreviation that should trigger emmet
                if (!(0, util_1.isStyleSheet)(syntax) && (document.languageId === 'javascript' || document.languageId === 'javascriptreact' || document.languageId === 'typescript' || document.languageId === 'typescriptreact')) {
                    const abbreviation = extractAbbreviationResults.abbreviation;
                    // For the second condition, we don't want abbreviations that have [] characters but not ='s in them to expand
                    // In turn, users must explicitly expand abbreviations of the form Component[attr1 attr2], but it means we don't try to expand a[i].
                    if (abbreviation.startsWith('this.') || /\[[^\]=]*\]/.test(abbreviation)) {
                        isNoisePromise = Promise.resolve(true);
                    }
                    else {
                        const uri = vscode_uri_1.URI.parse(document.uri);
                        const documentUri = context.decodeEmbeddedDocumentUri(uri)?.[0] ?? uri;
                        isNoisePromise = context.getLanguageService().getDocumentSymbols(documentUri).then(symbols => {
                            return !!symbols && symbols.some(x => abbreviation === x.name || (abbreviation.startsWith(x.name + '.') && !/>|\*|\+/.test(abbreviation)));
                        });
                    }
                }
                return isNoisePromise.then(async (isNoise) => {
                    if (isNoise) {
                        return undefined;
                    }
                    const config = await (0, util_1.getEmmetConfiguration)(context, syntax);
                    const result = helper.doComplete(document, position, syntax, config);
                    // https://github.com/microsoft/vscode/issues/86941
                    if (result && result.items && result.items.length === 1) {
                        if (result.items[0].label === 'widows: ;') {
                            return undefined;
                        }
                    }
                    return result;
                });
            }
        },
    };
}
//# sourceMappingURL=index.js.map