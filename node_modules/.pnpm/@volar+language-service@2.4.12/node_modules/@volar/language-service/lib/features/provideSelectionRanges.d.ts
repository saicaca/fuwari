import type * as vscode from 'vscode-languageserver-protocol';
import { URI } from 'vscode-uri';
import type { LanguageServiceContext } from '../types';
export declare function register(context: LanguageServiceContext): (uri: URI, positions: vscode.Position[], token?: vscode.CancellationToken) => Promise<vscode.SelectionRange[] | undefined>;
