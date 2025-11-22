import type * as vscode from 'vscode-languageserver-protocol';
import { URI } from 'vscode-uri';
import type { LanguageServiceContext } from '../types';
export interface DocumentLinkData {
    uri: string;
    original: Pick<vscode.DocumentLink, 'data'>;
    pluginIndex: number;
}
export declare function register(context: LanguageServiceContext): (uri: URI, token?: vscode.CancellationToken) => Promise<vscode.DocumentLink[]>;
