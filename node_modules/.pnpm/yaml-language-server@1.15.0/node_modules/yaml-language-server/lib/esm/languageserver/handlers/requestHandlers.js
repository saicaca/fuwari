import { MODIFICATION_ACTIONS, } from '../../languageservice/services/yamlSchemaService';
import { SchemaModificationNotification } from '../../requestTypes';
export class RequestHandlers {
    constructor(connection, languageService) {
        this.connection = connection;
        this.languageService = languageService;
    }
    registerHandlers() {
        this.connection.onRequest(SchemaModificationNotification.type, (modifications) => this.registerSchemaModificationNotificationHandler(modifications));
    }
    registerSchemaModificationNotificationHandler(modifications) {
        if (modifications.action === MODIFICATION_ACTIONS.add) {
            this.languageService.modifySchemaContent(modifications);
        }
        else if (modifications.action === MODIFICATION_ACTIONS.delete) {
            this.languageService.deleteSchemaContent(modifications);
        }
        else if (modifications.action === MODIFICATION_ACTIONS.deleteAll) {
            this.languageService.deleteSchemasWhole(modifications);
        }
    }
}
//# sourceMappingURL=requestHandlers.js.map