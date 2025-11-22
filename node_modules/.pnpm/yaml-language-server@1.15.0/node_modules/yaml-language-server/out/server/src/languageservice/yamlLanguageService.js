"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLanguageService = exports.SchemaPriority = void 0;
const yamlSchemaService_1 = require("./services/yamlSchemaService");
const documentSymbols_1 = require("./services/documentSymbols");
const yamlHover_1 = require("./services/yamlHover");
const yamlValidation_1 = require("./services/yamlValidation");
const yamlFormatter_1 = require("./services/yamlFormatter");
const yamlLinks_1 = require("./services/yamlLinks");
const yamlFolding_1 = require("./services/yamlFolding");
const yamlCodeActions_1 = require("./services/yamlCodeActions");
const yamlOnTypeFormatting_1 = require("./services/yamlOnTypeFormatting");
const yamlCodeLens_1 = require("./services/yamlCodeLens");
const yamlCompletion_1 = require("./services/yamlCompletion");
const yaml_documents_1 = require("./parser/yaml-documents");
const schemaSelectionHandlers_1 = require("../languageserver/handlers/schemaSelectionHandlers");
const yamlDefinition_1 = require("./services/yamlDefinition");
const yamlSelectionRanges_1 = require("./services/yamlSelectionRanges");
var SchemaPriority;
(function (SchemaPriority) {
    SchemaPriority[SchemaPriority["SchemaStore"] = 1] = "SchemaStore";
    SchemaPriority[SchemaPriority["SchemaAssociation"] = 2] = "SchemaAssociation";
    SchemaPriority[SchemaPriority["Settings"] = 3] = "Settings";
})(SchemaPriority = exports.SchemaPriority || (exports.SchemaPriority = {}));
function getLanguageService(params) {
    const schemaService = new yamlSchemaService_1.YAMLSchemaService(params.schemaRequestService, params.workspaceContext);
    const completer = new yamlCompletion_1.YamlCompletion(schemaService, params.clientCapabilities, yaml_documents_1.yamlDocumentsCache, params.telemetry);
    const hover = new yamlHover_1.YAMLHover(schemaService, params.telemetry);
    const yamlDocumentSymbols = new documentSymbols_1.YAMLDocumentSymbols(schemaService, params.telemetry);
    const yamlValidation = new yamlValidation_1.YAMLValidation(schemaService, params.telemetry);
    const formatter = new yamlFormatter_1.YAMLFormatter();
    const yamlCodeActions = new yamlCodeActions_1.YamlCodeActions(params.clientCapabilities);
    const yamlCodeLens = new yamlCodeLens_1.YamlCodeLens(schemaService, params.telemetry);
    const yamlLinks = new yamlLinks_1.YamlLinks(params.telemetry);
    const yamlDefinition = new yamlDefinition_1.YamlDefinition(params.telemetry);
    new schemaSelectionHandlers_1.JSONSchemaSelection(schemaService, params.yamlSettings, params.connection);
    return {
        configure: (settings) => {
            schemaService.clearExternalSchemas();
            if (settings.schemas) {
                schemaService.schemaPriorityMapping = new Map();
                settings.schemas.forEach((settings) => {
                    const currPriority = settings.priority ? settings.priority : 0;
                    schemaService.addSchemaPriority(settings.uri, currPriority);
                    schemaService.registerExternalSchema(settings.uri, settings.fileMatch, settings.schema, settings.name, settings.description, settings.versions);
                });
            }
            yamlValidation.configure(settings);
            hover.configure(settings);
            completer.configure(settings);
            formatter.configure(settings);
            yamlCodeActions.configure(settings);
        },
        registerCustomSchemaProvider: (schemaProvider) => {
            schemaService.registerCustomSchemaProvider(schemaProvider);
        },
        findLinks: yamlLinks.findLinks.bind(yamlLinks),
        doComplete: completer.doComplete.bind(completer),
        doValidation: yamlValidation.doValidation.bind(yamlValidation),
        doHover: hover.doHover.bind(hover),
        findDocumentSymbols: yamlDocumentSymbols.findDocumentSymbols.bind(yamlDocumentSymbols),
        findDocumentSymbols2: yamlDocumentSymbols.findHierarchicalDocumentSymbols.bind(yamlDocumentSymbols),
        doDefinition: yamlDefinition.getDefinition.bind(yamlDefinition),
        resetSchema: (uri) => {
            return schemaService.onResourceChange(uri);
        },
        doFormat: formatter.format.bind(formatter),
        doDocumentOnTypeFormatting: yamlOnTypeFormatting_1.doDocumentOnTypeFormatting,
        addSchema: (schemaID, schema) => {
            return schemaService.saveSchema(schemaID, schema);
        },
        deleteSchema: (schemaID) => {
            return schemaService.deleteSchema(schemaID);
        },
        modifySchemaContent: (schemaAdditions) => {
            return schemaService.addContent(schemaAdditions);
        },
        deleteSchemaContent: (schemaDeletions) => {
            return schemaService.deleteContent(schemaDeletions);
        },
        deleteSchemasWhole: (schemaDeletions) => {
            return schemaService.deleteSchemas(schemaDeletions);
        },
        getFoldingRanges: yamlFolding_1.getFoldingRanges,
        getSelectionRanges: yamlSelectionRanges_1.getSelectionRanges,
        getCodeAction: (document, params) => {
            return yamlCodeActions.getCodeAction(document, params);
        },
        getCodeLens: (document) => {
            return yamlCodeLens.getCodeLens(document);
        },
        resolveCodeLens: (param) => yamlCodeLens.resolveCodeLens(param),
    };
}
exports.getLanguageService = getLanguageService;
//# sourceMappingURL=yamlLanguageService.js.map