import { Connection } from 'vscode-languageserver';
import { LanguageService } from '../../languageservice/yamlLanguageService';
export declare class RequestHandlers {
    private readonly connection;
    private languageService;
    constructor(connection: Connection, languageService: LanguageService);
    registerHandlers(): void;
    private registerSchemaModificationNotificationHandler;
}
