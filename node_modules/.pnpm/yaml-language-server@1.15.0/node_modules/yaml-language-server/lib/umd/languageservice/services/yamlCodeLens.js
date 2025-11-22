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
        define(["require", "exports", "vscode-languageserver-types", "../../commands", "../parser/yaml-documents", "../utils/schemaUrls", "../utils/objects", "../utils/schemaUtils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.YamlCodeLens = void 0;
    const vscode_languageserver_types_1 = require("vscode-languageserver-types");
    const commands_1 = require("../../commands");
    const yaml_documents_1 = require("../parser/yaml-documents");
    const schemaUrls_1 = require("../utils/schemaUrls");
    const objects_1 = require("../utils/objects");
    const schemaUtils_1 = require("../utils/schemaUtils");
    class YamlCodeLens {
        constructor(schemaService, telemetry) {
            this.schemaService = schemaService;
            this.telemetry = telemetry;
        }
        async getCodeLens(document) {
            const result = [];
            try {
                const yamlDocument = yaml_documents_1.yamlDocumentsCache.getYamlDocument(document);
                let schemaUrls = new Map();
                for (const currentYAMLDoc of yamlDocument.documents) {
                    const schema = await this.schemaService.getSchemaForResource(document.uri, currentYAMLDoc);
                    if (schema?.schema) {
                        // merge schemas from all docs to avoid duplicates
                        schemaUrls = new Map([...(0, schemaUrls_1.getSchemaUrls)(schema?.schema), ...schemaUrls]);
                    }
                }
                for (const urlToSchema of schemaUrls) {
                    const lens = vscode_languageserver_types_1.CodeLens.create(vscode_languageserver_types_1.Range.create(0, 0, 0, 0));
                    lens.command = {
                        title: (0, schemaUtils_1.getSchemaTitle)(urlToSchema[1], urlToSchema[0]),
                        command: commands_1.YamlCommands.JUMP_TO_SCHEMA,
                        arguments: [urlToSchema[0]],
                    };
                    result.push(lens);
                }
            }
            catch (err) {
                this.telemetry?.sendError('yaml.codeLens.error', { error: (0, objects_1.convertErrorToTelemetryMsg)(err) });
            }
            return result;
        }
        resolveCodeLens(param) {
            return param;
        }
    }
    exports.YamlCodeLens = YamlCodeLens;
});
//# sourceMappingURL=yamlCodeLens.js.map