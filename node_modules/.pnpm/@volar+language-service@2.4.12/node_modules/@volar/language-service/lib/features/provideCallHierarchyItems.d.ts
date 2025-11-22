import type * as vscode from 'vscode-languageserver-protocol';
import { URI } from 'vscode-uri';
import type { LanguageServiceContext } from '../types';
export interface PluginCallHierarchyData {
    uri: string;
    original: Pick<vscode.CallHierarchyItem, 'data'>;
    pluginIndex: number;
    embeddedDocumentUri: string | undefined;
}
export declare function register(context: LanguageServiceContext): {
    getCallHierarchyItems(uri: URI, position: vscode.Position, token?: vscode.CancellationToken): Promise<vscode.CallHierarchyItem[] | undefined>;
    getTypeHierarchyItems(uri: URI, position: vscode.Position, token?: vscode.CancellationToken): Promise<vscode.TypeHierarchyItem[] | undefined>;
    getCallHierarchyIncomingCalls(item: vscode.CallHierarchyItem, token: vscode.CancellationToken): Promise<vscode.CallHierarchyIncomingCall[]>;
    getCallHierarchyOutgoingCalls(item: vscode.CallHierarchyItem, token: vscode.CancellationToken): Promise<vscode.CallHierarchyOutgoingCall[]>;
    getTypeHierarchySupertypes(item: vscode.CallHierarchyItem, token: vscode.CancellationToken): Promise<vscode.TypeHierarchyItem[] | undefined>;
    getTypeHierarchySubtypes(item: vscode.CallHierarchyItem, token: vscode.CancellationToken): Promise<vscode.TypeHierarchyItem[] | undefined>;
};
