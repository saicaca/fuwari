"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode_languageserver_1 = require("vscode-languageserver");
const browser_1 = require("vscode-languageserver/browser");
const telemetry_1 = require("../languageserver/telemetry");
const schemaRequestHandler_1 = require("../languageservice/services/schemaRequestHandler");
const yamlServerInit_1 = require("../yamlServerInit");
const yamlSettings_1 = require("../yamlSettings");
// eslint-disable-next-line @typescript-eslint/no-namespace
var FSReadFile;
(function (FSReadFile) {
    FSReadFile.type = new vscode_languageserver_1.RequestType('fs/readFile');
})(FSReadFile || (FSReadFile = {}));
const messageReader = new browser_1.BrowserMessageReader(globalThis);
const messageWriter = new browser_1.BrowserMessageWriter(globalThis);
const connection = (0, browser_1.createConnection)(messageReader, messageWriter);
const yamlSettings = new yamlSettings_1.SettingsState();
const fileSystem = {
    readFile: (fsPath) => {
        return connection.sendRequest(FSReadFile.type, fsPath);
    },
};
/**
 * Handles schema content requests given the schema URI
 * @param uri can be a local file, vscode request, http(s) request or a custom request
 */
const schemaRequestHandlerWrapper = (connection, uri) => {
    return (0, schemaRequestHandler_1.schemaRequestHandler)(connection, uri, yamlSettings.workspaceFolders, yamlSettings.workspaceRoot, yamlSettings.useVSCodeContentRequest, fileSystem);
};
const schemaRequestService = schemaRequestHandlerWrapper.bind(this, connection);
const telemetry = new telemetry_1.TelemetryImpl(connection);
new yamlServerInit_1.YAMLServerInit(connection, yamlSettings, schemaRequestHandler_1.workspaceContext, schemaRequestService, telemetry).start();
//# sourceMappingURL=yamlServerMain.js.map