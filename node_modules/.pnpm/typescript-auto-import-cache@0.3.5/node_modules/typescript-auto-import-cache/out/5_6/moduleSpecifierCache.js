"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createModuleSpecifierCache = void 0;
function createModuleSpecifierCache(
// host: ModuleSpecifierResolutionCacheHost
) {
    let containedNodeModulesWatchers;
    let cache;
    let currentKey;
    const result = {
        get(fromFileName, toFileName, preferences, options) {
            if (!cache || currentKey !== key(fromFileName, preferences, options))
                return undefined;
            return cache.get(toFileName);
        },
        set(fromFileName, toFileName, preferences, options, kind, modulePaths, moduleSpecifiers) {
            ensureCache(fromFileName, preferences, options).set(toFileName, createInfo(kind, modulePaths, moduleSpecifiers, /*packageName */ undefined, /*isBlockedByPackageJsonDependencies*/ false));
            // If any module specifiers were generated based off paths in node_modules,
            // a package.json file in that package was read and is an input to the cached.
            // Instead of watching each individual package.json file, set up a wildcard
            // directory watcher for any node_modules referenced and clear the cache when
            // it sees any changes.
            if (moduleSpecifiers) {
                for (const p of modulePaths) {
                    if (p.isInNodeModules) {
                        // No trailing slash
                        // const nodeModulesPath = p.path.substring(0, p.path.indexOf(nodeModulesPathPart) + nodeModulesPathPart.length - 1);
                        // const key = host.toPath(nodeModulesPath);
                        // if (!containedNodeModulesWatchers?.has(key)) {
                        //	 (containedNodeModulesWatchers ||= new Map()).set(
                        //		 key,
                        //		 host.watchNodeModulesForPackageJsonChanges(nodeModulesPath),
                        //	 );
                        // }
                    }
                }
            }
        },
        setModulePaths(fromFileName, toFileName, preferences, options, modulePaths) {
            const cache = ensureCache(fromFileName, preferences, options);
            const info = cache.get(toFileName);
            if (info) {
                info.modulePaths = modulePaths;
            }
            else {
                cache.set(toFileName, createInfo(/*kind*/ undefined, modulePaths, /*moduleSpecifiers*/ undefined, /*packageName */ undefined, /*isBlockedByPackageJsonDependencies*/ undefined));
            }
        },
        setBlockedByPackageJsonDependencies(fromFileName, toFileName, preferences, options, packageName, isBlockedByPackageJsonDependencies) {
            const cache = ensureCache(fromFileName, preferences, options);
            const info = cache.get(toFileName);
            if (info) {
                info.isBlockedByPackageJsonDependencies = isBlockedByPackageJsonDependencies;
                info.packageName = packageName;
            }
            else {
                cache.set(toFileName, createInfo(/*kind*/ undefined, /*modulePaths*/ undefined, /*moduleSpecifiers*/ undefined, /*packageName */ undefined, isBlockedByPackageJsonDependencies));
            }
        },
        clear() {
            containedNodeModulesWatchers === null || containedNodeModulesWatchers === void 0 ? void 0 : containedNodeModulesWatchers.forEach(watcher => watcher.close());
            cache === null || cache === void 0 ? void 0 : cache.clear();
            containedNodeModulesWatchers === null || containedNodeModulesWatchers === void 0 ? void 0 : containedNodeModulesWatchers.clear();
            currentKey = undefined;
        },
        count() {
            return cache ? cache.size : 0;
        }
    };
    // if (Debug.isDebugging) {
    //	 Object.defineProperty(result, "__cache", { get: () => cache });
    // }
    return result;
    function ensureCache(fromFileName, preferences, options) {
        const newKey = key(fromFileName, preferences, options);
        if (cache && (currentKey !== newKey)) {
            result.clear();
        }
        currentKey = newKey;
        return cache || (cache = new Map());
    }
    function key(fromFileName, preferences, options) {
        return `${fromFileName},${preferences.importModuleSpecifierEnding},${preferences.importModuleSpecifierPreference},${options.overrideImportMode}`;
    }
    function createInfo(kind, modulePaths, moduleSpecifiers, packageName, isBlockedByPackageJsonDependencies) {
        return { kind, modulePaths, moduleSpecifiers, packageName, isBlockedByPackageJsonDependencies };
    }
}
exports.createModuleSpecifierCache = createModuleSpecifierCache;
