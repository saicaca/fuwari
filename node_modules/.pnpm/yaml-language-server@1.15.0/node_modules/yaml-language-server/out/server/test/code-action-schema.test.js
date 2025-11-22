"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const testHelper_1 = require("./utils/testHelper");
const serviceSetup_1 = require("./utils/serviceSetup");
const vscode_languageserver_1 = require("vscode-languageserver");
const chai_1 = require("chai");
const yamlSettings_1 = require("../src/yamlSettings");
const yamlCodeActions_1 = require("../src/languageservice/services/yamlCodeActions");
describe('Schema Errors Code Action Tests', () => {
    let languageSettingsSetup;
    let validationHandler;
    let yamlSettings;
    let schemaProvider;
    before(() => {
        languageSettingsSetup = new serviceSetup_1.ServiceSetup().withValidate();
        const { validationHandler: valHandler, yamlSettings: settings, schemaProvider: testSchemaProvider, } = (0, testHelper_1.setupLanguageService)(languageSettingsSetup.languageSettings);
        validationHandler = valHandler;
        yamlSettings = settings;
        schemaProvider = testSchemaProvider;
    });
    function parseSetup(content, customSchemaID) {
        const testTextDocument = (0, testHelper_1.setupSchemaIDTextDocument)(content, customSchemaID);
        yamlSettings.documents = new yamlSettings_1.TextDocumentTestManager();
        yamlSettings.documents.set(testTextDocument);
        return testTextDocument;
    }
    afterEach(() => {
        schemaProvider.deleteSchema(testHelper_1.SCHEMA_ID);
    });
    describe('Convert value code action tests', () => {
        it('Should provide convert to boolean action for false', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    analytics: {
                        type: 'boolean',
                    },
                },
            });
            const content = 'analytics: "false"';
            const doc = parseSetup(content);
            const diagnostics = await validationHandler.validateTextDocument(doc);
            const params = {
                context: vscode_languageserver_1.CodeActionContext.create(diagnostics),
                range: undefined,
                textDocument: vscode_languageserver_1.TextDocumentIdentifier.create(testHelper_1.TEST_URI),
            };
            const actions = new yamlCodeActions_1.YamlCodeActions({});
            const result = actions.getCodeAction(doc, params);
            (0, chai_1.expect)(result.length).to.be.equal(1);
            (0, chai_1.expect)(result[0].title).to.be.equal('Convert to boolean');
            (0, chai_1.expect)(result[0].edit.changes[doc.uri]).to.exist;
            const edit = result[0].edit.changes[doc.uri];
            (0, chai_1.expect)(edit.length).to.be.equal(1);
            (0, chai_1.expect)(edit[0]).deep.equal(vscode_languageserver_1.TextEdit.replace(vscode_languageserver_1.Range.create(0, 11, 0, 18), 'false'));
        });
        it('Should provide convert to boolean action for true', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    analytics: {
                        type: 'boolean',
                    },
                },
            });
            const content = "analytics: 'true'";
            const doc = parseSetup(content);
            const diagnostics = await validationHandler.validateTextDocument(doc);
            const params = {
                context: vscode_languageserver_1.CodeActionContext.create(diagnostics),
                range: undefined,
                textDocument: vscode_languageserver_1.TextDocumentIdentifier.create(testHelper_1.TEST_URI),
            };
            const actions = new yamlCodeActions_1.YamlCodeActions({});
            const result = actions.getCodeAction(doc, params);
            (0, chai_1.expect)(result.length).to.be.equal(1);
            (0, chai_1.expect)(result[0].title).to.be.equal('Convert to boolean');
            (0, chai_1.expect)(result[0].edit.changes[doc.uri]).to.exist;
            const edit = result[0].edit.changes[doc.uri];
            (0, chai_1.expect)(edit.length).to.be.equal(1);
            (0, chai_1.expect)(edit[0]).deep.equal(vscode_languageserver_1.TextEdit.replace(vscode_languageserver_1.Range.create(0, 11, 0, 17), 'true'));
        });
    });
});
//# sourceMappingURL=code-action-schema.test.js.map