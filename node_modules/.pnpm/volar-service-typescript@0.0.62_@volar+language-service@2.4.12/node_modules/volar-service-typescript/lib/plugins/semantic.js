"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
const path = require("path-browserify");
const semver = require("semver");
const tsWithImportCache = require("typescript-auto-import-cache");
const vscode_uri_1 = require("vscode-uri");
const getFormatCodeSettings_1 = require("../configs/getFormatCodeSettings");
const getUserPreferences_1 = require("../configs/getUserPreferences");
const codeActions = require("../semanticFeatures/codeAction");
const codeActionResolve = require("../semanticFeatures/codeActionResolve");
const semanticTokens = require("../semanticFeatures/semanticTokens");
const shared_1 = require("../shared");
const lspConverters_1 = require("../utils/lspConverters");
const snippetForFunctionCall_1 = require("../utils/snippetForFunctionCall");
const documentRegistries = [];
function getDocumentRegistry(ts, useCaseSensitiveFileNames, currentDirectory) {
    let documentRegistry = documentRegistries.find(item => item[0] === useCaseSensitiveFileNames && item[1] === currentDirectory)?.[2];
    if (!documentRegistry) {
        documentRegistry = ts.createDocumentRegistry(useCaseSensitiveFileNames, currentDirectory);
        documentRegistries.push([useCaseSensitiveFileNames, currentDirectory, documentRegistry]);
    }
    return documentRegistry;
}
function create(ts, { disableAutoImportCache = false, isValidationEnabled = async (document, context) => {
    return await context.env.getConfiguration?.((0, shared_1.getConfigTitle)(document) + '.validate.enable') ?? true;
}, isSuggestionsEnabled = async (document, context) => {
    return await context.env.getConfiguration?.((0, shared_1.getConfigTitle)(document) + '.suggest.enabled') ?? true;
}, } = {}) {
    return {
        name: 'typescript-semantic',
        capabilities: {
            completionProvider: {
                triggerCharacters: getBasicTriggerCharacters(ts.version),
                resolveProvider: true,
            },
            renameProvider: {
                prepareProvider: true,
            },
            fileRenameEditsProvider: true,
            codeActionProvider: {
                codeActionKinds: [
                    '',
                    'quickfix',
                    'refactor',
                    'refactor.extract',
                    'refactor.inline',
                    'refactor.rewrite',
                    'source',
                    'source.fixAll',
                    'source.organizeImports',
                ],
                resolveProvider: true,
            },
            inlayHintProvider: {},
            callHierarchyProvider: true,
            definitionProvider: true,
            typeDefinitionProvider: true,
            diagnosticProvider: {
                interFileDependencies: true,
                workspaceDiagnostics: false,
            },
            hoverProvider: true,
            implementationProvider: true,
            referencesProvider: true,
            fileReferencesProvider: true,
            documentHighlightProvider: true,
            semanticTokensProvider: {
                // https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide#standard-token-types-and-modifiers
                legend: {
                    tokenTypes: [
                        'namespace',
                        'class',
                        'enum',
                        'interface',
                        'typeParameter',
                        'type',
                        'parameter',
                        'variable',
                        'property',
                        'enumMember',
                        'function',
                        'method',
                    ],
                    tokenModifiers: [
                        'declaration',
                        'readonly',
                        'static',
                        'async',
                        'defaultLibrary',
                        'local', // additional
                    ],
                },
            },
            workspaceSymbolProvider: {},
            signatureHelpProvider: {
                triggerCharacters: ['(', ',', '<'],
                retriggerCharacters: [')'],
            },
        },
        create(context) {
            if (!context.project.typescript) {
                console.warn(`[volar] typescript-semantic requires typescript project.`);
                return {};
            }
            const { sys, languageServiceHost, uriConverter, getExtraServiceScript } = context.project.typescript;
            let languageService;
            let created;
            if (disableAutoImportCache) {
                languageService = ts.createLanguageService(languageServiceHost, getDocumentRegistry(ts, sys.useCaseSensitiveFileNames, languageServiceHost.getCurrentDirectory()));
            }
            else {
                created = tsWithImportCache.createLanguageService(ts, sys, languageServiceHost, proxiedHost => ts.createLanguageService(proxiedHost, getDocumentRegistry(ts, sys.useCaseSensitiveFileNames, languageServiceHost.getCurrentDirectory())));
                languageService = created.languageService;
            }
            const ctx = {
                ...context,
                languageServiceHost,
                languageService,
                uriToFileName(uri) {
                    const virtualScript = getVirtualScriptByUri(uri);
                    if (virtualScript) {
                        return virtualScript.fileName;
                    }
                    return uriConverter.asFileName(uri);
                },
                fileNameToUri(fileName) {
                    const extraServiceScript = getExtraServiceScript(fileName);
                    if (extraServiceScript) {
                        const sourceScript = context.language.scripts.fromVirtualCode(extraServiceScript.code);
                        return context.encodeEmbeddedDocumentUri(sourceScript.id, extraServiceScript.code.id);
                    }
                    const uri = uriConverter.asUri(fileName);
                    const sourceScript = context.language.scripts.get(uri);
                    const serviceScript = sourceScript?.generated?.languagePlugin.typescript?.getServiceScript(sourceScript.generated.root);
                    if (sourceScript && serviceScript) {
                        return context.encodeEmbeddedDocumentUri(sourceScript.id, serviceScript.code.id);
                    }
                    return uri;
                },
                getTextDocument(uri) {
                    const decoded = context.decodeEmbeddedDocumentUri(uri);
                    if (decoded) {
                        const sourceScript = context.language.scripts.get(decoded[0]);
                        const virtualCode = sourceScript?.generated?.embeddedCodes.get(decoded[1]);
                        if (virtualCode) {
                            return context.documents.get(uri, virtualCode.languageId, virtualCode.snapshot);
                        }
                    }
                    else {
                        const sourceFile = context.language.scripts.get(uri);
                        if (sourceFile) {
                            return context.documents.get(uri, sourceFile.languageId, sourceFile.snapshot);
                        }
                    }
                },
            };
            const getCodeActions = codeActions.register(ctx);
            const doCodeActionResolve = codeActionResolve.register(ctx);
            const getDocumentSemanticTokens = semanticTokens.register(ts, ctx);
            /* typescript-language-features is hardcode true */
            const renameInfoOptions = { allowRenameOfImportPath: true };
            let formattingOptions;
            if (created?.setPreferences && context.env.getConfiguration) {
                updatePreferences();
                context.env.onDidChangeConfiguration?.(updatePreferences);
                async function updatePreferences() {
                    const preferences = await context.env.getConfiguration?.('typescript.preferences');
                    if (preferences) {
                        created.setPreferences?.(preferences);
                    }
                }
            }
            if (created?.projectUpdated) {
                const sourceScriptNames = new Set();
                const normalizeFileName = sys.useCaseSensitiveFileNames
                    ? (id) => id
                    : (id) => id.toLowerCase();
                updateSourceScriptFileNames();
                context.env.onDidChangeWatchedFiles?.(params => {
                    const someFileCreateOrDeiete = params.changes.some(change => change.type !== 2);
                    if (someFileCreateOrDeiete) {
                        updateSourceScriptFileNames();
                    }
                    for (const change of params.changes) {
                        const fileName = uriConverter.asFileName(vscode_uri_1.URI.parse(change.uri));
                        if (sourceScriptNames.has(normalizeFileName(fileName))) {
                            created.projectUpdated?.(languageServiceHost.getCurrentDirectory());
                        }
                    }
                });
                function updateSourceScriptFileNames() {
                    sourceScriptNames.clear();
                    for (const fileName of languageServiceHost.getScriptFileNames()) {
                        const maybeEmbeddedUri = ctx.fileNameToUri(fileName);
                        const decoded = context.decodeEmbeddedDocumentUri(maybeEmbeddedUri);
                        const uri = decoded ? decoded[0] : maybeEmbeddedUri;
                        const sourceScript = context.language.scripts.get(uri);
                        if (sourceScript?.generated) {
                            const tsCode = sourceScript.generated.languagePlugin.typescript?.getServiceScript(sourceScript.generated.root);
                            if (tsCode) {
                                sourceScriptNames.add(normalizeFileName(fileName));
                            }
                        }
                        else if (sourceScript) {
                            sourceScriptNames.add(normalizeFileName(fileName));
                        }
                    }
                }
            }
            return {
                provide: {
                    'typescript/languageService': () => languageService,
                    'typescript/languageServiceHost': () => languageServiceHost,
                    'typescript/documentFileName': uri => ctx.uriToFileName(uri),
                    'typescript/documentUri': fileName => ctx.fileNameToUri(fileName),
                },
                dispose() {
                    languageService.dispose();
                },
                provideDocumentFormattingEdits(_document, _range, options) {
                    formattingOptions = options;
                    return undefined;
                },
                provideOnTypeFormattingEdits(_document, _position, _key, options) {
                    formattingOptions = options;
                    return undefined;
                },
                async provideCompletionItems(document, position, completeContext, token) {
                    const uri = vscode_uri_1.URI.parse(document.uri);
                    if (!isSemanticDocument(uri, document)) {
                        return;
                    }
                    if (!await isSuggestionsEnabled(document, context)) {
                        return;
                    }
                    if (await isCancellationRequestedWhileSync(token)) {
                        return;
                    }
                    const preferences = await (0, getUserPreferences_1.getUserPreferences)(ctx, document);
                    const fileName = ctx.uriToFileName(uri);
                    const offset = document.offsetAt(position);
                    const info = (0, shared_1.safeCall)(() => ctx.languageService.getCompletionsAtPosition(fileName, offset, {
                        ...preferences,
                        triggerCharacter: completeContext.triggerCharacter,
                        triggerKind: completeContext.triggerKind,
                    }));
                    if (info) {
                        return (0, lspConverters_1.convertCompletionInfo)(ts, info, document, position, tsEntry => ({
                            uri: document.uri,
                            fileName,
                            offset,
                            originalItem: {
                                name: tsEntry.name,
                                source: tsEntry.source,
                                data: tsEntry.data,
                                labelDetails: tsEntry.labelDetails,
                            },
                        }));
                    }
                },
                async resolveCompletionItem(item, token) {
                    if (await isCancellationRequestedWhileSync(token)) {
                        return item;
                    }
                    const data = item.data;
                    if (!data) {
                        return item;
                    }
                    const { fileName, offset } = data;
                    const uri = vscode_uri_1.URI.parse(data.uri);
                    const document = ctx.getTextDocument(uri);
                    const [formatOptions, preferences] = await Promise.all([
                        (0, getFormatCodeSettings_1.getFormatCodeSettings)(ctx, document, formattingOptions),
                        (0, getUserPreferences_1.getUserPreferences)(ctx, document),
                    ]);
                    const details = (0, shared_1.safeCall)(() => ctx.languageService.getCompletionEntryDetails(fileName, offset, data.originalItem.name, formatOptions, data.originalItem.source, preferences, data.originalItem.data));
                    if (!details) {
                        return item;
                    }
                    if (data.originalItem.labelDetails) {
                        item.labelDetails ??= {};
                        Object.assign(item.labelDetails, data.originalItem.labelDetails);
                    }
                    (0, lspConverters_1.applyCompletionEntryDetails)(ts, item, details, document, ctx.fileNameToUri, ctx.getTextDocument);
                    const useCodeSnippetsOnMethodSuggest = await ctx.env.getConfiguration?.((0, shared_1.getConfigTitle)(document) + '.suggest.completeFunctionCalls') ?? false;
                    const useCodeSnippet = useCodeSnippetsOnMethodSuggest
                        && (item.kind === 3
                            || item.kind === 2);
                    if (useCodeSnippet) {
                        const shouldCompleteFunction = isValidFunctionCompletionContext(ctx.languageService, fileName, offset, document);
                        if (shouldCompleteFunction) {
                            const { snippet, parameterCount } = (0, snippetForFunctionCall_1.snippetForFunctionCall)({
                                insertText: item.insertText ?? item.textEdit?.newText, // insertText is dropped by LSP in some case: https://github.com/microsoft/vscode-languageserver-node/blob/9b742021fb04ad081aa3676a9eecf4fa612084b4/client/src/common/codeConverter.ts#L659-L664
                                label: item.label,
                            }, details.displayParts);
                            if (item.textEdit) {
                                item.textEdit.newText = snippet;
                            }
                            if (item.insertText) {
                                item.insertText = snippet;
                            }
                            item.insertTextFormat = 2;
                            if (parameterCount > 0) {
                                //Fix for https://github.com/microsoft/vscode/issues/104059
                                //Don't show parameter hints if "editor.parameterHints.enabled": false
                                // if (await getConfiguration('editor.parameterHints.enabled', document.uri)) {
                                // 	item.command = {
                                // 		title: 'triggerParameterHints',
                                // 		command: 'editor.action.triggerParameterHints',
                                // 	};
                                // }
                            }
                        }
                    }
                    return item;
                    function isValidFunctionCompletionContext(client, filepath, offset, document) {
                        // Workaround for https://github.com/microsoft/TypeScript/issues/12677
                        // Don't complete function calls inside of destructive assignments or imports
                        try {
                            const response = client.getQuickInfoAtPosition(filepath, offset);
                            if (response) {
                                switch (response.kind) {
                                    case 'var':
                                    case 'let':
                                    case 'const':
                                    case 'alias':
                                        return false;
                                }
                            }
                        }
                        catch {
                            // Noop
                        }
                        // Don't complete function call if there is already something that looks like a function call
                        // https://github.com/microsoft/vscode/issues/18131
                        const position = document.positionAt(offset);
                        const after = (0, lspConverters_1.getLineText)(document, position.line).slice(position.character);
                        return after.match(/^[a-z_$0-9]*\s*\(/gi) === null;
                    }
                },
                async provideRenameRange(document, position, token) {
                    const uri = vscode_uri_1.URI.parse(document.uri);
                    if (!isSemanticDocument(uri, document)) {
                        return;
                    }
                    if (await isCancellationRequestedWhileSync(token)) {
                        return;
                    }
                    const fileName = ctx.uriToFileName(uri);
                    const offset = document.offsetAt(position);
                    const renameInfo = (0, shared_1.safeCall)(() => ctx.languageService.getRenameInfo(fileName, offset, renameInfoOptions));
                    if (!renameInfo) {
                        return;
                    }
                    if (!renameInfo.canRename) {
                        return { message: renameInfo.localizedErrorMessage };
                    }
                    return (0, lspConverters_1.convertTextSpan)(renameInfo.triggerSpan, document);
                },
                async provideRenameEdits(document, position, newName, token) {
                    const uri = vscode_uri_1.URI.parse(document.uri);
                    if (!isSemanticDocument(uri, document, true)) {
                        return;
                    }
                    if (await isCancellationRequestedWhileSync(token)) {
                        return;
                    }
                    const fileName = ctx.uriToFileName(uri);
                    const offset = document.offsetAt(position);
                    const renameInfo = (0, shared_1.safeCall)(() => ctx.languageService.getRenameInfo(fileName, offset, renameInfoOptions));
                    if (!renameInfo?.canRename) {
                        return;
                    }
                    if (renameInfo.fileToRename) {
                        const [formatOptions, preferences] = await Promise.all([
                            (0, getFormatCodeSettings_1.getFormatCodeSettings)(ctx, document, formattingOptions),
                            (0, getUserPreferences_1.getUserPreferences)(ctx, document),
                        ]);
                        return renameFile(renameInfo.fileToRename, newName, formatOptions, preferences);
                    }
                    const { providePrefixAndSuffixTextForRename } = await (0, getUserPreferences_1.getUserPreferences)(ctx, document);
                    const entries = ctx.languageService.findRenameLocations(fileName, offset, false, false, providePrefixAndSuffixTextForRename);
                    if (!entries) {
                        return;
                    }
                    return (0, lspConverters_1.convertRenameLocations)(newName, entries, ctx.fileNameToUri, ctx.getTextDocument);
                    function renameFile(fileToRename, newName, formatOptions, preferences) {
                        // Make sure we preserve file extension if none provided
                        if (!path.extname(newName)) {
                            newName += path.extname(fileToRename);
                        }
                        const dirname = path.dirname(fileToRename);
                        const newFilePath = path.join(dirname, newName);
                        const response = (0, shared_1.safeCall)(() => ctx.languageService.getEditsForFileRename(fileToRename, newFilePath, formatOptions, preferences));
                        if (!response) {
                            return;
                        }
                        const edits = (0, lspConverters_1.convertFileTextChanges)(response, ctx.fileNameToUri, ctx.getTextDocument);
                        if (!edits.documentChanges) {
                            edits.documentChanges = [];
                        }
                        edits.documentChanges.push({
                            kind: 'rename',
                            oldUri: ctx.fileNameToUri(fileToRename).toString(),
                            newUri: ctx.fileNameToUri(newFilePath).toString(),
                        });
                        return edits;
                    }
                },
                async provideCodeActions(document, range, context, token) {
                    const uri = vscode_uri_1.URI.parse(document.uri);
                    if (!isSemanticDocument(uri, document)) {
                        return;
                    }
                    if (await isCancellationRequestedWhileSync(token)) {
                        return;
                    }
                    return getCodeActions(uri, document, range, context, formattingOptions);
                },
                async resolveCodeAction(codeAction, token) {
                    if (await isCancellationRequestedWhileSync(token)) {
                        return codeAction;
                    }
                    return doCodeActionResolve(codeAction, formattingOptions);
                },
                async provideInlayHints(document, range, token) {
                    const uri = vscode_uri_1.URI.parse(document.uri);
                    if (!isSemanticDocument(uri, document)) {
                        return;
                    }
                    if (await isCancellationRequestedWhileSync(token)) {
                        return;
                    }
                    const preferences = await (0, getUserPreferences_1.getUserPreferences)(ctx, document);
                    const fileName = ctx.uriToFileName(uri);
                    const start = document.offsetAt(range.start);
                    const end = document.offsetAt(range.end);
                    const inlayHints = (0, shared_1.safeCall)(() => 'provideInlayHints' in ctx.languageService
                        ? ctx.languageService.provideInlayHints(fileName, { start, length: end - start }, preferences)
                        : []);
                    if (!inlayHints) {
                        return [];
                    }
                    return inlayHints.map(hint => (0, lspConverters_1.convertInlayHint)(hint, document));
                },
                async provideCallHierarchyItems(document, position, token) {
                    const uri = vscode_uri_1.URI.parse(document.uri);
                    if (!isSemanticDocument(uri, document)) {
                        return;
                    }
                    if (await isCancellationRequestedWhileSync(token)) {
                        return;
                    }
                    const fileName = ctx.uriToFileName(uri);
                    const offset = document.offsetAt(position);
                    const calls = (0, shared_1.safeCall)(() => ctx.languageService.prepareCallHierarchy(fileName, offset));
                    if (!calls) {
                        return [];
                    }
                    const items = Array.isArray(calls) ? calls : [calls];
                    return items.map(item => (0, lspConverters_1.convertCallHierarchyItem)(item, ctx));
                },
                async provideCallHierarchyIncomingCalls(item, token) {
                    if (await isCancellationRequestedWhileSync(token)) {
                        return [];
                    }
                    const uri = vscode_uri_1.URI.parse(item.uri);
                    const document = ctx.getTextDocument(uri);
                    const fileName = ctx.uriToFileName(uri);
                    const offset = document.offsetAt(item.selectionRange.start);
                    const calls = (0, shared_1.safeCall)(() => ctx.languageService.provideCallHierarchyIncomingCalls(fileName, offset));
                    if (!calls) {
                        return [];
                    }
                    const items = Array.isArray(calls) ? calls : [calls];
                    return items.map(item => (0, lspConverters_1.convertCallHierarchyIncomingCall)(item, ctx));
                },
                async provideCallHierarchyOutgoingCalls(item, token) {
                    if (await isCancellationRequestedWhileSync(token)) {
                        return [];
                    }
                    const uri = vscode_uri_1.URI.parse(item.uri);
                    const document = ctx.getTextDocument(uri);
                    const fileName = ctx.uriToFileName(uri);
                    const offset = document.offsetAt(item.selectionRange.start);
                    const calls = (0, shared_1.safeCall)(() => ctx.languageService.provideCallHierarchyOutgoingCalls(fileName, offset));
                    if (!calls) {
                        return [];
                    }
                    const items = Array.isArray(calls) ? calls : [calls];
                    return items.map(item => (0, lspConverters_1.convertCallHierarchyOutgoingCall)(item, document, ctx));
                },
                async provideDefinition(document, position, token) {
                    const uri = vscode_uri_1.URI.parse(document.uri);
                    if (!isSemanticDocument(uri, document)) {
                        return;
                    }
                    if (await isCancellationRequestedWhileSync(token)) {
                        return;
                    }
                    const fileName = ctx.uriToFileName(uri);
                    const offset = document.offsetAt(position);
                    const info = (0, shared_1.safeCall)(() => ctx.languageService.getDefinitionAndBoundSpan(fileName, offset));
                    if (!info) {
                        return [];
                    }
                    return (0, lspConverters_1.convertDefinitionInfoAndBoundSpan)(info, document, ctx);
                },
                async provideTypeDefinition(document, position, token) {
                    const uri = vscode_uri_1.URI.parse(document.uri);
                    if (!isSemanticDocument(uri, document)) {
                        return;
                    }
                    if (await isCancellationRequestedWhileSync(token)) {
                        return;
                    }
                    const fileName = ctx.uriToFileName(uri);
                    const offset = document.offsetAt(position);
                    const entries = (0, shared_1.safeCall)(() => ctx.languageService.getTypeDefinitionAtPosition(fileName, offset));
                    if (!entries) {
                        return [];
                    }
                    return entries.map(entry => (0, lspConverters_1.convertDocumentSpantoLocationLink)(entry, ctx));
                },
                async provideDiagnostics(document, token) {
                    return [
                        ...await provideDiagnosticsWorker(document, token, 'syntactic') ?? [],
                        ...await provideDiagnosticsWorker(document, token, 'semantic') ?? [],
                    ];
                },
                async provideHover(document, position, token) {
                    const uri = vscode_uri_1.URI.parse(document.uri);
                    if (!isSemanticDocument(uri, document)) {
                        return;
                    }
                    if (await isCancellationRequestedWhileSync(token)) {
                        return;
                    }
                    const fileName = ctx.uriToFileName(uri);
                    const offset = document.offsetAt(position);
                    const info = (0, shared_1.safeCall)(() => ctx.languageService.getQuickInfoAtPosition(fileName, offset));
                    if (!info) {
                        return;
                    }
                    return (0, lspConverters_1.convertQuickInfo)(ts, info, document, ctx.fileNameToUri, ctx.getTextDocument);
                },
                async provideImplementation(document, position, token) {
                    const uri = vscode_uri_1.URI.parse(document.uri);
                    if (!isSemanticDocument(uri, document)) {
                        return;
                    }
                    if (await isCancellationRequestedWhileSync(token)) {
                        return;
                    }
                    const fileName = ctx.uriToFileName(uri);
                    const offset = document.offsetAt(position);
                    const entries = (0, shared_1.safeCall)(() => ctx.languageService.getImplementationAtPosition(fileName, offset));
                    if (!entries) {
                        return [];
                    }
                    return entries.map(entry => (0, lspConverters_1.convertDocumentSpantoLocationLink)(entry, ctx));
                },
                async provideReferences(document, position, referenceContext, token) {
                    const uri = vscode_uri_1.URI.parse(document.uri);
                    if (!isSemanticDocument(uri, document, true)) {
                        return;
                    }
                    if (await isCancellationRequestedWhileSync(token)) {
                        return;
                    }
                    const fileName = ctx.uriToFileName(uri);
                    const offset = document.offsetAt(position);
                    const references = (0, shared_1.safeCall)(() => ctx.languageService.findReferences(fileName, offset));
                    if (!references) {
                        return [];
                    }
                    const result = [];
                    for (const reference of references) {
                        if (referenceContext.includeDeclaration) {
                            const definition = (0, lspConverters_1.convertDocumentSpanToLocation)(reference.definition, ctx);
                            if (definition) {
                                result.push(definition);
                            }
                        }
                        for (const referenceEntry of reference.references) {
                            const reference = (0, lspConverters_1.convertDocumentSpanToLocation)(referenceEntry, ctx);
                            if (reference) {
                                result.push(reference);
                            }
                        }
                    }
                    return result;
                },
                async provideFileReferences(document, token) {
                    const uri = vscode_uri_1.URI.parse(document.uri);
                    if (!isSemanticDocument(uri, document, true)) {
                        return;
                    }
                    if (await isCancellationRequestedWhileSync(token)) {
                        return;
                    }
                    const fileName = ctx.uriToFileName(uri);
                    const entries = (0, shared_1.safeCall)(() => ctx.languageService.getFileReferences(fileName));
                    if (!entries) {
                        return [];
                    }
                    return entries.map(entry => (0, lspConverters_1.convertDocumentSpanToLocation)(entry, ctx));
                },
                async provideDocumentHighlights(document, position, token) {
                    const uri = vscode_uri_1.URI.parse(document.uri);
                    if (!isSemanticDocument(uri, document)) {
                        return;
                    }
                    if (await isCancellationRequestedWhileSync(token)) {
                        return;
                    }
                    const fileName = ctx.uriToFileName(uri);
                    const offset = document.offsetAt(position);
                    const highlights = (0, shared_1.safeCall)(() => ctx.languageService.getDocumentHighlights(fileName, offset, [fileName]));
                    if (!highlights) {
                        return [];
                    }
                    const results = [];
                    for (const highlight of highlights) {
                        for (const span of highlight.highlightSpans) {
                            results.push((0, lspConverters_1.convertHighlightSpan)(span, document));
                        }
                    }
                    return results;
                },
                async provideDocumentSemanticTokens(document, range, legend, token) {
                    const uri = vscode_uri_1.URI.parse(document.uri);
                    if (!isSemanticDocument(uri, document)) {
                        return;
                    }
                    if (await isCancellationRequestedWhileSync(token)) {
                        return;
                    }
                    return getDocumentSemanticTokens(uri, document, range, legend);
                },
                async provideWorkspaceSymbols(query, token) {
                    if (await isCancellationRequestedWhileSync(token)) {
                        return;
                    }
                    const items = (0, shared_1.safeCall)(() => ctx.languageService.getNavigateToItems(query));
                    if (!items) {
                        return [];
                    }
                    return items
                        .filter(item => item.containerName || item.kind !== 'alias')
                        .map(item => (0, lspConverters_1.convertNavigateToItem)(item, ctx.getTextDocument(ctx.fileNameToUri(item.fileName))))
                        .filter(item => !!item);
                },
                async provideFileRenameEdits(oldUri, newUri, token) {
                    if (await isCancellationRequestedWhileSync(token)) {
                        return;
                    }
                    const document = ctx.getTextDocument(oldUri);
                    const [formatOptions, preferences] = await Promise.all([
                        (0, getFormatCodeSettings_1.getFormatCodeSettings)(ctx, document, formattingOptions),
                        (0, getUserPreferences_1.getUserPreferences)(ctx, document),
                    ]);
                    const fileToRename = ctx.uriToFileName(oldUri);
                    const newFilePath = ctx.uriToFileName(newUri);
                    const response = (0, shared_1.safeCall)(() => ctx.languageService.getEditsForFileRename(fileToRename, newFilePath, formatOptions, preferences));
                    if (!response?.length) {
                        return;
                    }
                    return (0, lspConverters_1.convertFileTextChanges)(response, ctx.fileNameToUri, ctx.getTextDocument);
                },
                async provideSignatureHelp(document, position, context, token) {
                    const uri = vscode_uri_1.URI.parse(document.uri);
                    if (!isSemanticDocument(uri, document)) {
                        return;
                    }
                    if (await isCancellationRequestedWhileSync(token)) {
                        return;
                    }
                    const options = {};
                    if (context?.triggerKind === 1) {
                        options.triggerReason = {
                            kind: 'invoked'
                        };
                    }
                    else if (context?.triggerKind === 2) {
                        options.triggerReason = {
                            kind: 'characterTyped',
                            triggerCharacter: context.triggerCharacter,
                        };
                    }
                    else if (context?.triggerKind === 3) {
                        options.triggerReason = {
                            kind: 'retrigger',
                            triggerCharacter: context.triggerCharacter,
                        };
                    }
                    const fileName = ctx.uriToFileName(uri);
                    const offset = document.offsetAt(position);
                    const helpItems = (0, shared_1.safeCall)(() => ctx.languageService.getSignatureHelpItems(fileName, offset, options));
                    if (!helpItems) {
                        return;
                    }
                    return {
                        activeSignature: helpItems.selectedItemIndex,
                        activeParameter: helpItems.argumentIndex,
                        signatures: helpItems.items.map(item => {
                            const signature = {
                                label: '',
                                documentation: undefined,
                                parameters: []
                            };
                            signature.label += ts.displayPartsToString(item.prefixDisplayParts);
                            item.parameters.forEach((p, i, a) => {
                                const label = ts.displayPartsToString(p.displayParts);
                                const parameter = {
                                    label,
                                    documentation: ts.displayPartsToString(p.documentation)
                                };
                                signature.label += label;
                                signature.parameters.push(parameter);
                                if (i < a.length - 1) {
                                    signature.label += ts.displayPartsToString(item.separatorDisplayParts);
                                }
                            });
                            signature.label += ts.displayPartsToString(item.suffixDisplayParts);
                            return signature;
                        }),
                    };
                },
            };
            async function provideDiagnosticsWorker(document, token, mode) {
                const uri = vscode_uri_1.URI.parse(document.uri);
                if (!isSemanticDocument(uri, document)) {
                    return;
                }
                if (!await isValidationEnabled(document, context)) {
                    return;
                }
                if (mode === 'semantic' && await isCancellationRequestedWhileSync(token)) {
                    return;
                }
                const fileName = ctx.uriToFileName(uri);
                const program = ctx.languageService.getProgram();
                const sourceFile = program?.getSourceFile(fileName);
                if (!program || !sourceFile) {
                    return [];
                }
                const tsToken = {
                    isCancellationRequested() {
                        return ctx.project.typescript?.languageServiceHost.getCancellationToken?.().isCancellationRequested() ?? false;
                    },
                    throwIfCancellationRequested() { },
                };
                if (mode === 'syntactic') {
                    const syntacticDiagnostics = (0, shared_1.safeCall)(() => program.getSyntacticDiagnostics(sourceFile, tsToken)) ?? [];
                    const suggestionDiagnostics = (0, shared_1.safeCall)(() => ctx.languageService.getSuggestionDiagnostics(fileName)) ?? [];
                    return [...syntacticDiagnostics, ...suggestionDiagnostics]
                        .map(diagnostic => (0, lspConverters_1.convertDiagnostic)(diagnostic, document, ctx.fileNameToUri, ctx.getTextDocument))
                        .filter(diagnostic => !!diagnostic);
                }
                else if (mode === 'semantic') {
                    const semanticDiagnostics = (0, shared_1.safeCall)(() => program.getSemanticDiagnostics(sourceFile, tsToken)) ?? [];
                    const declarationDiagnostics = getEmitDeclarations(program.getCompilerOptions())
                        ? (0, shared_1.safeCall)(() => program.getDeclarationDiagnostics(sourceFile, tsToken)) ?? []
                        : [];
                    return [...semanticDiagnostics, ...declarationDiagnostics]
                        .map(diagnostic => (0, lspConverters_1.convertDiagnostic)(diagnostic, document, ctx.fileNameToUri, ctx.getTextDocument))
                        .filter(diagnostic => !!diagnostic);
                }
            }
            function getEmitDeclarations(compilerOptions) {
                return !!(compilerOptions.declaration || compilerOptions.composite);
            }
            function isSemanticDocument(uri, document, withJson = false) {
                const virtualScript = getVirtualScriptByUri(uri);
                if (virtualScript) {
                    return true;
                }
                if (withJson && (0, shared_1.isJsonDocument)(document)) {
                    return true;
                }
                return (0, shared_1.isTsDocument)(document);
            }
            async function isCancellationRequestedWhileSync(token) {
                if (sys.sync) {
                    let oldSysVersion;
                    let newSysVersion = sys.version;
                    do {
                        oldSysVersion = newSysVersion;
                        languageService.getProgram(); // trigger file requests
                        newSysVersion = await aggressiveSync(sys.sync);
                    } while (newSysVersion !== oldSysVersion && !token.isCancellationRequested);
                }
                return token.isCancellationRequested;
            }
            async function aggressiveSync(fn) {
                const promise = fn();
                let newVersion;
                let syncing = true;
                promise.then(version => {
                    newVersion = version;
                    syncing = false;
                });
                while (syncing) {
                    languageService.getProgram(); // trigger file requests before old requests are completed
                    await Promise.race([promise, sleep(10)]);
                }
                return newVersion;
            }
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            function getVirtualScriptByUri(uri) {
                const decoded = context.decodeEmbeddedDocumentUri(uri);
                const sourceScript = decoded && context.language.scripts.get(decoded[0]);
                const virtualCode = decoded && sourceScript?.generated?.embeddedCodes.get(decoded[1]);
                if (virtualCode && sourceScript?.generated?.languagePlugin.typescript) {
                    const { getServiceScript, getExtraServiceScripts } = sourceScript.generated?.languagePlugin.typescript;
                    const sourceFileName = uriConverter.asFileName(sourceScript.id);
                    if (getServiceScript(sourceScript.generated.root)?.code === virtualCode) {
                        return {
                            fileName: sourceFileName,
                            code: virtualCode,
                        };
                    }
                    for (const extraScript of getExtraServiceScripts?.(sourceFileName, sourceScript.generated.root) ?? []) {
                        if (extraScript.code === virtualCode) {
                            return extraScript;
                        }
                    }
                }
            }
        },
    };
}
function getBasicTriggerCharacters(tsVersion) {
    const triggerCharacters = ['.', '"', '\'', '`', '/', '<'];
    // https://github.com/microsoft/vscode/blob/8e65ae28d5fb8b3c931135da1a41edb9c80ae46f/extensions/typescript-language-features/src/languageFeatures/completions.ts#L811-L833
    if (semver.lt(tsVersion, '3.1.0') || semver.gte(tsVersion, '3.2.0')) {
        triggerCharacters.push('@');
    }
    if (semver.gte(tsVersion, '3.8.1')) {
        triggerCharacters.push('#');
    }
    if (semver.gte(tsVersion, '4.3.0')) {
        triggerCharacters.push(' ');
    }
    return triggerCharacters;
}
//# sourceMappingURL=semantic.js.map