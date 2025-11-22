/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Diagnostic, Position } from 'vscode-languageserver-types';
import { JSONValidation } from 'vscode-json-languageservice/lib/umd/services/jsonValidation';
import { YAML_SOURCE } from '../parser/jsonParser07';
import { TextBuffer } from '../utils/textBuffer';
import { yamlDocumentsCache } from '../parser/yaml-documents';
import { convertErrorToTelemetryMsg } from '../utils/objects';
import { UnusedAnchorsValidator } from './validation/unused-anchors';
import { YAMLStyleValidator } from './validation/yaml-style';
import { MapKeyOrderValidator } from './validation/map-key-order';
/**
 * Convert a YAMLDocDiagnostic to a language server Diagnostic
 * @param yamlDiag A YAMLDocDiagnostic from the parser
 * @param textDocument TextDocument from the language server client
 */
export const yamlDiagToLSDiag = (yamlDiag, textDocument) => {
    const start = textDocument.positionAt(yamlDiag.location.start);
    const range = {
        start,
        end: yamlDiag.location.toLineEnd
            ? Position.create(start.line, new TextBuffer(textDocument).getLineLength(start.line))
            : textDocument.positionAt(yamlDiag.location.end),
    };
    return Diagnostic.create(range, yamlDiag.message, yamlDiag.severity, yamlDiag.code, YAML_SOURCE);
};
export class YAMLValidation {
    constructor(schemaService, telemetry) {
        this.telemetry = telemetry;
        this.validators = [];
        this.MATCHES_MULTIPLE = 'Matches multiple schemas when only one must validate.';
        this.validationEnabled = true;
        this.jsonValidation = new JSONValidation(schemaService, Promise);
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
                this.validators.push(new YAMLStyleValidator(settings));
            }
            if (settings.keyOrdering) {
                this.validators.push(new MapKeyOrderValidator());
            }
        }
        this.validators.push(new UnusedAnchorsValidator());
    }
    async doValidation(textDocument, isKubernetes = false) {
        if (!this.validationEnabled) {
            return Promise.resolve([]);
        }
        const validationResult = [];
        try {
            const yamlDocument = yamlDocumentsCache.getYamlDocument(textDocument, { customTags: this.customTags, yamlVersion: this.yamlVersion }, true);
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
            this.telemetry?.sendError('yaml.validation.error', { error: convertErrorToTelemetryMsg(err) });
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
                err = yamlDiagToLSDiag(err, textDocument);
            }
            if (!err.source) {
                err.source = YAML_SOURCE;
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
//# sourceMappingURL=yamlValidation.js.map