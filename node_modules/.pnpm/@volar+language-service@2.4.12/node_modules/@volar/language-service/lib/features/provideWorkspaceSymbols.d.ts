import type * as vscode from 'vscode-languageserver-protocol';
import type { LanguageServiceContext } from '../types';
export interface WorkspaceSymbolData {
    original: Pick<vscode.WorkspaceSymbol, 'data'>;
    pluginIndex: number;
}
export declare function register(context: LanguageServiceContext): (query: string, token?: vscode.CancellationToken) => Promise<vscode.WorkspaceSymbol[]>;
