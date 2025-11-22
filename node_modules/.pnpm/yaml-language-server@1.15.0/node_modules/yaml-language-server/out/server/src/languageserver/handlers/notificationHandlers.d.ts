import { Connection } from 'vscode-languageserver';
import { LanguageService } from '../../languageservice/yamlLanguageService';
import { SettingsState } from '../../yamlSettings';
import { SettingsHandler } from './settingsHandlers';
export declare class NotificationHandlers {
    private readonly connection;
    private languageService;
    private yamlSettings;
    private settingsHandler;
    constructor(connection: Connection, languageService: LanguageService, yamlSettings: SettingsState, settingsHandler: SettingsHandler);
    registerHandlers(): void;
    /**
     * Received a notification from the client with schema associations from other extensions
     * Update the associations in the server
     */
    private schemaAssociationNotificationHandler;
    /**
     * Received a notification from the client that it can accept custom schema requests
     * Register the custom schema provider and use it for requests of unknown scheme
     */
    private dynamicSchemaRequestHandler;
    /**
     * Received a notification from the client that it can accept content requests
     * This means that the server sends schemas back to the client side to get resolved rather
     * than resolving them on the extension side
     */
    private vscodeContentRequestHandler;
    private schemaSelectionRequestHandler;
}
