"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLanguageServiceByDocument = getLanguageServiceByDocument;
exports.create = create;
const getFormatCodeSettings_1 = require("../configs/getFormatCodeSettings");
const shared_1 = require("../shared");
const syntaxOnlyService_1 = require("../syntaxOnlyService");
const lspConverters_1 = require("../utils/lspConverters");
const snapshots = new WeakMap();
let created;
function getLanguageServiceByDocument(ts, document) {
    if (!created) {
        created = (0, syntaxOnlyService_1.createSyntaxOnlyService)(ts, true);
    }
    let cache = snapshots.get(document);
    if (!cache || cache[0] !== document.version) {
        const snapshot = ts.ScriptSnapshot.fromString(document.getText());
        cache = [document.version, snapshot];
        snapshots.set(document, cache);
        created.updateFile(document.uri, cache[1], document.languageId === 'javascript'
            ? ts.ScriptKind.JS
            : document.languageId === 'javascriptreact'
                ? ts.ScriptKind.JSX
                : document.languageId === 'typescriptreact'
                    ? ts.ScriptKind.TSX
                    : ts.ScriptKind.TS);
    }
    return {
        languageService: created.languageService,
        fileName: document.uri,
    };
}
function create(ts, { isFormattingEnabled = async (document, context) => {
    return await context.env.getConfiguration?.((0, shared_1.getConfigTitle)(document) + '.format.enable') ?? true;
}, } = {}) {
    return {
        name: 'typescript-syntactic',
        capabilities: {
            autoInsertionProvider: {
                triggerCharacters: ['>', '>'],
                configurationSections: ['javascript.autoClosingTags', 'typescript.autoClosingTags'],
            },
            foldingRangeProvider: true,
            selectionRangeProvider: true,
            documentSymbolProvider: true,
            documentFormattingProvider: true,
            documentOnTypeFormattingProvider: {
                // https://github.com/microsoft/vscode/blob/ce119308e8fd4cd3f992d42b297588e7abe33a0c/extensions/typescript-language-features/src/languageFeatures/formatting.ts#L99
                triggerCharacters: [';', '}', '\n'],
            },
        },
        create(context) {
            return {
                async provideAutoInsertSnippet(document, selection, change) {
                    // selection must at end of change
                    if (document.offsetAt(selection) !== change.rangeOffset + change.text.length) {
                        return;
                    }
                    if ((document.languageId === 'javascriptreact' || document.languageId === 'typescriptreact')
                        && change.text.endsWith('>')
                        && (await context.env.getConfiguration?.((0, shared_1.getConfigTitle)(document) + '.autoClosingTags') ?? true)) {
                        const { languageService, fileName } = getLanguageServiceByDocument(ts, document);
                        const close = languageService.getJsxClosingTagAtPosition(fileName, document.offsetAt(selection));
                        if (close) {
                            return '$0' + close.newText;
                        }
                    }
                },
                provideFoldingRanges(document) {
                    if (!(0, shared_1.isTsDocument)(document)) {
                        return;
                    }
                    const { languageService, fileName } = getLanguageServiceByDocument(ts, document);
                    const outliningSpans = (0, shared_1.safeCall)(() => languageService.getOutliningSpans(fileName));
                    if (!outliningSpans) {
                        return [];
                    }
                    return outliningSpans.map(span => (0, lspConverters_1.convertOutliningSpan)(span, document));
                },
                provideSelectionRanges(document, positions) {
                    if (!(0, shared_1.isTsDocument)(document)) {
                        return;
                    }
                    const { languageService, fileName } = getLanguageServiceByDocument(ts, document);
                    const ranges = positions
                        .map(position => {
                        const offset = document.offsetAt(position);
                        const range = (0, shared_1.safeCall)(() => languageService.getSmartSelectionRange(fileName, offset));
                        if (!range) {
                            return;
                        }
                        return (0, lspConverters_1.convertSelectionRange)(range, document);
                    });
                    if (ranges.every(range => !!range)) {
                        return ranges;
                    }
                },
                provideDocumentSymbols(document) {
                    if (!(0, shared_1.isTsDocument)(document)) {
                        return;
                    }
                    const { languageService, fileName } = getLanguageServiceByDocument(ts, document);
                    const barItems = (0, shared_1.safeCall)(() => languageService.getNavigationTree(fileName));
                    if (!barItems) {
                        return [];
                    }
                    // The root represents the file. Ignore this when showing in the UI
                    return barItems.childItems
                        ?.map(item => (0, lspConverters_1.convertNavTree)(item, document))
                        .flat()
                        ?? [];
                },
                async provideDocumentFormattingEdits(document, range, options, codeOptions) {
                    if (!(0, shared_1.isTsDocument)(document)) {
                        return;
                    }
                    if (!await isFormattingEnabled(document, context)) {
                        return;
                    }
                    const tsOptions = await (0, getFormatCodeSettings_1.getFormatCodeSettings)(context, document, options);
                    if (codeOptions) {
                        tsOptions.baseIndentSize = codeOptions.initialIndentLevel * options.tabSize;
                    }
                    const { languageService, fileName } = getLanguageServiceByDocument(ts, document);
                    const scriptEdits = range
                        ? (0, shared_1.safeCall)(() => languageService.getFormattingEditsForRange(fileName, document.offsetAt(range.start), document.offsetAt(range.end), tsOptions))
                        : (0, shared_1.safeCall)(() => languageService.getFormattingEditsForDocument(fileName, tsOptions));
                    if (!scriptEdits) {
                        return [];
                    }
                    return scriptEdits.map(edit => (0, lspConverters_1.convertTextChange)(edit, document));
                },
                async provideOnTypeFormattingEdits(document, position, key, options, codeOptions) {
                    if (!(0, shared_1.isTsDocument)(document)) {
                        return;
                    }
                    if (!await isFormattingEnabled(document, context)) {
                        return;
                    }
                    const tsOptions = await (0, getFormatCodeSettings_1.getFormatCodeSettings)(context, document, options);
                    if (codeOptions) {
                        tsOptions.baseIndentSize = codeOptions.initialIndentLevel * options.tabSize;
                    }
                    const { languageService, fileName } = getLanguageServiceByDocument(ts, document);
                    const scriptEdits = (0, shared_1.safeCall)(() => languageService.getFormattingEditsAfterKeystroke(fileName, document.offsetAt(position), key, tsOptions));
                    if (!scriptEdits) {
                        return [];
                    }
                    return scriptEdits.map(edit => (0, lspConverters_1.convertTextChange)(edit, document));
                },
            };
        },
    };
}
//# sourceMappingURL=syntactic.js.map