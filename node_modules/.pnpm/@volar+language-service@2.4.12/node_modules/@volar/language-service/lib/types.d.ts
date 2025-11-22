import type { Language, SourceScript, VirtualCode } from '@volar/language-core';
import type * as vscode from 'vscode-languageserver-protocol';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type * as ts from 'typescript';
import type { LanguageService } from './languageService';
import type { URI } from 'vscode-uri';
import type { UriMap } from './utils/uriMap';
export type * from 'vscode-languageserver-protocol';
export interface LanguageServiceEnvironment {
    workspaceFolders: URI[];
    locale?: string;
    clientCapabilities?: vscode.ClientCapabilities;
    fs?: FileSystem;
    console?: Console;
    getConfiguration?<T>(section: string, scopeUri?: string): Promise<T | undefined>;
    onDidChangeConfiguration?(cb: (params: vscode.DidChangeConfigurationParams) => void): vscode.Disposable;
    onDidChangeWatchedFiles?(cb: (params: vscode.DidChangeWatchedFilesParams) => void): vscode.Disposable;
}
export interface FileSystem {
    stat(uri: URI): ProviderResult<FileStat | undefined>;
    readDirectory(uri: URI): ProviderResult<[string, FileType][]>;
    readFile(uri: URI, encoding?: string): ProviderResult<string | undefined>;
}
export interface FileStat {
    type: FileType;
    ctime: number;
    mtime: number;
    size: number;
}
export declare enum FileType {
    Unknown = 0,
    File = 1,
    Directory = 2,
    SymbolicLink = 64
}
export interface LanguageServiceCommand<T extends any[]> {
    create(...args: T): vscode.Command | undefined;
    is(value: vscode.Command): boolean;
}
export interface ProjectContext {
}
export interface LanguageServiceContext {
    language: Language<URI>;
    project: ProjectContext;
    getLanguageService(): LanguageService;
    env: LanguageServiceEnvironment;
    inject<Provide = any, K extends keyof Provide = keyof Provide>(key: K, ...args: Provide[K] extends (...args: any) => any ? Parameters<Provide[K]> : never): ReturnType<Provide[K] extends (...args: any) => any ? Provide[K] : never> | undefined;
    commands: {
        showReferences: LanguageServiceCommand<[uri: string, position: vscode.Position, locations: vscode.Location[]]>;
        rename: LanguageServiceCommand<[uri: string, position: vscode.Position]>;
        setSelection: LanguageServiceCommand<[position: vscode.Position]>;
    };
    documents: {
        get(uri: URI, languageId: string, snapshot: ts.IScriptSnapshot): TextDocument;
    };
    plugins: [LanguageServicePlugin, LanguageServicePluginInstance][];
    disabledEmbeddedDocumentUris: UriMap<boolean>;
    disabledServicePlugins: WeakSet<LanguageServicePluginInstance>;
    decodeEmbeddedDocumentUri(maybeEmbeddedUri: URI): [
        documentUri: URI,
        embeddedCodeId: string
    ] | undefined;
    encodeEmbeddedDocumentUri(uri: URI, embeededCodeId: string): URI;
}
export type ProviderResult<T> = T | Thenable<T>;
export type NullableProviderResult<T> = ProviderResult<T | undefined | null>;
export type SemanticToken = [
    line: number,
    character: number,
    length: number,
    tokenTypes: number,
    tokenModifiers: number
];
export interface LanguageServicePlugin<P = any> {
    name?: string;
    capabilities: {
        executeCommandProvider?: {
            commands: string[];
        };
        selectionRangeProvider?: boolean;
        foldingRangeProvider?: boolean;
        linkedEditingRangeProvider?: boolean;
        colorProvider?: boolean;
        documentSymbolProvider?: boolean;
        documentFormattingProvider?: boolean;
        referencesProvider?: boolean;
        implementationProvider?: boolean;
        declarationProvider?: boolean;
        definitionProvider?: boolean;
        typeDefinitionProvider?: boolean;
        callHierarchyProvider?: boolean;
        typeHierarchyProvider?: boolean;
        hoverProvider?: boolean;
        documentHighlightProvider?: boolean;
        monikerProvider?: boolean;
        inlineValueProvider?: boolean;
        workspaceSymbolProvider?: {
            resolveProvider?: boolean;
        };
        renameProvider?: {
            prepareProvider?: boolean;
        };
        signatureHelpProvider?: {
            triggerCharacters?: string[];
            retriggerCharacters?: string[];
        };
        completionProvider?: {
            resolveProvider?: boolean;
            triggerCharacters?: string[];
        };
        autoInsertionProvider?: {
            triggerCharacters: string[];
            configurationSections?: string[];
        };
        documentOnTypeFormattingProvider?: {
            triggerCharacters: string[];
        };
        documentLinkProvider?: {
            resolveProvider?: boolean;
        };
        codeLensProvider?: {
            resolveProvider?: boolean;
        };
        inlayHintProvider?: {
            resolveProvider?: boolean;
        };
        semanticTokensProvider?: {
            legend: vscode.SemanticTokensLegend;
        };
        codeActionProvider?: {
            codeActionKinds?: string[];
            resolveProvider?: boolean;
        };
        diagnosticProvider?: {
            interFileDependencies: boolean;
            workspaceDiagnostics: boolean;
        };
        fileReferencesProvider?: boolean;
        fileRenameEditsProvider?: boolean;
        documentDropEditsProvider?: boolean;
    };
    create(context: LanguageServiceContext): LanguageServicePluginInstance<P>;
}
export interface EmbeddedCodeFormattingOptions {
    level: number;
    initialIndentLevel: number;
}
export interface LanguageServicePluginInstance<P = any> {
    provide?: P;
    isAdditionalCompletion?: boolean;
    executeCommand?(command: string, args: any[], token: vscode.CancellationToken): ProviderResult<any>;
    provideHover?(document: TextDocument, position: vscode.Position, token: vscode.CancellationToken): NullableProviderResult<vscode.Hover>;
    provideDocumentSymbols?(document: TextDocument, token: vscode.CancellationToken): NullableProviderResult<vscode.DocumentSymbol[]>;
    provideDocumentHighlights?(document: TextDocument, position: vscode.Position, token: vscode.CancellationToken): NullableProviderResult<vscode.DocumentHighlight[]>;
    provideLinkedEditingRanges?(document: TextDocument, position: vscode.Position, token: vscode.CancellationToken): NullableProviderResult<vscode.LinkedEditingRanges>;
    provideDeclaration?(document: TextDocument, position: vscode.Position, token: vscode.CancellationToken): NullableProviderResult<vscode.DeclarationLink[]>;
    provideDefinition?(document: TextDocument, position: vscode.Position, token: vscode.CancellationToken): NullableProviderResult<vscode.LocationLink[]>;
    provideTypeDefinition?(document: TextDocument, position: vscode.Position, token: vscode.CancellationToken): NullableProviderResult<vscode.LocationLink[]>;
    provideImplementation?(document: TextDocument, position: vscode.Position, token: vscode.CancellationToken): NullableProviderResult<vscode.LocationLink[]>;
    provideCodeLenses?(document: TextDocument, token: vscode.CancellationToken): NullableProviderResult<vscode.CodeLens[]>;
    provideCodeActions?(document: TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken): NullableProviderResult<vscode.CodeAction[]>;
    provideDocumentFormattingEdits?(document: TextDocument, range: vscode.Range, options: vscode.FormattingOptions, embeddedCodeContext: EmbeddedCodeFormattingOptions | undefined, token: vscode.CancellationToken): NullableProviderResult<vscode.TextEdit[]>;
    provideOnTypeFormattingEdits?(document: TextDocument, position: vscode.Position, key: string, options: vscode.FormattingOptions, embeddedCodeContext: EmbeddedCodeFormattingOptions | undefined, token: vscode.CancellationToken): NullableProviderResult<vscode.TextEdit[]>;
    provideDocumentLinks?(document: TextDocument, token: vscode.CancellationToken): NullableProviderResult<vscode.DocumentLink[]>;
    provideCompletionItems?(document: TextDocument, position: vscode.Position, context: vscode.CompletionContext, token: vscode.CancellationToken): NullableProviderResult<vscode.CompletionList>;
    provideDocumentColors?(document: TextDocument, token: vscode.CancellationToken): NullableProviderResult<vscode.ColorInformation[]>;
    provideColorPresentations?(document: TextDocument, color: vscode.Color, range: vscode.Range, token: vscode.CancellationToken): NullableProviderResult<vscode.ColorPresentation[]>;
    provideFoldingRanges?(document: TextDocument, token: vscode.CancellationToken): NullableProviderResult<vscode.FoldingRange[]>;
    provideSignatureHelp?(document: TextDocument, position: vscode.Position, context: vscode.SignatureHelpContext, token: vscode.CancellationToken): NullableProviderResult<vscode.SignatureHelp>;
    provideRenameRange?(document: TextDocument, position: vscode.Position, token: vscode.CancellationToken): NullableProviderResult<vscode.Range | {
        range: vscode.Range;
        placeholder: string;
    } | {
        message: string;
    }>;
    provideRenameEdits?(document: TextDocument, position: vscode.Position, newName: string, token: vscode.CancellationToken): NullableProviderResult<vscode.WorkspaceEdit>;
    provideReferences?(document: TextDocument, position: vscode.Position, context: vscode.ReferenceContext, token: vscode.CancellationToken): NullableProviderResult<vscode.Location[]>;
    provideSelectionRanges?(document: TextDocument, positions: vscode.Position[], token: vscode.CancellationToken): NullableProviderResult<vscode.SelectionRange[]>;
    provideInlayHints?(document: TextDocument, range: vscode.Range, token: vscode.CancellationToken): NullableProviderResult<vscode.InlayHint[]>;
    provideInlineValues?(document: TextDocument, range: vscode.Range, context: vscode.InlineValueContext, token: vscode.CancellationToken): NullableProviderResult<vscode.InlineValue[]>;
    provideCallHierarchyItems?(document: TextDocument, position: vscode.Position, token: vscode.CancellationToken): NullableProviderResult<vscode.CallHierarchyItem[]>;
    provideCallHierarchyIncomingCalls?(item: vscode.CallHierarchyItem, token: vscode.CancellationToken): ProviderResult<vscode.CallHierarchyIncomingCall[]>;
    provideCallHierarchyOutgoingCalls?(item: vscode.CallHierarchyItem, token: vscode.CancellationToken): ProviderResult<vscode.CallHierarchyOutgoingCall[]>;
    provideTypeHierarchyItems?(document: TextDocument, position: vscode.Position, token: vscode.CancellationToken): NullableProviderResult<vscode.TypeHierarchyItem[]>;
    provideTypeHierarchySupertypes?(item: vscode.TypeHierarchyItem, token: vscode.CancellationToken): ProviderResult<vscode.TypeHierarchyItem[]>;
    provideTypeHierarchySubtypes?(item: vscode.TypeHierarchyItem, token: vscode.CancellationToken): ProviderResult<vscode.TypeHierarchyItem[]>;
    provideDocumentSemanticTokens?(document: TextDocument, range: vscode.Range, legend: vscode.SemanticTokensLegend, token: vscode.CancellationToken): NullableProviderResult<SemanticToken[]>;
    provideWorkspaceSymbols?(query: string, token: vscode.CancellationToken): NullableProviderResult<vscode.WorkspaceSymbol[]>;
    provideDiagnostics?(document: TextDocument, token: vscode.CancellationToken): NullableProviderResult<vscode.Diagnostic[]>;
    provideWorkspaceDiagnostics?(token: vscode.CancellationToken): NullableProviderResult<vscode.WorkspaceDocumentDiagnosticReport[]>;
    provideMoniker?(document: TextDocument, position: vscode.Position, token: vscode.CancellationToken): NullableProviderResult<vscode.Moniker[]>;
    provideFileReferences?(document: TextDocument, token: vscode.CancellationToken): NullableProviderResult<vscode.Location[]>;
    provideReferencesCodeLensRanges?(document: TextDocument, token: vscode.CancellationToken): NullableProviderResult<vscode.Range[]>;
    provideAutoInsertSnippet?(document: TextDocument, position: vscode.Position, lastChange: {
        rangeOffset: number;
        rangeLength: number;
        text: string;
    }, token: vscode.CancellationToken): NullableProviderResult<string>;
    provideFileRenameEdits?(oldUri: URI, newUri: URI, token: vscode.CancellationToken): NullableProviderResult<vscode.WorkspaceEdit>;
    provideDocumentDropEdits?(document: TextDocument, position: vscode.Position, dataTransfer: Map<string, DataTransferItem>, token: vscode.CancellationToken): NullableProviderResult<DocumentDropEdit>;
    resolveCodeLens?(codeLens: vscode.CodeLens, token: vscode.CancellationToken): ProviderResult<vscode.CodeLens>;
    resolveCodeAction?(codeAction: vscode.CodeAction, token: vscode.CancellationToken): ProviderResult<vscode.CodeAction>;
    resolveCompletionItem?(item: vscode.CompletionItem, token: vscode.CancellationToken): ProviderResult<vscode.CompletionItem>;
    resolveDocumentLink?(link: vscode.DocumentLink, token: vscode.CancellationToken): ProviderResult<vscode.DocumentLink>;
    resolveInlayHint?(inlayHint: vscode.InlayHint, token: vscode.CancellationToken): ProviderResult<vscode.InlayHint>;
    resolveWorkspaceSymbol?(symbol: vscode.WorkspaceSymbol, token: vscode.CancellationToken): ProviderResult<vscode.WorkspaceSymbol>;
    resolveEmbeddedCodeFormattingOptions?(sourceScript: SourceScript<URI>, embeddedCode: VirtualCode, options: EmbeddedCodeFormattingOptions, token: vscode.CancellationToken): NullableProviderResult<EmbeddedCodeFormattingOptions>;
    transformCompletionItem?(item: vscode.CompletionItem): vscode.CompletionItem | undefined;
    transformCodeAction?(item: vscode.CodeAction): vscode.CodeAction | undefined;
    dispose?(): void;
}
export interface DocumentDropEdit {
    insertText: string;
    insertTextFormat: vscode.InsertTextFormat;
    additionalEdit?: vscode.WorkspaceEdit;
    createDataTransferFile?: (vscode.CreateFile & {
        contentsMimeType: string;
    })[];
}
export interface DataTransferItem {
    value: any;
    asString(): Thenable<string>;
    asFile(): DataTransferFile | undefined;
}
export interface DataTransferFile {
    name: string;
    uri?: string;
    data(): Thenable<Uint8Array>;
}
