import type { Path, server } from 'typescript/lib/tsserverlibrary';
export declare const enum PackageJsonDependencyGroup {
    Dependencies = 1,
    DevDependencies = 2,
    PeerDependencies = 4,
    OptionalDependencies = 8,
    All = 15
}
export interface PackageJsonInfo {
    fileName: string;
    parseable: boolean;
    dependencies?: Map<string, string>;
    devDependencies?: Map<string, string>;
    peerDependencies?: Map<string, string>;
    optionalDependencies?: Map<string, string>;
    get(dependencyName: string, inGroups?: PackageJsonDependencyGroup): string | undefined;
    has(dependencyName: string, inGroups?: PackageJsonDependencyGroup): boolean;
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
export declare function canCreatePackageJsonCache(ts: typeof import('typescript/lib/tsserverlibrary')): boolean;
export declare function createPackageJsonCache(ts: typeof import('typescript/lib/tsserverlibrary'), host: ProjectService): PackageJsonCache;
export {};
