/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "vscode-languageserver-types", "vscode-json-languageservice/lib/umd/services/jsonValidation", "../parser/jsonParser07", "../utils/textBuffer", "../parser/yaml-documents", "../utils/objects", "./validation/unused-anchors", "./validation/yaml-style", "./validation/map-key-order"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.YAMLValidation = exports.yamlDiagToLSDiag = void 0;
    const vscode_languageserver_types_1 = require("vscode-languageserver-types");
    const jsonValidation_1 = require("vscode-json-languageservice/lib/umd/services/jsonValidation");
    const jsonParser07_1 = require("../parser/jsonParser07");
    const textBuffer_1 = require("../utils/textBuffer");
    const yaml_documents_1 = require("../parser/yaml-documents");
    const objects_1 = require("../utils/objects");
    const unused_anchors_1 = require("./validation/unused-anchors");
    const yaml_style_1 = require("./validation/yaml-style");
    const map_key_order_1 = require("./validation/map-key-order");
    /**
     * Convert a YAMLDocDiagnostic to a language server Diagnostic
     * @param yamlDiag A YAMLDocDiagnostic from the parser
     * @param textDocument TextDocument from the language server client
     */
    const yamlDiagToLSDiag = (yamlDiag, textDocument) => {
        const start = textDocument.positionAt(yamlDiag.location.start);
        const range = {
            start,
            end: yamlDiag.location.toLineEnd
                ? vscode_languageserver_types_1.Position.create(start.line, new textBuffer_1.TextBuffer(textDocument).getLineLength(start.line))
                : textDocument.positionAt(yamlDiag.location.end),
        };
        return vscode_languageserver_types_1.Diagnostic.create(range, yamlDiag.message, yamlDiag.severity, yamlDiag.code, jsonParser07_1.YAML_SOURCE);
    };
    exports.yamlDiagToLSDiag = yamlDiagToLSDiag;
    class YAMLValidation {
        constructor(schemaService, telemetry) {
            this.telemetry = telemetry;
            this.validators = [];
            this.MATCHES_MULTIPLE = 'Matches multiple schemas when only one must validate.';
            this.validationEnabled = true;
            this.jsonValidation = new jsonValidation_1.JSONValidation(schemaService, Promise);
        }
        configure(settings) {
            this.validators = [];
            if (settings) {
                this.validationEnabled = settings.validate;
                this.customTags = settings.customTags;
                this.disableAdditionalProperties = settings.disableAdditionalProperties;
                this.yamlVersion = settings.yamlVersion;
                // Add style validator if flow style is set to forbid only.
                if (settings.flowMapping === 'forbid' || settings.flowSequence === 'forbid') {
                    this.validators.push(new yaml_style_1.YAMLStyleValidator(settings));
                }
                if (settings.keyOrdering) {
                    this.validators.push(new map_key_order_1.MapKeyOrderValidator());
                }
            }
            this.validators.push(new unused_anchors_1.UnusedAnchorsValidator());
        }
        async doValidation(textDocument, isKubernetes = false) {
            if (!this.validationEnabled) {
                return Promise.resolve([]);
            }
            const validationResult = [];
            try {
                const yamlDocument = yaml_documents_1.yamlDocumentsCache.getYamlDocument(textDocument, { customTags: this.customTags, yamlVersion: this.yamlVersion }, true);
                let index = 0;
                for (const currentYAMLDoc of yamlDocument.documents) {
                    currentYAMLDoc.isKubernetes = isKubernetes;
                    currentYAMLDoc.currentDocIndex = index;
                    currentYAMLDoc.disableAdditionalProperties = this.disableAdditionalProperties;
                    currentYAMLDoc.uri = textDocument.uri;
                    const validation = await this.jsonValidation.doValidation(textDocument, currentYAMLDoc);
                    const syd = currentYAMLDoc;
                    if (syd.errors.length > 0) {
                        // TODO: Get rid of these type assertions (shouldn't need them)
                        validationResult.push(...syd.errors);
                    }
                    if (syd.warnings.length > 0) {
                        validationResult.push(...syd.warnings);
                    }
                    validationResult.push(...validation);
                    validationResult.push(...this.runAdditionalValidators(textDocument, currentYAMLDoc));
                    index++;
                }
            }
            catch (err) {
                this.telemetry?.sendError('yaml.validation.error', { error: (0, objects_1.convertErrorToTelemetryMsg)(err) });
            }
            let previousErr;
            const foundSignatures = new Set();
            const duplicateMessagesRemoved = [];
            for (let err of validationResult) {
                /**
                 * A patch ontop of the validation that removes the
                 * 'Matches many schemas' error for kubernetes
                 * for a better user experience.
                 */
                if (isKubernetes && err.message === this.MATCHES_MULTIPLE) {
                    continue;
                }
                if (Object.prototype.hasOwnProperty.call(err, 'location')) {
                    err = (0, exports.yamlDiagToLSDiag)(err, textDocument);
                }
                if (!err.source) {
                    err.source = jsonParser07_1.YAML_SOURCE;
                }
                if (previousErr &&
                    previousErr.message === err.message &&
                    previousErr.range.end.line === err.range.start.line &&
                    Math.abs(previousErr.range.end.character - err.range.end.character) >= 1) {
                    previousErr.range.end = err.range.end;
                    continue;
                }
                else {
                    previousErr = err;
                }
                const errSig = err.range.start.line + ' ' + err.range.start.character + ' ' + err.message;
                if (!foundSignatures.has(errSig)) {
                    duplicateMessagesRemoved.push(err);
                    foundSignatures.add(errSig);
                }
            }
            return duplicateMessagesRemoved;
        }
        runAdditionalValidators(document, yarnDoc) {
            const result = [];
            for (const validator of this.validators) {
                result.push(...validator.validate(document, yarnDoc));
            }
            return result;
        }
    }
    exports.YAMLValidation = YAMLValidation;
});
//# sourceMappingURL=yamlValidation.js.map