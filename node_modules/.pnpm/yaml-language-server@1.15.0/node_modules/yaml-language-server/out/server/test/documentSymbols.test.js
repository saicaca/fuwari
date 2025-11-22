"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const testHelper_1 = require("./utils/testHelper");
const verifyError_1 = require("./utils/verifyError");
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const assert = require("assert");
const serviceSetup_1 = require("./utils/serviceSetup");
const yamlSettings_1 = require("../src/yamlSettings");
describe('Document Symbols Tests', () => {
    let languageHandler;
    let yamlSettings;
    const limitContent = `
    a: [1, 2, 3]
    b: [4, 5, 6]
  `;
    before(() => {
        const languageSettingsSetup = new serviceSetup_1.ServiceSetup();
        const { languageHandler: langHandler, yamlSettings: settings } = (0, testHelper_1.setupLanguageService)(languageSettingsSetup.languageSettings);
        languageHandler = langHandler;
        yamlSettings = settings;
    });
    afterEach(() => {
        yamlSettings.maxItemsComputed = 5000;
    });
    function assertLimitWarning() {
        const warnings = languageHandler.pendingLimitExceededWarnings;
        assert.deepEqual(Object.keys(warnings), [testHelper_1.TEST_URI]);
        assert.deepEqual(warnings[testHelper_1.TEST_URI].features, { 'document symbols': 'document symbols' });
        assert(warnings[testHelper_1.TEST_URI].timeout);
    }
    describe('Document Symbols Tests (Non Hierarchical)', function () {
        function parseNonHierarchicalSetup(content) {
            const testTextDocument = (0, testHelper_1.setupTextDocument)(content);
            yamlSettings.documents = new yamlSettings_1.TextDocumentTestManager();
            yamlSettings.documents.set(testTextDocument);
            return languageHandler.documentSymbolHandler({
                textDocument: testTextDocument,
            });
        }
        it('Document is empty', (done) => {
            const content = '';
            const symbols = parseNonHierarchicalSetup(content);
            assert.deepStrictEqual(symbols, []);
            done();
        });
        it('Simple document symbols', () => {
            const content = 'cwd: test';
            const symbols = parseNonHierarchicalSetup(content);
            assert.equal(symbols.length, 1);
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedSymbolInformation)('cwd', 15, '', testHelper_1.TEST_URI, 0, 0, 0, 9));
        });
        it('Document Symbols with number', () => {
            const content = 'node1: 10000';
            const symbols = parseNonHierarchicalSetup(content);
            assert.equal(symbols.length, 1);
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedSymbolInformation)('node1', 16, '', testHelper_1.TEST_URI, 0, 0, 0, 12));
        });
        it('Document Symbols with boolean', () => {
            const content = 'node1: False';
            const symbols = parseNonHierarchicalSetup(content);
            assert.equal(symbols.length, 1);
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedSymbolInformation)('node1', 17, '', testHelper_1.TEST_URI, 0, 0, 0, 12));
        });
        it('Document Symbols with object', () => {
            const content = 'scripts:\n  node1: test\n  node2: test';
            const symbols = parseNonHierarchicalSetup(content);
            assert.equal(symbols.length, 3);
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedSymbolInformation)('scripts', 2, '', testHelper_1.TEST_URI, 0, 0, 2, 13));
            assert.deepEqual(symbols[1], (0, verifyError_1.createExpectedSymbolInformation)('node1', 15, 'scripts', testHelper_1.TEST_URI, 1, 2, 1, 13));
            assert.deepEqual(symbols[2], (0, verifyError_1.createExpectedSymbolInformation)('node2', 15, 'scripts', testHelper_1.TEST_URI, 2, 2, 2, 13));
        });
        it('Document Symbols with null', () => {
            const content = 'apiVersion: null';
            const symbols = parseNonHierarchicalSetup(content);
            assert.equal(symbols.length, 1);
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedSymbolInformation)('apiVersion', vscode_languageserver_types_1.SymbolKind.Variable, '', testHelper_1.TEST_URI, 0, 0, 0, 16));
        });
        it('Document Symbols with array of strings', () => {
            const content = 'items:\n  - test\n  - test';
            const symbols = parseNonHierarchicalSetup(content);
            assert.equal(symbols.length, 1);
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedSymbolInformation)('items', vscode_languageserver_types_1.SymbolKind.Array, '', testHelper_1.TEST_URI, 0, 0, 2, 8));
        });
        it('Document Symbols with array', () => {
            const content = 'authors:\n  - name: Josh\n  - email: jp';
            const symbols = parseNonHierarchicalSetup(content);
            assert.equal(symbols.length, 3);
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedSymbolInformation)('authors', 18, '', testHelper_1.TEST_URI, 0, 0, 2, 13));
            assert.deepEqual(symbols[1], (0, verifyError_1.createExpectedSymbolInformation)('name', 15, 'authors', testHelper_1.TEST_URI, 1, 4, 1, 14));
            assert.deepEqual(symbols[2], (0, verifyError_1.createExpectedSymbolInformation)('email', 15, 'authors', testHelper_1.TEST_URI, 2, 4, 2, 13));
        });
        it('Document Symbols with object and array', () => {
            const content = 'scripts:\n  node1: test\n  node2: test\nauthors:\n  - name: Josh\n  - email: jp';
            const symbols = parseNonHierarchicalSetup(content);
            assert.equal(symbols.length, 6);
            // Sort the items first so they have predictable order in the array
            symbols.sort((a, b) => {
                return a.name.localeCompare(b.name);
            });
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedSymbolInformation)('authors', 18, '', testHelper_1.TEST_URI, 3, 0, 5, 13));
            assert.deepEqual(symbols[1], (0, verifyError_1.createExpectedSymbolInformation)('email', 15, 'authors', testHelper_1.TEST_URI, 5, 4, 5, 13));
            assert.deepEqual(symbols[2], (0, verifyError_1.createExpectedSymbolInformation)('name', 15, 'authors', testHelper_1.TEST_URI, 4, 4, 4, 14));
            assert.deepEqual(symbols[3], (0, verifyError_1.createExpectedSymbolInformation)('node1', 15, 'scripts', testHelper_1.TEST_URI, 1, 2, 1, 13));
            assert.deepEqual(symbols[4], (0, verifyError_1.createExpectedSymbolInformation)('node2', 15, 'scripts', testHelper_1.TEST_URI, 2, 2, 2, 13));
            assert.deepEqual(symbols[5], (0, verifyError_1.createExpectedSymbolInformation)('scripts', 2, '', testHelper_1.TEST_URI, 0, 0, 2, 13));
        });
        it('Document Symbols with multi documents', () => {
            const content = '---\nanalytics: true\n...\n---\njson: test\n...';
            const symbols = parseNonHierarchicalSetup(content);
            assert.equal(symbols.length, 2);
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedSymbolInformation)('analytics', 17, '', testHelper_1.TEST_URI, 1, 0, 1, 15));
            assert.deepEqual(symbols[1], (0, verifyError_1.createExpectedSymbolInformation)('json', 15, '', testHelper_1.TEST_URI, 4, 0, 4, 10));
        });
        it('Document symbols with a limit', () => {
            yamlSettings.maxItemsComputed = 1;
            const symbols = parseNonHierarchicalSetup(limitContent);
            assert.equal(symbols.length, 1);
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedSymbolInformation)('a', vscode_languageserver_types_1.SymbolKind.Array, '', testHelper_1.TEST_URI, 1, 4, 1, 16));
            assertLimitWarning();
        });
    });
    describe('Document Symbols Tests (Hierarchical)', function () {
        function parseHierarchicalSetup(content) {
            const testTextDocument = (0, testHelper_1.setupTextDocument)(content);
            yamlSettings.hierarchicalDocumentSymbolSupport = true;
            yamlSettings.documents = new yamlSettings_1.TextDocumentTestManager();
            yamlSettings.documents.set(testTextDocument);
            return languageHandler.documentSymbolHandler({
                textDocument: testTextDocument,
            });
        }
        it('Document is empty', (done) => {
            const content = '';
            const symbols = parseHierarchicalSetup(content);
            assert.deepStrictEqual(symbols, []);
            done();
        });
        it('Simple document symbols', () => {
            const content = 'cwd: test';
            const symbols = parseHierarchicalSetup(content);
            assert.equal(symbols.length, 1);
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedDocumentSymbol)('cwd', 15, 0, 0, 0, 9, 0, 0, 0, 3, [], 'test'));
        });
        it('Document Symbols with number', () => {
            const content = 'node1: 10000';
            const symbols = parseHierarchicalSetup(content);
            assert.equal(symbols.length, 1);
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedDocumentSymbol)('node1', 16, 0, 0, 0, 12, 0, 0, 0, 5, [], '10000'));
        });
        it('Document Symbols with boolean', () => {
            const content = 'node1: False';
            const symbols = parseHierarchicalSetup(content);
            assert.equal(symbols.length, 1);
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedDocumentSymbol)('node1', 17, 0, 0, 0, 12, 0, 0, 0, 5, [], 'false'));
        });
        it('Document Symbols with object', () => {
            const content = 'scripts:\n  node1: test\n  node2: test';
            const symbols = parseHierarchicalSetup(content);
            assert.equal(symbols.length, 1);
            const child1 = (0, verifyError_1.createExpectedDocumentSymbol)('node1', vscode_languageserver_types_1.SymbolKind.String, 1, 2, 1, 13, 1, 2, 1, 7, [], 'test');
            const child2 = (0, verifyError_1.createExpectedDocumentSymbol)('node2', vscode_languageserver_types_1.SymbolKind.String, 2, 2, 2, 13, 2, 2, 2, 7, [], 'test');
            const children = [child1, child2];
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedDocumentSymbol)('scripts', vscode_languageserver_types_1.SymbolKind.Module, 0, 0, 2, 13, 0, 0, 0, 7, children));
        });
        it('Document Symbols with null', () => {
            const content = 'apiVersion: null';
            const symbols = parseHierarchicalSetup(content);
            assert.equal(symbols.length, 1);
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedDocumentSymbol)('apiVersion', vscode_languageserver_types_1.SymbolKind.Variable, 0, 0, 0, 16, 0, 0, 0, 10, [], 'null'));
        });
        it('Document Symbols with array of strings', () => {
            const content = 'items:\n  - test\n  - test';
            const symbols = parseHierarchicalSetup(content);
            assert.equal(symbols.length, 1);
            const child1 = (0, verifyError_1.createExpectedDocumentSymbolNoDetail)('0', vscode_languageserver_types_1.SymbolKind.String, 1, 4, 1, 8, 1, 4, 1, 8);
            const child2 = (0, verifyError_1.createExpectedDocumentSymbolNoDetail)('1', vscode_languageserver_types_1.SymbolKind.String, 2, 4, 2, 8, 2, 4, 2, 8);
            const children = [child1, child2];
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedDocumentSymbol)('items', vscode_languageserver_types_1.SymbolKind.Array, 0, 0, 2, 8, 0, 0, 0, 5, children));
        });
        it('Document Symbols with array', () => {
            const content = 'authors:\n  - name: Josh\n  - email: jp';
            const symbols = parseHierarchicalSetup(content);
            const object1 = (0, verifyError_1.createExpectedDocumentSymbol)('name', vscode_languageserver_types_1.SymbolKind.String, 1, 4, 1, 14, 1, 4, 1, 8, [], 'Josh');
            const arrayChild1 = (0, verifyError_1.createExpectedDocumentSymbolNoDetail)('0', vscode_languageserver_types_1.SymbolKind.Module, 1, 4, 1, 14, 1, 4, 1, 14, [object1]);
            const object2 = (0, verifyError_1.createExpectedDocumentSymbol)('email', vscode_languageserver_types_1.SymbolKind.String, 2, 4, 2, 13, 2, 4, 2, 9, [], 'jp');
            const arrayChild2 = (0, verifyError_1.createExpectedDocumentSymbolNoDetail)('1', vscode_languageserver_types_1.SymbolKind.Module, 2, 4, 2, 13, 2, 4, 2, 13, [object2]);
            const children = [arrayChild1, arrayChild2];
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedDocumentSymbol)('authors', vscode_languageserver_types_1.SymbolKind.Array, 0, 0, 2, 13, 0, 0, 0, 7, children));
        });
        it('Document Symbols with object and array', () => {
            const content = 'scripts:\n  node1: test\n  node2: test\nauthors:\n  - name: Josh\n  - email: jp';
            const symbols = parseHierarchicalSetup(content);
            assert.equal(symbols.length, 2);
            const child1 = (0, verifyError_1.createExpectedDocumentSymbol)('node1', vscode_languageserver_types_1.SymbolKind.String, 1, 2, 1, 13, 1, 2, 1, 7, [], 'test');
            const child2 = (0, verifyError_1.createExpectedDocumentSymbol)('node2', vscode_languageserver_types_1.SymbolKind.String, 2, 2, 2, 13, 2, 2, 2, 7, [], 'test');
            const children = [child1, child2];
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedDocumentSymbol)('scripts', vscode_languageserver_types_1.SymbolKind.Module, 0, 0, 2, 13, 0, 0, 0, 7, children));
            const object1 = (0, verifyError_1.createExpectedDocumentSymbol)('name', vscode_languageserver_types_1.SymbolKind.String, 4, 4, 4, 14, 4, 4, 4, 8, [], 'Josh');
            const arrayChild1 = (0, verifyError_1.createExpectedDocumentSymbolNoDetail)('0', vscode_languageserver_types_1.SymbolKind.Module, 4, 4, 4, 14, 4, 4, 4, 14, [object1]);
            const object2 = (0, verifyError_1.createExpectedDocumentSymbol)('email', vscode_languageserver_types_1.SymbolKind.String, 5, 4, 5, 13, 5, 4, 5, 9, [], 'jp');
            const arrayChild2 = (0, verifyError_1.createExpectedDocumentSymbolNoDetail)('1', vscode_languageserver_types_1.SymbolKind.Module, 5, 4, 5, 13, 5, 4, 5, 13, [object2]);
            const children2 = [arrayChild1, arrayChild2];
            assert.deepEqual(symbols[1], (0, verifyError_1.createExpectedDocumentSymbol)('authors', vscode_languageserver_types_1.SymbolKind.Array, 3, 0, 5, 13, 3, 0, 3, 7, children2));
        });
        it('Document Symbols with multi documents', () => {
            const content = '---\nanalytics: true\n...\n---\njson: test\n...';
            const symbols = parseHierarchicalSetup(content);
            assert.equal(symbols.length, 2);
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedDocumentSymbol)('analytics', vscode_languageserver_types_1.SymbolKind.Boolean, 1, 0, 1, 15, 1, 0, 1, 9, [], 'true'));
            assert.deepEqual(symbols[1], (0, verifyError_1.createExpectedDocumentSymbol)('json', vscode_languageserver_types_1.SymbolKind.String, 4, 0, 4, 10, 4, 0, 4, 4, [], 'test'));
        });
        it('Document Symbols with complex mapping and aliases', () => {
            const content = `
            version: 0.0.1
            structure:
              ? &root root
              :
                element: div
            conditions:
              ? *root
              :
                style:
                  height: 41`;
            const symbols = parseHierarchicalSetup(content);
            assert.equal(symbols.length, 3);
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedDocumentSymbol)('version', vscode_languageserver_types_1.SymbolKind.String, 1, 12, 1, 26, 1, 12, 1, 19, [], '0.0.1'));
            const element = (0, verifyError_1.createExpectedDocumentSymbol)('element', vscode_languageserver_types_1.SymbolKind.String, 5, 16, 5, 28, 5, 16, 5, 23, [], 'div');
            const root1 = (0, verifyError_1.createExpectedDocumentSymbol)('root', vscode_languageserver_types_1.SymbolKind.Module, 3, 22, 5, 28, 3, 22, 3, 26, [element]);
            const height = (0, verifyError_1.createExpectedDocumentSymbol)('height', vscode_languageserver_types_1.SymbolKind.Number, 10, 18, 10, 28, 10, 18, 10, 24, [], '41');
            const style = (0, verifyError_1.createExpectedDocumentSymbol)('style', vscode_languageserver_types_1.SymbolKind.Module, 9, 16, 10, 28, 9, 16, 9, 21, [height]);
            const root2 = (0, verifyError_1.createExpectedDocumentSymbol)('root', vscode_languageserver_types_1.SymbolKind.Module, 7, 16, 10, 28, 7, 16, 7, 21, [style]);
            assert.deepEqual(symbols[1], (0, verifyError_1.createExpectedDocumentSymbol)('structure', vscode_languageserver_types_1.SymbolKind.Module, 2, 12, 5, 28, 2, 12, 2, 21, [root1]));
            assert.deepEqual(symbols[2], (0, verifyError_1.createExpectedDocumentSymbol)('conditions', vscode_languageserver_types_1.SymbolKind.Module, 6, 12, 10, 28, 6, 12, 6, 22, [root2]));
        });
        it('Document symbols with a limit', () => {
            yamlSettings.maxItemsComputed = 3;
            const symbols = parseHierarchicalSetup(limitContent);
            assert.equal(symbols.length, 2);
            assert.equal(symbols[0].children.length, 1);
            assert.equal(symbols[1].children.length, 0);
            const el = (0, verifyError_1.createExpectedDocumentSymbolNoDetail)('0', vscode_languageserver_types_1.SymbolKind.Number, 1, 8, 1, 9, 1, 8, 1, 9, []);
            const root = (0, verifyError_1.createExpectedDocumentSymbol)('a', vscode_languageserver_types_1.SymbolKind.Array, 1, 4, 1, 16, 1, 4, 1, 5, [el]);
            assert.deepEqual(symbols[0], root);
            assertLimitWarning();
        });
        it('Document Symbols with numbers as keys', () => {
            const content = 'items:\n  1: test\n  2: test';
            const symbols = parseHierarchicalSetup(content);
            assert.equal(symbols.length, 1);
            const child1 = (0, verifyError_1.createExpectedDocumentSymbol)('1', vscode_languageserver_types_1.SymbolKind.String, 1, 2, 1, 9, 1, 2, 1, 3, undefined, 'test');
            const child2 = (0, verifyError_1.createExpectedDocumentSymbol)('2', vscode_languageserver_types_1.SymbolKind.String, 2, 2, 2, 9, 2, 2, 2, 3, undefined, 'test');
            const children = [child1, child2];
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedDocumentSymbol)('items', vscode_languageserver_types_1.SymbolKind.Module, 0, 0, 2, 9, 0, 0, 0, 5, children));
        });
        it('Document Symbols with mapping as keys', () => {
            const content = '{foo: bar}: foo';
            const symbols = parseHierarchicalSetup(content);
            assert.equal(symbols.length, 1);
            assert.deepEqual(symbols[0], (0, verifyError_1.createExpectedDocumentSymbol)('{}', vscode_languageserver_types_1.SymbolKind.String, 0, 0, 0, 15, 0, 0, 0, 10, [], 'foo'));
        });
    });
});
//# sourceMappingURL=documentSymbols.test.js.map