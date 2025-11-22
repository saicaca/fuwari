"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.provider = void 0;
const language_service_1 = require("@volar/language-service");
const fs = require("fs");
exports.provider = {
    stat(uri) {
        try {
            const stats = fs.statSync(uri.fsPath, { throwIfNoEntry: false });
            if (stats) {
                return {
                    type: stats.isFile() ? language_service_1.FileType.File
                        : stats.isDirectory() ? language_service_1.FileType.Directory
                            : stats.isSymbolicLink() ? language_service_1.FileType.SymbolicLink
                                : language_service_1.FileType.Unknown,
                    ctime: stats.ctimeMs,
                    mtime: stats.mtimeMs,
                    size: stats.size,
                };
            }
        }
        catch {
            return undefined;
        }
    },
    readFile(uri, encoding) {
        try {
            return fs.readFileSync(uri.fsPath, { encoding: encoding ?? 'utf-8' });
        }
        catch {
            return undefined;
        }
    },
    readDirectory(uri) {
        try {
            const files = fs.readdirSync(uri.fsPath, { withFileTypes: true });
            return files.map(file => {
                return [file.name, file.isFile() ? language_service_1.FileType.File
                        : file.isDirectory() ? language_service_1.FileType.Directory
                            : file.isSymbolicLink() ? language_service_1.FileType.SymbolicLink
                                : language_service_1.FileType.Unknown];
            });
        }
        catch {
            return [];
        }
    },
};
//# sourceMappingURL=node.js.map