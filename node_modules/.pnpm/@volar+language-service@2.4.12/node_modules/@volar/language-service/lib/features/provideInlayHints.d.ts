import type * as vscode from 'vscode-languageserver-protocol';
import { URI } from 'vscode-uri';
import type { LanguageServiceContext } from '../types';
export interface InlayHintData {
    uri: string;
    original: Pick<vscode.CodeAction, 'data' | 'edit'>;
    pluginIndex: number;
}
export declare function register(context: LanguageServiceContext): (uri: URI, range: vscode.Range, token?: vscode.CancellationToken) => Promise<vscode.InlayHint[] | undefined>;
