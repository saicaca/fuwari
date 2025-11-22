/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { JSONDocumentSymbols } from 'vscode-json-languageservice/lib/umd/services/jsonDocumentSymbols';
import { yamlDocumentsCache } from '../parser/yaml-documents';
import { isMap, isSeq } from 'yaml';
import { convertErrorToTelemetryMsg } from '../utils/objects';
export class YAMLDocumentSymbols {
    constructor(schemaService, telemetry) {
        this.telemetry = telemetry;
        this.jsonDocumentSymbols = new JSONDocumentSymbols(schemaService);
        // override 'getKeyLabel' to handle complex mapping
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.jsonDocumentSymbols.getKeyLabel = (property) => {
            const keyNode = property.keyNode.internalNode;
            let name = '';
            if (isMap(keyNode)) {
                name = '{}';
            }
            else if (isSeq(keyNode)) {
                name = '[]';
            }
            else {
                name = keyNode.source;
            }
            return name;
        };
    }
    findDocumentSymbols(document, context = { resultLimit: Number.MAX_VALUE }) {
        let results = [];
        try {
            const doc = yamlDocumentsCache.getYamlDocument(document);
            if (!doc || doc['documents'].length === 0) {
                return null;
            }
            for (const yamlDoc of doc['documents']) {
                if (yamlDoc.root) {
                    results = results.concat(this.jsonDocumentSymbols.findDocumentSymbols(document, yamlDoc, context));
                }
            }
        }
        catch (err) {
            this.telemetry?.sendError('yaml.documentSymbols.error', { error: convertErrorToTelemetryMsg(err) });
        }
        return results;
    }
    findHierarchicalDocumentSymbols(document, context = { resultLimit: Number.MAX_VALUE }) {
        let results = [];
        try {
            const doc = yamlDocumentsCache.getYamlDocument(document);
            if (!doc || doc['documents'].length === 0) {
                return null;
            }
            for (const yamlDoc of doc['documents']) {
                if (yamlDoc.root) {
                    results = results.concat(this.jsonDocumentSymbols.findDocumentSymbols2(document, yamlDoc, context));
                }
            }
        }
        catch (err) {
            this.telemetry?.sendError('yaml.hierarchicalDocumentSymbols.error', { error: convertErrorToTelemetryMsg(err) });
        }
        return results;
    }
}
//# sourceMappingURL=documentSymbols.js.map