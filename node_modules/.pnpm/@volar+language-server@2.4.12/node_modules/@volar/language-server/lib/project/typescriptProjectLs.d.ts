import { Language, LanguagePlugin, LanguageService, LanguageServiceEnvironment, ProjectContext, ProviderResult } from '@volar/language-service';
import { TypeScriptProjectHost, createSys } from '@volar/typescript';
import type * as ts from 'typescript';
import { URI } from 'vscode-uri';
import type { LanguageServer } from '../types';
export interface TypeScriptProjectLS {
    tryAddFile(fileName: string): void;
    getCommandLine(): ts.ParsedCommandLine;
    languageService: LanguageService;
    dispose(): void;
}
export interface ProjectExposeContext {
    env: LanguageServiceEnvironment;
    configFileName: string | undefined;
    projectHost: TypeScriptProjectHost;
    sys: ReturnType<typeof createSys>;
    uriConverter: {
        asUri(fileName: string): URI;
        asFileName(uri: URI): string;
    };
}
export declare function createTypeScriptLS(ts: typeof import('typescript'), tsLocalized: ts.MapLike<string> | undefined, tsconfig: string | ts.CompilerOptions, server: LanguageServer, serviceEnv: LanguageServiceEnvironment, workspaceFolder: URI, uriConverter: {
    asUri(fileName: string): URI;
    asFileName(uri: URI): string;
}, create: (projectContext: ProjectExposeContext) => ProviderResult<{
    languagePlugins: LanguagePlugin<URI>[];
    setup?(options: {
        language: Language;
        project: ProjectContext;
    }): void;
}>): Promise<TypeScriptProjectLS>;
