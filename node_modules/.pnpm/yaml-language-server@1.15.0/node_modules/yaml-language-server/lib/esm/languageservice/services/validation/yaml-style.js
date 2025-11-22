import { Diagnostic, DiagnosticSeverity, Range } from 'vscode-languageserver-types';
import { isMap, isSeq, visit } from 'yaml';
export class YAMLStyleValidator {
    constructor(settings) {
        this.forbidMapping = settings.flowMapping === 'forbid';
        this.forbidSequence = settings.flowSequence === 'forbid';
    }
    validate(document, yamlDoc) {
        const result = [];
        visit(yamlDoc.internalDocument, (key, node) => {
            if (this.forbidMapping && isMap(node) && node.srcToken?.type === 'flow-collection') {
                result.push(Diagnostic.create(this.getRangeOf(document, node.srcToken), 'Flow style mapping is forbidden', DiagnosticSeverity.Error, 'flowMap'));
            }
            if (this.forbidSequence && isSeq(node) && node.srcToken?.type === 'flow-collection') {
                result.push(Diagnostic.create(this.getRangeOf(document, node.srcToken), 'Flow style sequence is forbidden', DiagnosticSeverity.Error, 'flowSeq'));
            }
        });
        return result;
    }
    getRangeOf(document, node) {
        return Range.create(document.positionAt(node.start.offset), document.positionAt(node.end.pop().offset));
    }
}
//# sourceMappingURL=yaml-style.js.map