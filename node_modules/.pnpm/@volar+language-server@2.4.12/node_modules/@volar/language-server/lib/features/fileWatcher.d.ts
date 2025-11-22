import { Disposable } from '@volar/language-service';
import * as vscode from 'vscode-languageserver';
import { LanguageServerState } from '../types';
export declare function register(server: LanguageServerState): {
    watchFiles: (patterns: string[]) => Promise<Disposable>;
    onDidChangeWatchedFiles: (cb: vscode.NotificationHandler<vscode.DidChangeWatchedFilesParams>) => {
        dispose: () => void;
    };
};
