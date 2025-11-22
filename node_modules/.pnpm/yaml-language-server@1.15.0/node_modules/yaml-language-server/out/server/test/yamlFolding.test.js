"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const yamlFolding_1 = require("../src/languageservice/services/yamlFolding");
const testHelper_1 = require("./utils/testHelper");
const context = { rangeLimit: 100000 };
describe('YAML Folding', () => {
    it('should return undefined if no document provided', () => {
        const ranges = (0, yamlFolding_1.getFoldingRanges)(undefined, context);
        (0, chai_1.expect)(ranges).to.be.undefined;
    });
    it('should return empty array for empty document', () => {
        const doc = (0, testHelper_1.setupTextDocument)('');
        const ranges = (0, yamlFolding_1.getFoldingRanges)(doc, context);
        (0, chai_1.expect)(ranges).to.be.empty;
    });
    it('should provide folding ranges for object', () => {
        const yaml = `
    foo: bar
    aaa:
      bbb: ccc
    `;
        const doc = (0, testHelper_1.setupTextDocument)(yaml);
        const ranges = (0, yamlFolding_1.getFoldingRanges)(doc, context);
        (0, chai_1.expect)(ranges.length).to.equal(1);
        (0, chai_1.expect)(ranges[0]).to.be.eql(vscode_languageserver_types_1.FoldingRange.create(2, 3, 4, 14));
    });
    it('should provide folding ranges for array', () => {
        const yaml = `
    foo: bar
    aaa:
      - bbb
    ccc: ddd
    `;
        const doc = (0, testHelper_1.setupTextDocument)(yaml);
        const ranges = (0, yamlFolding_1.getFoldingRanges)(doc, context);
        (0, chai_1.expect)(ranges.length).to.equal(1);
        (0, chai_1.expect)(ranges[0]).to.be.eql(vscode_languageserver_types_1.FoldingRange.create(2, 3, 4, 11));
    });
    it('should provide folding ranges for multiple documents', () => {
        const yaml = `---\nname: jack\nage: 22\n---\ncwd: test\n`;
        const doc = (0, testHelper_1.setupTextDocument)(yaml);
        const ranges = (0, yamlFolding_1.getFoldingRanges)(doc, context);
        (0, chai_1.expect)(ranges.length).to.equal(2);
        (0, chai_1.expect)(ranges[0]).to.be.eql(vscode_languageserver_types_1.FoldingRange.create(1, 2, 0, 7));
        (0, chai_1.expect)(ranges[1]).to.be.eql(vscode_languageserver_types_1.FoldingRange.create(4, 4, 0, 9));
    });
    it('should not include comments on folding ranges', () => {
        const yaml = `# a comment\nname: jack\n# age comment\nage:\n  - october`;
        const doc = (0, testHelper_1.setupTextDocument)(yaml);
        const ranges = (0, yamlFolding_1.getFoldingRanges)(doc, context);
        (0, chai_1.expect)(ranges.length).to.equal(1);
        (0, chai_1.expect)(ranges[0]).to.be.eql(vscode_languageserver_types_1.FoldingRange.create(3, 4, 0, 11));
    });
    it('should provide folding ranges for multiline string', () => {
        const yaml = `
    foo: 
          bar:
    aaa:
          bbb
          zzz
    `;
        const doc = (0, testHelper_1.setupTextDocument)(yaml);
        const ranges = (0, yamlFolding_1.getFoldingRanges)(doc, context);
        (0, chai_1.expect)(ranges).to.deep.include.members([vscode_languageserver_types_1.FoldingRange.create(1, 2, 4, 14), vscode_languageserver_types_1.FoldingRange.create(3, 5, 4, 13)]);
    });
    it('should provide folding ranges for mapping in array', () => {
        const yaml = `
    foo: bar
    aaa:
      - bbb: "bbb"
        fff: "fff"
    ccc: ddd
    `;
        const doc = (0, testHelper_1.setupTextDocument)(yaml);
        const ranges = (0, yamlFolding_1.getFoldingRanges)(doc, context);
        (0, chai_1.expect)(ranges).to.deep.include.members([vscode_languageserver_types_1.FoldingRange.create(2, 4, 4, 18), vscode_languageserver_types_1.FoldingRange.create(3, 4, 8, 18)]);
    });
    it('should provide folding ranges for mapping in mapping', () => {
        const yaml = `
    foo: bar
    aaa:
      bbb:
        fff: "fff"
    ccc: ddd
    `;
        const doc = (0, testHelper_1.setupTextDocument)(yaml);
        const ranges = (0, yamlFolding_1.getFoldingRanges)(doc, context);
        (0, chai_1.expect)(ranges).to.deep.include.members([vscode_languageserver_types_1.FoldingRange.create(2, 4, 4, 18), vscode_languageserver_types_1.FoldingRange.create(3, 4, 6, 18)]);
    });
    it('should provide proper folding for map in map with array', () => {
        const yaml = `FirstDict:
  FirstDictFirstKey:
    SomeList:
      - foo
SecondDict:
  SecondDictFirstKey: foo`;
        const doc = (0, testHelper_1.setupTextDocument)(yaml);
        const ranges = (0, yamlFolding_1.getFoldingRanges)(doc, context);
        (0, chai_1.expect)(ranges).to.deep.include.members([vscode_languageserver_types_1.FoldingRange.create(1, 3, 2, 11)]);
    });
    it('should provide proper folding for map in map with array2', () => {
        const yaml = `top1:
  second11:
    name: one
    events:
      - element
  second12:
    name: two`;
        const doc = (0, testHelper_1.setupTextDocument)(yaml);
        const ranges = (0, yamlFolding_1.getFoldingRanges)(doc, context);
        (0, chai_1.expect)(ranges).to.deep.include.members([vscode_languageserver_types_1.FoldingRange.create(1, 4, 2, 15)]);
    });
    it('should respect range limits', () => {
        const yaml = `
      a:
        - 1
      b:
        - 2
    `;
        const warnings = [];
        const doc = (0, testHelper_1.setupTextDocument)(yaml);
        const unlimitedRanges = (0, yamlFolding_1.getFoldingRanges)(doc, {
            rangeLimit: 10,
            onRangeLimitExceeded: (uri) => warnings.push(uri),
        });
        (0, chai_1.expect)(unlimitedRanges.length).to.equal(2);
        (0, chai_1.expect)(warnings).to.be.empty;
        const limitedRanges = (0, yamlFolding_1.getFoldingRanges)(doc, {
            rangeLimit: 1,
            onRangeLimitExceeded: (uri) => warnings.push(uri),
        });
        (0, chai_1.expect)(limitedRanges.length).to.equal(1);
        (0, chai_1.expect)(warnings).to.deep.equal([testHelper_1.TEST_URI]);
    });
});
//# sourceMappingURL=yamlFolding.test.js.map