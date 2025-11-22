import type * as vscode from 'vscode-languageserver-protocol';
import { URI } from 'vscode-uri';
import type { LanguageServiceContext } from '../types';
export interface ServiceCompletionData {
    uri: string;
    original: Pick<vscode.CompletionItem, 'additionalTextEdits' | 'textEdit' | 'data'>;
    pluginIndex: number;
    embeddedDocumentUri: string | undefined;
}
export declare function register(context: LanguageServiceContext): (uri: URI, position: vscode.Position, completionContext?: vscode.CompletionContext, token?: vscode.CancellationToken) => Promise<vscode.CompletionList>;
