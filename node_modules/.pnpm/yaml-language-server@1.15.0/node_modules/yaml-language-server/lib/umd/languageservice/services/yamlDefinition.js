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
        define(["require", "exports", "vscode-languageserver-types", "yaml", "../parser/yaml-documents", "../utils/arrUtils", "../utils/objects", "../utils/textBuffer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.YamlDefinition = void 0;
    const vscode_languageserver_types_1 = require("vscode-languageserver-types");
    const yaml_1 = require("yaml");
    const yaml_documents_1 = require("../parser/yaml-documents");
    const arrUtils_1 = require("../utils/arrUtils");
    const objects_1 = require("../utils/objects");
    const textBuffer_1 = require("../utils/textBuffer");
    class YamlDefinition {
        constructor(telemetry) {
            this.telemetry = telemetry;
        }
        getDefinition(document, params) {
            try {
                const yamlDocument = yaml_documents_1.yamlDocumentsCache.getYamlDocument(document);
                const offset = document.offsetAt(params.position);
                const currentDoc = (0, arrUtils_1.matchOffsetToDocument)(offset, yamlDocument);
                if (currentDoc) {
                    const [node] = currentDoc.getNodeFromPosition(offset, new textBuffer_1.TextBuffer(document));
                    if (node && (0, yaml_1.isAlias)(node)) {
                        const defNode = node.resolve(currentDoc.internalDocument);
                        if (defNode && defNode.range) {
                            const targetRange = vscode_languageserver_types_1.Range.create(document.positionAt(defNode.range[0]), document.positionAt(defNode.range[2]));
                            const selectionRange = vscode_languageserver_types_1.Range.create(document.positionAt(defNode.range[0]), document.positionAt(defNode.range[1]));
                            return [vscode_languageserver_types_1.LocationLink.create(document.uri, targetRange, selectionRange)];
                        }
                    }
                }
            }
            catch (err) {
                this.telemetry?.sendError('yaml.definition.error', { error: (0, objects_1.convertErrorToTelemetryMsg)(err) });
            }
            return undefined;
        }
    }
    exports.YamlDefinition = YamlDefinition;
});
//# sourceMappingURL=yamlDefinition.js.map