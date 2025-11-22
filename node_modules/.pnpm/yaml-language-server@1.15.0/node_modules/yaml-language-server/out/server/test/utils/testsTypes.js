"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestTelemetry = exports.TestWorkspace = void 0;
const telemetry_1 = require("../../src/languageserver/telemetry");
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
class TestWorkspace {
    applyEdit(paramOrEdit) {
        throw new Error('Method not implemented.');
    }
    getConfiguration(items) {
        throw new Error('Method not implemented.');
    }
    getWorkspaceFolders() {
        throw new Error('Method not implemented.');
    }
    onDidCreateFiles(handler) {
        throw new Error('Method not implemented.');
    }
    onDidRenameFiles(handler) {
        throw new Error('Method not implemented.');
    }
    onDidDeleteFiles(handler) {
        throw new Error('Method not implemented.');
    }
    onWillCreateFiles(handler) {
        throw new Error('Method not implemented.');
    }
    onWillRenameFiles(handler) {
        throw new Error('Method not implemented.');
    }
    onWillDeleteFiles(handler) {
        throw new Error('Method not implemented.');
    }
}
exports.TestWorkspace = TestWorkspace;
class TestTelemetry extends telemetry_1.TelemetryImpl {
    constructor(connection) {
        super(connection);
        this.messages = [];
    }
    send(event) {
        this.messages.push(event);
    }
    clearMessages() {
        this.messages = [];
    }
}
exports.TestTelemetry = TestTelemetry;
//# sourceMappingURL=testsTypes.js.map