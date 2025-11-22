import { Diagnostic, Language, LanguagePlugin, LanguageServicePlugin, ProjectContext } from '@volar/language-service';
import * as ts from 'typescript';
import { URI } from 'vscode-uri';
export declare function createTypeScriptChecker(languagePlugins: LanguagePlugin<URI>[], languageServicePlugins: LanguageServicePlugin[], tsconfig: string, includeProjectReference?: boolean, setup?: (options: {
    language: Language;
    project: ProjectContext;
}) => void): {
    check: (fileName: string) => Promise<Diagnostic[]>;
    fixErrors: (fileName: string, diagnostics: Diagnostic[], only: string[] | undefined, writeFile: (fileName: string, newText: string) => Promise<void>) => Promise<void>;
    printErrors: (fileName: string, diagnostics: Diagnostic[], rootPath?: string) => string;
    getRootFileNames: () => string[];
    language: Language<URI>;
    settings: {};
    fileCreated(fileName: string): void;
    fileUpdated(fileName: string): void;
    fileDeleted(fileName: string): void;
};
export declare function createTypeScriptInferredChecker(languagePlugins: LanguagePlugin<URI>[], languageServicePlugins: LanguageServicePlugin[], getScriptFileNames: () => string[], compilerOptions?: ts.CompilerOptions, setup?: (options: {
    language: Language;
    project: ProjectContext;
}) => void): {
    check: (fileName: string) => Promise<Diagnostic[]>;
    fixErrors: (fileName: string, diagnostics: Diagnostic[], only: string[] | undefined, writeFile: (fileName: string, newText: string) => Promise<void>) => Promise<void>;
    printErrors: (fileName: string, diagnostics: Diagnostic[], rootPath?: string) => string;
    getRootFileNames: () => string[];
    language: Language<URI>;
    settings: {};
    fileCreated(fileName: string): void;
    fileUpdated(fileName: string): void;
    fileDeleted(fileName: string): void;
};
