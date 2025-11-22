import { LanguageServicePlugin } from '@volar/language-service';
import * as vscode from 'vscode-languageserver';
import type { ExperimentalFeatures, LanguageServerEnvironment, LanguageServerProject } from './types.js';
export declare function createServerBase(connection: vscode.Connection, env: LanguageServerEnvironment): {
    initializeParams: vscode.InitializeParams;
    project: LanguageServerProject;
    languageServicePlugins: LanguageServicePlugin<any>[];
    initialize(params: vscode.InitializeParams, project: LanguageServerProject, languageServicePlugins: LanguageServicePlugin[]): vscode.InitializeResult<ExperimentalFeatures>;
    initialized(): void;
    shutdown(): void;
    configurations: {
        get: <T>(section: string, scopeUri?: string) => Promise<T | undefined>;
        onDidChange: (cb: vscode.NotificationHandler<vscode.DidChangeConfigurationParams>) => {
            dispose(): void;
        };
    };
    editorFeatures: void;
    documents: {
        all: () => import("./utils/snapshotDocument.js").SnapshotDocument[];
        onDidChangeContent: vscode.Event<vscode.TextDocumentChangeEvent<import("./utils/snapshotDocument.js").SnapshotDocument>>;
        onDidOpen: vscode.Event<vscode.TextDocumentChangeEvent<import("./utils/snapshotDocument.js").SnapshotDocument>>;
        onDidClose: vscode.Event<vscode.TextDocumentChangeEvent<import("./utils/snapshotDocument.js").SnapshotDocument>>;
        onDidSave: vscode.Event<vscode.TextDocumentChangeEvent<import("./utils/snapshotDocument.js").SnapshotDocument>>;
        get(uri: import("vscode-uri").URI): import("./utils/snapshotDocument.js").SnapshotDocument | undefined;
    };
    workspaceFolders: {
        readonly all: import("vscode-uri").URI[];
        has(uri: import("vscode-uri").URI): boolean;
        onDidChange: (cb: vscode.NotificationHandler<vscode.WorkspaceFoldersChangeEvent>) => {
            dispose(): void;
        };
    };
    fileWatcher: {
        watchFiles: (patterns: string[]) => Promise<vscode.Disposable>;
        onDidChangeWatchedFiles: (cb: vscode.NotificationHandler<vscode.DidChangeWatchedFilesParams>) => {
            dispose: () => void;
        };
    };
    languageFeatures: {
        requestRefresh: (clearDiagnostics: boolean) => Promise<void>;
    };
    fileSystem: {
        readFile(uri: import("vscode-uri").URI): string | Thenable<string | undefined>;
        stat(uri: import("vscode-uri").URI): import("@volar/language-service").FileStat | Thenable<import("@volar/language-service").FileStat | undefined>;
        readDirectory(uri: import("vscode-uri").URI): import("@volar/language-service").ProviderResult<[string, import("@volar/language-service").FileType][]>;
        install(scheme: string, provider: import("@volar/language-service").FileSystem): void;
    };
    env: LanguageServerEnvironment;
    connection: vscode.Connection;
    onInitialize(callback: (serverCapabilities: vscode.ServerCapabilities<ExperimentalFeatures>) => void): void;
    onInitialized(callback: () => void): void;
};
