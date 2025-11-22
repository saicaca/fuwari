"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const yamlSettings_1 = require("../src/yamlSettings");
const serviceSetup_1 = require("./utils/serviceSetup");
const testHelper_1 = require("./utils/testHelper");
const chai_1 = require("chai");
const verifyError_1 = require("./utils/verifyError");
describe('YAML Validation Tests', () => {
    let languageSettingsSetup;
    let validationHandler;
    let yamlSettings;
    before(() => {
        languageSettingsSetup = new serviceSetup_1.ServiceSetup().withValidate();
        const { validationHandler: valHandler, yamlSettings: settings } = (0, testHelper_1.setupLanguageService)(languageSettingsSetup.languageSettings);
        validationHandler = valHandler;
        yamlSettings = settings;
    });
    function parseSetup(content, customSchemaID) {
        const testTextDocument = (0, testHelper_1.setupSchemaIDTextDocument)(content, customSchemaID);
        yamlSettings.documents = new yamlSettings_1.TextDocumentTestManager();
        yamlSettings.documents.set(testTextDocument);
        return validationHandler.validateTextDocument(testTextDocument);
    }
    describe('TAB Character diagnostics', () => {
        it('Should report if TAB character present', async () => {
            const yaml = 'foo:\n\t- bar';
            const result = await parseSetup(yaml);
            (0, chai_1.expect)(result).is.not.empty;
            (0, chai_1.expect)(result.length).to.be.equal(1);
            (0, chai_1.expect)(result[0]).deep.equal((0, verifyError_1.createExpectedError)('Tabs are not allowed as indentation', 1, 0, 1, 6));
        });
        it('Should report one error for TAB character present in a row', async () => {
            const yaml = 'foo:\n\t\t- bar';
            const result = await parseSetup(yaml);
            (0, chai_1.expect)(result).is.not.empty;
            (0, chai_1.expect)(result.length).to.be.equal(1);
            (0, chai_1.expect)(result[0]).deep.equal((0, verifyError_1.createExpectedError)('Tabs are not allowed as indentation', 1, 0, 1, 7));
        });
        it('Should report one error for TAB`s characters present in the middle of indentation', async () => {
            const yaml = 'foo:\n \t\t\t - bar';
            const result = await parseSetup(yaml);
            (0, chai_1.expect)(result).is.not.empty;
            (0, chai_1.expect)(result.length).to.be.equal(1);
            (0, chai_1.expect)(result[0]).deep.equal((0, verifyError_1.createExpectedError)('Tabs are not allowed as indentation', 1, 1, 1, 10));
        });
    });
    describe('Unused anchors diagnostics', () => {
        it('should report unused anchor', async () => {
            const yaml = 'foo: &bar bar\n';
            const result = await parseSetup(yaml);
            (0, chai_1.expect)(result).is.not.empty;
            (0, chai_1.expect)(result.length).to.be.equal(1);
            (0, chai_1.expect)(result[0]).deep.equal((0, verifyError_1.createUnusedAnchorDiagnostic)('Unused anchor "&bar"', 0, 5, 0, 9));
        });
        it('should not report used anchor', async () => {
            const yaml = 'foo: &bar bar\nfff: *bar';
            const result = await parseSetup(yaml);
            (0, chai_1.expect)(result).is.empty;
        });
        it('should report unused anchors in array ', async () => {
            const yaml = `foo: &bar   doe
aaa: some
dd: *ba
some: 
  &a ss: ss
&aa ff: 
  - s
  - &g o
  - &e m
  - e
ee: *g`;
            const result = await parseSetup(yaml);
            (0, chai_1.expect)(result).is.not.empty;
            (0, chai_1.expect)(result.length).to.be.equal(4);
            (0, chai_1.expect)(result).to.include.deep.members([
                (0, verifyError_1.createUnusedAnchorDiagnostic)('Unused anchor "&bar"', 0, 5, 0, 9),
                (0, verifyError_1.createUnusedAnchorDiagnostic)('Unused anchor "&a"', 4, 2, 4, 4),
                (0, verifyError_1.createUnusedAnchorDiagnostic)('Unused anchor "&aa"', 5, 0, 5, 3),
                (0, verifyError_1.createUnusedAnchorDiagnostic)('Unused anchor "&e"', 8, 4, 8, 6),
            ]);
        });
    });
    describe(`YAML styles test`, () => {
        it('should not report flow style', async () => {
            const yaml = `host: phl-42  
datacenter:   
  location: canada  
  cab: 15  
animals:  
  - dog  
  - cat  
  - mouse`;
            const result = await parseSetup(yaml);
            (0, chai_1.expect)(result).to.be.empty;
        });
        it('should report flow style', async () => {
            const yaml = `host: phl-42  
datacenter: {location: canada , cab: 15}  
animals: [dog , cat , mouse]  `;
            yamlSettings.style = {
                flowMapping: 'forbid',
                flowSequence: 'forbid',
            };
            languageSettingsSetup = new serviceSetup_1.ServiceSetup().withValidate().withFlowMapping('forbid').withFlowSequence('forbid');
            const { validationHandler: valHandler, yamlSettings: settings } = (0, testHelper_1.setupLanguageService)(languageSettingsSetup.languageSettings);
            validationHandler = valHandler;
            yamlSettings = settings;
            const result = await parseSetup(yaml);
            (0, chai_1.expect)(result).not.to.be.empty;
            (0, chai_1.expect)(result.length).to.be.equal(2);
            (0, chai_1.expect)(result).to.include.deep.members([
                (0, verifyError_1.createExpectedError)('Flow style mapping is forbidden', 1, 12, 1, 42, vscode_languageserver_types_1.DiagnosticSeverity.Error, 'YAML', 'flowMap'),
                (0, verifyError_1.createExpectedError)('Flow style sequence is forbidden', 2, 9, 2, 28, vscode_languageserver_types_1.DiagnosticSeverity.Error, 'YAML', 'flowSeq'),
            ]);
        });
        it('should report only sequence when flow mapping is allow', async () => {
            const yaml = `host: phl-42  
datacenter: {location: canada , cab: 15}  
animals: [dog , cat , mouse]  `;
            yamlSettings.style = {
                flowMapping: 'forbid',
                flowSequence: 'forbid',
            };
            languageSettingsSetup = new serviceSetup_1.ServiceSetup().withValidate().withFlowMapping('allow').withFlowSequence('forbid');
            const { validationHandler: valHandler, yamlSettings: settings } = (0, testHelper_1.setupLanguageService)(languageSettingsSetup.languageSettings);
            validationHandler = valHandler;
            yamlSettings = settings;
            const result = await parseSetup(yaml);
            (0, chai_1.expect)(result).not.to.be.empty;
            (0, chai_1.expect)(result.length).to.be.equal(1);
            (0, chai_1.expect)(result).to.include.deep.members([
                (0, verifyError_1.createExpectedError)('Flow style sequence is forbidden', 2, 9, 2, 28, vscode_languageserver_types_1.DiagnosticSeverity.Error, 'YAML', 'flowSeq'),
            ]);
        });
        it('should report flow error for empty map & sequence', async () => {
            const yaml = 'object: {} \nobject2: []';
            yamlSettings.style = {
                flowMapping: 'forbid',
                flowSequence: 'forbid',
            };
            languageSettingsSetup = new serviceSetup_1.ServiceSetup().withValidate().withFlowMapping('forbid').withFlowSequence('forbid');
            const { validationHandler: valHandler, yamlSettings: settings } = (0, testHelper_1.setupLanguageService)(languageSettingsSetup.languageSettings);
            validationHandler = valHandler;
            yamlSettings = settings;
            const result = await parseSetup(yaml);
            (0, chai_1.expect)(result).not.to.be.empty;
            (0, chai_1.expect)(result.length).to.be.equal(2);
            (0, chai_1.expect)(result).to.include.deep.members([
                (0, verifyError_1.createExpectedError)('Flow style mapping is forbidden', 0, 8, 0, 11, vscode_languageserver_types_1.DiagnosticSeverity.Error, 'YAML', 'flowMap'),
                (0, verifyError_1.createExpectedError)('Flow style sequence is forbidden', 1, 9, 1, 10, vscode_languageserver_types_1.DiagnosticSeverity.Error, 'YAML', 'flowSeq'),
            ]);
        });
    });
    describe('Map keys order Tests', () => {
        it('should report key order error', async () => {
            const yaml = '- key 2: v\n  key 1: val\n  key 5: valu\n  key 3: ff';
            yamlSettings.keyOrdering = true;
            languageSettingsSetup = new serviceSetup_1.ServiceSetup().withValidate().withKeyOrdering();
            const { validationHandler: valHandler, yamlSettings: settings } = (0, testHelper_1.setupLanguageService)(languageSettingsSetup.languageSettings);
            validationHandler = valHandler;
            yamlSettings = settings;
            const result = await parseSetup(yaml);
            (0, chai_1.expect)(result).not.to.be.empty;
            (0, chai_1.expect)(result.length).to.be.equal(2);
            (0, chai_1.expect)(result).to.include.deep.members([
                (0, verifyError_1.createExpectedError)('Wrong ordering of key "key 2" in mapping', 0, 2, 0, 9, vscode_languageserver_types_1.DiagnosticSeverity.Error, 'YAML', 'mapKeyOrder'),
                (0, verifyError_1.createExpectedError)('Wrong ordering of key "key 5" in mapping', 2, 0, 2, 9, vscode_languageserver_types_1.DiagnosticSeverity.Error, 'YAML', 'mapKeyOrder'),
            ]);
        });
        it('should report key order error for flow style maps', async () => {
            const yaml = '- {b: 1, a: 2}';
            yamlSettings.keyOrdering = true;
            languageSettingsSetup = new serviceSetup_1.ServiceSetup().withValidate().withKeyOrdering();
            const { validationHandler: valHandler, yamlSettings: settings } = (0, testHelper_1.setupLanguageService)(languageSettingsSetup.languageSettings);
            validationHandler = valHandler;
            yamlSettings = settings;
            const result = await parseSetup(yaml);
            (0, chai_1.expect)(result).not.to.be.empty;
            (0, chai_1.expect)(result.length).to.be.equal(1);
            (0, chai_1.expect)(result).to.include.deep.members([
                (0, verifyError_1.createExpectedError)('Wrong ordering of key "b" in mapping', 0, 3, 0, 6, vscode_languageserver_types_1.DiagnosticSeverity.Error, 'YAML', 'mapKeyOrder'),
            ]);
        });
        it('should NOT report any errors', async () => {
            const yaml = '- key 1: val\n  key 5: valu\n- {a: 1, c: 2}';
            yamlSettings.keyOrdering = true;
            languageSettingsSetup = new serviceSetup_1.ServiceSetup().withValidate().withKeyOrdering();
            const { validationHandler: valHandler, yamlSettings: settings } = (0, testHelper_1.setupLanguageService)(languageSettingsSetup.languageSettings);
            validationHandler = valHandler;
            yamlSettings = settings;
            const result = await parseSetup(yaml);
            (0, chai_1.expect)(result).to.be.empty;
        });
    });
});
//# sourceMappingURL=yamlValidation.test.js.map