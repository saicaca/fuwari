"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProject = void 0;
const project_1 = require("../5_3/project");
const moduleSpecifierCache_1 = require("./moduleSpecifierCache");
function createProject(ts, host, createLanguageService, options) {
    // @ts-expect-error
    options.createModuleSpecifierCache = moduleSpecifierCache_1.createModuleSpecifierCache;
    return (0, project_1.createProject)(ts, host, createLanguageService, options);
}
exports.createProject = createProject;
