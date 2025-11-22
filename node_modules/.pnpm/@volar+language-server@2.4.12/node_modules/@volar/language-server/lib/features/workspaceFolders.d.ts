import * as vscode from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { LanguageServerState } from '../types';
export declare function register(server: LanguageServerState): {
    readonly all: URI[];
    has(uri: URI): boolean;
    onDidChange: (cb: vscode.NotificationHandler<vscode.WorkspaceFoldersChangeEvent>) => {
        dispose(): void;
    };
};
