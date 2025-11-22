import { Event, NotificationHandler, RequestHandler } from 'vscode-jsonrpc';
import { ApplyWorkspaceEditParams, WorkspaceEdit, ApplyWorkspaceEditResponse, ConfigurationItem, WorkspaceFolder, WorkspaceFoldersChangeEvent, CreateFilesParams, RenameFilesParams, DeleteFilesParams } from 'vscode-languageserver-protocol';
import { Connection, RemoteWorkspace } from 'vscode-languageserver';
import { TelemetryImpl } from '../../src/languageserver/telemetry';
import { TelemetryEvent } from '../../src/languageservice/telemetry';
export declare class TestWorkspace implements RemoteWorkspace {
    connection: Connection;
    applyEdit(paramOrEdit: ApplyWorkspaceEditParams | WorkspaceEdit): Promise<ApplyWorkspaceEditResponse>;
    getConfiguration(): Promise<any>;
    getConfiguration(section: string): Promise<any>;
    getConfiguration(item: ConfigurationItem): Promise<any>;
    getConfiguration(items: ConfigurationItem[]): Promise<any[]>;
    getWorkspaceFolders(): Promise<WorkspaceFolder[]>;
    onDidChangeWorkspaceFolders: Event<WorkspaceFoldersChangeEvent>;
    onDidCreateFiles(handler: NotificationHandler<CreateFilesParams>): void;
    onDidRenameFiles(handler: NotificationHandler<RenameFilesParams>): void;
    onDidDeleteFiles(handler: NotificationHandler<DeleteFilesParams>): void;
    onWillCreateFiles(handler: RequestHandler<CreateFilesParams, WorkspaceEdit, never>): void;
    onWillRenameFiles(handler: RequestHandler<RenameFilesParams, WorkspaceEdit, never>): void;
    onWillDeleteFiles(handler: RequestHandler<DeleteFilesParams, WorkspaceEdit, never>): void;
}
export declare class TestTelemetry extends TelemetryImpl {
    messages: TelemetryEvent[];
    constructor(connection: Connection);
    send(event: TelemetryEvent): void;
    clearMessages(): void;
}
