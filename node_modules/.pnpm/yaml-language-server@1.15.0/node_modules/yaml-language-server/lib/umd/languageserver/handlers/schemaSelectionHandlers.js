/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../languageservice/parser/yaml-documents", "../../languageservice/utils/schemaUrls", "../../requestTypes"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.JSONSchemaSelection = void 0;
    const yaml_documents_1 = require("../../languageservice/parser/yaml-documents");
    const schemaUrls_1 = require("../../languageservice/utils/schemaUrls");
    const requestTypes_1 = require("../../requestTypes");
    class JSONSchemaSelection {
        constructor(schemaService, yamlSettings, connection) {
            this.schemaService = schemaService;
            this.yamlSettings = yamlSettings;
            this.connection = connection;
            this.connection?.onRequest(requestTypes_1.SchemaSelectionRequests.getSchema, (fileUri) => {
                return this.getSchemas(fileUri);
            });
            this.connection?.onRequest(requestTypes_1.SchemaSelectionRequests.getAllSchemas, (fileUri) => {
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
            const yamlDoc = yaml_documents_1.yamlDocumentsCache.getYamlDocument(document);
            for (const currentYAMLDoc of yamlDoc.documents) {
                const schema = await this.schemaService.getSchemaForResource(document.uri, currentYAMLDoc);
                if (schema?.schema) {
                    const schemaUrls = (0, schemaUrls_1.getSchemaUrls)(schema?.schema);
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
    exports.JSONSchemaSelection = JSONSchemaSelection;
});
//# sourceMappingURL=schemaSelectionHandlers.js.map