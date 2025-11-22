import type { Path, UserPreferences, SourceFile } from 'typescript/lib/tsserverlibrary';
export interface ModulePath {
    path: string;
    isInNodeModules: boolean;
    isRedirect: boolean;
}
export interface ResolvedModuleSpecifierInfo {
    modulePaths: readonly ModulePath[] | undefined;
    moduleSpecifiers: readonly string[] | undefined;
    isBlockedByPackageJsonDependencies: boolean | undefined;
}
export interface ModuleSpecifierOptions {
    overrideImportMode?: SourceFile["impliedNodeFormat"];
}
export interface ModuleSpecifierCache {
    get(fromFileName: Path, toFileName: Path, preferences: UserPreferences, options: ModuleSpecifierOptions): Readonly<ResolvedModuleSpecifierInfo> | undefined;
    set(fromFileName: Path, toFileName: Path, preferences: UserPreferences, options: ModuleSpecifierOptions, modulePaths: readonly ModulePath[], moduleSpecifiers: readonly string[]): void;
    setBlockedByPackageJsonDependencies(fromFileName: Path, toFileName: Path, preferences: UserPreferences, options: ModuleSpecifierOptions, isBlockedByPackageJsonDependencies: boolean): void;
    setModulePaths(fromFileName: Path, toFileName: Path, preferences: UserPreferences, options: ModuleSpecifierOptions, modulePaths: readonly ModulePath[]): void;
    clear(): void;
    count(): number;
}
export interface FileWatcher {
    close(): void;
}
export interface ModuleSpecifierResolutionCacheHost {
    watchNodeModulesForPackageJsonChanges(directoryPath: string): FileWatcher;
}
export declare const nodeModulesPathPart = "/node_modules/";
export declare function createModuleSpecifierCache(): ModuleSpecifierCache;
