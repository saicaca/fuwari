"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandExecutor = exports.CommandExecutor = void 0;
class CommandExecutor {
    constructor() {
        this.commands = new Map();
    }
    executeCommand(params) {
        if (this.commands.has(params.command)) {
            const handler = this.commands.get(params.command);
            return handler(...params.arguments);
        }
        throw new Error(`Command '${params.command}' not found`);
    }
    registerCommand(commandId, handler) {
        this.commands.set(commandId, handler);
    }
}
exports.CommandExecutor = CommandExecutor;
exports.commandExecutor = new CommandExecutor();
//# sourceMappingURL=commandExecutor.js.map