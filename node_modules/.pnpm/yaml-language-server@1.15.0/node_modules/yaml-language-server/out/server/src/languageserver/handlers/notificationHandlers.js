"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationHandlers = void 0;
const requestTypes_1 = require("../../requestTypes");
class NotificationHandlers {
    constructor(connection, languageService, yamlSettings, settingsHandler) {
        this.connection = connection;
        this.languageService = languageService;
        this.yamlSettings = yamlSettings;
        this.settingsHandler = settingsHandler;
    }
    registerHandlers() {
        this.connection.onNotification(requestTypes_1.SchemaAssociationNotification.type, (associations) => this.schemaAssociationNotificationHandler(associations));
        this.connection.onNotification(requestTypes_1.DynamicCustomSchemaRequestRegistration.type, () => this.dynamicSchemaRequestHandler());
        this.connection.onNotification(requestTypes_1.VSCodeContentRequestRegistration.type, () => this.vscodeContentRequestHandler());
        this.connection.onNotification(requestTypes_1.SchemaSelectionRequests.type, () => this.schemaSelectionRequestHandler());
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
            return this.connection.sendRequest(requestTypes_1.CustomSchemaRequest.type, resource);
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
exports.NotificationHandlers = NotificationHandlers;
//# sourceMappingURL=notificationHandlers.js.map