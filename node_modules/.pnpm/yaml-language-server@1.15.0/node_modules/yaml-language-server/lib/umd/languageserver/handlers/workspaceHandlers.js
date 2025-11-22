/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceHandlers = void 0;
    class WorkspaceHandlers {
        constructor(connection, commandExecutor) {
            this.connection = connection;
            this.commandExecutor = commandExecutor;
        }
        registerHandlers() {
            this.connection.onExecuteCommand((params) => this.executeCommand(params));
        }
        executeCommand(params) {
            return this.commandExecutor.executeCommand(params);
        }
    }
    exports.WorkspaceHandlers = WorkspaceHandlers;
});
//# sourceMappingURL=workspaceHandlers.js.map