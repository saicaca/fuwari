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
        define(["require", "exports", "./jsonParser07", "yaml", "./yamlParser07", "vscode-json-languageservice", "./ast-converter", "../utils/arrUtils", "../utils/astUtils", "../utils/strings"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.yamlDocumentsCache = exports.YamlDocuments = exports.YAMLDocument = exports.SingleYAMLDocument = void 0;
    const jsonParser07_1 = require("./jsonParser07");
    const yaml_1 = require("yaml");
    const yamlParser07_1 = require("./yamlParser07");
    const vscode_json_languageservice_1 = require("vscode-json-languageservice");
    const ast_converter_1 = require("./ast-converter");
    const arrUtils_1 = require("../utils/arrUtils");
    const astUtils_1 = require("../utils/astUtils");
    const strings_1 = require("../utils/strings");
    /**
     * These documents are collected into a final YAMLDocument
     * and passed to the `parseYAML` caller.
     */
    class SingleYAMLDocument extends jsonParser07_1.JSONDocument {
        constructor(lineCounter) {
            super(null, []);
            this.lineCounter = lineCounter;
        }
        /**
         * Create a deep copy of this document
         */
        clone() {
            const copy = new SingleYAMLDocument(this.lineCounter);
            copy.isKubernetes = this.isKubernetes;
            copy.disableAdditionalProperties = this.disableAdditionalProperties;
            copy.uri = this.uri;
            copy.currentDocIndex = this.currentDocIndex;
            copy._lineComments = this.lineComments.slice();
            // this will re-create root node
            copy.internalDocument = this._internalDocument.clone();
            return copy;
        }
        collectLineComments() {
            this._lineComments = [];
            if (this._internalDocument.commentBefore) {
                const comments = this._internalDocument.commentBefore.split('\n');
                comments.forEach((comment) => this._lineComments.push(`#${comment}`));
            }
            (0, yaml_1.visit)(this.internalDocument, (_key, node) => {
                if (node?.commentBefore) {
                    const comments = node?.commentBefore.split('\n');
                    comments.forEach((comment) => this._lineComments.push(`#${comment}`));
                }
                if (node?.comment) {
                    this._lineComments.push(`#${node.comment}`);
                }
            });
            if (this._internalDocument.comment) {
                this._lineComments.push(`#${this._internalDocument.comment}`);
            }
        }
        /**
         * Updates the internal AST tree of the object
         * from the internal node. This is call whenever the
         * internalDocument is set but also can be called to
         * reflect any changes on the underlying document
         * without setting the internalDocument explicitly.
         */
        updateFromInternalDocument() {
            this.root = (0, ast_converter_1.convertAST)(null, this._internalDocument.contents, this._internalDocument, this.lineCounter);
        }
        set internalDocument(document) {
            this._internalDocument = document;
            this.updateFromInternalDocument();
        }
        get internalDocument() {
            return this._internalDocument;
        }
        get lineComments() {
            if (!this._lineComments) {
                this.collectLineComments();
            }
            return this._lineComments;
        }
        set lineComments(val) {
            this._lineComments = val;
        }
        get errors() {
            return this.internalDocument.errors.map(YAMLErrorToYamlDocDiagnostics);
        }
        get warnings() {
            return this.internalDocument.warnings.map(YAMLErrorToYamlDocDiagnostics);
        }
        getNodeFromPosition(positionOffset, textBuffer, configuredIndentation) {
            const position = textBuffer.getPosition(positionOffset);
            const lineContent = textBuffer.getLineContent(position.line);
            if (lineContent.trim().length === 0) {
                return [this.findClosestNode(positionOffset, textBuffer, configuredIndentation), true];
            }
            const textAfterPosition = lineContent.substring(position.character);
            const spacesAfterPositionMatch = textAfterPosition.match(/^([ ]+)\n?$/);
            const areOnlySpacesAfterPosition = !!spacesAfterPositionMatch;
            const countOfSpacesAfterPosition = spacesAfterPositionMatch?.[1].length;
            let closestNode;
            (0, yaml_1.visit)(this.internalDocument, (key, node) => {
                if (!node) {
                    return;
                }
                const range = node.range;
                if (!range) {
                    return;
                }
                const isNullNodeOnTheLine = () => areOnlySpacesAfterPosition &&
                    positionOffset + countOfSpacesAfterPosition === range[2] &&
                    (0, yaml_1.isScalar)(node) &&
                    node.value === null;
                if ((range[0] <= positionOffset && range[1] >= positionOffset) || isNullNodeOnTheLine()) {
                    closestNode = node;
                }
                else {
                    return yaml_1.visit.SKIP;
                }
            });
            return [closestNode, false];
        }
        findClosestNode(offset, textBuffer, configuredIndentation) {
            let offsetDiff = this.internalDocument.range[2];
            let maxOffset = this.internalDocument.range[0];
            let closestNode;
            (0, yaml_1.visit)(this.internalDocument, (key, node) => {
                if (!node) {
                    return;
                }
                const range = node.range;
                if (!range) {
                    return;
                }
                const diff = range[1] - offset;
                if (maxOffset <= range[0] && diff <= 0 && Math.abs(diff) <= offsetDiff) {
                    offsetDiff = Math.abs(diff);
                    maxOffset = range[0];
                    closestNode = node;
                }
            });
            const position = textBuffer.getPosition(offset);
            const lineContent = textBuffer.getLineContent(position.line);
            const indentation = (0, strings_1.getIndentation)(lineContent, position.character);
            if ((0, yaml_1.isScalar)(closestNode) && closestNode.value === null) {
                return closestNode;
            }
            if (indentation === position.character) {
                closestNode = this.getProperParentByIndentation(indentation, closestNode, textBuffer, '', configuredIndentation);
            }
            return closestNode;
        }
        getProperParentByIndentation(indentation, node, textBuffer, currentLine, configuredIndentation, rootParent) {
            if (!node) {
                return this.internalDocument.contents;
            }
            configuredIndentation = !configuredIndentation ? 2 : configuredIndentation;
            if ((0, yaml_1.isNode)(node) && node.range) {
                const position = textBuffer.getPosition(node.range[0]);
                const lineContent = textBuffer.getLineContent(position.line);
                currentLine = currentLine === '' ? lineContent.trim() : currentLine;
                if (currentLine.startsWith('-') && indentation === configuredIndentation && currentLine === lineContent.trim()) {
                    position.character += indentation;
                }
                if (position.character > indentation && position.character > 0) {
                    const parent = this.getParent(node);
                    if (parent) {
                        return this.getProperParentByIndentation(indentation, parent, textBuffer, currentLine, configuredIndentation, rootParent);
                    }
                }
                else if (position.character < indentation) {
                    const parent = this.getParent(node);
                    if ((0, yaml_1.isPair)(parent) && (0, yaml_1.isNode)(parent.value)) {
                        return parent.value;
                    }
                    else if ((0, yaml_1.isPair)(rootParent) && (0, yaml_1.isNode)(rootParent.value)) {
                        return rootParent.value;
                    }
                }
                else {
                    return node;
                }
            }
            else if ((0, yaml_1.isPair)(node)) {
                rootParent = node;
                const parent = this.getParent(node);
                return this.getProperParentByIndentation(indentation, parent, textBuffer, currentLine, configuredIndentation, rootParent);
            }
            return node;
        }
        getParent(node) {
            return (0, astUtils_1.getParent)(this.internalDocument, node);
        }
    }
    exports.SingleYAMLDocument = SingleYAMLDocument;
    /**
     * Contains the SingleYAMLDocuments, to be passed
     * to the `parseYAML` caller.
     */
    class YAMLDocument {
        constructor(documents, tokens) {
            this.documents = documents;
            this.tokens = tokens;
            this.errors = [];
            this.warnings = [];
        }
    }
    exports.YAMLDocument = YAMLDocument;
    class YamlDocuments {
        constructor() {
            // a mapping of URIs to cached documents
            this.cache = new Map();
        }
        /**
         * Get cached YAMLDocument
         * @param document TextDocument to parse
         * @param parserOptions YAML parserOptions
         * @param addRootObject if true and document is empty add empty object {} to force schema usage
         * @returns the YAMLDocument
         */
        getYamlDocument(document, parserOptions, addRootObject = false) {
            this.ensureCache(document, parserOptions ?? yamlParser07_1.defaultOptions, addRootObject);
            return this.cache.get(document.uri).document;
        }
        /**
         * For test purpose only!
         */
        clear() {
            this.cache.clear();
        }
        ensureCache(document, parserOptions, addRootObject) {
            const key = document.uri;
            if (!this.cache.has(key)) {
                this.cache.set(key, { version: -1, document: new YAMLDocument([], []), parserOptions: yamlParser07_1.defaultOptions });
            }
            const cacheEntry = this.cache.get(key);
            if (cacheEntry.version !== document.version ||
                (parserOptions.customTags && !(0, arrUtils_1.isArrayEqual)(cacheEntry.parserOptions.customTags, parserOptions.customTags))) {
                let text = document.getText();
                // if text is contains only whitespace wrap all text in object to force schema selection
                if (addRootObject && !/\S/.test(text)) {
                    text = `{${text}}`;
                }
                const doc = (0, yamlParser07_1.parse)(text, parserOptions, document);
                cacheEntry.document = doc;
                cacheEntry.version = document.version;
                cacheEntry.parserOptions = parserOptions;
            }
        }
    }
    exports.YamlDocuments = YamlDocuments;
    exports.yamlDocumentsCache = new YamlDocuments();
    function YAMLErrorToYamlDocDiagnostics(error) {
        return {
            message: error.message,
            location: {
                start: error.pos[0],
                end: error.pos[1],
                toLineEnd: true,
            },
            severity: 1,
            code: vscode_json_languageservice_1.ErrorCode.Undefined,
        };
    }
});
//# sourceMappingURL=yaml-documents.js.map