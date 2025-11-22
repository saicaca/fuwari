import type * as vscode from 'vscode-languageserver-protocol';
import type { LanguageServiceContext } from '../types';
export declare function register(context: LanguageServiceContext): (token?: vscode.CancellationToken) => Promise<vscode.WorkspaceDocumentDiagnosticReport[]>;
