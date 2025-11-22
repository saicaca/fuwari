/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Diagnostic, DiagnosticSeverity, DiagnosticTag, Range } from 'vscode-languageserver-types';
import { isAlias, isCollection, isNode, isScalar, visit, CST } from 'yaml';
import { isCollectionItem } from '../../../languageservice/utils/astUtils';
export class UnusedAnchorsValidator {
    validate(document, yamlDoc) {
        const result = [];
        const anchors = new Set();
        const usedAnchors = new Set();
        const anchorParent = new Map();
        visit(yamlDoc.internalDocument, (key, node, path) => {
            if (!isNode(node)) {
                return;
            }
            if ((isCollection(node) || isScalar(node)) && node.anchor) {
                anchors.add(node);
                anchorParent.set(node, path[path.length - 1]);
            }
            if (isAlias(node)) {
                usedAnchors.add(node.resolve(yamlDoc.internalDocument));
            }
        });
        for (const anchor of anchors) {
            if (!usedAnchors.has(anchor)) {
                const aToken = this.getAnchorNode(anchorParent.get(anchor), anchor);
                if (aToken) {
                    const range = Range.create(document.positionAt(aToken.offset), document.positionAt(aToken.offset + aToken.source.length));
                    const warningDiagnostic = Diagnostic.create(range, `Unused anchor "${aToken.source}"`, DiagnosticSeverity.Hint, 0);
                    warningDiagnostic.tags = [DiagnosticTag.Unnecessary];
                    result.push(warningDiagnostic);
                }
            }
        }
        return result;
    }
    getAnchorNode(parentNode, node) {
        if (parentNode && parentNode.srcToken) {
            const token = parentNode.srcToken;
            if (isCollectionItem(token)) {
                return getAnchorFromCollectionItem(token);
            }
            else if (CST.isCollection(token)) {
                for (const t of token.items) {
                    if (node.srcToken !== t.value)
                        continue;
                    const anchor = getAnchorFromCollectionItem(t);
                    if (anchor) {
                        return anchor;
                    }
                }
            }
        }
        return undefined;
    }
}
function getAnchorFromCollectionItem(token) {
    for (const t of token.start) {
        if (t.type === 'anchor') {
            return t;
        }
    }
    if (token.sep && Array.isArray(token.sep)) {
        for (const t of token.sep) {
            if (t.type === 'anchor') {
                return t;
            }
        }
    }
}
//# sourceMappingURL=unused-anchors.js.map