import type { LanguagePlugin, LanguageServiceEnvironment } from '@volar/language-service';
import type { URI } from 'vscode-uri';
import type { LanguageServer, LanguageServerProject } from '../types';
export declare function createSimpleProject(languagePlugins: LanguagePlugin<URI>[]): LanguageServerProject;
export declare function createLanguageServiceEnvironment(server: LanguageServer, workspaceFolders: URI[]): LanguageServiceEnvironment;
