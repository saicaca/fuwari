"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConnection = createConnection;
exports.createServer = createServer;
exports.loadTsdkByPath = loadTsdkByPath;
const vscode = require("vscode-languageserver/node");
const http_1 = require("./lib/fileSystemProviders/http");
const node_1 = require("./lib/fileSystemProviders/node");
const server_1 = require("./lib/server");
__exportStar(require("vscode-languageserver/node"), exports);
__exportStar(require("./index"), exports);
__exportStar(require("./lib/project/simpleProject"), exports);
__exportStar(require("./lib/project/typescriptProject"), exports);
__exportStar(require("./lib/server"), exports);
function createConnection() {
    return vscode.createConnection(vscode.ProposedFeatures.all);
}
function createServer(connection) {
    const server = (0, server_1.createServerBase)(connection, {
        timer: {
            setImmediate: setImmediate,
        },
    });
    server.fileSystem.install('file', node_1.provider);
    server.fileSystem.install('http', http_1.provider);
    server.fileSystem.install('https', http_1.provider);
    server.onInitialized(() => (0, http_1.listenEditorSettings)(server));
    return server;
}
function loadTsdkByPath(tsdk, locale) {
    locale = locale?.toLowerCase();
    // webpack compatibility
    const _require = eval('require');
    return {
        typescript: loadLib(),
        diagnosticMessages: loadLocalizedDiagnosticMessages(),
    };
    function loadLib() {
        for (const name of ['./typescript.js', './tsserverlibrary.js']) {
            try {
                return _require(_require.resolve(name, { paths: [tsdk] }));
            }
            catch { }
        }
        // for bun
        for (const name of ['typescript.js', 'tsserverlibrary.js']) {
            try {
                return _require(tsdk + '/' + name);
            }
            catch { }
        }
        throw new Error(`Can't find typescript.js or tsserverlibrary.js in ${JSON.stringify(tsdk)}`);
    }
    function loadLocalizedDiagnosticMessages() {
        if (locale === 'en') {
            return;
        }
        try {
            const path = _require.resolve(`./${locale}/diagnosticMessages.generated.json`, { paths: [tsdk] });
            return _require(path);
        }
        catch { }
    }
}
//# sourceMappingURL=node.js.map