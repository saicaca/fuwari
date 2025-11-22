"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_service_1 = require("@volar/language-service");
const vscode = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
const protocol_1 = require("../../protocol");
const reportedCapabilities = new Set();
function register(server, documents, configurations) {
    // Diagnostics support
    let refreshReq = 0;
    let updateDiagnosticsBatchReq = 0;
    const refreshHandlers = [];
    server.onInitialize(serverCapabilities => {
        let lastCompleteUri;
        let lastCompleteLs;
        let lastCodeLensLs;
        let lastCodeActionLs;
        let lastCallHierarchyLs;
        let lastTypeHierarchyLs;
        let lastDocumentLinkLs;
        let lastInlayHintLs;
        let languageServiceToId = new WeakMap();
        let currentLanguageServiceId = 0;
        const languageServiceById = new Map();
        const { languageServicePlugins, project, initializeParams } = server;
        if (languageServicePlugins.some(({ capabilities }) => capabilities.selectionRangeProvider)) {
            serverCapabilities.selectionRangeProvider = true;
            server.connection.onSelectionRanges(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    return languageService.getSelectionRanges(uri, params.positions, token);
                });
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.foldingRangeProvider)) {
            serverCapabilities.foldingRangeProvider = true;
            server.connection.onFoldingRanges(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    return languageService.getFoldingRanges(uri, token);
                });
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.linkedEditingRangeProvider)) {
            serverCapabilities.linkedEditingRangeProvider = true;
            server.connection.languages.onLinkedEditingRange(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    return languageService.getLinkedEditingRanges(uri, params.position, token);
                });
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.colorProvider)) {
            serverCapabilities.colorProvider = true;
            server.connection.onDocumentColor(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    return languageService.getDocumentColors(uri, token);
                });
            });
            server.connection.onColorPresentation(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    return languageService.getColorPresentations(uri, params.color, params.range, token);
                });
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.documentSymbolProvider)) {
            serverCapabilities.documentSymbolProvider = true;
            server.connection.onDocumentSymbol(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    return languageService.getDocumentSymbols(uri, token);
                });
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.documentFormattingProvider)) {
            serverCapabilities.documentFormattingProvider = true;
            serverCapabilities.documentRangeFormattingProvider = true;
            server.connection.onDocumentFormatting(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    return languageService.getDocumentFormattingEdits(uri, params.options, undefined, undefined, token);
                });
            });
            server.connection.onDocumentRangeFormatting(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    return languageService.getDocumentFormattingEdits(uri, params.options, params.range, undefined, token);
                });
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.referencesProvider)) {
            serverCapabilities.referencesProvider = true;
            server.connection.onReferences(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    return languageService.getReferences(uri, params.position, { includeDeclaration: true }, token);
                });
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.implementationProvider)) {
            serverCapabilities.implementationProvider = true;
            server.connection.onImplementation(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, async (languageService) => {
                    const definitions = await languageService.getImplementations(uri, params.position, token);
                    return handleDefinitions(initializeParams, 'implementation', definitions ?? []);
                });
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.declarationProvider)) {
            serverCapabilities.declarationProvider = true;
            server.connection.onDeclaration(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, async (languageService) => {
                    const definitions = await languageService.getDeclaration(uri, params.position, token);
                    return handleDefinitions(initializeParams, 'declaration', definitions ?? []);
                });
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.definitionProvider)) {
            serverCapabilities.definitionProvider = true;
            server.connection.onDefinition(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, async (languageService) => {
                    const definitions = await languageService.getDefinition(uri, params.position, token);
                    return handleDefinitions(initializeParams, 'definition', definitions ?? []);
                });
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.typeDefinitionProvider)) {
            serverCapabilities.typeDefinitionProvider = true;
            server.connection.onTypeDefinition(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, async (languageService) => {
                    const definitions = await languageService.getTypeDefinition(uri, params.position, token);
                    return handleDefinitions(initializeParams, 'typeDefinition', definitions ?? []);
                });
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.callHierarchyProvider)) {
            serverCapabilities.callHierarchyProvider = true;
            server.connection.languages.callHierarchy.onPrepare(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    lastCallHierarchyLs = languageService;
                    return languageService.getCallHierarchyItems(uri, params.position, token);
                }) ?? [];
            });
            server.connection.languages.callHierarchy.onIncomingCalls(async (params, token) => {
                return await lastCallHierarchyLs?.getCallHierarchyIncomingCalls(params.item, token) ?? [];
            });
            server.connection.languages.callHierarchy.onOutgoingCalls(async (params, token) => {
                return await lastCallHierarchyLs?.getCallHierarchyOutgoingCalls(params.item, token) ?? [];
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.typeHierarchyProvider)) {
            serverCapabilities.typeHierarchyProvider = true;
            server.connection.languages.typeHierarchy.onPrepare(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    lastTypeHierarchyLs = languageService;
                    return languageService.getTypeHierarchyItems(uri, params.position, token);
                }) ?? [];
            });
            server.connection.languages.typeHierarchy.onSupertypes(async (params, token) => {
                return await lastTypeHierarchyLs?.getTypeHierarchySupertypes(params.item, token) ?? [];
            });
            server.connection.languages.typeHierarchy.onSubtypes(async (params, token) => {
                return await lastTypeHierarchyLs?.getTypeHierarchySubtypes(params.item, token) ?? [];
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.hoverProvider)) {
            serverCapabilities.hoverProvider = true;
            server.connection.onHover(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    return languageService.getHover(uri, params.position, token);
                });
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.documentHighlightProvider)) {
            serverCapabilities.documentHighlightProvider = true;
            server.connection.onDocumentHighlight(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    return languageService.getDocumentHighlights(uri, params.position, token);
                });
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.workspaceSymbolProvider)) {
            serverCapabilities.workspaceSymbolProvider = {};
            server.connection.onWorkspaceSymbol(async (params, token) => {
                let languageServices = await project.getExistingLanguageServices();
                if (!languageServices.length) {
                    for (const document of documents.all()) {
                        await project.getLanguageService(vscode_uri_1.URI.parse(document.uri));
                    }
                    languageServices = await project.getExistingLanguageServices();
                }
                const symbols = [];
                for (const languageService of languageServices) {
                    if (token.isCancellationRequested) {
                        return;
                    }
                    let languageServiceId = languageServiceToId.get(languageService);
                    if (languageServiceId === undefined) {
                        languageServiceId = currentLanguageServiceId;
                        languageServiceToId.set(languageService, languageServiceId);
                        languageServiceById.set(languageServiceId, new WeakRef(languageService));
                    }
                    const languageServiceResult = await languageService.getWorkspaceSymbols(params.query, token);
                    for (const symbol of languageServiceResult) {
                        symbol.data = {
                            languageServiceId,
                            originalData: symbol.data,
                        };
                    }
                    symbols.push(...await languageService.getWorkspaceSymbols(params.query, token));
                }
                return symbols;
            });
            if (languageServicePlugins.some(({ capabilities }) => capabilities.workspaceSymbolProvider?.resolveProvider)) {
                serverCapabilities.workspaceSymbolProvider.resolveProvider = true;
                server.connection.onWorkspaceSymbolResolve(async (symbol, token) => {
                    const languageServiceId = symbol.data?.languageServiceId;
                    const languageService = languageServiceById.get(languageServiceId)?.deref();
                    if (!languageService) {
                        return symbol;
                    }
                    symbol.data = symbol.data?.originalData;
                    return await languageService.resolveWorkspaceSymbol?.(symbol, token);
                });
            }
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.renameProvider)) {
            serverCapabilities.renameProvider = {};
            server.connection.onRenameRequest(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    return languageService.getRenameEdits(uri, params.position, params.newName, token);
                });
            });
            if (languageServicePlugins.some(({ capabilities }) => capabilities.renameProvider?.prepareProvider)) {
                serverCapabilities.renameProvider.prepareProvider = true;
                server.connection.onPrepareRename(async (params, token) => {
                    const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                    return await worker(uri, token, async (languageService) => {
                        const result = await languageService.getRenameRange(uri, params.position, token);
                        if (result && 'message' in result) {
                            return new vscode.ResponseError(0, result.message);
                        }
                        return result;
                    });
                });
            }
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.documentLinkProvider)) {
            serverCapabilities.documentLinkProvider = {};
            server.connection.onDocumentLinks(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    lastDocumentLinkLs = languageService;
                    return languageService.getDocumentLinks(uri, token);
                });
            });
            if (languageServicePlugins.some(({ capabilities }) => capabilities.documentLinkProvider?.resolveProvider)) {
                serverCapabilities.documentLinkProvider.resolveProvider = true;
                server.connection.onDocumentLinkResolve(async (link, token) => {
                    return await lastDocumentLinkLs?.resolveDocumentLink(link, token);
                });
            }
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.codeLensProvider)) {
            serverCapabilities.codeLensProvider = {};
            server.connection.onCodeLens(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    lastCodeLensLs = languageService;
                    return languageService.getCodeLenses(uri, token);
                });
            });
            if (languageServicePlugins.some(({ capabilities }) => capabilities.codeLensProvider?.resolveProvider)) {
                serverCapabilities.codeLensProvider.resolveProvider = true;
                server.connection.onCodeLensResolve(async (codeLens, token) => {
                    return await lastCodeLensLs?.resolveCodeLens(codeLens, token) ?? codeLens;
                });
            }
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.inlayHintProvider)) {
            serverCapabilities.inlayHintProvider = {};
            server.connection.languages.inlayHint.on(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    lastInlayHintLs = languageService;
                    return languageService.getInlayHints(uri, params.range, token);
                });
            });
            if (languageServicePlugins.some(({ capabilities }) => capabilities.inlayHintProvider?.resolveProvider)) {
                serverCapabilities.inlayHintProvider.resolveProvider = true;
                server.connection.languages.inlayHint.resolve(async (hint, token) => {
                    return await lastInlayHintLs?.resolveInlayHint(hint, token) ?? hint;
                });
            }
            refreshHandlers.push(() => {
                if (initializeParams.capabilities.workspace?.inlayHint?.refreshSupport) {
                    server.connection.languages.inlayHint.refresh();
                }
                else {
                    wranCapabilitiesNotSupported('workspace.inlayHint.refreshSupport');
                }
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.signatureHelpProvider)) {
            serverCapabilities.signatureHelpProvider = {
                triggerCharacters: [...new Set(languageServicePlugins.map(({ capabilities }) => capabilities.signatureHelpProvider?.triggerCharacters ?? []).flat())],
                retriggerCharacters: [...new Set(languageServicePlugins.map(({ capabilities }) => capabilities.signatureHelpProvider?.retriggerCharacters ?? []).flat())],
            };
            server.connection.onSignatureHelp(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    return languageService.getSignatureHelp(uri, params.position, params.context, token);
                });
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.completionProvider)) {
            serverCapabilities.completionProvider = {
                triggerCharacters: [...new Set(languageServicePlugins.map(({ capabilities }) => capabilities.completionProvider?.triggerCharacters ?? []).flat())],
            };
            server.connection.onCompletion(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, async (languageService) => {
                    lastCompleteUri = params.textDocument.uri;
                    lastCompleteLs = languageService;
                    const list = await languageService.getCompletionItems(uri, params.position, params.context, token);
                    list.items = list.items.map(item => handleCompletionItem(initializeParams, item));
                    return list;
                });
            });
            if (languageServicePlugins.some(({ capabilities }) => capabilities.completionProvider?.resolveProvider)) {
                serverCapabilities.completionProvider.resolveProvider = true;
                server.connection.onCompletionResolve(async (item, token) => {
                    if (lastCompleteUri && lastCompleteLs) {
                        item = await lastCompleteLs.resolveCompletionItem(item, token);
                        item = handleCompletionItem(initializeParams, item);
                    }
                    return item;
                });
            }
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.semanticTokensProvider)) {
            serverCapabilities.semanticTokensProvider = {
                range: true,
                full: false, // TODO: enable it after testing
                legend: {
                    tokenTypes: [...new Set(languageServicePlugins.map(({ capabilities }) => capabilities.semanticTokensProvider?.legend?.tokenTypes ?? []).flat())],
                    tokenModifiers: [...new Set(languageServicePlugins.map(({ capabilities }) => capabilities.semanticTokensProvider?.legend?.tokenModifiers ?? []).flat())],
                },
            };
            server.connection.languages.semanticTokens.on(async (params, token, _, resultProgress) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, async (languageService) => {
                    return await languageService?.getSemanticTokens(uri, undefined, serverCapabilities.semanticTokensProvider.legend, tokens => resultProgress?.report(tokens), token);
                }) ?? { data: [] };
            });
            server.connection.languages.semanticTokens.onRange(async (params, token, _, resultProgress) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, async (languageService) => {
                    return await languageService?.getSemanticTokens(uri, params.range, serverCapabilities.semanticTokensProvider.legend, tokens => resultProgress?.report(tokens), token);
                }) ?? { data: [] };
            });
            refreshHandlers.push(() => {
                if (initializeParams.capabilities.workspace?.semanticTokens?.refreshSupport) {
                    server.connection.languages.semanticTokens.refresh();
                }
                else {
                    wranCapabilitiesNotSupported('workspace.semanticTokens.refreshSupport');
                }
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.codeActionProvider)) {
            serverCapabilities.codeActionProvider = {
                codeActionKinds: languageServicePlugins.some(({ capabilities }) => capabilities.codeActionProvider?.codeActionKinds)
                    ? [...new Set(languageServicePlugins.map(({ capabilities }) => capabilities.codeActionProvider?.codeActionKinds ?? []).flat())]
                    : undefined,
            };
            server.connection.onCodeAction(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, async (languageService) => {
                    lastCodeActionLs = languageService;
                    let codeActions = await languageService.getCodeActions(uri, params.range, params.context, token) ?? [];
                    for (const codeAction of codeActions) {
                        if (codeAction.data && typeof codeAction.data === 'object') {
                            codeAction.data.uri = params.textDocument.uri;
                        }
                        else {
                            codeAction.data = { uri: params.textDocument.uri };
                        }
                    }
                    if (!initializeParams.capabilities.textDocument?.codeAction?.disabledSupport
                        && codeActions.some(codeAction => !codeAction.disabled)) {
                        codeActions = codeActions.filter(codeAction => !codeAction.disabled);
                        wranCapabilitiesNotSupported('textDocument.codeAction.disabledSupport');
                    }
                    return codeActions;
                });
            });
            if (languageServicePlugins.some(({ capabilities }) => capabilities.codeActionProvider?.resolveProvider)) {
                serverCapabilities.codeActionProvider.resolveProvider = true;
                server.connection.onCodeActionResolve(async (codeAction, token) => {
                    return await lastCodeActionLs?.resolveCodeAction(codeAction, token) ?? codeAction;
                });
            }
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.documentOnTypeFormattingProvider)) {
            serverCapabilities.documentOnTypeFormattingProvider = {
                firstTriggerCharacter: [...new Set(languageServicePlugins.map(({ capabilities }) => capabilities.documentOnTypeFormattingProvider?.triggerCharacters ?? []).flat())][0],
                moreTriggerCharacter: [...new Set(languageServicePlugins.map(({ capabilities }) => capabilities.documentOnTypeFormattingProvider?.triggerCharacters ?? []).flat())].slice(1),
            };
            server.connection.onDocumentOnTypeFormatting(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    return languageService.getDocumentFormattingEdits(uri, params.options, undefined, params, token);
                });
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.executeCommandProvider)) {
            serverCapabilities.executeCommandProvider = {
                commands: [...new Set(languageServicePlugins.map(({ capabilities }) => capabilities.executeCommandProvider?.commands ?? []).flat())],
            };
            server.connection.onExecuteCommand(async (params, token) => {
                let languageServices = await project.getExistingLanguageServices();
                if (!languageServices.length) {
                    for (const document of documents.all()) {
                        await project.getLanguageService(vscode_uri_1.URI.parse(document.uri));
                    }
                    languageServices = await project.getExistingLanguageServices();
                }
                for (const languageService of languageServices) {
                    if (languageService.executeCommand && languageService.commands.includes(params.command)) {
                        try {
                            return await languageService.executeCommand(params.command, params.arguments ?? [], token);
                        }
                        catch { }
                    }
                }
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.monikerProvider)) {
            serverCapabilities.monikerProvider = true;
            server.connection.languages.moniker.on(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    return languageService.getMoniker(uri, params.position, token);
                }) ?? null;
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.inlineValueProvider)) {
            serverCapabilities.inlineValueProvider = true;
            server.connection.languages.inlineValue.on(async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    return languageService.getInlineValue(uri, params.range, params.context, token);
                });
            });
            refreshHandlers.push(() => {
                if (initializeParams.capabilities.workspace?.inlineValue?.refreshSupport) {
                    server.connection.languages.inlineValue.refresh();
                }
                else {
                    wranCapabilitiesNotSupported('workspace.inlineValue.refreshSupport');
                }
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.autoInsertionProvider)) {
            const triggerCharacterToConfigurationSections = new Map();
            const tryAdd = (char, section) => {
                let sectionSet = triggerCharacterToConfigurationSections.get(char);
                if (!sectionSet) {
                    triggerCharacterToConfigurationSections.set(char, sectionSet = new Set());
                }
                if (section) {
                    sectionSet.add(section);
                }
            };
            for (const { capabilities } of languageServicePlugins) {
                if (capabilities.autoInsertionProvider) {
                    const { triggerCharacters, configurationSections } = capabilities.autoInsertionProvider;
                    if (configurationSections) {
                        if (configurationSections.length !== triggerCharacters.length) {
                            throw new Error('configurationSections.length !== triggerCharacters.length');
                        }
                        for (let i = 0; i < configurationSections.length; i++) {
                            tryAdd(triggerCharacters[i], configurationSections[i]);
                        }
                    }
                    else {
                        for (const char of triggerCharacters) {
                            tryAdd(char);
                        }
                    }
                }
            }
            serverCapabilities.experimental ??= {};
            serverCapabilities.experimental.autoInsertionProvider = {
                triggerCharacters: [],
                configurationSections: [],
            };
            for (const [char, sections] of triggerCharacterToConfigurationSections) {
                if (sections.size) {
                    serverCapabilities.experimental.autoInsertionProvider.triggerCharacters.push(char);
                    serverCapabilities.experimental.autoInsertionProvider.configurationSections.push([...sections]);
                }
                else {
                    serverCapabilities.experimental.autoInsertionProvider.triggerCharacters.push(char);
                    serverCapabilities.experimental.autoInsertionProvider.configurationSections.push(null);
                }
            }
            server.connection.onRequest(protocol_1.AutoInsertRequest.type, async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    return languageService.getAutoInsertSnippet(uri, params.selection, params.change, token);
                });
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.fileRenameEditsProvider)) {
            serverCapabilities.experimental ??= {};
            serverCapabilities.experimental.fileRenameEditsProvider = true;
            server.connection.workspace.onWillRenameFiles(async (params, token) => {
                const _edits = await Promise.all(params.files.map(async (file) => {
                    const oldUri = vscode_uri_1.URI.parse(file.oldUri);
                    const newUri = vscode_uri_1.URI.parse(file.newUri);
                    return await worker(oldUri, token, languageService => {
                        return languageService.getFileRenameEdits(oldUri, newUri, token) ?? null;
                    }) ?? null;
                }));
                const edits = _edits.filter((edit) => !!edit);
                if (edits.length) {
                    (0, language_service_1.mergeWorkspaceEdits)(edits[0], ...edits.slice(1));
                    return edits[0];
                }
                return null;
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.fileReferencesProvider)) {
            serverCapabilities.experimental ??= {};
            serverCapabilities.experimental.fileReferencesProvider = true;
            server.connection.onRequest(protocol_1.FindFileReferenceRequest.type, async (params, token) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                return await worker(uri, token, languageService => {
                    return languageService.getFileReferences(uri, token);
                });
            });
        }
        if (languageServicePlugins.some(({ capabilities }) => capabilities.documentDropEditsProvider)) {
            serverCapabilities.experimental ??= {};
            serverCapabilities.experimental.documentDropEditsProvider = true;
            server.connection.onRequest(protocol_1.DocumentDropRequest.type, async ({ textDocument, position, dataTransfer }, token) => {
                const dataTransferMap = new Map();
                for (const item of dataTransfer) {
                    dataTransferMap.set(item.mimeType, {
                        value: item.value,
                        asString() {
                            return server.connection.sendRequest(protocol_1.DocumentDrop_DataTransferItemAsStringRequest.type, { mimeType: item.mimeType });
                        },
                        asFile() {
                            if (item.file) {
                                return {
                                    name: item.file.name,
                                    uri: item.file.uri,
                                    data() {
                                        return server.connection.sendRequest(protocol_1.DocumentDrop_DataTransferItemFileDataRequest.type, { mimeType: item.mimeType });
                                    },
                                };
                            }
                        },
                    });
                }
                const uri = vscode_uri_1.URI.parse(textDocument.uri);
                const languageService = (await project.getLanguageService(uri));
                return languageService.getDocumentDropEdits(uri, position, dataTransferMap, token);
            });
        }
        // Diagnostic support
        const supportsDiagnosticPull = !!initializeParams.capabilities.workspace?.diagnostics;
        const diagnosticProvider = languageServicePlugins.some(({ capabilities }) => !!capabilities.diagnosticProvider);
        const interFileDependencies = languageServicePlugins.some(({ capabilities }) => capabilities.diagnosticProvider?.interFileDependencies);
        const workspaceDiagnostics = languageServicePlugins.some(({ capabilities }) => capabilities.diagnosticProvider?.workspaceDiagnostics);
        if (diagnosticProvider) {
            if (supportsDiagnosticPull && !interFileDependencies) {
                serverCapabilities.diagnosticProvider = {
                    // Unreliable, see https://github.com/microsoft/vscode-languageserver-node/issues/848#issuecomment-2189521060
                    interFileDependencies: false,
                    workspaceDiagnostics,
                };
                refreshHandlers.push(() => {
                    if (initializeParams.capabilities.workspace?.diagnostics?.refreshSupport) {
                        server.connection.languages.diagnostics.refresh();
                    }
                    else {
                        wranCapabilitiesNotSupported('workspace.diagnostics.refreshSupport');
                    }
                });
            }
            else {
                documents.onDidChangeContent(({ document }) => {
                    const changedDocument = documents.get(vscode_uri_1.URI.parse(document.uri));
                    if (!changedDocument) {
                        return;
                    }
                    if (interFileDependencies) {
                        const remainingDocuments = [...documents.all()].filter(doc => doc !== changedDocument);
                        updateDiagnosticsBatch(project, [changedDocument, ...remainingDocuments]);
                    }
                    else {
                        updateDiagnosticsBatch(project, [changedDocument]);
                    }
                });
                documents.onDidClose(({ document }) => {
                    server.connection.sendDiagnostics({ uri: document.uri, diagnostics: [] });
                });
                configurations.onDidChange(() => requestRefresh(false));
                refreshHandlers.push(async (clearDiagnostics) => {
                    if (clearDiagnostics) {
                        for (const document of documents.all()) {
                            server.connection.sendDiagnostics({ uri: document.uri, diagnostics: [] });
                        }
                    }
                    await updateDiagnosticsBatch(project, [...documents.all()]);
                });
            }
            server.connection.languages.diagnostics.on(async (params, token, _workDoneProgressReporter, resultProgressReporter) => {
                const uri = vscode_uri_1.URI.parse(params.textDocument.uri);
                const result = await worker(uri, token, languageService => {
                    return languageService.getDiagnostics(uri, errors => {
                        // resultProgressReporter is undefined in vscode
                        resultProgressReporter?.report({
                            relatedDocuments: {
                                [params.textDocument.uri]: {
                                    kind: vscode.DocumentDiagnosticReportKind.Full,
                                    items: errors,
                                },
                            },
                        });
                    }, token);
                });
                return {
                    kind: vscode.DocumentDiagnosticReportKind.Full,
                    items: result ?? [],
                };
            });
        }
        if (workspaceDiagnostics) {
            server.connection.languages.diagnostics.onWorkspace(async (_params, token) => {
                let languageServices = await project.getExistingLanguageServices();
                if (!languageServices.length) {
                    for (const document of documents.all()) {
                        await project.getLanguageService(vscode_uri_1.URI.parse(document.uri));
                    }
                    languageServices = await project.getExistingLanguageServices();
                }
                const items = [];
                for (const languageService of languageServices) {
                    if (token.isCancellationRequested) {
                        break;
                    }
                    const result = await languageService.getWorkspaceDiagnostics(token);
                    items.push(...result);
                }
                return { items };
            });
        }
    });
    return { requestRefresh };
    async function requestRefresh(clearDiagnostics) {
        const req = ++refreshReq;
        const delay = 250;
        await sleep(delay);
        if (req !== refreshReq) {
            return;
        }
        for (const handler of refreshHandlers) {
            handler(clearDiagnostics);
        }
    }
    async function updateDiagnosticsBatch(project, documents) {
        const req = ++updateDiagnosticsBatchReq;
        const delay = 250;
        const token = {
            get isCancellationRequested() {
                return req !== updateDiagnosticsBatchReq;
            },
            onCancellationRequested: vscode.Event.None,
        };
        for (const doc of documents) {
            await sleep(delay);
            if (token.isCancellationRequested) {
                break;
            }
            await updateDiagnostics(project, vscode_uri_1.URI.parse(doc.uri), doc.version, token);
        }
    }
    async function updateDiagnostics(project, uri, version, token) {
        const languageService = await project.getLanguageService(uri);
        const diagnostics = await languageService.getDiagnostics(uri, diagnostics => server.connection.sendDiagnostics({ uri: uri.toString(), diagnostics, version }), token);
        if (!token.isCancellationRequested) {
            server.connection.sendDiagnostics({ uri: uri.toString(), diagnostics, version });
        }
    }
    function worker(uri, token, cb) {
        return new Promise(resolve => {
            server.env.timer.setImmediate(async () => {
                if (token.isCancellationRequested) {
                    resolve(undefined);
                    return;
                }
                const languageService = (await server.project.getLanguageService((0, language_service_1.decodeEmbeddedDocumentUri)(uri)?.[0] ?? uri));
                const result = await cb(languageService);
                if (token.isCancellationRequested) {
                    resolve(undefined);
                    return;
                }
                resolve(result);
            });
        });
    }
    function handleCompletionItem(initializeParams, item) {
        const snippetSupport = initializeParams.capabilities.textDocument?.completion?.completionItem?.snippetSupport ?? false;
        const insertReplaceSupport = initializeParams.capabilities.textDocument?.completion?.completionItem?.insertReplaceSupport ?? false;
        if (!snippetSupport && item.insertTextFormat === vscode.InsertTextFormat.Snippet) {
            item.insertTextFormat = vscode.InsertTextFormat.PlainText;
            if (item.insertText) {
                item.insertText = item.insertText.replace(/\$\d+/g, '');
                item.insertText = item.insertText.replace(/\${\d+:([^}]*)}/g, '');
            }
            wranCapabilitiesNotSupported('textDocument.completion.completionItem.snippetSupport');
        }
        if (!insertReplaceSupport && item.textEdit && vscode.InsertReplaceEdit.is(item.textEdit)) {
            item.textEdit = vscode.TextEdit.replace(item.textEdit.insert, item.textEdit.newText);
            wranCapabilitiesNotSupported('textDocument.completion.completionItem.insertReplaceSupport');
        }
        return item;
    }
    function handleDefinitions(initializeParams, type, items) {
        const linkSupport = initializeParams.capabilities.textDocument?.[type]?.linkSupport ?? false;
        if (!linkSupport) {
            wranCapabilitiesNotSupported(`textDocument.${type}.linkSupport`);
            return items.map(item => ({
                uri: item.targetUri,
                range: item.targetRange,
            }));
        }
        return items;
    }
}
function wranCapabilitiesNotSupported(path) {
    if (reportedCapabilities.has(path)) {
        return;
    }
    reportedCapabilities.add(path);
    console.warn(`${path} is not supported by the client but could be used by the server.`);
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//# sourceMappingURL=languageFeatures.js.map