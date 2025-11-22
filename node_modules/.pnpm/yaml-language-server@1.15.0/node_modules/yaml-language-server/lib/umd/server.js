/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Adam Voss. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "vscode-languageserver/node", "vscode-nls", "./languageservice/services/schemaRequestHandler", "./yamlServerInit", "./yamlSettings", "fs", "./languageservice/utils/objects", "./languageserver/telemetry"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const node_1 = require("vscode-languageserver/node");
    const nls = require("vscode-nls");
    const schemaRequestHandler_1 = require("./languageservice/services/schemaRequestHandler");
    const yamlServerInit_1 = require("./yamlServerInit");
    const yamlSettings_1 = require("./yamlSettings");
    const fs_1 = require("fs");
    const objects_1 = require("./languageservice/utils/objects");
    const telemetry_1 = require("./languageserver/telemetry");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nls.config(process.env['VSCODE_NLS_CONFIG']);
    // Create a connection for the server.
    let connection = null;
    if (process.argv.indexOf('--stdio') === -1) {
        connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
    }
    else {
        connection = (0, node_1.createConnection)();
    }
    process.on('uncaughtException', (err) => {
        // send all uncaught exception to telemetry with stack traces
        connection.console.error((0, objects_1.convertErrorToTelemetryMsg)(err));
    });
    console.log = connection.console.log.bind(connection.console);
    console.error = connection.console.error.bind(connection.console);
    //vscode-nls calls console.error(null) in some cases, so we put that in info, to predict sending "null" in to telemetry
    console.error = (arg) => {
        if (arg === null) {
            connection.console.info(arg);
        }
        else {
            connection.console.error(arg);
        }
    };
    const yamlSettings = new yamlSettings_1.SettingsState();
    const fileSystem = {
        readFile: async (fsPath, encoding) => {
            const b = await fs_1.promises.readFile(fsPath, encoding);
            return b.toString();
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
});
//# sourceMappingURL=server.js.map