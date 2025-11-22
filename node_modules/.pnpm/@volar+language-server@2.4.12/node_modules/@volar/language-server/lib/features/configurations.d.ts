import * as vscode from 'vscode-languageserver';
import { LanguageServerState } from '../types';
export declare function register(server: LanguageServerState): {
    get: <T>(section: string, scopeUri?: string) => Promise<T | undefined>;
    onDidChange: (cb: vscode.NotificationHandler<vscode.DidChangeConfigurationParams>) => {
        dispose(): void;
    };
};
