"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const vscode = require("vscode-languageserver");
function register(server) {
    const configurations = new Map();
    const didChangeCallbacks = new Set();
    server.onInitialized(() => {
        server.connection.onDidChangeConfiguration(params => {
            configurations.clear(); // TODO: clear only the configurations that changed
            for (const cb of didChangeCallbacks) {
                cb(params);
            }
        });
        const didChangeConfiguration = server.initializeParams.capabilities.workspace?.didChangeConfiguration;
        if (didChangeConfiguration?.dynamicRegistration) {
            server.connection.client.register(vscode.DidChangeConfigurationNotification.type);
        }
    });
    return {
        get,
        onDidChange,
    };
    function get(section, scopeUri) {
        if (!server.initializeParams.capabilities.workspace?.configuration) {
            return Promise.resolve(undefined);
        }
        const didChangeConfiguration = server.initializeParams.capabilities.workspace?.didChangeConfiguration;
        if (!scopeUri && didChangeConfiguration) {
            if (!configurations.has(section)) {
                configurations.set(section, getConfigurationWorker(section, scopeUri));
            }
            return configurations.get(section);
        }
        return getConfigurationWorker(section, scopeUri);
    }
    function onDidChange(cb) {
        didChangeCallbacks.add(cb);
        return {
            dispose() {
                didChangeCallbacks.delete(cb);
            },
        };
    }
    async function getConfigurationWorker(section, scopeUri) {
        return (await server.connection.workspace.getConfiguration({ scopeUri, section })) ?? undefined /* replace null to undefined */;
    }
}
//# sourceMappingURL=configurations.js.map