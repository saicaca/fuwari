import type { Path } from 'typescript/lib/tsserverlibrary';
import type { ProjectService } from './projectService';
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
/** @internal */
export interface PackageJsonInfo {
    packageDirectory: string;
    contents: PackageJsonInfoContents;
}
/** @internal */
export interface PackageJsonInfoContents {
    packageJsonContent: PackageJsonPathFields;
    /** false: versionPaths are not present. undefined: not yet resolved */
    versionPaths: VersionPaths | false | undefined;
    /** false: resolved to nothing. undefined: not yet resolved */
    resolvedEntrypoints: string[] | false | undefined;
}
/** @internal */
export declare const enum PackageJsonDependencyGroup {
    Dependencies = 1,
    DevDependencies = 2,
    PeerDependencies = 4,
    OptionalDependencies = 8,
    All = 15
}
/** @internal */
export interface ProjectPackageJsonInfo {
    fileName: string;
    parseable: boolean;
    dependencies?: Map<string, string>;
    devDependencies?: Map<string, string>;
    peerDependencies?: Map<string, string>;
    optionalDependencies?: Map<string, string>;
    get(dependencyName: string, inGroups?: PackageJsonDependencyGroup): string | undefined;
    has(dependencyName: string, inGroups?: PackageJsonDependencyGroup): boolean;
}
export interface ProjectPackageJsonInfo {
    fileName: string;
    parseable: boolean;
    dependencies?: Map<string, string>;
    devDependencies?: Map<string, string>;
    peerDependencies?: Map<string, string>;
    optionalDependencies?: Map<string, string>;
    get(dependencyName: string, inGroups?: PackageJsonDependencyGroup): string | undefined;
    has(dependencyName: string, inGroups?: PackageJsonDependencyGroup): boolean;
}
export interface PackageJsonCache {
    addOrUpdate(fileName: Path): void;
    forEach(action: (info: ProjectPackageJsonInfo, fileName: Path) => void): void;
    delete(fileName: Path): void;
    get(fileName: Path): ProjectPackageJsonInfo | false | undefined;
    getInDirectory(directory: Path): ProjectPackageJsonInfo | undefined;
    directoryHasPackageJson(directory: Path): Ternary;
    searchDirectoryAndAncestors(directory: Path): void;
}
export declare const enum Ternary {
    False = 0,
    Unknown = 1,
    Maybe = 3,
    True = -1
}
export declare function createPackageJsonCache(ts: typeof import('typescript/lib/tsserverlibrary'), host: ProjectService): PackageJsonCache;
export {};
