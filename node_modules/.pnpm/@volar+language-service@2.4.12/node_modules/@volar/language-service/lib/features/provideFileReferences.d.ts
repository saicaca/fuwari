import type * as vscode from 'vscode-languageserver-protocol';
import { URI } from 'vscode-uri';
import type { LanguageServiceContext, NullableProviderResult } from '../types';
export declare function register(context: LanguageServiceContext): (uri: URI, token?: vscode.CancellationToken) => NullableProviderResult<vscode.Location[]>;
