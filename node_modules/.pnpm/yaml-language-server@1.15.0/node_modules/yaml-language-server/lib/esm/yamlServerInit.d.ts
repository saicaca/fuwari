import { Connection, InitializeParams, InitializeResult } from 'vscode-languageserver';
import { LanguageService, SchemaRequestService, WorkspaceContextService } from './languageservice/yamlLanguageService';
import { SettingsState } from './yamlSettings';
import { LanguageHandlers } from './languageserver/handlers/languageHandlers';
import { ValidationHandler } from './languageserver/handlers/validationHandlers';
import { SettingsHandler } from './languageserver/handlers/settingsHandlers';
import { Telemetry } from './languageservice/telemetry';
export declare class YAMLServerInit {
    private readonly connection;
    private yamlSettings;
    private workspaceContext;
    private schemaRequestService;
    private telemetry;
    languageService: LanguageService;
    languageHandler: LanguageHandlers;
    validationHandler: ValidationHandler;
    settingsHandler: SettingsHandler;
    constructor(connection: Connection, yamlSettings: SettingsState, workspaceContext: WorkspaceContextService, schemaRequestService: SchemaRequestService, telemetry: Telemetry);
    connectionInitialized(params: InitializeParams): InitializeResult;
    private registerHandlers;
    start(): void;
}
