/* eslint-disable @typescript-eslint/no-namespace */
import { NotificationType, RequestType } from 'vscode-languageserver';
export var SchemaAssociationNotification;
(function (SchemaAssociationNotification) {
    SchemaAssociationNotification.type = new NotificationType('json/schemaAssociations');
})(SchemaAssociationNotification || (SchemaAssociationNotification = {}));
export var DynamicCustomSchemaRequestRegistration;
(function (DynamicCustomSchemaRequestRegistration) {
    DynamicCustomSchemaRequestRegistration.type = new NotificationType('yaml/registerCustomSchemaRequest');
})(DynamicCustomSchemaRequestRegistration || (DynamicCustomSchemaRequestRegistration = {}));
export var VSCodeContentRequestRegistration;
(function (VSCodeContentRequestRegistration) {
    VSCodeContentRequestRegistration.type = new NotificationType('yaml/registerContentRequest');
})(VSCodeContentRequestRegistration || (VSCodeContentRequestRegistration = {}));
export var ResultLimitReachedNotification;
(function (ResultLimitReachedNotification) {
    ResultLimitReachedNotification.type = new NotificationType('yaml/resultLimitReached');
})(ResultLimitReachedNotification || (ResultLimitReachedNotification = {}));
export var VSCodeContentRequest;
(function (VSCodeContentRequest) {
    VSCodeContentRequest.type = new RequestType('vscode/content');
})(VSCodeContentRequest || (VSCodeContentRequest = {}));
export var CustomSchemaContentRequest;
(function (CustomSchemaContentRequest) {
    CustomSchemaContentRequest.type = new RequestType('custom/schema/content');
})(CustomSchemaContentRequest || (CustomSchemaContentRequest = {}));
export var CustomSchemaRequest;
(function (CustomSchemaRequest) {
    CustomSchemaRequest.type = new RequestType('custom/schema/request');
})(CustomSchemaRequest || (CustomSchemaRequest = {}));
export var ColorSymbolRequest;
(function (ColorSymbolRequest) {
    ColorSymbolRequest.type = new RequestType('json/colorSymbols');
})(ColorSymbolRequest || (ColorSymbolRequest = {}));
export var SchemaModificationNotification;
(function (SchemaModificationNotification) {
    SchemaModificationNotification.type = new RequestType('json/schema/modify');
})(SchemaModificationNotification || (SchemaModificationNotification = {}));
export var SchemaSelectionRequests;
(function (SchemaSelectionRequests) {
    SchemaSelectionRequests.type = new NotificationType('yaml/supportSchemaSelection');
    SchemaSelectionRequests.getSchema = new RequestType('yaml/get/jsonSchema');
    SchemaSelectionRequests.getAllSchemas = new RequestType('yaml/get/all/jsonSchemas');
    SchemaSelectionRequests.schemaStoreInitialized = new NotificationType('yaml/schema/store/initialized');
})(SchemaSelectionRequests || (SchemaSelectionRequests = {}));
//# sourceMappingURL=requestTypes.js.map