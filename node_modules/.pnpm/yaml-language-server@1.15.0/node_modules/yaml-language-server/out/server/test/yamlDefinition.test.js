"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const testHelper_1 = require("./utils/testHelper");
const chai_1 = require("chai");
const yamlDefinition_1 = require("../src/languageservice/services/yamlDefinition");
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
describe('YAML Definition', () => {
    it('should not provide definition for non anchor node', () => {
        const doc = (0, testHelper_1.setupTextDocument)('foo: &bar some\naaa: *bar');
        const result = new yamlDefinition_1.YamlDefinition({}).getDefinition(doc, {
            position: vscode_languageserver_types_1.Position.create(1, 2),
            textDocument: { uri: testHelper_1.TEST_URI },
        });
        (0, chai_1.expect)(result).is.undefined;
    });
    it('should provide definition for anchor', () => {
        const doc = (0, testHelper_1.setupTextDocument)('foo: &bar some\naaa: *bar');
        const result = new yamlDefinition_1.YamlDefinition({}).getDefinition(doc, {
            position: vscode_languageserver_types_1.Position.create(1, 7),
            textDocument: { uri: testHelper_1.TEST_URI },
        });
        (0, chai_1.expect)(result).is.not.undefined;
        (0, chai_1.expect)(result[0]).is.eqls(vscode_languageserver_types_1.LocationLink.create(testHelper_1.TEST_URI, vscode_languageserver_types_1.Range.create(0, 10, 1, 0), vscode_languageserver_types_1.Range.create(0, 10, 0, 14)));
    });
});
//# sourceMappingURL=yamlDefinition.test.js.map