"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildErrorMessage = exports.parseCommand = void 0;
function parseCommand(command) {
    return Array.isArray(command)
        ? [command[0], command.splice(1), false] // shell=false
        : [command, [], true]; // shell=true
}
exports.parseCommand = parseCommand;
function buildErrorMessage(command0, status) {
    return `Command '${command0}' failed with status code ${status}`;
}
exports.buildErrorMessage = buildErrorMessage;
