"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const testHelper_1 = require("./utils/testHelper");
const assert = require("assert");
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const serviceSetup_1 = require("./utils/serviceSetup");
const yamlSettings_1 = require("../src/yamlSettings");
// Defines a Mocha test describe to group tests of similar kind together
describe('Kubernetes Integration Tests', () => {
    let languageSettingsSetup;
    let languageHandler;
    let validationHandler;
    let yamlSettings;
    before(() => {
        const uri = 'https://raw.githubusercontent.com/yannh/kubernetes-json-schema/master/v1.22.4-standalone-strict/all.json';
        const fileMatch = ['*.yml', '*.yaml'];
        languageSettingsSetup = new serviceSetup_1.ServiceSetup()
            .withHover()
            .withValidate()
            .withCompletion()
            .withSchemaFileMatch({
            fileMatch,
            uri,
        })
            .withKubernetes();
        const { validationHandler: valHandler, languageHandler: langHandler, yamlSettings: settings, } = (0, testHelper_1.setupLanguageService)(languageSettingsSetup.languageSettings);
        validationHandler = valHandler;
        languageHandler = langHandler;
        yamlSettings = settings;
    });
    // Tests for validator
    describe('Yaml Validation with kubernetes', function () {
        function parseSetup(content) {
            const testTextDocument = (0, testHelper_1.setupTextDocument)(content);
            yamlSettings.documents = new yamlSettings_1.TextDocumentTestManager();
            yamlSettings.documents.set(testTextDocument);
            yamlSettings.specificValidatorPaths = ['*.yml', '*.yaml'];
            return validationHandler.validateTextDocument(testTextDocument);
        }
        //Validating basic nodes
        describe('Test that validation does not throw errors', function () {
            it('Basic test', (done) => {
                const content = 'apiVersion: v1';
                const validator = parseSetup(content);
                validator
                    .then(function (result) {
                    assert.equal(result.length, 0);
                })
                    .then(done, done);
            });
            it('Basic test on nodes with children', (done) => {
                const content = 'metadata:\n  name: hello';
                const validator = parseSetup(content);
                validator
                    .then(function (result) {
                    assert.equal(result.length, 0);
                })
                    .then(done, done);
            });
            it('Advanced test on nodes with children', (done) => {
                const content = 'apiVersion: v1\nmetadata:\n  name: test1';
                const validator = parseSetup(content);
                validator
                    .then(function (result) {
                    assert.equal(result.length, 0);
                })
                    .then(done, done);
            });
            it('Type string validates under children', (done) => {
                const content = 'apiVersion: v1\nkind: Pod\nmetadata:\n  resourceVersion: test';
                const validator = parseSetup(content);
                validator
                    .then(function (result) {
                    assert.equal(result.length, 0);
                })
                    .then(done, done);
            });
            describe('Type tests', function () {
                it('Type String does not error on valid node', (done) => {
                    const content = 'apiVersion: v1';
                    const validator = parseSetup(content);
                    validator
                        .then(function (result) {
                        assert.equal(result.length, 0);
                    })
                        .then(done, done);
                });
                it('Type Boolean does not error on valid node', (done) => {
                    const content = 'readOnlyRootFilesystem: false';
                    const validator = parseSetup(content);
                    validator
                        .then(function (result) {
                        assert.equal(result.length, 0);
                    })
                        .then(done, done);
                });
                it('Type Number does not error on valid node', (done) => {
                    const content = 'generation: 5';
                    const validator = parseSetup(content);
                    validator
                        .then(function (result) {
                        assert.equal(result.length, 0);
                    })
                        .then(done, done);
                });
                it('Type Object does not error on valid node', (done) => {
                    const content = 'metadata:\n  clusterName: tes';
                    const validator = parseSetup(content);
                    validator
                        .then(function (result) {
                        assert.equal(result.length, 0);
                    })
                        .then(done, done);
                });
                it('Type Array does not error on valid node', (done) => {
                    const content = 'items:\n  - apiVersion: v1';
                    const validator = parseSetup(content);
                    validator
                        .then(function (result) {
                        assert.equal(result.length, 0);
                    })
                        .then(done, done);
                });
            });
        });
        /**
         * Removed these tests because the schema pulled in from
         * https://github.com/redhat-developer/yaml-language-server/pull/108
         * No longer has those types of validation
         */
        // describe('Test that validation DOES throw errors', function () {
        //     it('Error when theres no value for a node', done => {
        //         const content = 'apiVersion:';
        //         const validator = parseSetup(content);
        //         validator.then(function (result){
        //             assert.notEqual(result.length, 0);
        //         }).then(done, done);
        //     });
        //     it('Error on incorrect value type (number)', done => {
        //         const content = 'apiVersion: 1000';
        //         const validator = parseSetup(content);
        //         validator.then(function (result){
        //             assert.notEqual(result.length, 0);
        //         }).then(done, done);
        //     });
        //     it('Error on incorrect value type (boolean)', done => {
        //         const content = 'apiVersion: False';
        //         const validator = parseSetup(content);
        //         validator.then(function (result){
        //             assert.notEqual(result.length, 0);
        //         }).then(done, done);
        //     });
        //     it('Error on incorrect value type (string)', done => {
        //         const content = 'isNonResourceURL: hello_world';
        //         const validator = parseSetup(content);
        //         validator.then(function (result){
        //             assert.notEqual(result.length, 0);
        //         }).then(done, done);
        //     });
        //     it('Error on incorrect value type (object)', done => {
        //         const content = 'apiVersion: v1\nkind: Pod\nmetadata:\n  name: False';
        //         const validator = parseSetup(content);
        //         validator.then(function (result){
        //             assert.notEqual(result.length, 0);
        //         }).then(done, done);
        //     });
        //     it('Error on incorrect value type in multiple yaml documents', done => {
        //         const content = '---\napiVersion: v1\n...\n---\napiVersion: False\n...';
        //         const validator = parseSetup(content);
        //         validator.then(function (result){
        //             assert.notEqual(result.length, 0);
        //         }).then(done, done);
        //     });
        //     it('Property error message should be \"Property unknown_node is not allowed.\" when property is not allowed ', done => {
        //         const content = 'unknown_node: test';
        //         const validator = parseSetup(content);
        //         validator.then(function (result){
        //             assert.equal(result.length, 1);
        //             assert.equal(result[0].message, 'Property unknown_node is not allowed.');
        //         }).then(done, done);
        //     });
        // });
    });
    describe('yamlCompletion with kubernetes', function () {
        describe('doComplete', function () {
            function parseSetup(content, position) {
                const testTextDocument = (0, testHelper_1.setupTextDocument)(content);
                yamlSettings.documents = new yamlSettings_1.TextDocumentTestManager();
                yamlSettings.documents.set(testTextDocument);
                return languageHandler.completionHandler({
                    position: testTextDocument.positionAt(position),
                    textDocument: testTextDocument,
                });
            }
            /**
             * Known issue: https://github.com/redhat-developer/yaml-language-server/issues/51
             */
            // it('Autocomplete on root node without word', done => {
            //     const content = '';
            //     const completion = parseSetup(content, 0);
            //     completion.then(function (result){
            //         assert.notEqual(result.items.length, 0);
            //     }).then(done, done);
            // });
            // it('Autocomplete on root node with word', done => {
            //     const content = 'api';
            //     const completion = parseSetup(content, 6);
            //     completion.then(function (result){
            //         assert.notEqual(result.items.length, 0);
            //     }).then(done, done);
            // });
            /**
             * Removed these tests because the schema pulled in from
             * https://github.com/redhat-developer/yaml-language-server/pull/108
             * No longer has those types of completion
             */
            // it('Autocomplete on default value (without value content)', done => {
            //     const content = 'apiVersion: ';
            //     const completion = parseSetup(content, 10);
            //     completion.then(function (result){
            //         assert.notEqual(result.items.length, 0);
            //     }).then(done, done);
            // });
            it('Autocomplete on default value (with value content)', (done) => {
                const content = 'apiVersion: v1\nkind: Depl';
                const completion = parseSetup(content, 19);
                completion
                    .then(function (result) {
                    assert.notEqual(result.items.length, 0);
                })
                    .then(done, done);
            });
            it('Autocomplete on boolean value (without value content)', (done) => {
                const content = 'spec:\n  allowPrivilegeEscalation: ';
                const completion = parseSetup(content, 38);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 2);
                })
                    .then(done, done);
            });
            it('Autocomplete on boolean value (with value content)', (done) => {
                const content = 'spec:\n  allowPrivilegeEscalation: fal';
                const completion = parseSetup(content, 43);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 2);
                })
                    .then(done, done);
            });
            it('Autocomplete key in middle of file', (done) => {
                const content = 'metadata:\n  nam';
                const completion = parseSetup(content, 14);
                completion
                    .then(function (result) {
                    assert.notEqual(result.items.length, 0);
                })
                    .then(done, done);
            });
            it('Autocomplete key in middle of file 2', (done) => {
                const content = 'metadata:\n  name: test\n  cluster';
                const completion = parseSetup(content, 31);
                completion
                    .then(function (result) {
                    assert.notEqual(result.items.length, 0);
                })
                    .then(done, done);
            });
        });
    });
    describe('yamlHover with kubernetes', function () {
        function parseSetup(content, offset) {
            const testTextDocument = (0, testHelper_1.setupTextDocument)(content);
            yamlSettings.documents = new yamlSettings_1.TextDocumentTestManager();
            yamlSettings.documents.set(testTextDocument);
            return languageHandler.hoverHandler({
                position: testTextDocument.positionAt(offset),
                textDocument: testTextDocument,
            });
        }
        it('Hover on incomplete kubernetes document', async () => {
            const content = 'apiVersion: v1\nmetadata:\n  name: test\nkind: Deployment\nspec:\n   ';
            const hover = await parseSetup(content, 58);
            assert.strictEqual(vscode_languageserver_types_1.MarkupContent.is(hover?.contents), true);
            assert.strictEqual((hover?.contents).value, '');
        });
    });
});
//# sourceMappingURL=integration.test.js.map