"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestHandlers = void 0;
const yamlSchemaService_1 = require("../../languageservice/services/yamlSchemaService");
const requestTypes_1 = require("../../requestTypes");
class RequestHandlers {
    constructor(connection, languageService) {
        this.connection = connection;
        this.languageService = languageService;
    }
    registerHandlers() {
        this.connection.onRequest(requestTypes_1.SchemaModificationNotification.type, (modifications) => this.registerSchemaModificationNotificationHandler(modifications));
    }
    registerSchemaModificationNotificationHandler(modifications) {
        if (modifications.action === yamlSchemaService_1.MODIFICATION_ACTIONS.add) {
            this.languageService.modifySchemaContent(modifications);
        }
        else if (modifications.action === yamlSchemaService_1.MODIFICATION_ACTIONS.delete) {
            this.languageService.deleteSchemaContent(modifications);
        }
        else if (modifications.action === yamlSchemaService_1.MODIFICATION_ACTIONS.deleteAll) {
            this.languageService.deleteSchemasWhole(modifications);
        }
    }
}
exports.RequestHandlers = RequestHandlers;
//# sourceMappingURL=requestHandlers.js.map