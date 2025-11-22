(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "vscode-json-languageservice/lib/umd/services/jsonLinks", "../parser/yaml-documents", "../utils/objects"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.YamlLinks = void 0;
    /*---------------------------------------------------------------------------------------------
     *  Copyright (c) Red Hat, Inc. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
    const jsonLinks_1 = require("vscode-json-languageservice/lib/umd/services/jsonLinks");
    const yaml_documents_1 = require("../parser/yaml-documents");
    const objects_1 = require("../utils/objects");
    class YamlLinks {
        constructor(telemetry) {
            this.telemetry = telemetry;
        }
        findLinks(document) {
            try {
                const doc = yaml_documents_1.yamlDocumentsCache.getYamlDocument(document);
                // Find links across all YAML Documents then report them back once finished
                const linkPromises = [];
                for (const yamlDoc of doc.documents) {
                    linkPromises.push((0, jsonLinks_1.findLinks)(document, yamlDoc));
                }
                // Wait for all the promises to return and then flatten them into one DocumentLink array
                return Promise.all(linkPromises).then((yamlLinkArray) => [].concat(...yamlLinkArray));
            }
            catch (err) {
                this.telemetry?.sendError('yaml.documentLink.error', { error: (0, objects_1.convertErrorToTelemetryMsg)(err) });
            }
        }
    }
    exports.YamlLinks = YamlLinks;
});
//# sourceMappingURL=yamlLinks.js.map