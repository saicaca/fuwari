(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "vscode-uri", "request-light", "url", "../../requestTypes", "../utils/paths"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.workspaceContext = exports.schemaRequestHandler = void 0;
    const vscode_uri_1 = require("vscode-uri");
    const request_light_1 = require("request-light");
    const URL = require("url");
    const requestTypes_1 = require("../../requestTypes");
    const paths_1 = require("../utils/paths");
    /**
     * Handles schema content requests given the schema URI
     * @param uri can be a local file, vscode request, http(s) request or a custom request
     */
    const schemaRequestHandler = (connection, uri, workspaceFolders, workspaceRoot, useVSCodeContentRequest, fs) => {
        if (!uri) {
            return Promise.reject('No schema specified');
        }
        // If the requested schema URI is a relative file path
        // Convert it into a proper absolute path URI
        if ((0, paths_1.isRelativePath)(uri)) {
            uri = (0, paths_1.relativeToAbsolutePath)(workspaceFolders, workspaceRoot, uri);
        }
        let scheme = vscode_uri_1.URI.parse(uri).scheme.toLowerCase();
        // test if uri is windows path, ie starts with 'c:\'
        if (/^[a-z]:[\\/]/i.test(uri)) {
            const winUri = vscode_uri_1.URI.file(uri);
            scheme = winUri.scheme.toLowerCase();
            uri = winUri.toString();
        }
        // If the requested schema is a local file, read and return the file contents
        if (scheme === 'file') {
            const fsPath = vscode_uri_1.URI.parse(uri).fsPath;
            return fs.readFile(fsPath, 'UTF-8').catch(() => {
                // If there was an error reading the file, return empty error message
                // Otherwise return the file contents as a string
                return '';
            });
        }
        // HTTP(S) requests are sent and the response result is either the schema content or an error
        if (scheme === 'http' || scheme === 'https') {
            // If we are running inside of VSCode we need to make a content request. This content request
            // will make it so that schemas behind VPN's will resolve correctly
            if (useVSCodeContentRequest) {
                return connection.sendRequest(requestTypes_1.VSCodeContentRequest.type, uri).then((responseText) => {
                    return responseText;
                }, (error) => {
                    return Promise.reject(error.message);
                });
            }
            // Send the HTTP(S) schema content request and return the result
            const headers = { 'Accept-Encoding': 'gzip, deflate' };
            return (0, request_light_1.xhr)({ url: uri, followRedirects: 5, headers }).then((response) => {
                return response.responseText;
            }, (error) => {
                return Promise.reject(error.responseText || (0, request_light_1.getErrorStatusDescription)(error.status) || error.toString());
            });
        }
        // Neither local file nor vscode, nor HTTP(S) schema request, so send it off as a custom request
        return connection.sendRequest(requestTypes_1.CustomSchemaContentRequest.type, uri);
    };
    exports.schemaRequestHandler = schemaRequestHandler;
    exports.workspaceContext = {
        resolveRelativePath: (relativePath, resource) => {
            return URL.resolve(resource, relativePath);
        },
    };
});
//# sourceMappingURL=schemaRequestHandler.js.map