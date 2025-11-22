import type * as vscode from 'vscode-languageserver-protocol';
import { URI } from 'vscode-uri';
import type { LanguageServiceContext } from '../types';
export declare function register(context: LanguageServiceContext): (uri: URI, selection: vscode.Position, change: {
    rangeOffset: number;
    rangeLength: number;
    text: string;
}, token?: vscode.CancellationToken) => Promise<string | undefined>;
