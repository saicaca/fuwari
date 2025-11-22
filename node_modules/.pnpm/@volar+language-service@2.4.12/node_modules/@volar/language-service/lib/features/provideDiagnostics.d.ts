import type * as vscode from 'vscode-languageserver-protocol';
import { URI } from 'vscode-uri';
import type { LanguageServiceContext } from '../types';
import { DocumentsAndMap } from '../utils/featureWorkers';
export interface ServiceDiagnosticData {
    uri: string;
    version: number;
    original: Pick<vscode.Diagnostic, 'data'>;
    isFormat: boolean;
    pluginIndex: number;
    documentUri: string;
}
export declare const errorMarkups: Map<URI, {
    error: vscode.Diagnostic;
    markup: vscode.MarkupContent;
}[]>;
export declare function register(context: LanguageServiceContext): (uri: URI, response?: (result: vscode.Diagnostic[]) => void, token?: vscode.CancellationToken) => Promise<vscode.Diagnostic[]>;
export declare function transformDiagnostic(context: LanguageServiceContext, error: vscode.Diagnostic, docs: DocumentsAndMap | undefined): vscode.Diagnostic | undefined;
export declare function updateRange(range: vscode.Range, change: {
    range: vscode.Range;
    newEnd: vscode.Position;
}): vscode.Range | undefined;
