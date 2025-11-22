"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.embeddedContentScheme = void 0;
exports.createLanguageService = createLanguageService;
exports.decodeEmbeddedDocumentUri = decodeEmbeddedDocumentUri;
exports.encodeEmbeddedDocumentUri = encodeEmbeddedDocumentUri;
const language_core_1 = require("@volar/language-core");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const vscode_uri_1 = require("vscode-uri");
const autoInsert = require("./features/provideAutoInsertSnippet");
const hierarchy = require("./features/provideCallHierarchyItems");
const codeActions = require("./features/provideCodeActions");
const codeLens = require("./features/provideCodeLenses");
const colorPresentations = require("./features/provideColorPresentations");
const completions = require("./features/provideCompletionItems");
const definition = require("./features/provideDefinition");
const diagnostics = require("./features/provideDiagnostics");
const documentColors = require("./features/provideDocumentColors");
const documentDrop = require("./features/provideDocumentDropEdits");
const format = require("./features/provideDocumentFormattingEdits");
const documentHighlight = require("./features/provideDocumentHighlights");
const documentLink = require("./features/provideDocumentLinks");
const semanticTokens = require("./features/provideDocumentSemanticTokens");
const documentSymbols = require("./features/provideDocumentSymbols");
const fileReferences = require("./features/provideFileReferences");
const fileRename = require("./features/provideFileRenameEdits");
const foldingRanges = require("./features/provideFoldingRanges");
const hover = require("./features/provideHover");
const inlayHints = require("./features/provideInlayHints");
const moniker = require("./features/provideMoniker");
const inlineValue = require("./features/provideInlineValue");
const linkedEditing = require("./features/provideLinkedEditingRanges");
const references = require("./features/provideReferences");
const rename = require("./features/provideRenameEdits");
const renamePrepare = require("./features/provideRenameRange");
const selectionRanges = require("./features/provideSelectionRanges");
const signatureHelp = require("./features/provideSignatureHelp");
const workspaceDiagnostics = require("./features/provideWorkspaceDiagnostics");
const workspaceSymbol = require("./features/provideWorkspaceSymbols");
const codeActionResolve = require("./features/resolveCodeAction");
const codeLensResolve = require("./features/resolveCodeLens");
const completionResolve = require("./features/resolveCompletionItem");
const documentLinkResolve = require("./features/resolveDocumentLink");
const inlayHintResolve = require("./features/resolveInlayHint");
const workspaceSymbolResolve = require("./features/resolveWorkspaceSymbol");
const cancellation_1 = require("./utils/cancellation");
const uriMap_1 = require("./utils/uriMap");
exports.embeddedContentScheme = 'volar-embedded-content';
function createLanguageService(language, plugins, env, project) {
    const documentVersions = (0, uriMap_1.createUriMap)();
    const snapshot2Doc = new WeakMap();
    const context = {
        language,
        project,
        getLanguageService: () => langaugeService,
        documents: {
            get(uri, languageId, snapshot) {
                if (!snapshot2Doc.has(snapshot)) {
                    snapshot2Doc.set(snapshot, (0, uriMap_1.createUriMap)());
                }
                const map = snapshot2Doc.get(snapshot);
                if (!map.has(uri)) {
                    const version = documentVersions.get(uri) ?? 0;
                    documentVersions.set(uri, version + 1);
                    map.set(uri, vscode_languageserver_textdocument_1.TextDocument.create(uri.toString(), languageId, version, snapshot.getText(0, snapshot.getLength())));
                }
                return map.get(uri);
            },
        },
        env,
        inject: (key, ...args) => {
            for (const plugin of context.plugins) {
                if (context.disabledServicePlugins.has(plugin[1])) {
                    continue;
                }
                const provide = plugin[1].provide?.[key];
                if (provide) {
                    return provide(...args);
                }
            }
        },
        plugins: [],
        commands: {
            rename: {
                create(uri, position) {
                    return {
                        title: '',
                        command: 'editor.action.rename',
                        arguments: [
                            uri,
                            position,
                        ],
                    };
                },
                is(command) {
                    return command.command === 'editor.action.rename';
                },
            },
            showReferences: {
                create(uri, position, locations) {
                    return {
                        title: locations.length === 1 ? '1 reference' : `${locations.length} references`,
                        command: 'editor.action.showReferences',
                        arguments: [
                            uri,
                            position,
                            locations,
                        ],
                    };
                },
                is(command) {
                    return command.command === 'editor.action.showReferences';
                },
            },
            setSelection: {
                create(position) {
                    return {
                        title: '',
                        command: 'setSelection',
                        arguments: [{
                                selection: {
                                    selectionStartLineNumber: position.line + 1,
                                    positionLineNumber: position.line + 1,
                                    selectionStartColumn: position.character + 1,
                                    positionColumn: position.character + 1,
                                },
                            }],
                    };
                },
                is(command) {
                    return command.command === 'setSelection';
                },
            },
        },
        disabledEmbeddedDocumentUris: (0, uriMap_1.createUriMap)(),
        disabledServicePlugins: new WeakSet(),
        decodeEmbeddedDocumentUri,
        encodeEmbeddedDocumentUri,
    };
    for (const plugin of plugins) {
        context.plugins.push([plugin, plugin.create(context)]);
    }
    const langaugeService = createLanguageServiceBase(plugins, context);
    return langaugeService;
}
function decodeEmbeddedDocumentUri(maybeEmbeddedContentUri) {
    if (maybeEmbeddedContentUri.scheme === exports.embeddedContentScheme) {
        const embeddedCodeId = decodeURIComponent(maybeEmbeddedContentUri.authority);
        const documentUri = decodeURIComponent(maybeEmbeddedContentUri.path.substring(1));
        return [
            vscode_uri_1.URI.parse(documentUri),
            embeddedCodeId,
        ];
    }
}
function encodeEmbeddedDocumentUri(documentUri, embeddedContentId) {
    if (embeddedContentId !== embeddedContentId.toLowerCase()) {
        console.error(`embeddedContentId must be lowercase: ${embeddedContentId}`);
    }
    return vscode_uri_1.URI.from({
        scheme: exports.embeddedContentScheme,
        authority: encodeURIComponent(embeddedContentId),
        path: '/' + encodeURIComponent(documentUri.toString()),
    });
}
function createLanguageServiceBase(plugins, context) {
    const tokenModifiers = plugins.map(plugin => plugin.capabilities.semanticTokensProvider?.legend?.tokenModifiers ?? []).flat();
    const tokenTypes = plugins.map(plugin => plugin.capabilities.semanticTokensProvider?.legend?.tokenTypes ?? []).flat();
    return {
        semanticTokenLegend: {
            tokenModifiers: [...new Set(tokenModifiers)],
            tokenTypes: [...new Set(tokenTypes)],
        },
        commands: plugins.map(plugin => plugin.capabilities.executeCommandProvider?.commands ?? []).flat(),
        triggerCharacters: plugins.map(plugin => plugin.capabilities.completionProvider?.triggerCharacters ?? []).flat(),
        autoFormatTriggerCharacters: plugins.map(plugin => plugin.capabilities.documentOnTypeFormattingProvider?.triggerCharacters ?? []).flat(),
        signatureHelpTriggerCharacters: plugins.map(plugin => plugin.capabilities.signatureHelpProvider?.triggerCharacters ?? []).flat(),
        signatureHelpRetriggerCharacters: plugins.map(plugin => plugin.capabilities.signatureHelpProvider?.retriggerCharacters ?? []).flat(),
        executeCommand(command, args, token = cancellation_1.NoneCancellationToken) {
            for (const plugin of context.plugins) {
                if (context.disabledServicePlugins.has(plugin[1])) {
                    continue;
                }
                if (!plugin[1].executeCommand || !plugin[0].capabilities.executeCommandProvider?.commands.includes(command)) {
                    continue;
                }
                return plugin[1].executeCommand(command, args, token);
            }
        },
        getDocumentFormattingEdits: format.register(context),
        getFoldingRanges: foldingRanges.register(context),
        getSelectionRanges: selectionRanges.register(context),
        getLinkedEditingRanges: linkedEditing.register(context),
        getDocumentSymbols: documentSymbols.register(context),
        getDocumentColors: documentColors.register(context),
        getColorPresentations: colorPresentations.register(context),
        getDiagnostics: diagnostics.register(context),
        getWorkspaceDiagnostics: workspaceDiagnostics.register(context),
        getReferences: references.register(context),
        getFileReferences: fileReferences.register(context),
        getDeclaration: definition.register(context, 'provideDeclaration', language_core_1.isDefinitionEnabled),
        getDefinition: definition.register(context, 'provideDefinition', language_core_1.isDefinitionEnabled),
        getTypeDefinition: definition.register(context, 'provideTypeDefinition', language_core_1.isTypeDefinitionEnabled),
        getImplementations: definition.register(context, 'provideImplementation', language_core_1.isImplementationEnabled),
        getRenameRange: renamePrepare.register(context),
        getRenameEdits: rename.register(context),
        getFileRenameEdits: fileRename.register(context),
        getSemanticTokens: semanticTokens.register(context),
        getHover: hover.register(context),
        getCompletionItems: completions.register(context),
        getCodeActions: codeActions.register(context),
        getSignatureHelp: signatureHelp.register(context),
        getCodeLenses: codeLens.register(context),
        getDocumentHighlights: documentHighlight.register(context),
        getDocumentLinks: documentLink.register(context),
        getWorkspaceSymbols: workspaceSymbol.register(context),
        getAutoInsertSnippet: autoInsert.register(context),
        getDocumentDropEdits: documentDrop.register(context),
        getInlayHints: inlayHints.register(context),
        getMoniker: moniker.register(context),
        getInlineValue: inlineValue.register(context),
        resolveCodeAction: codeActionResolve.register(context),
        resolveCompletionItem: completionResolve.register(context),
        resolveCodeLens: codeLensResolve.register(context),
        resolveDocumentLink: documentLinkResolve.register(context),
        resolveInlayHint: inlayHintResolve.register(context),
        resolveWorkspaceSymbol: workspaceSymbolResolve.register(context),
        ...hierarchy.register(context),
        dispose: () => context.plugins.forEach(plugin => plugin[1].dispose?.()),
        context,
    };
}
//# sourceMappingURL=languageService.js.map