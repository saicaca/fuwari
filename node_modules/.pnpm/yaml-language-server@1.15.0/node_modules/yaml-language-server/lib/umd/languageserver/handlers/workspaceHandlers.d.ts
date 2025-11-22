import { Connection } from 'vscode-languageserver';
import { CommandExecutor } from '../commandExecutor';
export declare class WorkspaceHandlers {
    private readonly connection;
    private readonly commandExecutor;
    constructor(connection: Connection, commandExecutor: CommandExecutor);
    registerHandlers(): void;
    private executeCommand;
}
