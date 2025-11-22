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
exports.loadTsdkByUrl = loadTsdkByUrl;
const vscode = require("vscode-languageserver/browser");
const vscode_uri_1 = require("vscode-uri");
const http_1 = require("./lib/fileSystemProviders/http");
const server_1 = require("./lib/server");
const http_2 = require("./lib/fileSystemProviders/http");
__exportStar(require("vscode-languageserver/browser"), exports);
__exportStar(require("./index"), exports);
__exportStar(require("./lib/project/simpleProject"), exports);
__exportStar(require("./lib/project/typescriptProject"), exports);
__exportStar(require("./lib/server"), exports);
function createConnection() {
    const messageReader = new vscode.BrowserMessageReader(self);
    const messageWriter = new vscode.BrowserMessageWriter(self);
    const connection = vscode.createConnection(messageReader, messageWriter);
    return connection;
}
function createServer(connection) {
    const server = (0, server_1.createServerBase)(connection, {
        timer: {
            setImmediate: (callback, ...args) => {
                setTimeout(callback, 0, ...args);
            },
        },
    });
    server.fileSystem.install('http', http_2.provider);
    server.fileSystem.install('https', http_2.provider);
    server.onInitialized(() => (0, http_2.listenEditorSettings)(server));
    return server;
}
async function loadTsdkByUrl(tsdkUrl, locale) {
    locale = locale?.toLowerCase();
    return {
        typescript: await loadLib(),
        diagnosticMessages: await loadLocalizedDiagnosticMessages(),
    };
    async function loadLib() {
        const originalModule = globalThis.module;
        try {
            globalThis.module = { exports: {} };
            await import(`${tsdkUrl}/typescript.js`);
            return globalThis.module.exports;
        }
        finally {
            globalThis.module = originalModule;
        }
    }
    async function loadLocalizedDiagnosticMessages() {
        if (locale === 'en') {
            return;
        }
        try {
            const json = await (0, http_1.handler)(vscode_uri_1.URI.parse(`${tsdkUrl}/${locale}/diagnosticMessages.generated.json`));
            if (json) {
                return JSON.parse(json);
            }
        }
        catch { }
    }
}
//# sourceMappingURL=browser.js.map