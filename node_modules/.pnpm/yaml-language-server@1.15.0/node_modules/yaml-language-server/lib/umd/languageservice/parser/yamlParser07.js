/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Adam Voss. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "yaml", "./yaml-documents", "./custom-tag-provider", "../utils/textBuffer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parse = exports.defaultOptions = exports.SingleYAMLDocument = exports.YAMLDocument = void 0;
    const yaml_1 = require("yaml");
    const yaml_documents_1 = require("./yaml-documents");
    Object.defineProperty(exports, "YAMLDocument", { enumerable: true, get: function () { return yaml_documents_1.YAMLDocument; } });
    Object.defineProperty(exports, "SingleYAMLDocument", { enumerable: true, get: function () { return yaml_documents_1.SingleYAMLDocument; } });
    const custom_tag_provider_1 = require("./custom-tag-provider");
    const textBuffer_1 = require("../utils/textBuffer");
    exports.defaultOptions = {
        customTags: [],
        yamlVersion: '1.2',
    };
    /**
     * `yaml-ast-parser-custom-tags` parses the AST and
     * returns YAML AST nodes, which are then formatted
     * for consumption via the language server.
     */
    function parse(text, parserOptions = exports.defaultOptions, document) {
        const options = {
            strict: false,
            customTags: (0, custom_tag_provider_1.getCustomTags)(parserOptions.customTags),
            version: parserOptions.yamlVersion ?? exports.defaultOptions.yamlVersion,
            keepSourceTokens: true,
        };
        const composer = new yaml_1.Composer(options);
        const lineCounter = new yaml_1.LineCounter();
        let isLastLineEmpty = false;
        if (document) {
            const textBuffer = new textBuffer_1.TextBuffer(document);
            const position = textBuffer.getPosition(text.length);
            const lineContent = textBuffer.getLineContent(position.line);
            isLastLineEmpty = lineContent.trim().length === 0;
        }
        const parser = isLastLineEmpty ? new yaml_1.Parser() : new yaml_1.Parser(lineCounter.addNewLine);
        const tokens = parser.parse(text);
        const tokensArr = Array.from(tokens);
        const docs = composer.compose(tokensArr, true, text.length);
        // Generate the SingleYAMLDocs from the AST nodes
        const yamlDocs = Array.from(docs, (doc) => parsedDocToSingleYAMLDocument(doc, lineCounter));
        // Consolidate the SingleYAMLDocs
        return new yaml_documents_1.YAMLDocument(yamlDocs, tokensArr);
    }
    exports.parse = parse;
    function parsedDocToSingleYAMLDocument(parsedDoc, lineCounter) {
        const syd = new yaml_documents_1.SingleYAMLDocument(lineCounter);
        syd.internalDocument = parsedDoc;
        return syd;
    }
});
//# sourceMappingURL=yamlParser07.js.map