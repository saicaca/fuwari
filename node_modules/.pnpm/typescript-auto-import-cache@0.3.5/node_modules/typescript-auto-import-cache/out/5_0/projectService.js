"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProjectService = void 0;
const packageJsonCache_1 = require("./packageJsonCache");
function createProjectService(ts, sys, currentDirectory, hostConfiguration, serverMode) {
    const { toPath, getNormalizedAbsolutePath, normalizePath: toNormalizedPath, createGetCanonicalFileName, forEachAncestorDirectory, getDirectoryPath, } = ts;
    const projectService = {
        serverMode,
        host: sys,
        currentDirectory: toNormalizedPath(currentDirectory),
        toCanonicalFileName: createGetCanonicalFileName(sys.useCaseSensitiveFileNames),
        toPath(fileName) {
            return toPath(fileName, this.currentDirectory, this.toCanonicalFileName);
        },
        getExecutingFilePath() {
            return this.getNormalizedAbsolutePath(this.host.getExecutingFilePath());
        },
        getNormalizedAbsolutePath(fileName) {
            return getNormalizedAbsolutePath(fileName, this.host.getCurrentDirectory());
        },
        packageJsonCache: undefined,
        getPackageJsonsVisibleToFile(fileName, rootDir) {
            const packageJsonCache = this.packageJsonCache;
            const rootPath = rootDir && this.toPath(rootDir);
            const filePath = this.toPath(fileName);
            const result = [];
            const processDirectory = (directory) => {
                switch (packageJsonCache.directoryHasPackageJson(directory)) {
                    // Sync and check same directory again
                    case 3 /* Ternary.Maybe */:
                        packageJsonCache.searchDirectoryAndAncestors(directory);
                        return processDirectory(directory);
                    // Check package.json
                    case -1 /* Ternary.True */:
                        // const packageJsonFileName = _combinePaths(directory, "package.json");
                        // this.watchPackageJsonFile(packageJsonFileName as ts.Path); // TODO
                        const info = packageJsonCache.getInDirectory(directory);
                        if (info)
                            result.push(info);
                }
                if (rootPath && rootPath === directory) {
                    return true;
                }
            };
            forEachAncestorDirectory(getDirectoryPath(filePath), processDirectory);
            return result;
        },
        includePackageJsonAutoImports() {
            switch (hostConfiguration.preferences.includePackageJsonAutoImports) {
                case 'on': return 1 /* PackageJsonAutoImportPreference.On */;
                case 'off': return 0 /* PackageJsonAutoImportPreference.Off */;
                default: return 2 /* PackageJsonAutoImportPreference.Auto */;
            }
        },
        fileExists(fileName) {
            return this.host.fileExists(fileName);
        },
    };
    projectService.packageJsonCache = (0, packageJsonCache_1.createPackageJsonCache)(ts, projectService);
    return projectService;
}
exports.createProjectService = createProjectService;
