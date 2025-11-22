"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileType = void 0;
exports.isAbsolutePath = isAbsolutePath;
exports.resolvePath = resolvePath;
exports.normalizePath = normalizePath;
exports.joinPath = joinPath;
var FileType;
(function (FileType) {
    /**
     * The file type is unknown.
     */
    FileType[FileType["Unknown"] = 0] = "Unknown";
    /**
     * A regular file.
     */
    FileType[FileType["File"] = 1] = "File";
    /**
     * A directory.
     */
    FileType[FileType["Directory"] = 2] = "Directory";
    /**
     * A symbolic link to a file.
     */
    FileType[FileType["SymbolicLink"] = 64] = "SymbolicLink";
})(FileType || (exports.FileType = FileType = {}));
// following https://nodejs.org/api/path.html#path_path_isabsolute_path
const PathMatchRegex = new RegExp('^(/|//|\\\\\\\\|[A-Za-z]:(/|\\\\))');
const Dot = '.'.charCodeAt(0);
function isAbsolutePath(path) {
    return PathMatchRegex.test(path);
}
function resolvePath(uri, path) {
    if (isAbsolutePath(path)) {
        return uri.with({ path: normalizePath(path.split('/')) });
    }
    return joinPath(uri, path);
}
function normalizePath(parts) {
    const newParts = [];
    for (const part of parts) {
        if (part.length === 0 || part.length === 1 && part.charCodeAt(0) === Dot) {
            // ignore
        }
        else if (part.length === 2 && part.charCodeAt(0) === Dot && part.charCodeAt(1) === Dot) {
            newParts.pop();
        }
        else {
            newParts.push(part);
        }
    }
    if (parts.length > 1 && parts[parts.length - 1].length === 0) {
        newParts.push('');
    }
    let res = newParts.join('/');
    if (parts[0].length === 0) {
        res = '/' + res;
    }
    return res;
}
function joinPath(uri, ...paths) {
    const parts = uri.path.split('/');
    for (const path of paths) {
        parts.push(...path.split('/'));
    }
    return uri.with({ path: normalizePath(parts) });
}
//# sourceMappingURL=fileService.js.map