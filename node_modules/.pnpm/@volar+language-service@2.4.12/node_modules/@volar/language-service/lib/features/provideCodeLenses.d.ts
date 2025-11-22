import type * as vscode from 'vscode-languageserver-protocol';
import { URI } from 'vscode-uri';
import type { LanguageServiceContext } from '../types';
export interface ServiceCodeLensData {
    kind: 'normal';
    uri: string;
    original: Pick<vscode.CodeLens, 'data'>;
    pluginIndex: number;
}
export interface ServiceReferencesCodeLensData {
    kind: 'references';
    sourceFileUri: string;
    workerFileUri: string;
    workerFileRange: vscode.Range;
    pluginIndex: number;
}
export declare function register(context: LanguageServiceContext): (uri: URI, token?: vscode.CancellationToken) => Promise<vscode.CodeLens[]>;
