"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moduleSpecifierCache_1 = require("./moduleSpecifierCache");
const packageJsonCache_1 = require("./packageJsonCache");
function default_1(ts, host, service) {
    const _createCacheableExportInfoMap = ts.createCacheableExportInfoMap;
    const _combinePaths = ts.combinePaths;
    const _forEachAncestorDirectory = ts.forEachAncestorDirectory;
    const _getDirectoryPath = ts.getDirectoryPath;
    const _toPath = ts.toPath;
    const _createGetCanonicalFileName = ts.createGetCanonicalFileName;
    if (!_createCacheableExportInfoMap
        || !_combinePaths
        || !_forEachAncestorDirectory
        || !_getDirectoryPath
        || !_toPath
        || !_createGetCanonicalFileName)
        return;
    const moduleSpecifierCache = (0, moduleSpecifierCache_1.createModuleSpecifierCache)();
    const exportMapCache = _createCacheableExportInfoMap({
        getCurrentProgram() {
            return service.getProgram();
        },
        getPackageJsonAutoImportProvider() {
            return service.getProgram();
        },
        getGlobalTypingsCacheLocation() {
            return undefined;
        },
    });
    const packageJsonCache = (0, packageJsonCache_1.createPackageJsonCache)(ts, Object.assign(Object.assign({}, host), { 
        // @ts-expect-error
        host: Object.assign({}, host), toPath }));
    // @ts-expect-error
    host.getCachedExportInfoMap = () => exportMapCache;
    // @ts-expect-error
    host.getModuleSpecifierCache = () => moduleSpecifierCache;
    // @ts-expect-error
    host.getPackageJsonsVisibleToFile = (fileName, rootDir) => {
        const rootPath = rootDir && toPath(rootDir);
        const filePath = toPath(fileName);
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
        _forEachAncestorDirectory(_getDirectoryPath(filePath), processDirectory);
        return result;
    };
    function toPath(fileName) {
        var _a;
        return _toPath(fileName, host.getCurrentDirectory(), _createGetCanonicalFileName((_a = host.useCaseSensitiveFileNames) === null || _a === void 0 ? void 0 : _a.call(host)));
    }
}
exports.default = default_1;
