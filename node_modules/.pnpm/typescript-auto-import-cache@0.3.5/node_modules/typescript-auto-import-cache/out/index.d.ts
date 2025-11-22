import type * as ts from 'typescript/lib/tsserverlibrary';
export { PackageJsonAutoImportPreference } from './5_0/projectService';
export declare function createLanguageService(ts: typeof import('typescript/lib/tsserverlibrary'), sys: ts.System, host: ts.LanguageServiceHost, createLanguageService: (host: ts.LanguageServiceHost) => ts.LanguageService): {
    languageService: ts.LanguageService;
    setPreferences?(preferences: ts.UserPreferences): void;
    projectUpdated?(updatedProjectDirectory: string): void;
};
