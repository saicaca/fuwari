import type * as vscode from 'vscode-languageserver-protocol';
import { URI } from 'vscode-uri';
import type { LanguageServiceContext } from '../types';
export declare function register(context: LanguageServiceContext): (uri: URI, position: vscode.Position, newName: string, token?: vscode.CancellationToken) => Promise<vscode.WorkspaceEdit | undefined>;
export declare function mergeWorkspaceEdits(original: vscode.WorkspaceEdit, ...others: vscode.WorkspaceEdit[]): void;
