import type { System, server, LanguageServiceMode, UserPreferences } from 'typescript/lib/tsserverlibrary';
import { PackageJsonCache, ProjectPackageJsonInfo } from './packageJsonCache';
export type ProjectService = ReturnType<typeof createProjectService>;
type NormalizedPath = server.NormalizedPath;
export declare const enum PackageJsonAutoImportPreference {
    Off = 0,
    On = 1,
    Auto = 2
}
export declare function createProjectService(ts: typeof import('typescript/lib/tsserverlibrary'), sys: System, currentDirectory: string, hostConfiguration: {
    preferences: UserPreferences;
}, serverMode: LanguageServiceMode): {
    serverMode: LanguageServiceMode;
    host: System;
    currentDirectory: any;
    toCanonicalFileName: any;
    toPath(fileName: string): any;
    getExecutingFilePath(): any;
    getNormalizedAbsolutePath(fileName: string): any;
    packageJsonCache: PackageJsonCache;
    getPackageJsonsVisibleToFile(fileName: string, rootDir?: string): readonly ProjectPackageJsonInfo[];
    includePackageJsonAutoImports(): PackageJsonAutoImportPreference;
    fileExists(fileName: NormalizedPath): boolean;
};
export {};
