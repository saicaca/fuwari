import { CustomSchemaRequest, DynamicCustomSchemaRequestRegistration, SchemaAssociationNotification, SchemaSelectionRequests, VSCodeContentRequestRegistration, } from '../../requestTypes';
export class NotificationHandlers {
    constructor(connection, languageService, yamlSettings, settingsHandler) {
        this.connection = connection;
        this.languageService = languageService;
        this.yamlSettings = yamlSettings;
        this.settingsHandler = settingsHandler;
    }
    registerHandlers() {
        this.connection.onNotification(SchemaAssociationNotification.type, (associations) => this.schemaAssociationNotificationHandler(associations));
        this.connection.onNotification(DynamicCustomSchemaRequestRegistration.type, () => this.dynamicSchemaRequestHandler());
        this.connection.onNotification(VSCodeContentRequestRegistration.type, () => this.vscodeContentRequestHandler());
        this.connection.onNotification(SchemaSelectionRequests.type, () => this.schemaSelectionRequestHandler());
    }
    /**
     * Received a notification from the client with schema associations from other extensions
     * Update the associations in the server
     */
    schemaAssociationNotificationHandler(associations) {
        this.yamlSettings.schemaAssociations = associations;
        this.yamlSettings.specificValidatorPaths = [];
        this.settingsHandler.pullConfiguration().catch((error) => console.log(error));
    }
    /**
     * Received a notification from the client that it can accept custom schema requests
     * Register the custom schema provider and use it for requests of unknown scheme
     */
    dynamicSchemaRequestHandler() {
        const schemaProvider = ((resource) => {
            return this.connection.sendRequest(CustomSchemaRequest.type, resource);
        });
        this.languageService.registerCustomSchemaProvider(schemaProvider);
    }
    /**
     * Received a notification from the client that it can accept content requests
     * This means that the server sends schemas back to the client side to get resolved rather
     * than resolving them on the extension side
     */
    vscodeContentRequestHandler() {
        this.yamlSettings.useVSCodeContentRequest = true;
    }
    schemaSelectionRequestHandler() {
        this.yamlSettings.useSchemaSelectionRequests = true;
    }
}
//# sourceMappingURL=notificationHandlers.js.map