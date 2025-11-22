import type * as vscode from 'vscode-languageserver-protocol';
import { URI } from 'vscode-uri';
import type { LanguageServiceContext } from '../types';
export declare function register(context: LanguageServiceContext): (uri: URI, options: vscode.FormattingOptions, range: vscode.Range | undefined, onTypeParams: {
    ch: string;
    position: vscode.Position;
} | undefined, token?: vscode.CancellationToken) => Promise<vscode.TextEdit[] | undefined>;
