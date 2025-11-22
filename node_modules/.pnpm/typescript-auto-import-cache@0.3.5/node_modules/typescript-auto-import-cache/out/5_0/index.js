"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const projectService_1 = require("./projectService");
const project_1 = require("./project");
// only create the once for all hosts, as this will improve performance as the internal cache can be reused
let projectService;
const projects = new Set();
function default_1(ts, sys, host, createLanguageService, _createProject = project_1.createProject) {
    const hostConfiguration = { preferences: { includePackageJsonAutoImports: 'auto' } };
    if (!projectService) {
        projectService = (0, projectService_1.createProjectService)(ts, sys, host.getCurrentDirectory(), hostConfiguration, ts.LanguageServiceMode.Semantic);
    }
    const project = _createProject(ts, host, createLanguageService, {
        projectService,
        currentDirectory: host.getCurrentDirectory(),
        compilerOptions: host.getCompilationSettings(),
    });
    const proxyMethods = [
        'getCachedExportInfoMap',
        'getModuleSpecifierCache',
        'getGlobalTypingsCacheLocation',
        'getSymlinkCache',
        'getPackageJsonsVisibleToFile',
        'getPackageJsonAutoImportProvider',
        'includePackageJsonAutoImports',
        'useSourceOfProjectReferenceRedirect'
    ];
    proxyMethods.forEach(key => host[key] = project[key].bind(project));
    (0, project_1.initProject)(project, host, createLanguageService);
    projects.add(project);
    return {
        languageService: project.languageService,
        setPreferences(newPreferences) {
            let onAutoImportProviderSettingsChanged = newPreferences.includePackageJsonAutoImports !== hostConfiguration.preferences.includePackageJsonAutoImports;
            hostConfiguration.preferences = newPreferences;
            if (onAutoImportProviderSettingsChanged) {
                project.onAutoImportProviderSettingsChanged();
            }
        },
        projectUpdated(path) {
            projects.forEach(projectToUpdate => {
                var _a, _b, _c;
                if (project === projectToUpdate || !projectToUpdate.autoImportProviderHost)
                    return;
                const realPaths = [...(_c = (_b = (_a = projectToUpdate.symlinks) === null || _a === void 0 ? void 0 : _a.getSymlinkedDirectoriesByRealpath()) === null || _b === void 0 ? void 0 : _b.keys()) !== null && _c !== void 0 ? _c : []]
                    .map(name => projectToUpdate.projectService.getNormalizedAbsolutePath(name));
                if (realPaths.includes(projectToUpdate.projectService.toCanonicalFileName(path))) {
                    projectToUpdate.autoImportProviderHost.markAsDirty();
                }
            });
        },
    };
}
exports.default = default_1;
