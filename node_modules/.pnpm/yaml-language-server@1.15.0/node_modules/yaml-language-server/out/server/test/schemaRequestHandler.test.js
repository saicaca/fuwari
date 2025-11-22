"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const schemaRequestHandler_1 = require("../src/languageservice/services/schemaRequestHandler");
const sinon = require("sinon");
const vscode_uri_1 = require("vscode-uri");
const chai = require("chai");
const sinonChai = require("sinon-chai");
const expect = chai.expect;
chai.use(sinonChai);
const testHelper_1 = require("./utils/testHelper");
describe('Schema Request Handler Tests', () => {
    describe('schemaRequestHandler', () => {
        const sandbox = sinon.createSandbox();
        let readFileStub;
        beforeEach(() => {
            readFileStub = sandbox.stub(testHelper_1.testFileSystem, 'readFile');
            readFileStub.returns(Promise.resolve('{some: "json"}'));
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('Should care Win URI', async () => {
            const connection = {};
            const resultPromise = (0, schemaRequestHandler_1.schemaRequestHandler)(connection, 'c:\\some\\window\\path\\scheme.json', [], vscode_uri_1.URI.parse(''), false, testHelper_1.testFileSystem);
            expect(readFileStub).calledOnceWith('c:\\some\\window\\path\\scheme.json');
            const result = await resultPromise;
            expect(result).to.be.equal('{some: "json"}');
        });
        it('UNIX URI should works', async () => {
            const connection = {};
            const resultPromise = (0, schemaRequestHandler_1.schemaRequestHandler)(connection, '/some/unix/path/', [], vscode_uri_1.URI.parse(''), false, testHelper_1.testFileSystem);
            const result = await resultPromise;
            expect(result).to.be.equal('{some: "json"}');
        });
        it('should handle not valid Windows path', async () => {
            const connection = {};
            const resultPromise = (0, schemaRequestHandler_1.schemaRequestHandler)(connection, 'A:/some/window/path/scheme.json', [], vscode_uri_1.URI.parse(''), false, testHelper_1.testFileSystem);
            expect(readFileStub).calledOnceWith(vscode_uri_1.URI.file('a:/some/window/path/scheme.json').fsPath);
            const result = await resultPromise;
            expect(result).to.be.equal('{some: "json"}');
        });
    });
});
//# sourceMappingURL=schemaRequestHandler.test.js.map