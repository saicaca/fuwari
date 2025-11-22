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
        define(["require", "exports", "vscode-languageserver-types", "yaml"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MapKeyOrderValidator = void 0;
    const vscode_languageserver_types_1 = require("vscode-languageserver-types");
    const yaml_1 = require("yaml");
    class MapKeyOrderValidator {
        validate(document, yamlDoc) {
            const result = [];
            (0, yaml_1.visit)(yamlDoc.internalDocument, (key, node) => {
                if ((0, yaml_1.isMap)(node)) {
                    for (let i = 1; i < node.items.length; i++) {
                        if (compare(node.items[i - 1], node.items[i]) > 0) {
                            const range = createRange(document, node.items[i - 1]);
                            result.push(vscode_languageserver_types_1.Diagnostic.create(range, `Wrong ordering of key "${node.items[i - 1].key}" in mapping`, vscode_languageserver_types_1.DiagnosticSeverity.Error, 'mapKeyOrder'));
                        }
                    }
                }
            });
            return result;
        }
    }
    exports.MapKeyOrderValidator = MapKeyOrderValidator;
    function createRange(document, node) {
        const start = node?.srcToken.start[0]?.offset ?? node?.srcToken?.key.offset ?? node?.srcToken?.sep[0]?.offset;
        const end = node?.srcToken?.value.offset ||
            node?.srcToken?.sep[0]?.offset ||
            node?.srcToken?.key.offset ||
            node?.srcToken.start[node.srcToken.start.length - 1]?.offset;
        return vscode_languageserver_types_1.Range.create(document.positionAt(start), document.positionAt(end));
    }
    function compare(thiz, that) {
        const thatKey = String(that.key);
        const thisKey = String(thiz.key);
        return thisKey.localeCompare(thatKey);
    }
});
//# sourceMappingURL=map-key-order.js.map