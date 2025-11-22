import { Language, LanguagePlugin, ProjectContext, ProviderResult } from '@volar/language-service';
import type * as ts from 'typescript';
import { URI } from 'vscode-uri';
import type { LanguageServerProject } from '../types';
import { ProjectExposeContext } from './typescriptProjectLs';
export declare function createTypeScriptProject(ts: typeof import('typescript'), tsLocalized: ts.MapLike<string> | undefined, create: (projectContext: ProjectExposeContext) => ProviderResult<{
    languagePlugins: LanguagePlugin<URI>[];
    setup?(options: {
        language: Language;
        project: ProjectContext;
    }): void;
}>): LanguageServerProject;
export declare function createUriConverter(rootFolders: URI[]): {
    asFileName: (parsed: URI) => string;
    asUri: (fileName: string) => URI;
};
export declare function sortTSConfigs(file: string, a: string, b: string): number;
export declare function isFileInDir(fileName: string, dir: string): boolean;
export declare function getWorkspaceFolder(uri: URI, workspaceFolders: {
    has(uri: URI): boolean;
    all: URI[];
}): URI;
