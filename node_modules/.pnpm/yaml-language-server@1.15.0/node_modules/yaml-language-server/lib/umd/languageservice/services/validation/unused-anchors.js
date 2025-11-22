/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "vscode-languageserver-types", "yaml", "../../../languageservice/utils/astUtils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UnusedAnchorsValidator = void 0;
    const vscode_languageserver_types_1 = require("vscode-languageserver-types");
    const yaml_1 = require("yaml");
    const astUtils_1 = require("../../../languageservice/utils/astUtils");
    class UnusedAnchorsValidator {
        validate(document, yamlDoc) {
            const result = [];
            const anchors = new Set();
            const usedAnchors = new Set();
            const anchorParent = new Map();
            (0, yaml_1.visit)(yamlDoc.internalDocument, (key, node, path) => {
                if (!(0, yaml_1.isNode)(node)) {
                    return;
                }
                if (((0, yaml_1.isCollection)(node) || (0, yaml_1.isScalar)(node)) && node.anchor) {
                    anchors.add(node);
                    anchorParent.set(node, path[path.length - 1]);
                }
                if ((0, yaml_1.isAlias)(node)) {
                    usedAnchors.add(node.resolve(yamlDoc.internalDocument));
                }
            });
            for (const anchor of anchors) {
                if (!usedAnchors.has(anchor)) {
                    const aToken = this.getAnchorNode(anchorParent.get(anchor), anchor);
                    if (aToken) {
                        const range = vscode_languageserver_types_1.Range.create(document.positionAt(aToken.offset), document.positionAt(aToken.offset + aToken.source.length));
                        const warningDiagnostic = vscode_languageserver_types_1.Diagnostic.create(range, `Unused anchor "${aToken.source}"`, vscode_languageserver_types_1.DiagnosticSeverity.Hint, 0);
                        warningDiagnostic.tags = [vscode_languageserver_types_1.DiagnosticTag.Unnecessary];
                        result.push(warningDiagnostic);
                    }
                }
            }
            return result;
        }
        getAnchorNode(parentNode, node) {
            if (parentNode && parentNode.srcToken) {
                const token = parentNode.srcToken;
                if ((0, astUtils_1.isCollectionItem)(token)) {
                    return getAnchorFromCollectionItem(token);
                }
                else if (yaml_1.CST.isCollection(token)) {
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
    exports.UnusedAnchorsValidator = UnusedAnchorsValidator;
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
});
//# sourceMappingURL=unused-anchors.js.map