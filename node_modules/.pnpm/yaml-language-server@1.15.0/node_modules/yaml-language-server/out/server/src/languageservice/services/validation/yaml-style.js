"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YAMLStyleValidator = void 0;
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const yaml_1 = require("yaml");
class YAMLStyleValidator {
    constructor(settings) {
        this.forbidMapping = settings.flowMapping === 'forbid';
        this.forbidSequence = settings.flowSequence === 'forbid';
    }
    validate(document, yamlDoc) {
        const result = [];
        (0, yaml_1.visit)(yamlDoc.internalDocument, (key, node) => {
            if (this.forbidMapping && (0, yaml_1.isMap)(node) && node.srcToken?.type === 'flow-collection') {
                result.push(vscode_languageserver_types_1.Diagnostic.create(this.getRangeOf(document, node.srcToken), 'Flow style mapping is forbidden', vscode_languageserver_types_1.DiagnosticSeverity.Error, 'flowMap'));
            }
            if (this.forbidSequence && (0, yaml_1.isSeq)(node) && node.srcToken?.type === 'flow-collection') {
                result.push(vscode_languageserver_types_1.Diagnostic.create(this.getRangeOf(document, node.srcToken), 'Flow style sequence is forbidden', vscode_languageserver_types_1.DiagnosticSeverity.Error, 'flowSeq'));
            }
        });
        return result;
    }
    getRangeOf(document, node) {
        return vscode_languageserver_types_1.Range.create(document.positionAt(node.start.offset), document.positionAt(node.end.pop().offset));
    }
}
exports.YAMLStyleValidator = YAMLStyleValidator;
//# sourceMappingURL=yaml-style.js.map