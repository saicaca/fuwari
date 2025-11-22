"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPackageJsonCache = exports.canCreatePackageJsonCache = void 0;
function canCreatePackageJsonCache(ts) {
    return 'createPackageJsonInfo' in ts && 'getDirectoryPath' in ts && 'combinePaths' in ts && 'tryFileExists' in ts && 'forEachAncestorDirectory' in ts;
}
exports.canCreatePackageJsonCache = canCreatePackageJsonCache;
function createPackageJsonCache(ts, host) {
    const { createPackageJsonInfo, getDirectoryPath, combinePaths, tryFileExists, forEachAncestorDirectory } = ts;
    const packageJsons = new Map();
    const directoriesWithoutPackageJson = new Map();
    return {
        addOrUpdate,
        // @ts-expect-error
        forEach: packageJsons.forEach.bind(packageJsons),
        get: packageJsons.get.bind(packageJsons),
        delete: fileName => {
            packageJsons.delete(fileName);
            directoriesWithoutPackageJson.set(getDirectoryPath(fileName), true);
        },
        getInDirectory: directory => {
            return packageJsons.get(combinePaths(directory, "package.json")) || undefined;
        },
        directoryHasPackageJson,
        searchDirectoryAndAncestors: directory => {
            // @ts-expect-error
            forEachAncestorDirectory(directory, ancestor => {
                if (directoryHasPackageJson(ancestor) !== 3 /* Ternary.Maybe */) {
                    return true;
                }
                const packageJsonFileName = host.toPath(combinePaths(ancestor, "package.json"));
                if (tryFileExists(host, packageJsonFileName)) {
                    addOrUpdate(packageJsonFileName);
                }
                else {
                    directoriesWithoutPackageJson.set(ancestor, true);
                }
            });
        },
    };
    function addOrUpdate(fileName) {
        const packageJsonInfo = 
        // Debug.checkDefined(
        createPackageJsonInfo(fileName, host.host);
        // );
        packageJsons.set(fileName, packageJsonInfo);
        directoriesWithoutPackageJson.delete(getDirectoryPath(fileName));
    }
    function directoryHasPackageJson(directory) {
        return packageJsons.has(combinePaths(directory, "package.json")) ? -1 /* Ternary.True */ :
            directoriesWithoutPackageJson.has(directory) ? 0 /* Ternary.False */ :
                3 /* Ternary.Maybe */;
    }
}
exports.createPackageJsonCache = createPackageJsonCache;
