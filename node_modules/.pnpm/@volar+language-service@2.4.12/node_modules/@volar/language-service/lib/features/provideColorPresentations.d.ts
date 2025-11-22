import type * as vscode from 'vscode-languageserver-protocol';
import { URI } from 'vscode-uri';
import type { LanguageServiceContext } from '../types';
export declare function register(context: LanguageServiceContext): (uri: URI, color: vscode.Color, range: vscode.Range, token?: vscode.CancellationToken) => Promise<vscode.ColorPresentation[] | undefined>;
