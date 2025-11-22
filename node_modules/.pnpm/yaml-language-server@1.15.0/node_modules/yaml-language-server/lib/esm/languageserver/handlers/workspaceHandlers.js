/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class WorkspaceHandlers {
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
//# sourceMappingURL=workspaceHandlers.js.map