import type { Path, server } from 'typescript/lib/tsserverlibrary';
interface PackageJsonPathFields {
    typings?: string;
    types?: string;
    typesVersions?: Map<string, Map<string, string[]>>;
    main?: string;
    tsconfig?: string;
    type?: string;
    imports?: object;
    exports?: object;
    name?: string;
}
interface VersionPaths {
    version: string;
    paths: Map<string, string[]>;
}
export interface PackageJsonInfo {
    packageDirectory: string;
    packageJsonContent: PackageJsonPathFields;
    versionPaths: VersionPaths | undefined;
    /** false: resolved to nothing. undefined: not yet resolved */
    resolvedEntrypoints: string[] | false | undefined;
}
export declare const enum Ternary {
    False = 0,
    Unknown = 1,
    Maybe = 3,
    True = -1
}
type ProjectService = server.ProjectService;
export interface PackageJsonCache {
    addOrUpdate(fileName: Path): void;
    forEach(action: (info: PackageJsonInfo, fileName: Path) => void): void;
    delete(fileName: Path): void;
    get(fileName: Path): PackageJsonInfo | false | undefined;
    getInDirectory(directory: Path): PackageJsonInfo | undefined;
    directoryHasPackageJson(directory: Path): Ternary;
    searchDirectoryAndAncestors(directory: Path): void;
}
export declare function createPackageJsonCache(ts: typeof import('typescript/lib/tsserverlibrary'), host: ProjectService): PackageJsonCache;
export {};
