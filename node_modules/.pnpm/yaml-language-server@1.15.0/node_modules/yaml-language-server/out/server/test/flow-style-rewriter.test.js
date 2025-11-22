"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const yaml_documents_1 = require("../src/languageservice/parser/yaml-documents");
const flow_style_rewriter_1 = require("../src/languageservice/utils/flow-style-rewriter");
const testHelper_1 = require("./utils/testHelper");
describe('Flow style rewriter', () => {
    let writer;
    let documents;
    const indentation = '  ';
    beforeEach(() => {
        documents = new yaml_documents_1.YamlDocuments();
        writer = new flow_style_rewriter_1.FlowStyleRewriter(indentation);
    });
    it('should return null if node is not flow style', () => {
        const doc = (0, testHelper_1.setupTextDocument)('foo: bar');
        const yamlDoc = documents.getYamlDocument(doc);
        const node = yamlDoc.documents[0].getNodeFromOffset(1);
        const result = writer.write(node);
        (0, chai_1.expect)(result).to.be.null;
    });
    it('should rewrite flow style map to block', () => {
        const doc = (0, testHelper_1.setupTextDocument)('datacenter: { location: canada, cab: 15}');
        const yamlDoc = documents.getYamlDocument(doc);
        const node = yamlDoc.documents[0].getNodeFromOffset(13);
        const result = writer.write(node);
        (0, chai_1.expect)(result).not.to.be.null;
        (0, chai_1.expect)(result).to.deep.equals(`\n${indentation}location: canada\n${indentation}cab: 15`);
    });
    it('should rewrite flow style map and preserve space ', () => {
        const doc = (0, testHelper_1.setupTextDocument)('datacenter: { location:  canada, cab:   15}');
        const yamlDoc = documents.getYamlDocument(doc);
        const node = yamlDoc.documents[0].getNodeFromOffset(13);
        const result = writer.write(node);
        (0, chai_1.expect)(result).not.to.be.null;
        (0, chai_1.expect)(result).to.deep.equals(`\n${indentation}location:  canada\n${indentation}cab:   15`);
    });
    it('should rewrite flow style map with null ', () => {
        const doc = (0, testHelper_1.setupTextDocument)('datacenter: { "explicit": "entry",\n "implicit": "entry",\n null: null }');
        const yamlDoc = documents.getYamlDocument(doc);
        const node = yamlDoc.documents[0].getNodeFromOffset(13);
        const result = writer.write(node);
        (0, chai_1.expect)(result).not.to.be.null;
        (0, chai_1.expect)(result).to.deep.equals(`\n${indentation}"explicit": "entry"\n${indentation}"implicit": "entry"\n${indentation}null: null `);
    });
    it('should rewrite flow style map with explicit entry', () => {
        const doc = (0, testHelper_1.setupTextDocument)('datacenter: { "foo bar": "baz" }');
        const yamlDoc = documents.getYamlDocument(doc);
        const node = yamlDoc.documents[0].getNodeFromOffset(13);
        const result = writer.write(node);
        (0, chai_1.expect)(result).not.to.be.null;
        (0, chai_1.expect)(result).to.deep.equals(`\n${indentation}"foo bar": "baz" `);
    });
    it('should rewrite flow style sequence', () => {
        const doc = (0, testHelper_1.setupTextDocument)('animals: [dog , cat , mouse]  ');
        const yamlDoc = documents.getYamlDocument(doc);
        const node = yamlDoc.documents[0].getNodeFromOffset(9);
        const result = writer.write(node);
        (0, chai_1.expect)(result).not.to.be.null;
        (0, chai_1.expect)(result).to.deep.equals(`\n${indentation}- dog \n${indentation}- cat \n${indentation}- mouse`);
    });
    it('should rewrite flow style for mixed sequence and map', () => {
        const doc = (0, testHelper_1.setupTextDocument)('animals: [ { "foo": "bar" } ]');
        const yamlDoc = documents.getYamlDocument(doc);
        const node = yamlDoc.documents[0].getNodeFromOffset(9);
        const result = writer.write(node);
        (0, chai_1.expect)(result).not.to.be.null;
        (0, chai_1.expect)(result).to.deep.equals(`\n${indentation}- { "foo": "bar" } `);
    });
    it('should rewrite flow style when parent is sequence', () => {
        const doc = (0, testHelper_1.setupTextDocument)(`items:\n${indentation}-  { location: some }`);
        const yamlDoc = documents.getYamlDocument(doc);
        const node = yamlDoc.documents[0].getNodeFromOffset(13);
        const result = writer.write(node);
        (0, chai_1.expect)(result).not.to.be.null;
        (0, chai_1.expect)(result).to.deep.equals(`  location: some `);
    });
});
//# sourceMappingURL=flow-style-rewriter.test.js.map