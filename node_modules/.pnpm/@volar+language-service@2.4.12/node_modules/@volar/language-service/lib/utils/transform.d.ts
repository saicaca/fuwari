import type * as vscode from 'vscode-languageserver-protocol';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import type { LanguageServiceContext } from '../types';
export declare function transformDocumentLinkTarget(_target: string, context: LanguageServiceContext): URI;
export declare function transformMarkdown(content: string, context: LanguageServiceContext): string;
export declare function transformCompletionItem<T extends vscode.CompletionItem>(item: T, getOtherRange: (range: vscode.Range) => vscode.Range | undefined, document: vscode.TextDocument, context: LanguageServiceContext): T;
export declare function transformCompletionList<T extends vscode.CompletionList>(completionList: T, getOtherRange: (range: vscode.Range) => vscode.Range | undefined, document: TextDocument, context: LanguageServiceContext): T;
export declare function transformDocumentSymbol(symbol: vscode.DocumentSymbol, getOtherRange: (range: vscode.Range) => vscode.Range | undefined): vscode.DocumentSymbol | undefined;
export declare function transformFoldingRanges(ranges: vscode.FoldingRange[], getOtherRange: (range: vscode.Range) => vscode.Range | undefined): vscode.FoldingRange[];
export declare function transformHover<T extends vscode.Hover>(hover: T, getOtherRange: (range: vscode.Range) => vscode.Range | undefined): T | undefined;
export declare function transformLocation<T extends {
    range: vscode.Range;
}>(location: T, getOtherRange: (range: vscode.Range) => vscode.Range | undefined): T | undefined;
export declare function transformLocations<T extends {
    range: vscode.Range;
}>(locations: T[], getOtherRange: (range: vscode.Range) => vscode.Range | undefined): T[];
export declare function transformSelectionRange<T extends vscode.SelectionRange>(location: T, getOtherRange: (range: vscode.Range) => vscode.Range | undefined): T | undefined;
export declare function transformSelectionRanges<T extends vscode.SelectionRange>(locations: T[], getOtherRange: (range: vscode.Range) => vscode.Range | undefined): T[];
export declare function transformTextEdit<T extends vscode.TextEdit | vscode.InsertReplaceEdit>(textEdit: T, getOtherRange: (range: vscode.Range) => vscode.Range | undefined, document: vscode.TextDocument): T | undefined;
export declare function transformWorkspaceSymbol(symbol: vscode.WorkspaceSymbol, getOtherLocation: (location: vscode.Location) => vscode.Location | undefined): vscode.WorkspaceSymbol | undefined;
export declare function transformWorkspaceEdit(edit: vscode.WorkspaceEdit, context: LanguageServiceContext, mode: 'fileName' | 'rename' | 'codeAction' | undefined, versions?: Record<string, number>): vscode.WorkspaceEdit | undefined;
export declare function pushEditToDocumentChanges(arr: NonNullable<vscode.WorkspaceEdit['documentChanges']>, item: NonNullable<vscode.WorkspaceEdit['documentChanges']>[number]): void;
