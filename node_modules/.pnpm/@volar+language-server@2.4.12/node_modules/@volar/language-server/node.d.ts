import * as vscode from 'vscode-languageserver/node';
export * from 'vscode-languageserver/node';
export * from './index';
export * from './lib/project/simpleProject';
export * from './lib/project/typescriptProject';
export * from './lib/server';
export declare function createConnection(): vscode._Connection<vscode._, vscode._, vscode._, vscode._, vscode._, vscode._, import("vscode-languageserver/lib/common/inlineCompletion.proposed").InlineCompletionFeatureShape, vscode._>;
export declare function createServer(connection: vscode.Connection): {
    initializeParams: vscode.InitializeParams;
    project: import("./index").LanguageServerProject;
    languageServicePlugins: import("@volar/language-service/lib/types").LanguageServicePlugin<any>[];
    initialize(params: vscode.InitializeParams, project: import("./index").LanguageServerProject, languageServicePlugins: import("@volar/language-service/lib/types").LanguageServicePlugin[]): vscode.InitializeResult<import("./index").ExperimentalFeatures>;
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
        all: () => import("./lib/utils/snapshotDocument").SnapshotDocument[];
        onDidChangeContent: vscode.Event<vscode.TextDocumentChangeEvent<import("./lib/utils/snapshotDocument").SnapshotDocument>>;
        onDidOpen: vscode.Event<vscode.TextDocumentChangeEvent<import("./lib/utils/snapshotDocument").SnapshotDocument>>;
        onDidClose: vscode.Event<vscode.TextDocumentChangeEvent<import("./lib/utils/snapshotDocument").SnapshotDocument>>;
        onDidSave: vscode.Event<vscode.TextDocumentChangeEvent<import("./lib/utils/snapshotDocument").SnapshotDocument>>;
        get(uri: import("vscode-uri").URI): import("./lib/utils/snapshotDocument").SnapshotDocument | undefined;
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
        stat(uri: import("vscode-uri").URI): import("@volar/language-service/lib/types").FileStat | Thenable<import("@volar/language-service/lib/types").FileStat | undefined>;
        readDirectory(uri: import("vscode-uri").URI): import("@volar/language-service/lib/types").ProviderResult<[string, import("@volar/language-service/lib/types").FileType][]>;
        install(scheme: string, provider: import("@volar/language-service/lib/types").FileSystem): void;
    };
    env: import("./index").LanguageServerEnvironment;
    connection: vscode.Connection;
    onInitialize(callback: (serverCapabilities: vscode.ServerCapabilities<import("./index").ExperimentalFeatures>) => void): void;
    onInitialized(callback: () => void): void;
};
export declare function loadTsdkByPath(tsdk: string, locale: string | undefined): {
    typescript: typeof import("typescript");
    diagnosticMessages: import("typescript").MapLike<string> | undefined;
};
