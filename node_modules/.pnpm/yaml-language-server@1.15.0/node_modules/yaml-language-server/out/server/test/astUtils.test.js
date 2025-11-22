"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const yaml_1 = require("yaml");
const yaml_documents_1 = require("../src/languageservice/parser/yaml-documents");
const astUtils_1 = require("../src/languageservice/utils/astUtils");
const textBuffer_1 = require("../src/languageservice/utils/textBuffer");
const testHelper_1 = require("./utils/testHelper");
const expect = chai.expect;
describe('AST Utils Tests', () => {
    let documents;
    beforeEach(() => {
        documents = new yaml_documents_1.YamlDocuments();
    });
    describe('Get Parent Node', () => {
        it('get key parent', () => {
            const doc = (0, testHelper_1.setupTextDocument)('foo: bar');
            const yamlDoc = documents.getYamlDocument(doc);
            const [node] = yamlDoc.documents[0].getNodeFromPosition(2, new textBuffer_1.TextBuffer(doc));
            const result = (0, astUtils_1.getParent)(yamlDoc.documents[0].internalDocument, node);
            expect(result).is.not.undefined;
            expect((0, yaml_1.isPair)(result)).is.true;
            expect(result.key).property('value', 'foo');
        });
        it('get value parent', () => {
            const doc = (0, testHelper_1.setupTextDocument)('foo: bar');
            const yamlDoc = documents.getYamlDocument(doc);
            const [node] = yamlDoc.documents[0].getNodeFromPosition(6, new textBuffer_1.TextBuffer(doc));
            const result = (0, astUtils_1.getParent)(yamlDoc.documents[0].internalDocument, node);
            expect(result).is.not.undefined;
            expect((0, yaml_1.isPair)(result)).is.true;
            expect(result.value).property('value', 'bar');
        });
        it('get root map parent', () => {
            const doc = (0, testHelper_1.setupTextDocument)('foo: bar');
            const yamlDoc = documents.getYamlDocument(doc);
            const [node] = yamlDoc.documents[0].getNodeFromPosition(4, new textBuffer_1.TextBuffer(doc));
            const result = (0, astUtils_1.getParent)(yamlDoc.documents[0].internalDocument, node);
            expect(result).is.undefined;
        });
        it('get array parent', () => {
            const doc = (0, testHelper_1.setupTextDocument)('foo:\n  - bar');
            const yamlDoc = documents.getYamlDocument(doc);
            const [node] = yamlDoc.documents[0].getNodeFromPosition(10, new textBuffer_1.TextBuffer(doc));
            const result = (0, astUtils_1.getParent)(yamlDoc.documents[0].internalDocument, node);
            expect(result).is.not.undefined;
            expect((0, yaml_1.isSeq)(result)).is.true;
            expect(result.items[0]).property('value', 'bar');
        });
        it('get pair parent', () => {
            const doc = (0, testHelper_1.setupTextDocument)('foo:\n  - bar');
            const yamlDoc = documents.getYamlDocument(doc);
            const [node] = yamlDoc.documents[0].getNodeFromPosition(7, new textBuffer_1.TextBuffer(doc));
            const result = (0, astUtils_1.getParent)(yamlDoc.documents[0].internalDocument, node);
            expect(result).is.not.undefined;
            expect((0, yaml_1.isPair)(result)).is.true;
            expect(result.key).property('value', 'foo');
        });
    });
    describe('Is Offset in comment', () => {
        it('should detect that offset in comment', () => {
            const doc = (0, testHelper_1.setupTextDocument)('#some comment\nfoo: bar');
            const yamlDoc = documents.getYamlDocument(doc);
            const result = (0, astUtils_1.isInComment)(yamlDoc.tokens, 4);
            expect(result).to.be.true;
        });
        it('should detect that comment inside object', () => {
            const doc = (0, testHelper_1.setupTextDocument)('obj:\n#some comment\n  foo: bar');
            const yamlDoc = documents.getYamlDocument(doc);
            const result = (0, astUtils_1.isInComment)(yamlDoc.tokens, 12);
            expect(result).to.be.true;
        });
    });
});
//# sourceMappingURL=astUtils.test.js.map