import type * as vscode from 'vscode-languageserver-protocol';
import { URI } from 'vscode-uri';
import type { LanguageServiceContext } from '../types';
export declare function register(context: LanguageServiceContext): (uri: URI, range: vscode.Range, ivContext: vscode.InlineValueContext, token?: vscode.CancellationToken) => Promise<vscode.InlineValue[] | undefined>;
