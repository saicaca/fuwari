/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { yamlDocumentsCache } from '../../languageservice/parser/yaml-documents';
import { getSchemaUrls } from '../../languageservice/utils/schemaUrls';
import { SchemaSelectionRequests } from '../../requestTypes';
export class JSONSchemaSelection {
    constructor(schemaService, yamlSettings, connection) {
        this.schemaService = schemaService;
        this.yamlSettings = yamlSettings;
        this.connection = connection;
        this.connection?.onRequest(SchemaSelectionRequests.getSchema, (fileUri) => {
            return this.getSchemas(fileUri);
        });
        this.connection?.onRequest(SchemaSelectionRequests.getAllSchemas, (fileUri) => {
            return this.getAllSchemas(fileUri);
        });
    }
    async getSchemas(docUri) {
        const schemas = await this.getSchemasForFile(docUri);
        return Array.from(schemas).map((val) => {
            return {
                name: val[1].title,
                uri: val[0],
                description: val[1].description,
                versions: val[1].versions,
            };
        });
    }
    async getSchemasForFile(docUri) {
        const document = this.yamlSettings?.documents.get(docUri);
        const schemas = new Map();
        if (!document) {
            return schemas;
        }
        const yamlDoc = yamlDocumentsCache.getYamlDocument(document);
        for (const currentYAMLDoc of yamlDoc.documents) {
            const schema = await this.schemaService.getSchemaForResource(document.uri, currentYAMLDoc);
            if (schema?.schema) {
                const schemaUrls = getSchemaUrls(schema?.schema);
                if (schemaUrls.size === 0) {
                    continue;
                }
                for (const urlToSchema of schemaUrls) {
                    schemas.set(urlToSchema[0], urlToSchema[1]);
                }
            }
        }
        return schemas;
    }
    async getAllSchemas(docUri) {
        const fileSchemas = await this.getSchemasForFile(docUri);
        const fileSchemasHandle = Array.from(fileSchemas.entries()).map((val) => {
            return {
                uri: val[0],
                fromStore: false,
                usedForCurrentFile: true,
                name: val[1].title,
                description: val[1].description,
                versions: val[1].versions,
            };
        });
        const result = [];
        let allSchemas = this.schemaService.getAllSchemas();
        allSchemas = allSchemas.filter((val) => !fileSchemas.has(val.uri));
        result.push(...fileSchemasHandle);
        result.push(...allSchemas);
        return result;
    }
}
//# sourceMappingURL=schemaSelectionHandlers.js.map