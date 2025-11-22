"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_service_1 = require("@volar/language-service");
const vscode_uri_1 = require("vscode-uri");
function register(server) {
    const folders = (0, language_service_1.createUriMap)();
    const didChangeCallbacks = new Set();
    server.onInitialize(serverCapabilities => {
        const { initializeParams } = server;
        if (initializeParams.workspaceFolders?.length) {
            for (const folder of initializeParams.workspaceFolders) {
                folders.set(vscode_uri_1.URI.parse(folder.uri), true);
            }
        }
        else if (initializeParams.rootUri) {
            folders.set(vscode_uri_1.URI.parse(initializeParams.rootUri), true);
        }
        else if (initializeParams.rootPath) {
            folders.set(vscode_uri_1.URI.file(initializeParams.rootPath), true);
        }
        // #18
        serverCapabilities.workspace ??= {};
        serverCapabilities.workspace.workspaceFolders = {
            supported: true,
            changeNotifications: true,
        };
    });
    server.onInitialized(() => {
        if (server.initializeParams.capabilities.workspace?.workspaceFolders) {
            server.connection.workspace.onDidChangeWorkspaceFolders(e => {
                e.added = e.added.filter(folder => !folders.has(vscode_uri_1.URI.parse(folder.uri)));
                e.removed = e.removed.filter(folder => folders.has(vscode_uri_1.URI.parse(folder.uri)));
                if (e.added.length || e.removed.length) {
                    for (const folder of e.added) {
                        folders.set(vscode_uri_1.URI.parse(folder.uri), true);
                    }
                    for (const folder of e.removed) {
                        folders.delete(vscode_uri_1.URI.parse(folder.uri));
                    }
                    server.project.reload();
                    for (const cb of didChangeCallbacks) {
                        cb(e);
                    }
                }
            });
        }
    });
    return {
        get all() {
            return [...folders.keys()];
        },
        has(uri) {
            return folders.has(uri);
        },
        onDidChange,
    };
    function onDidChange(cb) {
        didChangeCallbacks.add(cb);
        return {
            dispose() {
                didChangeCallbacks.delete(cb);
            },
        };
    }
}
//# sourceMappingURL=workspaceFolders.js.map