(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../services/yamlSchemaService"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isKubernetesAssociatedDocument = exports.setKubernetesParserOption = void 0;
    const yamlSchemaService_1 = require("../services/yamlSchemaService");
    function setKubernetesParserOption(jsonDocuments, option) {
        for (const jsonDoc of jsonDocuments) {
            jsonDoc.isKubernetes = option;
        }
    }
    exports.setKubernetesParserOption = setKubernetesParserOption;
    function isKubernetesAssociatedDocument(textDocument, paths) {
        for (const path in paths) {
            const globPath = paths[path];
            const fpa = new yamlSchemaService_1.FilePatternAssociation(globPath);
            if (fpa.matchesPattern(textDocument.uri)) {
                return true;
            }
        }
        return false;
    }
    exports.isKubernetesAssociatedDocument = isKubernetesAssociatedDocument;
});
//# sourceMappingURL=isKubernetes.js.map