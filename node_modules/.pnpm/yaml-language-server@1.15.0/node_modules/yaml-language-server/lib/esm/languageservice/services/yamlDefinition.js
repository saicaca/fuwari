/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { LocationLink, Range } from 'vscode-languageserver-types';
import { isAlias } from 'yaml';
import { yamlDocumentsCache } from '../parser/yaml-documents';
import { matchOffsetToDocument } from '../utils/arrUtils';
import { convertErrorToTelemetryMsg } from '../utils/objects';
import { TextBuffer } from '../utils/textBuffer';
export class YamlDefinition {
    constructor(telemetry) {
        this.telemetry = telemetry;
    }
    getDefinition(document, params) {
        try {
            const yamlDocument = yamlDocumentsCache.getYamlDocument(document);
            const offset = document.offsetAt(params.position);
            const currentDoc = matchOffsetToDocument(offset, yamlDocument);
            if (currentDoc) {
                const [node] = currentDoc.getNodeFromPosition(offset, new TextBuffer(document));
                if (node && isAlias(node)) {
                    const defNode = node.resolve(currentDoc.internalDocument);
                    if (defNode && defNode.range) {
                        const targetRange = Range.create(document.positionAt(defNode.range[0]), document.positionAt(defNode.range[2]));
                        const selectionRange = Range.create(document.positionAt(defNode.range[0]), document.positionAt(defNode.range[1]));
                        return [LocationLink.create(document.uri, targetRange, selectionRange)];
                    }
                }
            }
        }
        catch (err) {
            this.telemetry?.sendError('yaml.definition.error', { error: convertErrorToTelemetryMsg(err) });
        }
        return undefined;
    }
}
//# sourceMappingURL=yamlDefinition.js.map