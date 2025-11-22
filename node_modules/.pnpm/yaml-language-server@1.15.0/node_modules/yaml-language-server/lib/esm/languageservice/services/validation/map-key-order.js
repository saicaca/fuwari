/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Diagnostic, DiagnosticSeverity, Range } from 'vscode-languageserver-types';
import { isMap, visit } from 'yaml';
export class MapKeyOrderValidator {
    validate(document, yamlDoc) {
        const result = [];
        visit(yamlDoc.internalDocument, (key, node) => {
            if (isMap(node)) {
                for (let i = 1; i < node.items.length; i++) {
                    if (compare(node.items[i - 1], node.items[i]) > 0) {
                        const range = createRange(document, node.items[i - 1]);
                        result.push(Diagnostic.create(range, `Wrong ordering of key "${node.items[i - 1].key}" in mapping`, DiagnosticSeverity.Error, 'mapKeyOrder'));
                    }
                }
            }
        });
        return result;
    }
}
function createRange(document, node) {
    const start = node?.srcToken.start[0]?.offset ?? node?.srcToken?.key.offset ?? node?.srcToken?.sep[0]?.offset;
    const end = node?.srcToken?.value.offset ||
        node?.srcToken?.sep[0]?.offset ||
        node?.srcToken?.key.offset ||
        node?.srcToken.start[node.srcToken.start.length - 1]?.offset;
    return Range.create(document.positionAt(start), document.positionAt(end));
}
function compare(thiz, that) {
    const thatKey = String(that.key);
    const thisKey = String(thiz.key);
    return thisKey.localeCompare(thatKey);
}
//# sourceMappingURL=map-key-order.js.map