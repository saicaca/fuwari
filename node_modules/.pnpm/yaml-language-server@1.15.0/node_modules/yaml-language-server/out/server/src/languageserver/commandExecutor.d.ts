import { ExecuteCommandParams } from 'vscode-languageserver-protocol';
export interface CommandHandler {
    (...args: unknown[]): void;
}
export declare class CommandExecutor {
    private commands;
    executeCommand(params: ExecuteCommandParams): void;
    registerCommand(commandId: string, handler: CommandHandler): void;
}
export declare const commandExecutor: CommandExecutor;
