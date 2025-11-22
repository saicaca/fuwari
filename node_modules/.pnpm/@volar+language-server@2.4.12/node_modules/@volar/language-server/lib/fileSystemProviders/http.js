"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.provider = void 0;
exports.listenEditorSettings = listenEditorSettings;
exports.handler = handler;
const language_service_1 = require("@volar/language-service");
const request_light_1 = require("request-light");
exports.provider = {
    async stat(uri) {
        const text = await this.readFile(uri);
        if (text !== undefined) {
            return {
                type: language_service_1.FileType.File,
                size: text.length,
                ctime: 0,
                mtime: 0,
            };
        }
    },
    readFile(uri) {
        return handler(uri);
    },
    readDirectory() {
        return [];
    },
};
function listenEditorSettings(server) {
    server.configurations.onDidChange(updateHttpSettings);
    updateHttpSettings();
    async function updateHttpSettings() {
        const httpSettings = await server.configurations.get('http');
        (0, request_light_1.configure)(httpSettings?.proxy, httpSettings?.proxyStrictSSL ?? false);
    }
}
function handler(uri) {
    const headers = { 'Accept-Encoding': 'gzip, deflate' };
    return (0, request_light_1.xhr)({ url: uri.toString(true), followRedirects: 5, headers }).then(response => {
        if (response.status !== 200) {
            return;
        }
        return response.responseText;
    }, (error) => {
        return Promise.reject(error.responseText || (0, request_light_1.getErrorStatusDescription)(error.status) || error.toString());
    });
}
//# sourceMappingURL=http.js.map