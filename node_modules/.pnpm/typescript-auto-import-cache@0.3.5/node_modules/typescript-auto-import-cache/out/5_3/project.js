"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProject = void 0;
const project_1 = require("../5_0/project");
function createProject(ts, host, createLanguageService, options) {
    const { createSymlinkCache, ensureTrailingDirectorySeparator } = ts;
    const project = (0, project_1.createProject)(ts, host, createLanguageService, options);
    project.getSymlinkCache = () => {
        if (!project.symlinks) {
            project.symlinks = createSymlinkCache(project.getCurrentDirectory(), project.getCanonicalFileName);
            const setSymlinkedDirectory = project.symlinks.setSymlinkedDirectory;
            project.symlinks.setSymlinkedDirectory = (symlink, real) => {
                if (typeof real === 'object') {
                    real.real = ensureTrailingDirectorySeparator(real.real);
                    real.realPath = ensureTrailingDirectorySeparator(real.realPath);
                }
                setSymlinkedDirectory(symlink, real);
            };
        }
        if (project.program && !project.symlinks.hasProcessedResolutions()) {
            project.symlinks.setSymlinksFromResolutions(
            // @ts-expect-error
            project.program.forEachResolvedModule, 
            // @ts-expect-error
            project.program.forEachResolvedTypeReferenceDirective, 
            // @ts-expect-error
            project.program.getAutomaticTypeDirectiveResolutions());
        }
        return project.symlinks;
    };
    return project;
}
exports.createProject = createProject;
