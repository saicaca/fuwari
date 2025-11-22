"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chai = require("chai");
const yaml_documents_1 = require("../src/languageservice/parser/yaml-documents");
const testHelper_1 = require("./utils/testHelper");
const yamlParser = require("../src/languageservice/parser/yamlParser07");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const yaml_1 = require("yaml");
const textBuffer_1 = require("../src/languageservice/utils/textBuffer");
const expect = chai.expect;
chai.use(sinonChai);
describe('YAML Documents', () => {
    const sandbox = sinon.createSandbox();
    describe('YAML Documents Cache Tests', () => {
        let parseStub;
        beforeEach(() => {
            parseStub = sandbox.stub(yamlParser, 'parse');
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('should cache parsed document', () => {
            const cache = new yaml_documents_1.YamlDocuments();
            const doc = (0, testHelper_1.setupTextDocument)('foo: bar');
            parseStub.returns({});
            const result1 = cache.getYamlDocument(doc);
            const result2 = cache.getYamlDocument(doc);
            expect(parseStub).calledOnce;
            expect(result1).to.be.equal(result2);
        });
        it('should re parse document if document changed', () => {
            const cache = new yaml_documents_1.YamlDocuments();
            const doc = (0, testHelper_1.setupTextDocument)('foo: bar');
            parseStub.onFirstCall().returns({});
            parseStub.onSecondCall().returns({ foo: 'bar' });
            const result1 = cache.getYamlDocument(doc);
            vscode_languageserver_textdocument_1.TextDocument.update(doc, [], 2);
            const result2 = cache.getYamlDocument(doc);
            expect(parseStub).calledTwice;
            expect(result1).to.be.not.equal(result2);
        });
        it('should invalidate cache if custom tags provided', () => {
            const cache = new yaml_documents_1.YamlDocuments();
            const doc = (0, testHelper_1.setupTextDocument)('foo: bar');
            parseStub.onFirstCall().returns({});
            parseStub.onSecondCall().returns({ foo: 'bar' });
            const result1 = cache.getYamlDocument(doc);
            const result2 = cache.getYamlDocument(doc, getParserOptions(['some']));
            expect(parseStub).calledTwice;
            expect(result1).to.not.equal(result2);
        });
        it('should use cache if custom tags are same', () => {
            const cache = new yaml_documents_1.YamlDocuments();
            const doc = (0, testHelper_1.setupTextDocument)('foo: bar');
            parseStub.onFirstCall().returns({});
            parseStub.onSecondCall().returns({ foo: 'bar' });
            const result1 = cache.getYamlDocument(doc, getParserOptions(['some']));
            const result2 = cache.getYamlDocument(doc, getParserOptions(['some']));
            expect(parseStub).calledOnce;
            expect(result1).to.be.equal(result2);
        });
    });
    describe('Single YAML Document Tests', () => {
        let documents;
        beforeEach(() => {
            documents = new yaml_documents_1.YamlDocuments();
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('Get node from position: key', () => {
            const doc = (0, testHelper_1.setupTextDocument)('foo: bar');
            const yamlDoc = documents.getYamlDocument(doc);
            const [result] = yamlDoc.documents[0].getNodeFromPosition(2, new textBuffer_1.TextBuffer(doc));
            expect(result).is.not.undefined;
            expect((0, yaml_1.isScalar)(result)).is.true;
            expect(result.value).eqls('foo');
        });
        it('Get node from position: value', () => {
            const doc = (0, testHelper_1.setupTextDocument)('foo: bar');
            const yamlDoc = documents.getYamlDocument(doc);
            const [result] = yamlDoc.documents[0].getNodeFromPosition(6, new textBuffer_1.TextBuffer(doc));
            expect(result).is.not.undefined;
            expect((0, yaml_1.isScalar)(result)).is.true;
            expect(result.value).eqls('bar');
        });
        it('Get node from position: map', () => {
            const doc = (0, testHelper_1.setupTextDocument)('foo: bar');
            const yamlDoc = documents.getYamlDocument(doc);
            const [result] = yamlDoc.documents[0].getNodeFromPosition(4, new textBuffer_1.TextBuffer(doc));
            expect(result).is.not.undefined;
            expect((0, yaml_1.isMap)(result)).is.true;
            expect(result.items).length(1);
        });
        it('Get node from position: scalar in array', () => {
            const doc = (0, testHelper_1.setupTextDocument)('foo:\n  - bar');
            const yamlDoc = documents.getYamlDocument(doc);
            const [result] = yamlDoc.documents[0].getNodeFromPosition(9, new textBuffer_1.TextBuffer(doc));
            expect(result).is.not.undefined;
            expect((0, yaml_1.isScalar)(result)).is.true;
            expect(result.value).equal('bar');
        });
        it('Get node from position: array', () => {
            const doc = (0, testHelper_1.setupTextDocument)('foo:\n  - bar');
            const yamlDoc = documents.getYamlDocument(doc);
            const [result] = yamlDoc.documents[0].getNodeFromPosition(8, new textBuffer_1.TextBuffer(doc));
            expect(result).is.not.undefined;
            expect((0, yaml_1.isSeq)(result)).is.true;
            expect(result.items).length(1);
        });
        it('Get node from position: map with array', () => {
            const doc = (0, testHelper_1.setupTextDocument)('foo:\n  - bar');
            const yamlDoc = documents.getYamlDocument(doc);
            const [result] = yamlDoc.documents[0].getNodeFromPosition(6, new textBuffer_1.TextBuffer(doc));
            expect(result).is.not.undefined;
            expect((0, yaml_1.isMap)(result)).is.true;
            expect(result.items).length(1);
        });
        it('Get node from position: flow map key', () => {
            const doc = (0, testHelper_1.setupTextDocument)('{foo: bar}');
            const yamlDoc = documents.getYamlDocument(doc);
            const [result] = yamlDoc.documents[0].getNodeFromPosition(3, new textBuffer_1.TextBuffer(doc));
            expect(result).is.not.undefined;
            expect((0, yaml_1.isScalar)(result)).is.true;
            expect(result.value).eqls('foo');
        });
        it('Get node from position: flow map value', () => {
            const doc = (0, testHelper_1.setupTextDocument)('{foo: bar}');
            const yamlDoc = documents.getYamlDocument(doc);
            const [result] = yamlDoc.documents[0].getNodeFromPosition(8, new textBuffer_1.TextBuffer(doc));
            expect(result).is.not.undefined;
            expect((0, yaml_1.isScalar)(result)).is.true;
            expect(result.value).eqls('bar');
        });
        it('get pair parent in array', () => {
            const doc = (0, testHelper_1.setupTextDocument)(`objA:
  - name: nameA1
    
objB:
  size: midle
  name: nameB2
`);
            const yamlDoc = documents.getYamlDocument(doc);
            const result = yamlDoc.documents[0].findClosestNode(27, new textBuffer_1.TextBuffer(doc));
            expect(result).is.not.undefined;
            expect((0, yaml_1.isMap)(result)).is.true;
            const resultItem = result.items[0];
            expect(resultItem.key).property('value', 'name');
            expect(resultItem.value).property('value', 'nameA1');
        });
        it('Find closes node: map', () => {
            const doc = (0, testHelper_1.setupTextDocument)('foo:\n  bar: aaa\n  ');
            const yamlDoc = documents.getYamlDocument(doc);
            const textBuffer = new textBuffer_1.TextBuffer(doc);
            const result = yamlDoc.documents[0].findClosestNode(18, textBuffer);
            expect(result).is.not.undefined;
            expect((0, yaml_1.isMap)(result)).is.true;
            expect(result.items[0].key.value).eqls('bar');
        });
        it('Find closes node: array', () => {
            const doc = (0, testHelper_1.setupTextDocument)('foo:\n  - bar: aaa\n  ');
            const yamlDoc = documents.getYamlDocument(doc);
            const textBuffer = new textBuffer_1.TextBuffer(doc);
            const result = yamlDoc.documents[0].findClosestNode(20, textBuffer);
            expect(result).is.not.undefined;
            expect((0, yaml_1.isSeq)(result)).is.true;
            expect(result.items[0].items[0].key.value).eqls('bar');
        });
        it('Find closes node: root map', () => {
            const doc = (0, testHelper_1.setupTextDocument)('foo:\n  bar: aaa\n  ');
            const yamlDoc = documents.getYamlDocument(doc);
            const textBuffer = new textBuffer_1.TextBuffer(doc);
            const result = yamlDoc.documents[0].findClosestNode(17, textBuffer);
            expect(result).is.not.undefined;
            expect((0, yaml_1.isMap)(result)).is.true;
            expect(result.items[0].key.value).eqls('bar');
        });
        it('should parse document when no yamlVersion is provided', () => {
            const doc = (0, testHelper_1.setupTextDocument)('foo: bar');
            const opts = {
                customTags: ['some'],
                yamlVersion: undefined,
            };
            const yamlDoc = documents.getYamlDocument(doc, opts);
            expect(yamlDoc).is.not.undefined;
        });
    });
});
function getParserOptions(customTags) {
    return { customTags, yamlVersion: '1.2' };
}
//# sourceMappingURL=yaml-documents.test.js.map