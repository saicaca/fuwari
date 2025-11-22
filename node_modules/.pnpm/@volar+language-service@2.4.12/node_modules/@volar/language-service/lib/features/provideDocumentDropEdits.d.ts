import type * as vscode from 'vscode-languageserver-protocol';
import { URI } from 'vscode-uri';
import type { DataTransferItem, LanguageServiceContext } from '../types';
export declare function register(context: LanguageServiceContext): (uri: URI, position: vscode.Position, dataTransfer: Map<string, DataTransferItem>, token?: vscode.CancellationToken) => Promise<import("../types").DocumentDropEdit | undefined>;
