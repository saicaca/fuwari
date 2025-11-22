"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initProject = exports.createProject = void 0;
const moduleSpecifierCache_1 = require("./moduleSpecifierCache");
const autoImportProviderProject_1 = require("./autoImportProviderProject");
;
function createProject(ts, host, createLanguageService, options) {
    var _a, _b;
    const { combinePaths, inferredTypesContainingFile, createSymlinkCache, toPath, createCacheableExportInfoMap, timestamp, isInsideNodeModules, LanguageServiceMode, } = ts;
    const tsCreateModuleSpecifierCache = (_a = ts.server) === null || _a === void 0 ? void 0 : _a.createModuleSpecifierCache;
    const noopHost = {
        watchNodeModulesForPackageJsonChanges: () => ({ close: () => { } }),
        toPath(fileName) {
            return toPath(fileName, host.getCurrentDirectory(), projectService.toCanonicalFileName);
        }
    };
    const AutoImportProviderProject = (0, autoImportProviderProject_1.createAutoImportProviderProjectStatic)(ts, host, createLanguageService);
    const { projectService, compilerOptions, currentDirectory } = options;
    function updateProjectIfDirty(project) {
        return project.dirty && project.updateGraph();
    }
    return {
        dirty: false,
        hostProject: undefined,
        languageServiceEnabled: true,
        languageService: undefined,
        projectService,
        getCanonicalFileName: projectService.toCanonicalFileName,
        exportMapCache: undefined,
        getCachedExportInfoMap() {
            return (this.exportMapCache || (this.exportMapCache = createCacheableExportInfoMap(this)));
        },
        clearCachedExportInfoMap() {
            var _a;
            (_a = this.exportMapCache) === null || _a === void 0 ? void 0 : _a.clear();
        },
        moduleSpecifierCache: tsCreateModuleSpecifierCache
            ? tsCreateModuleSpecifierCache(noopHost)
            : ((_b = options.createModuleSpecifierCache) !== null && _b !== void 0 ? _b : moduleSpecifierCache_1.createModuleSpecifierCache)(),
        getModuleSpecifierCache() {
            return this.moduleSpecifierCache;
        },
        compilerOptions,
        getCompilationSettings() {
            return this.compilerOptions;
        },
        getCompilerOptions() {
            return this.compilerOptions;
        },
        program: undefined,
        getCurrentProgram() {
            return this.program;
        },
        currentDirectory: projectService.getNormalizedAbsolutePath(currentDirectory || ''),
        getCurrentDirectory() {
            return this.currentDirectory;
        },
        symlinks: undefined,
        getSymlinkCache() {
            if (!this.symlinks) {
                this.symlinks = createSymlinkCache(this.getCurrentDirectory(), this.getCanonicalFileName);
            }
            if (this.program && !this.symlinks.hasProcessedResolutions()) {
                this.symlinks.setSymlinksFromResolutions(this.program.getSourceFiles(), 
                // @ts-expect-error
                this.program.getAutomaticTypeDirectiveResolutions());
            }
            return this.symlinks;
        },
        packageJsonsForAutoImport: undefined,
        getPackageJsonsForAutoImport(rootDir) {
            const packageJsons = this.getPackageJsonsVisibleToFile(combinePaths(this.currentDirectory, inferredTypesContainingFile), rootDir);
            this.packageJsonsForAutoImport = new Set(packageJsons.map((p) => p.fileName));
            return packageJsons;
        },
        getPackageJsonsVisibleToFile(fileName, rootDir) {
            return this.projectService.getPackageJsonsVisibleToFile(fileName, rootDir);
        },
        getModuleResolutionHostForAutoImportProvider() {
            var _a;
            if (this.program) {
                return {
                    // @ts-expect-error
                    fileExists: this.program.fileExists,
                    // @ts-expect-error
                    directoryExists: this.program.directoryExists,
                    // @ts-expect-error
                    realpath: this.program.realpath || ((_a = this.projectService.host.realpath) === null || _a === void 0 ? void 0 : _a.bind(this.projectService.host)),
                    getCurrentDirectory: this.getCurrentDirectory.bind(this),
                    readFile: this.projectService.host.readFile.bind(this.projectService.host),
                    getDirectories: this.projectService.host.getDirectories.bind(this.projectService.host),
                    // trace: this.projectService.host.trace?.bind(this.projectService.host),
                    trace: () => { },
                    // @ts-expect-error
                    useCaseSensitiveFileNames: this.program.useCaseSensitiveFileNames(),
                };
            }
            return this.projectService.host;
        },
        autoImportProviderHost: undefined,
        getPackageJsonAutoImportProvider() {
            if (this.autoImportProviderHost === false) {
                return undefined;
            }
            if (this.projectService.serverMode !== LanguageServiceMode.Semantic) {
                this.autoImportProviderHost = false;
                return undefined;
            }
            if (this.autoImportProviderHost) {
                updateProjectIfDirty(this.autoImportProviderHost);
                if (this.autoImportProviderHost.isEmpty()) {
                    this.autoImportProviderHost.close();
                    this.autoImportProviderHost = undefined;
                    return undefined;
                }
                return this.autoImportProviderHost.getCurrentProgram();
            }
            const dependencySelection = projectService.includePackageJsonAutoImports();
            if (dependencySelection) {
                // tracing?.push(tracing.Phase.Session, "getPackageJsonAutoImportProvider");
                const start = timestamp();
                this.autoImportProviderHost = AutoImportProviderProject.create(dependencySelection, this, this.getModuleResolutionHostForAutoImportProvider());
                if (this.autoImportProviderHost) {
                    updateProjectIfDirty(this.autoImportProviderHost);
                    this.sendPerformanceEvent('CreatePackageJsonAutoImportProvider', timestamp() - start);
                    // tracing?.pop();
                    return this.autoImportProviderHost.getCurrentProgram();
                }
                // tracing?.pop();
            }
        },
        includePackageJsonAutoImports() {
            if (this.projectService.includePackageJsonAutoImports() === 0 /* PackageJsonAutoImportPreference.Off */ ||
                !this.languageServiceEnabled ||
                isInsideNodeModules(this.currentDirectory) /* ||
            !this.isDefaultProjectForOpenFiles()*/) {
                return 0 /* PackageJsonAutoImportPreference.Off */;
            }
            return this.projectService.includePackageJsonAutoImports();
        },
        close() { },
        log(_message) { },
        sendPerformanceEvent(_kind, _durationMs) { },
        toPath(fileName) {
            return toPath(fileName, this.currentDirectory, this.projectService.toCanonicalFileName);
        },
        getGlobalTypingsCacheLocation() {
            return undefined;
        },
        useSourceOfProjectReferenceRedirect() {
            return !this.getCompilerOptions().disableSourceOfProjectReferenceRedirect;
        },
        onAutoImportProviderSettingsChanged() {
            var _a;
            if (this.autoImportProviderHost === false) {
                this.autoImportProviderHost = undefined;
            }
            else {
                (_a = this.autoImportProviderHost) === null || _a === void 0 ? void 0 : _a.markAsDirty();
            }
        },
    };
}
exports.createProject = createProject;
function initProject(project, host, createLanguageService) {
    const languageService = createLanguageService(host);
    project.languageService = languageService;
    project.program = languageService.getProgram();
    return project;
}
exports.initProject = initProject;
