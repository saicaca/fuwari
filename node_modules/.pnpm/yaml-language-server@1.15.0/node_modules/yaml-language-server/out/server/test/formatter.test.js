"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const testHelper_1 = require("./utils/testHelper");
const serviceSetup_1 = require("./utils/serviceSetup");
const assert = require("assert");
const yamlSettings_1 = require("../src/yamlSettings");
describe('Formatter Tests', () => {
    let languageHandler;
    let yamlSettings;
    before(() => {
        const languageSettingsSetup = new serviceSetup_1.ServiceSetup().withFormat();
        const { languageHandler: langHandler, yamlSettings: settings } = (0, testHelper_1.setupLanguageService)(languageSettingsSetup.languageSettings);
        languageHandler = langHandler;
        yamlSettings = settings;
    });
    // Tests for formatter
    describe('Formatter', function () {
        describe('Test that formatter works with custom tags', function () {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            function parseSetup(content, options = {}) {
                const testTextDocument = (0, testHelper_1.setupTextDocument)(content);
                yamlSettings.documents = new yamlSettings_1.TextDocumentTestManager();
                yamlSettings.documents.set(testTextDocument);
                yamlSettings.yamlFormatterSettings = options;
                return languageHandler.formatterHandler({
                    options,
                    textDocument: testTextDocument,
                });
            }
            it('Formatting works without custom tags', () => {
                const content = 'cwd: test';
                const edits = parseSetup(content);
                assert.notEqual(edits.length, 0);
                assert.equal(edits[0].newText, 'cwd: test\n');
            });
            it('Formatting works with custom tags', () => {
                const content = 'cwd:       !Test test';
                const edits = parseSetup(content);
                assert.notEqual(edits.length, 0);
                assert.equal(edits[0].newText, 'cwd: !Test test\n');
            });
            it('Formatting wraps text', () => {
                const content = `comments: >
                test test test test test test test test test test test test`;
                const edits = parseSetup(content, {
                    printWidth: 20,
                    proseWrap: 'always',
                });
                assert.equal(edits[0].newText, 'comments: >\n  test test test\n  test test test\n  test test test\n  test test test\n');
            });
            it('Formatting uses tabSize', () => {
                const content = `map:
  k1: v1
  k2: v2
list:
  - item1
  - item2
`;
                const edits = parseSetup(content, {
                    tabSize: 5,
                });
                const expected = `map:
     k1: v1
     k2: v2
list:
     - item1
     - item2
`;
                assert.equal(edits[0].newText, expected);
            });
            it('Formatting uses tabWidth', () => {
                const content = `map:
  k1: v1
  k2: v2
list:
  - item1
  - item2
`;
                const edits = parseSetup(content, {
                    tabWidth: 5,
                });
                const expected = `map:
     k1: v1
     k2: v2
list:
     - item1
     - item2
`;
                assert.equal(edits[0].newText, expected);
            });
            it('Formatting uses tabWidth over tabSize', () => {
                const content = `map:
  k1: v1
  k2: v2
list:
  - item1
  - item2
`;
                const edits = parseSetup(content, {
                    tabSize: 3,
                    tabWidth: 5,
                });
                const expected = `map:
     k1: v1
     k2: v2
list:
     - item1
     - item2
`;
                assert.equal(edits[0].newText, expected);
            });
        });
    });
});
//# sourceMappingURL=formatter.test.js.map