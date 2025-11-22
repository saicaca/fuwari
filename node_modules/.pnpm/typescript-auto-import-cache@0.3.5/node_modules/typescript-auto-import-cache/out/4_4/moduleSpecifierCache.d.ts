import type { Path, UserPreferences } from 'typescript/lib/tsserverlibrary';
export interface ModulePath {
    path: string;
    isInNodeModules: boolean;
    isRedirect: boolean;
}
export interface ResolvedModuleSpecifierInfo {
    modulePaths: readonly ModulePath[] | undefined;
    moduleSpecifiers: readonly string[] | undefined;
    isAutoImportable: boolean | undefined;
}
export interface ModuleSpecifierCache {
    get(fromFileName: Path, toFileName: Path, preferences: UserPreferences): Readonly<ResolvedModuleSpecifierInfo> | undefined;
    set(fromFileName: Path, toFileName: Path, preferences: UserPreferences, modulePaths: readonly ModulePath[], moduleSpecifiers: readonly string[]): void;
    setIsAutoImportable(fromFileName: Path, toFileName: Path, preferences: UserPreferences, isAutoImportable: boolean): void;
    setModulePaths(fromFileName: Path, toFileName: Path, preferences: UserPreferences, modulePaths: readonly ModulePath[]): void;
    clear(): void;
    count(): number;
}
export declare function createModuleSpecifierCache(): ModuleSpecifierCache;
