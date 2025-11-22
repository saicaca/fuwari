import type * as vscode from 'vscode-languageserver-protocol';
import { URI } from 'vscode-uri';
import type { LanguageServiceContext } from '../types';
export declare function register(context: LanguageServiceContext): (uri: URI, position: vscode.Position, referenceContext: vscode.ReferenceContext, token?: vscode.CancellationToken) => Promise<vscode.Location[] | undefined>;
