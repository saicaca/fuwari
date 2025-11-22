"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asUri = exports.asFileName = exports.defaultCompilerOptions = void 0;
exports.asPosix = asPosix;
const vscode_uri_1 = require("vscode-uri");
exports.defaultCompilerOptions = {
    allowJs: true,
    allowSyntheticDefaultImports: true,
    allowNonTsExtensions: true,
    resolveJsonModule: true,
    jsx: 1,
};
function asPosix(path) {
    return path.replace(/\\/g, '/');
}
const asFileName = (uri) => uri.fsPath.replace(/\\/g, '/');
exports.asFileName = asFileName;
const asUri = (fileName) => vscode_uri_1.URI.file(fileName);
exports.asUri = asUri;
//# sourceMappingURL=utils.js.map