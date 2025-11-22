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
        define(["require", "exports", "../parser/yamlParser07"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isModeline = exports.getSchemaFromModeline = void 0;
    const yamlParser07_1 = require("../parser/yamlParser07");
    /**
     * Retrieve schema if declared as modeline.
     * Public for testing purpose, not part of the API.
     * @param doc
     */
    function getSchemaFromModeline(doc) {
        if (doc instanceof yamlParser07_1.SingleYAMLDocument) {
            const yamlLanguageServerModeline = doc.lineComments.find((lineComment) => {
                return isModeline(lineComment);
            });
            if (yamlLanguageServerModeline != undefined) {
                const schemaMatchs = yamlLanguageServerModeline.match(/\$schema=\S+/g);
                if (schemaMatchs !== null && schemaMatchs.length >= 1) {
                    if (schemaMatchs.length >= 2) {
                        console.log('Several $schema attributes have been found on the yaml-language-server modeline. The first one will be picked.');
                    }
                    return schemaMatchs[0].substring('$schema='.length);
                }
            }
        }
        return undefined;
    }
    exports.getSchemaFromModeline = getSchemaFromModeline;
    function isModeline(lineText) {
        const matchModeline = lineText.match(/^#\s+yaml-language-server\s*:/g);
        return matchModeline !== null && matchModeline.length === 1;
    }
    exports.isModeline = isModeline;
});
//# sourceMappingURL=modelineUtil.js.map