"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const path = require("path");
const testHelper_1 = require("./utils/testHelper");
const assert = require("assert");
const serviceSetup_1 = require("./utils/serviceSetup");
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const yamlSettings_1 = require("../src/yamlSettings");
/**
 * Setup the schema we are going to use with the language settings
 */
// Defines a Mocha test describe to group tests of similar kind together
describe('Multiple Documents Validation Tests', () => {
    let languageSettingsSetup;
    let languageHandler;
    let validationHandler;
    let languageService;
    let yamlSettings;
    before(() => {
        const uri = (0, testHelper_1.toFsPath)(path.join(__dirname, './fixtures/customMultipleSchemaSequences.json'));
        const fileMatch = ['*.yml', '*.yaml'];
        languageSettingsSetup = new serviceSetup_1.ServiceSetup()
            .withHover()
            .withIndentation('  ')
            .withValidate()
            .withSchemaFileMatch({
            fileMatch,
            uri,
        })
            .withCustomTags(['!Test', '!Ref sequence']);
        const { languageService: langService, validationHandler: valHandler, languageHandler: langHandler, yamlSettings: settings, } = (0, testHelper_1.setupLanguageService)(languageSettingsSetup.languageSettings);
        languageService = langService;
        validationHandler = valHandler;
        languageHandler = langHandler;
        yamlSettings = settings;
    });
    describe('Multiple Documents Validation', function () {
        function validatorSetup(content) {
            const testTextDocument = (0, testHelper_1.setupTextDocument)(content);
            languageService.configure(languageSettingsSetup.languageSettings);
            return validationHandler.validateTextDocument(testTextDocument);
        }
        function hoverSetup(content, position) {
            const testTextDocument = (0, testHelper_1.setupTextDocument)(content);
            languageService.configure(languageSettingsSetup.languageSettings);
            yamlSettings.documents = new yamlSettings_1.TextDocumentTestManager();
            yamlSettings.documents.set(testTextDocument);
            return languageHandler.hoverHandler({
                position: testTextDocument.positionAt(position),
                textDocument: testTextDocument,
            });
        }
        it('Should validate multiple documents', (done) => {
            const content = `
name: jack
age: 22
---
cwd: test
            `;
            const validator = validatorSetup(content);
            validator
                .then((result) => {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
        it('Should find errors in both documents', (done) => {
            const content = `name1: jack
age: asd
---
cwd: False`;
            const validator = validatorSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 3);
            })
                .then(done, done);
        });
        it('Should find errors in first document', (done) => {
            const content = `name: jack
age: age
---
cwd: test`;
            const validator = validatorSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 1);
            })
                .then(done, done);
        });
        it('Should find errors in second document', (done) => {
            const content = `name: jack
age: 22
---
cwd: False
`;
            const validator = validatorSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 1);
            })
                .then(done, done);
        });
        it('Should hover in first document', async () => {
            const content = 'name: jack\nage: 22\n---\ncwd: False';
            const result = await hoverSetup(content, 1 + content.indexOf('age'));
            assert.strictEqual(vscode_languageserver_types_1.MarkupContent.is(result.contents), true);
            assert.strictEqual(result.contents.kind, 'markdown');
            assert.strictEqual(result.contents.value, 'The age of this person');
        });
    });
});
//# sourceMappingURL=multipleDocuments.test.js.map