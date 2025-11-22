import type { InitializeParams, LanguageService, LanguageServicePlugin, ProviderResult, ServerCapabilities } from '@volar/language-service';
import { Connection } from 'vscode-languageserver';
import type { URI } from 'vscode-uri';
import { createServerBase } from './server';
export interface LanguageServerEnvironment {
    timer: {
        setImmediate: (callback: (...args: any[]) => void, ...args: any[]) => void;
    };
}
export interface LanguageServerProject {
    setup(server: LanguageServer): void;
    getLanguageService(uri: URI): ProviderResult<LanguageService>;
    getExistingLanguageServices(): ProviderResult<LanguageService[]>;
    reload(): void;
}
export interface LanguageServerState {
    env: LanguageServerEnvironment;
    connection: Connection;
    initializeParams: InitializeParams;
    project: LanguageServerProject;
    languageServicePlugins: LanguageServicePlugin[];
    onInitialize(callback: (serverCapabilities: ServerCapabilities<ExperimentalFeatures>) => void): void;
    onInitialized(callback: () => void): void;
}
export type LanguageServer = ReturnType<typeof createServerBase>;
export interface ExperimentalFeatures {
    fileReferencesProvider?: boolean;
    fileRenameEditsProvider?: boolean;
    documentDropEditsProvider?: boolean;
    autoInsertionProvider?: {
        triggerCharacters: string[];
        configurationSections?: (string[] | null)[];
    };
}
