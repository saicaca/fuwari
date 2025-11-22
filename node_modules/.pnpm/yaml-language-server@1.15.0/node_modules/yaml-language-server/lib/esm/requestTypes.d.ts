import { NotificationType, RequestType } from 'vscode-languageserver';
import { SchemaAdditions, SchemaDeletions } from './languageservice/services/yamlSchemaService';
import { SchemaConfiguration } from './languageservice/yamlLanguageService';
import { SchemaVersions } from './languageservice/yamlTypes';
export declare type ISchemaAssociations = Record<string, string[]>;
export interface JSONSchemaDescription {
    /**
     * Schema URI
     */
    uri: string;
    /**
     * Schema name, from schema store
     */
    name?: string;
    /**
     * Schema description, from schema store
     */
    description?: string;
}
export interface JSONSchemaDescriptionExt extends JSONSchemaDescription {
    /**
     * Is schema used for current document
     */
    usedForCurrentFile: boolean;
    /**
     * Is schema from schema store
     */
    fromStore: boolean;
    versions?: SchemaVersions;
}
export declare namespace SchemaAssociationNotification {
    const type: NotificationType<ISchemaAssociations | SchemaConfiguration[]>;
}
export declare namespace DynamicCustomSchemaRequestRegistration {
    const type: NotificationType<unknown>;
}
export declare namespace VSCodeContentRequestRegistration {
    const type: NotificationType<unknown>;
}
export declare namespace ResultLimitReachedNotification {
    const type: NotificationType<string>;
}
export declare namespace VSCodeContentRequest {
    const type: RequestType<string, string, unknown>;
}
export declare namespace CustomSchemaContentRequest {
    const type: RequestType<string, string, unknown>;
}
export declare namespace CustomSchemaRequest {
    const type: RequestType<unknown, unknown, unknown>;
}
export declare namespace ColorSymbolRequest {
    const type: RequestType<unknown, unknown, unknown>;
}
export declare namespace SchemaModificationNotification {
    const type: RequestType<SchemaAdditions | SchemaDeletions, void, unknown>;
}
export declare namespace SchemaSelectionRequests {
    const type: NotificationType<void>;
    const getSchema: RequestType<string, JSONSchemaDescription[], unknown>;
    const getAllSchemas: RequestType<string, JSONSchemaDescriptionExt[], unknown>;
    const schemaStoreInitialized: NotificationType<unknown>;
}
