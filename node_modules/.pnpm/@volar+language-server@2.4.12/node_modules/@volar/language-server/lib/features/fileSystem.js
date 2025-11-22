"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_service_1 = require("@volar/language-service");
const vscode = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
function register(documents, fileWatcher) {
    const providers = new Map();
    const readFileCache = (0, language_service_1.createUriMap)();
    const statCache = (0, language_service_1.createUriMap)();
    const readDirectoryCache = (0, language_service_1.createUriMap)();
    documents.onDidSave(({ document }) => {
        const uri = vscode_uri_1.URI.parse(document.uri);
        readFileCache.set(uri, document.getText());
        statCache.delete(uri);
    });
    fileWatcher.onDidChangeWatchedFiles(({ changes }) => {
        for (const change of changes) {
            const changeUri = vscode_uri_1.URI.parse(change.uri);
            const dir = vscode_uri_1.URI.parse(change.uri.substring(0, change.uri.lastIndexOf('/')));
            if (change.type === vscode.FileChangeType.Deleted) {
                readFileCache.set(changeUri, undefined);
                statCache.set(changeUri, undefined);
                readDirectoryCache.delete(dir);
            }
            else if (change.type === vscode.FileChangeType.Changed) {
                readFileCache.delete(changeUri);
                statCache.delete(changeUri);
            }
            else if (change.type === vscode.FileChangeType.Created) {
                readFileCache.delete(changeUri);
                statCache.delete(changeUri);
                readDirectoryCache.delete(dir);
            }
        }
    });
    return {
        readFile(uri) {
            if (!readFileCache.has(uri)) {
                readFileCache.set(uri, providers.get(uri.scheme)?.readFile(uri));
            }
            return readFileCache.get(uri);
        },
        stat(uri) {
            if (!statCache.has(uri)) {
                statCache.set(uri, providers.get(uri.scheme)?.stat(uri));
            }
            return statCache.get(uri);
        },
        readDirectory(uri) {
            if (!readDirectoryCache.has(uri)) {
                readDirectoryCache.set(uri, providers.get(uri.scheme)?.readDirectory(uri) ?? []);
            }
            return readDirectoryCache.get(uri);
        },
        install(scheme, provider) {
            providers.set(scheme, provider);
        },
    };
}
//# sourceMappingURL=fileSystem.js.map