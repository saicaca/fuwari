"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAutoImportProviderProjectStatic = void 0;
const project_1 = require("./project");
function createAutoImportProviderProjectStatic(tsBase, host, createLanguageService) {
    const ts = tsBase;
    const { combinePaths, inferredTypesContainingFile, arrayFrom, resolvePackageNameToPackageJson, concatenate, forEach, startsWith, getEntrypointsFromPackageJsonInfo, mapDefined, timestamp, } = ts;
    return {
        maxDependencies: 10,
        compilerOptionsOverrides: {
            diagnostics: false,
            skipLibCheck: true,
            sourceMap: false,
            types: ts.emptyArray,
            lib: ts.emptyArray,
            noLib: true,
        },
        getRootFileNames(dependencySelection, hostProject, moduleResolutionHost, compilerOptions) {
            var _a, _b;
            if (!dependencySelection) {
                return ts.emptyArray;
            }
            const program = hostProject.getCurrentProgram();
            if (!program) {
                return ts.emptyArray;
            }
            const start = timestamp();
            let dependencyNames;
            let rootNames;
            const rootFileName = combinePaths(hostProject.currentDirectory, inferredTypesContainingFile);
            const packageJsons = hostProject.getPackageJsonsForAutoImport(combinePaths(hostProject.currentDirectory, rootFileName));
            for (const packageJson of packageJsons) {
                (_a = packageJson.dependencies) === null || _a === void 0 ? void 0 : _a.forEach((_, dependenyName) => addDependency(dependenyName));
                (_b = packageJson.peerDependencies) === null || _b === void 0 ? void 0 : _b.forEach((_, dependencyName) => addDependency(dependencyName));
            }
            let dependenciesAdded = 0;
            if (dependencyNames) {
                const symlinkCache = hostProject.getSymlinkCache();
                for (const name of arrayFrom(dependencyNames.keys())) {
                    // Avoid creating a large project that would significantly slow down time to editor interactivity
                    if (dependencySelection === 2 /* PackageJsonAutoImportPreference.Auto */ && dependenciesAdded > this.maxDependencies) {
                        hostProject.log(`AutoImportProviderProject: attempted to add more than ${this.maxDependencies} dependencies. Aborting.`);
                        return ts.emptyArray;
                    }
                    // 1. Try to load from the implementation package. For many dependencies, the
                    //	package.json will exist, but the package will not contain any typings,
                    //	so `entrypoints` will be undefined. In that case, or if the dependency
                    //	is missing altogether, we will move on to trying the @types package (2).
                    const packageJson = resolvePackageNameToPackageJson(name, hostProject.currentDirectory, compilerOptions, moduleResolutionHost, 
                    // @ts-expect-error
                    program.getModuleResolutionCache());
                    if (packageJson) {
                        const entrypoints = getRootNamesFromPackageJson(packageJson, program, symlinkCache);
                        if (entrypoints) {
                            rootNames = concatenate(rootNames, entrypoints);
                            dependenciesAdded += entrypoints.length ? 1 : 0;
                            continue;
                        }
                    }
                    // 2. Try to load from the @types package in the tree and in the global
                    //	typings cache location, if enabled.
                    // @ts-expect-error
                    const done = forEach([hostProject.currentDirectory, hostProject.getGlobalTypingsCacheLocation()], (directory) => {
                        if (directory) {
                            const typesPackageJson = resolvePackageNameToPackageJson(`@types/${name}`, directory, compilerOptions, moduleResolutionHost, 
                            // @ts-expect-error
                            program.getModuleResolutionCache());
                            if (typesPackageJson) {
                                const entrypoints = getRootNamesFromPackageJson(typesPackageJson, program, symlinkCache);
                                rootNames = concatenate(rootNames, entrypoints);
                                dependenciesAdded += (entrypoints === null || entrypoints === void 0 ? void 0 : entrypoints.length) ? 1 : 0;
                                return true;
                            }
                        }
                    });
                    if (done)
                        continue;
                    // 3. If the @types package did not exist and the user has settings that
                    //	allow processing JS from node_modules, go back to the implementation
                    //	package and load the JS.
                    if (packageJson && compilerOptions.allowJs && compilerOptions.maxNodeModuleJsDepth) {
                        const entrypoints = getRootNamesFromPackageJson(packageJson, program, symlinkCache, /*allowJs*/ true);
                        rootNames = concatenate(rootNames, entrypoints);
                        dependenciesAdded += (entrypoints === null || entrypoints === void 0 ? void 0 : entrypoints.length) ? 1 : 0;
                    }
                }
            }
            if (rootNames === null || rootNames === void 0 ? void 0 : rootNames.length) {
                hostProject.log(`AutoImportProviderProject: found ${rootNames.length} root files in ${dependenciesAdded} dependencies in ${timestamp() - start} ms`);
            }
            return rootNames || ts.emptyArray;
            function addDependency(dependency) {
                if (!startsWith(dependency, '@types/')) {
                    (dependencyNames || (dependencyNames = new Set())).add(dependency);
                }
            }
            function getRootNamesFromPackageJson(packageJson, program, symlinkCache, resolveJs) {
                var _a;
                const entrypoints = getEntrypointsFromPackageJsonInfo(packageJson, compilerOptions, moduleResolutionHost, 
                // @ts-expect-error
                program.getModuleResolutionCache(), resolveJs);
                if (entrypoints) {
                    const real = (_a = moduleResolutionHost.realpath) === null || _a === void 0 ? void 0 : _a.call(moduleResolutionHost, packageJson.packageDirectory);
                    const isSymlink = real && real !== packageJson.packageDirectory;
                    if (isSymlink) {
                        symlinkCache.setSymlinkedDirectory(packageJson.packageDirectory, {
                            real,
                            realPath: hostProject.toPath(real),
                        });
                    }
                    // @ts-expect-error
                    return mapDefined(entrypoints, (entrypoint) => {
                        const resolvedFileName = isSymlink ? entrypoint.replace(packageJson.packageDirectory, real) : entrypoint;
                        if (!program.getSourceFile(resolvedFileName) && !(isSymlink && program.getSourceFile(entrypoint))) {
                            return resolvedFileName;
                        }
                    });
                }
            }
        },
        create(dependencySelection, hostProject, moduleResolutionHost) {
            if (dependencySelection === 0 /* PackageJsonAutoImportPreference.Off */) {
                return undefined;
            }
            const compilerOptions = Object.assign(Object.assign({}, hostProject.getCompilerOptions()), this.compilerOptionsOverrides);
            let rootNames = this.getRootFileNames(dependencySelection, hostProject, moduleResolutionHost, compilerOptions);
            if (!rootNames.length) {
                return undefined;
            }
            return createAutoImportProviderProject(tsBase, host, createLanguageService, { self: this, hostProject, rootNames, compilerOptions });
        }
    };
}
exports.createAutoImportProviderProjectStatic = createAutoImportProviderProjectStatic;
function createAutoImportProviderProject(tsBase, host, createLanguageService, options) {
    const { self, rootNames, compilerOptions, hostProject } = options;
    const ts = tsBase;
    const { some } = ts;
    const project = Object.assign(Object.assign({}, (0, project_1.createProject)(tsBase, host, createLanguageService, {
        projectService: hostProject.projectService,
        currentDirectory: hostProject.currentDirectory,
        compilerOptions,
    })), { projectVersion: 0, getProjectVersion() {
            return this.projectVersion.toString();
        }, rootFileNames: rootNames, hostProject,
        isEmpty() {
            return !some(this.rootFileNames);
        },
        isOrphan() {
            return true;
        },
        updateGraph() {
            var _a;
            let rootFileNames = this.rootFileNames;
            if (!rootFileNames) {
                rootFileNames = self.getRootFileNames(this.hostProject.includePackageJsonAutoImports(), this.hostProject, this.hostProject.getModuleResolutionHostForAutoImportProvider(), this.getCompilationSettings());
            }
            this.rootFileNames = rootFileNames;
            const oldProgram = this.getCurrentProgram();
            this.program = (_a = this.languageService) === null || _a === void 0 ? void 0 : _a.getProgram();
            this.dirty = false;
            if (oldProgram && oldProgram !== this.getCurrentProgram()) {
                this.hostProject.clearCachedExportInfoMap();
            }
        },
        scheduleInvalidateResolutionsOfFailedLookupLocations() {
            // Invalidation will happen on-demand as part of updateGraph
            return;
        },
        hasRoots() {
            var _a;
            return !!((_a = this.rootFileNames) === null || _a === void 0 ? void 0 : _a.length);
        },
        markAsDirty() {
            if (!this.dirty) {
                this.rootFileNames = undefined;
                this.projectVersion++;
                this.dirty = true;
            }
        },
        getScriptFileNames() {
            return this.rootFileNames || ts.emptyArray;
        },
        getLanguageService() {
            throw new Error("AutoImportProviderProject language service should never be used. To get the program, use `project.getCurrentProgram()`.");
        },
        onAutoImportProviderSettingsChanged() {
            throw new Error("AutoImportProviderProject is an auto import provider; use `markAsDirty()` instead.");
        },
        onPackageJsonChange() {
            throw new Error("package.json changes should be notified on an AutoImportProvider's host project");
        },
        getModuleResolutionHostForAutoImportProvider() {
            throw new Error("AutoImportProviderProject cannot provide its own host; use `hostProject.getModuleResolutionHostForAutomImportProvider()` instead.");
        },
        includePackageJsonAutoImports() {
            return 0 /* PackageJsonAutoImportPreference.Off */;
        },
        getTypeAcquisition() {
            return { enable: false };
        },
        getSymlinkCache() {
            return this.hostProject.getSymlinkCache();
        },
        getModuleResolutionCache() {
            var _a, _b;
            // @ts-expect-error
            return (_b = (_a = this.hostProject.languageService) === null || _a === void 0 ? void 0 : _a.getProgram()) === null || _b === void 0 ? void 0 : _b.getModuleResolutionCache();
        } });
    return (0, project_1.initProject)(project, new Proxy(host, {
        get(target, key) {
            return key in project ? project[key] : target[key];
        },
        set(_target, key, value) {
            project[key] = value;
            return true;
        }
    }), createLanguageService);
}
