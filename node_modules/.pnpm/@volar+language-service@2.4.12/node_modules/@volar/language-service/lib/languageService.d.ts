import { type Language } from '@volar/language-core';
import type * as vscode from 'vscode-languageserver-protocol';
import { URI } from 'vscode-uri';
import type { LanguageServiceContext, LanguageServiceEnvironment, LanguageServicePlugin, ProjectContext } from './types';
export type LanguageService = ReturnType<typeof createLanguageServiceBase>;
export declare const embeddedContentScheme = "volar-embedded-content";
export declare function createLanguageService(language: Language<URI>, plugins: LanguageServicePlugin[], env: LanguageServiceEnvironment, project: ProjectContext): {
    dispose: () => void;
    context: LanguageServiceContext;
    getCallHierarchyItems(uri: URI, position: vscode.Position, token?: vscode.CancellationToken): Promise<vscode.CallHierarchyItem[] | undefined>;
    getTypeHierarchyItems(uri: URI, position: vscode.Position, token?: vscode.CancellationToken): Promise<vscode.TypeHierarchyItem[] | undefined>;
    getCallHierarchyIncomingCalls(item: vscode.CallHierarchyItem, token: vscode.CancellationToken): Promise<vscode.CallHierarchyIncomingCall[]>;
    getCallHierarchyOutgoingCalls(item: vscode.CallHierarchyItem, token: vscode.CancellationToken): Promise<vscode.CallHierarchyOutgoingCall[]>;
    getTypeHierarchySupertypes(item: vscode.CallHierarchyItem, token: vscode.CancellationToken): Promise<vscode.TypeHierarchyItem[] | undefined>;
    getTypeHierarchySubtypes(item: vscode.CallHierarchyItem, token: vscode.CancellationToken): Promise<vscode.TypeHierarchyItem[] | undefined>;
    semanticTokenLegend: {
        tokenModifiers: string[];
        tokenTypes: string[];
    };
    commands: string[];
    triggerCharacters: string[];
    autoFormatTriggerCharacters: string[];
    signatureHelpTriggerCharacters: string[];
    signatureHelpRetriggerCharacters: string[];
    executeCommand(command: string, args: any[], token?: vscode.CancellationToken): any;
    getDocumentFormattingEdits: (uri: URI, options: vscode.FormattingOptions, range: vscode.Range | undefined, onTypeParams: {
        ch: string;
        position: vscode.Position;
    } | undefined, token?: vscode.CancellationToken) => Promise<vscode.TextEdit[] | undefined>;
    getFoldingRanges: (uri: URI, token?: vscode.CancellationToken) => Promise<vscode.FoldingRange[] | undefined>;
    getSelectionRanges: (uri: URI, positions: vscode.Position[], token?: vscode.CancellationToken) => Promise<vscode.SelectionRange[] | undefined>;
    getLinkedEditingRanges: (uri: URI, position: vscode.Position, token?: vscode.CancellationToken) => Promise<vscode.LinkedEditingRanges | undefined>;
    getDocumentSymbols: (uri: URI, token?: vscode.CancellationToken) => Promise<vscode.DocumentSymbol[] | undefined>;
    getDocumentColors: (uri: URI, token?: vscode.CancellationToken) => Promise<vscode.ColorInformation[] | undefined>;
    getColorPresentations: (uri: URI, color: vscode.Color, range: vscode.Range, token?: vscode.CancellationToken) => Promise<vscode.ColorPresentation[] | undefined>;
    getDiagnostics: (uri: URI, response?: (result: vscode.Diagnostic[]) => void, token?: vscode.CancellationToken) => Promise<vscode.Diagnostic[]>;
    getWorkspaceDiagnostics: (token?: vscode.CancellationToken) => Promise<vscode.WorkspaceDocumentDiagnosticReport[]>;
    getReferences: (uri: URI, position: vscode.Position, referenceContext: vscode.ReferenceContext, token?: vscode.CancellationToken) => Promise<vscode.Location[] | undefined>;
    getFileReferences: (uri: URI, token?: vscode.CancellationToken) => import("./types").NullableProviderResult<vscode.Location[]>;
    getDeclaration: (uri: URI, position: vscode.Position, token?: vscode.CancellationToken) => Promise<vscode.LocationLink[] | undefined>;
    getDefinition: (uri: URI, position: vscode.Position, token?: vscode.CancellationToken) => Promise<vscode.LocationLink[] | undefined>;
    getTypeDefinition: (uri: URI, position: vscode.Position, token?: vscode.CancellationToken) => Promise<vscode.LocationLink[] | undefined>;
    getImplementations: (uri: URI, position: vscode.Position, token?: vscode.CancellationToken) => Promise<vscode.LocationLink[] | undefined>;
    getRenameRange: (uri: URI, position: vscode.Position, token?: vscode.CancellationToken) => Promise<vscode.Range | {
        range: vscode.Range;
        placeholder: string;
    } | {
        message: string;
    } | undefined>;
    getRenameEdits: (uri: URI, position: vscode.Position, newName: string, token?: vscode.CancellationToken) => Promise<vscode.WorkspaceEdit | undefined>;
    getFileRenameEdits: (oldUri: URI, newUri: URI, token?: vscode.CancellationToken) => Promise<vscode.WorkspaceEdit | undefined>;
    getSemanticTokens: (uri: URI, range: vscode.Range | undefined, legend: vscode.SemanticTokensLegend, _reportProgress?: (tokens: vscode.SemanticTokens) => void, token?: vscode.CancellationToken) => Promise<vscode.SemanticTokens | undefined>;
    getHover: (uri: URI, position: vscode.Position, token?: vscode.CancellationToken) => Promise<vscode.Hover | undefined>;
    getCompletionItems: (uri: URI, position: vscode.Position, completionContext?: vscode.CompletionContext, token?: vscode.CancellationToken) => Promise<vscode.CompletionList>;
    getCodeActions: (uri: URI, range: vscode.Range, codeActionContext: vscode.CodeActionContext, token?: vscode.CancellationToken) => Promise<vscode.CodeAction[] | undefined>;
    getSignatureHelp: (uri: URI, position: vscode.Position, signatureHelpContext?: vscode.SignatureHelpContext, token?: vscode.CancellationToken) => Promise<vscode.SignatureHelp | undefined>;
    getCodeLenses: (uri: URI, token?: vscode.CancellationToken) => Promise<vscode.CodeLens[]>;
    getDocumentHighlights: (uri: URI, position: vscode.Position, token?: vscode.CancellationToken) => Promise<vscode.DocumentHighlight[] | undefined>;
    getDocumentLinks: (uri: URI, token?: vscode.CancellationToken) => Promise<vscode.DocumentLink[]>;
    getWorkspaceSymbols: (query: string, token?: vscode.CancellationToken) => Promise<vscode.WorkspaceSymbol[]>;
    getAutoInsertSnippet: (uri: URI, selection: vscode.Position, change: {
        rangeOffset: number;
        rangeLength: number;
        text: string;
    }, token?: vscode.CancellationToken) => Promise<string | undefined>;
    getDocumentDropEdits: (uri: URI, position: vscode.Position, dataTransfer: Map<string, import("./types").DataTransferItem>, token?: vscode.CancellationToken) => Promise<import("./types").DocumentDropEdit | undefined>;
    getInlayHints: (uri: URI, range: vscode.Range, token?: vscode.CancellationToken) => Promise<vscode.InlayHint[] | undefined>;
    getMoniker: (uri: URI, position: vscode.Position, token?: vscode.CancellationToken) => Promise<vscode.Moniker[] | undefined>;
    getInlineValue: (uri: URI, range: vscode.Range, ivContext: vscode.InlineValueContext, token?: vscode.CancellationToken) => Promise<vscode.InlineValue[] | undefined>;
    resolveCodeAction: (item: vscode.CodeAction, token?: vscode.CancellationToken) => Promise<vscode.CodeAction>;
    resolveCompletionItem: (item: vscode.CompletionItem, token?: vscode.CancellationToken) => Promise<vscode.CompletionItem>;
    resolveCodeLens: (item: vscode.CodeLens, token?: vscode.CancellationToken) => Promise<vscode.CodeLens>;
    resolveDocumentLink: (item: vscode.DocumentLink, token?: vscode.CancellationToken) => Promise<vscode.DocumentLink>;
    resolveInlayHint: (item: vscode.InlayHint, token?: vscode.CancellationToken) => Promise<vscode.InlayHint>;
    resolveWorkspaceSymbol: (item: vscode.WorkspaceSymbol, token?: vscode.CancellationToken) => Promise<vscode.WorkspaceSymbol>;
};
export declare function decodeEmbeddedDocumentUri(maybeEmbeddedContentUri: URI): [
    documentUri: URI,
    embeddedCodeId: string
] | undefined;
export declare function encodeEmbeddedDocumentUri(documentUri: URI, embeddedContentId: string): URI;
declare function createLanguageServiceBase(plugins: LanguageServicePlugin[], context: LanguageServiceContext): {
    dispose: () => void;
    context: LanguageServiceContext;
    getCallHierarchyItems(uri: URI, position: vscode.Position, token?: vscode.CancellationToken): Promise<vscode.CallHierarchyItem[] | undefined>;
    getTypeHierarchyItems(uri: URI, position: vscode.Position, token?: vscode.CancellationToken): Promise<vscode.TypeHierarchyItem[] | undefined>;
    getCallHierarchyIncomingCalls(item: vscode.CallHierarchyItem, token: vscode.CancellationToken): Promise<vscode.CallHierarchyIncomingCall[]>;
    getCallHierarchyOutgoingCalls(item: vscode.CallHierarchyItem, token: vscode.CancellationToken): Promise<vscode.CallHierarchyOutgoingCall[]>;
    getTypeHierarchySupertypes(item: vscode.CallHierarchyItem, token: vscode.CancellationToken): Promise<vscode.TypeHierarchyItem[] | undefined>;
    getTypeHierarchySubtypes(item: vscode.CallHierarchyItem, token: vscode.CancellationToken): Promise<vscode.TypeHierarchyItem[] | undefined>;
    semanticTokenLegend: {
        tokenModifiers: string[];
        tokenTypes: string[];
    };
    commands: string[];
    triggerCharacters: string[];
    autoFormatTriggerCharacters: string[];
    signatureHelpTriggerCharacters: string[];
    signatureHelpRetriggerCharacters: string[];
    executeCommand(command: string, args: any[], token?: vscode.CancellationToken): any;
    getDocumentFormattingEdits: (uri: URI, options: vscode.FormattingOptions, range: vscode.Range | undefined, onTypeParams: {
        ch: string;
        position: vscode.Position;
    } | undefined, token?: vscode.CancellationToken) => Promise<vscode.TextEdit[] | undefined>;
    getFoldingRanges: (uri: URI, token?: vscode.CancellationToken) => Promise<vscode.FoldingRange[] | undefined>;
    getSelectionRanges: (uri: URI, positions: vscode.Position[], token?: vscode.CancellationToken) => Promise<vscode.SelectionRange[] | undefined>;
    getLinkedEditingRanges: (uri: URI, position: vscode.Position, token?: vscode.CancellationToken) => Promise<vscode.LinkedEditingRanges | undefined>;
    getDocumentSymbols: (uri: URI, token?: vscode.CancellationToken) => Promise<vscode.DocumentSymbol[] | undefined>;
    getDocumentColors: (uri: URI, token?: vscode.CancellationToken) => Promise<vscode.ColorInformation[] | undefined>;
    getColorPresentations: (uri: URI, color: vscode.Color, range: vscode.Range, token?: vscode.CancellationToken) => Promise<vscode.ColorPresentation[] | undefined>;
    getDiagnostics: (uri: URI, response?: (result: vscode.Diagnostic[]) => void, token?: vscode.CancellationToken) => Promise<vscode.Diagnostic[]>;
    getWorkspaceDiagnostics: (token?: vscode.CancellationToken) => Promise<vscode.WorkspaceDocumentDiagnosticReport[]>;
    getReferences: (uri: URI, position: vscode.Position, referenceContext: vscode.ReferenceContext, token?: vscode.CancellationToken) => Promise<vscode.Location[] | undefined>;
    getFileReferences: (uri: URI, token?: vscode.CancellationToken) => import("./types").NullableProviderResult<vscode.Location[]>;
    getDeclaration: (uri: URI, position: vscode.Position, token?: vscode.CancellationToken) => Promise<vscode.LocationLink[] | undefined>;
    getDefinition: (uri: URI, position: vscode.Position, token?: vscode.CancellationToken) => Promise<vscode.LocationLink[] | undefined>;
    getTypeDefinition: (uri: URI, position: vscode.Position, token?: vscode.CancellationToken) => Promise<vscode.LocationLink[] | undefined>;
    getImplementations: (uri: URI, position: vscode.Position, token?: vscode.CancellationToken) => Promise<vscode.LocationLink[] | undefined>;
    getRenameRange: (uri: URI, position: vscode.Position, token?: vscode.CancellationToken) => Promise<vscode.Range | {
        range: vscode.Range;
        placeholder: string;
    } | {
        message: string;
    } | undefined>;
    getRenameEdits: (uri: URI, position: vscode.Position, newName: string, token?: vscode.CancellationToken) => Promise<vscode.WorkspaceEdit | undefined>;
    getFileRenameEdits: (oldUri: URI, newUri: URI, token?: vscode.CancellationToken) => Promise<vscode.WorkspaceEdit | undefined>;
    getSemanticTokens: (uri: URI, range: vscode.Range | undefined, legend: vscode.SemanticTokensLegend, _reportProgress?: (tokens: vscode.SemanticTokens) => void, token?: vscode.CancellationToken) => Promise<vscode.SemanticTokens | undefined>;
    getHover: (uri: URI, position: vscode.Position, token?: vscode.CancellationToken) => Promise<vscode.Hover | undefined>;
    getCompletionItems: (uri: URI, position: vscode.Position, completionContext?: vscode.CompletionContext, token?: vscode.CancellationToken) => Promise<vscode.CompletionList>;
    getCodeActions: (uri: URI, range: vscode.Range, codeActionContext: vscode.CodeActionContext, token?: vscode.CancellationToken) => Promise<vscode.CodeAction[] | undefined>;
    getSignatureHelp: (uri: URI, position: vscode.Position, signatureHelpContext?: vscode.SignatureHelpContext, token?: vscode.CancellationToken) => Promise<vscode.SignatureHelp | undefined>;
    getCodeLenses: (uri: URI, token?: vscode.CancellationToken) => Promise<vscode.CodeLens[]>;
    getDocumentHighlights: (uri: URI, position: vscode.Position, token?: vscode.CancellationToken) => Promise<vscode.DocumentHighlight[] | undefined>;
    getDocumentLinks: (uri: URI, token?: vscode.CancellationToken) => Promise<vscode.DocumentLink[]>;
    getWorkspaceSymbols: (query: string, token?: vscode.CancellationToken) => Promise<vscode.WorkspaceSymbol[]>;
    getAutoInsertSnippet: (uri: URI, selection: vscode.Position, change: {
        rangeOffset: number;
        rangeLength: number;
        text: string;
    }, token?: vscode.CancellationToken) => Promise<string | undefined>;
    getDocumentDropEdits: (uri: URI, position: vscode.Position, dataTransfer: Map<string, import("./types").DataTransferItem>, token?: vscode.CancellationToken) => Promise<import("./types").DocumentDropEdit | undefined>;
    getInlayHints: (uri: URI, range: vscode.Range, token?: vscode.CancellationToken) => Promise<vscode.InlayHint[] | undefined>;
    getMoniker: (uri: URI, position: vscode.Position, token?: vscode.CancellationToken) => Promise<vscode.Moniker[] | undefined>;
    getInlineValue: (uri: URI, range: vscode.Range, ivContext: vscode.InlineValueContext, token?: vscode.CancellationToken) => Promise<vscode.InlineValue[] | undefined>;
    resolveCodeAction: (item: vscode.CodeAction, token?: vscode.CancellationToken) => Promise<vscode.CodeAction>;
    resolveCompletionItem: (item: vscode.CompletionItem, token?: vscode.CancellationToken) => Promise<vscode.CompletionItem>;
    resolveCodeLens: (item: vscode.CodeLens, token?: vscode.CancellationToken) => Promise<vscode.CodeLens>;
    resolveDocumentLink: (item: vscode.DocumentLink, token?: vscode.CancellationToken) => Promise<vscode.DocumentLink>;
    resolveInlayHint: (item: vscode.InlayHint, token?: vscode.CancellationToken) => Promise<vscode.InlayHint>;
    resolveWorkspaceSymbol: (item: vscode.WorkspaceSymbol, token?: vscode.CancellationToken) => Promise<vscode.WorkspaceSymbol>;
};
export {};
