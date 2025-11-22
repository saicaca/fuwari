"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _5_0_1 = require("../5_0");
const project_1 = require("./project");
function default_1(ts, sys, host, createLanguageService) {
    return (0, _5_0_1.default)(ts, sys, host, createLanguageService, project_1.createProject);
}
exports.default = default_1;
