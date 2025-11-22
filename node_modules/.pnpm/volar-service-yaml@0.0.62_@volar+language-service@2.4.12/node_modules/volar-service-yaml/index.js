"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
const vscode_uri_1 = require("vscode-uri");
const yaml = require("yaml-language-server");
function noop() { }
/**
 * Create a Volar language service for YAML documents.
 */
function create({ documentSelector = ['yaml'], getWorkspaceContextService = context => {
    return {
        resolveRelativePath(relativePath, resource) {
            const base = resource.substring(0, resource.lastIndexOf('/') + 1);
            let baseUri = vscode_uri_1.URI.parse(base);
            const decoded = context.decodeEmbeddedDocumentUri(baseUri);
            if (decoded) {
                baseUri = decoded[0];
            }
            return vscode_uri_1.Utils.resolvePath(baseUri, relativePath).toString();
        },
    };
}, getLanguageSettings = () => {
    return {
        completion: true,
        customTags: [],
        format: true,
        hover: true,
        isKubernetes: false,
        validate: true,
        yamlVersion: '1.2',
    };
}, onDidChangeLanguageSettings = () => {
    return { dispose() { } };
}, } = {}) {
    return {
        name: 'yaml',
        capabilities: {
            codeActionProvider: {},
            codeLensProvider: {
                resolveProvider: true,
            },
            completionProvider: {
                triggerCharacters: [' ', ':'],
            },
            definitionProvider: true,
            diagnosticProvider: {
                interFileDependencies: false,
                workspaceDiagnostics: false,
            },
            documentOnTypeFormattingProvider: {
                triggerCharacters: ['\n']
            },
            documentSymbolProvider: true,
            hoverProvider: true,
            documentLinkProvider: {},
            foldingRangeProvider: true,
            selectionRangeProvider: true,
        },
        create(context) {
            const ls = yaml.getLanguageService({
                schemaRequestService: async (uri) => await context.env.fs?.readFile(vscode_uri_1.URI.parse(uri)) ?? '',
                telemetry: {
                    send: noop,
                    sendError: noop,
                    sendTrack: noop
                },
                // @ts-expect-error https://github.com/redhat-developer/yaml-language-server/pull/910
                clientCapabilities: context.env?.clientCapabilities,
                workspaceContext: getWorkspaceContextService(context),
            });
            const disposable = onDidChangeLanguageSettings(() => initializing = undefined, context);
            let initializing;
            return {
                dispose() {
                    disposable.dispose();
                },
                provide: {
                    'yaml/languageService': () => ls
                },
                provideCodeActions(document, range, context) {
                    return worker(document, () => {
                        return ls.getCodeAction(document, {
                            context,
                            range,
                            textDocument: document
                        });
                    });
                },
                provideCodeLenses(document) {
                    return worker(document, () => {
                        return ls.getCodeLens(document);
                    });
                },
                provideCompletionItems(document, position) {
                    return worker(document, () => {
                        return ls.doComplete(document, position, false);
                    });
                },
                provideDefinition(document, position) {
                    return worker(document, () => {
                        return ls.doDefinition(document, { position, textDocument: document });
                    });
                },
                provideDiagnostics(document) {
                    return worker(document, () => {
                        return ls.doValidation(document, false);
                    });
                },
                provideDocumentSymbols(document) {
                    return worker(document, () => {
                        return ls.findDocumentSymbols2(document, {});
                    });
                },
                provideHover(document, position) {
                    return worker(document, () => {
                        return ls.doHover(document, position);
                    });
                },
                provideDocumentLinks(document) {
                    return worker(document, () => {
                        return ls.findLinks(document);
                    });
                },
                provideFoldingRanges(document) {
                    return worker(document, () => {
                        return ls.getFoldingRanges(document, context.env.clientCapabilities?.textDocument?.foldingRange ?? {});
                    });
                },
                provideOnTypeFormattingEdits(document, position, key, options) {
                    return worker(document, () => {
                        return ls.doDocumentOnTypeFormatting(document, { ch: key, options, position, textDocument: document });
                    });
                },
                provideSelectionRanges(document, positions) {
                    return worker(document, () => {
                        return ls.getSelectionRanges(document, positions);
                    });
                },
                resolveCodeLens(codeLens) {
                    return ls.resolveCodeLens(codeLens);
                },
            };
            async function worker(document, callback) {
                if (!matchDocument(documentSelector, document)) {
                    return;
                }
                await (initializing ??= initialize());
                return await callback();
            }
            async function initialize() {
                const settings = await getLanguageSettings(context);
                ls.configure(settings);
            }
        },
    };
}
function matchDocument(selector, document) {
    for (const sel of selector) {
        if (sel === document.languageId || (typeof sel === 'object' && sel.language === document.languageId)) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=index.js.map