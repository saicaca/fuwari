"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const vscode = require("vscode-languageserver");
function register(server) {
    let watchFilesDisposableCounter = 0;
    let watchFilesDisposable;
    const didChangeWatchedFilesCallbacks = new Set();
    return {
        watchFiles,
        onDidChangeWatchedFiles,
    };
    async function watchFiles(patterns) {
        const disposables = [];
        const didChangeWatchedFiles = server.initializeParams.capabilities.workspace?.didChangeWatchedFiles;
        const fileOperations = server.initializeParams.capabilities.workspace?.fileOperations;
        if (didChangeWatchedFiles) {
            if (watchFilesDisposableCounter === 0) {
                watchFilesDisposable = server.connection.onDidChangeWatchedFiles(e => {
                    for (const cb of didChangeWatchedFilesCallbacks) {
                        cb(e);
                    }
                });
            }
            watchFilesDisposableCounter++;
            disposables.push({
                dispose() {
                    watchFilesDisposableCounter--;
                    if (watchFilesDisposableCounter === 0) {
                        watchFilesDisposable?.dispose();
                    }
                }
            });
        }
        if (didChangeWatchedFiles?.dynamicRegistration) {
            disposables.push(await server.connection.client.register(vscode.DidChangeWatchedFilesNotification.type, {
                watchers: patterns.map(pattern => ({ globPattern: pattern })),
            }));
        }
        if (fileOperations?.dynamicRegistration && fileOperations.willRename) {
            disposables.push(await server.connection.client.register(vscode.WillRenameFilesRequest.type, {
                filters: patterns.map(pattern => ({ pattern: { glob: pattern } })),
            }));
        }
        return {
            dispose() {
                for (const disposable of disposables) {
                    disposable.dispose();
                }
                disposables.length = 0;
            },
        };
    }
    function onDidChangeWatchedFiles(cb) {
        didChangeWatchedFilesCallbacks.add(cb);
        return {
            dispose: () => {
                didChangeWatchedFilesCallbacks.delete(cb);
            },
        };
    }
}
//# sourceMappingURL=fileWatcher.js.map