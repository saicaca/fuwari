import * as vscode from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { LanguageServerState } from '../types';
import { SnapshotDocument } from '../utils/snapshotDocument';
export declare function register(server: LanguageServerState): {
    all: () => SnapshotDocument[];
    onDidChangeContent: vscode.Event<vscode.TextDocumentChangeEvent<SnapshotDocument>>;
    onDidOpen: vscode.Event<vscode.TextDocumentChangeEvent<SnapshotDocument>>;
    onDidClose: vscode.Event<vscode.TextDocumentChangeEvent<SnapshotDocument>>;
    onDidSave: vscode.Event<vscode.TextDocumentChangeEvent<SnapshotDocument>>;
    get(uri: URI): SnapshotDocument | undefined;
};
