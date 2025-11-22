"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require("sinon-chai");
const schemaSelectionHandlers_1 = require("../src/languageserver/handlers/schemaSelectionHandlers");
const yamlSchemaService_1 = require("../src/languageservice/services/yamlSchemaService");
const yamlSettings_1 = require("../src/yamlSettings");
const requestTypes_1 = require("../src/requestTypes");
const testHelper_1 = require("./utils/testHelper");
const expect = chai.expect;
chai.use(sinonChai);
describe('Schema Selection Handlers', () => {
    const sandbox = sinon.createSandbox();
    const connection = {};
    let service;
    let requestServiceMock;
    beforeEach(() => {
        requestServiceMock = sandbox.fake.resolves(undefined);
        service = new yamlSchemaService_1.YAMLSchemaService(requestServiceMock);
        connection.client = {};
        const onRequest = sandbox.fake();
        connection.onRequest = onRequest;
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('add handler for "getSchema" and "getAllSchemas" requests', () => {
        new schemaSelectionHandlers_1.JSONSchemaSelection(service, new yamlSettings_1.SettingsState(), connection);
        expect(connection.onRequest).calledWith(requestTypes_1.SchemaSelectionRequests.getSchema);
        expect(connection.onRequest).calledWith(requestTypes_1.SchemaSelectionRequests.getAllSchemas);
    });
    it('getAllSchemas should return all schemas', async () => {
        service.registerExternalSchema('https://some.com/some.json', ['foo.yaml'], undefined, 'Schema name', 'Schema description');
        const settings = new yamlSettings_1.SettingsState();
        const testTextDocument = (0, testHelper_1.setupSchemaIDTextDocument)('');
        settings.documents = new yamlSettings_1.TextDocumentTestManager();
        settings.documents.set(testTextDocument);
        const selection = new schemaSelectionHandlers_1.JSONSchemaSelection(service, settings, connection);
        const result = await selection.getAllSchemas(testTextDocument.uri);
        expect(result).length(1);
        expect(result[0]).to.be.eqls({
            uri: 'https://some.com/some.json',
            fromStore: true,
            usedForCurrentFile: false,
            name: 'Schema name',
            description: 'Schema description',
            versions: undefined,
        });
    });
    it('getAllSchemas should return all schemas and mark used for current file', async () => {
        service.registerExternalSchema('https://some.com/some.json', [testHelper_1.SCHEMA_ID], undefined, 'Schema name', 'Schema description');
        const settings = new yamlSettings_1.SettingsState();
        const testTextDocument = (0, testHelper_1.setupSchemaIDTextDocument)('');
        settings.documents = new yamlSettings_1.TextDocumentTestManager();
        settings.documents.set(testTextDocument);
        const selection = new schemaSelectionHandlers_1.JSONSchemaSelection(service, settings, connection);
        const result = await selection.getAllSchemas(testTextDocument.uri);
        expect(result).length(1);
        expect(result[0]).to.be.eqls({
            uri: 'https://some.com/some.json',
            name: 'Schema name',
            description: 'Schema description',
            fromStore: false,
            usedForCurrentFile: true,
            versions: undefined,
        });
    });
    it('getSchemas should return all schemas', async () => {
        service.registerExternalSchema('https://some.com/some.json', [testHelper_1.SCHEMA_ID], undefined, 'Schema name', 'Schema description');
        const settings = new yamlSettings_1.SettingsState();
        const testTextDocument = (0, testHelper_1.setupSchemaIDTextDocument)('');
        settings.documents = new yamlSettings_1.TextDocumentTestManager();
        settings.documents.set(testTextDocument);
        const selection = new schemaSelectionHandlers_1.JSONSchemaSelection(service, settings, connection);
        const result = await selection.getSchemas(testTextDocument.uri);
        expect(result).length(1);
        expect(result[0]).to.be.eqls({
            uri: 'https://some.com/some.json',
            name: 'Schema name',
            description: 'Schema description',
            versions: undefined,
        });
    });
    it('getSchemas should handle empty schemas', async () => {
        const settings = new yamlSettings_1.SettingsState();
        const testTextDocument = (0, testHelper_1.setupSchemaIDTextDocument)('');
        settings.documents = new yamlSettings_1.TextDocumentTestManager();
        settings.documents.set(testTextDocument);
        const selection = new schemaSelectionHandlers_1.JSONSchemaSelection(service, settings, connection);
        const result = await selection.getSchemas(testTextDocument.uri);
        expect(result).length(0);
    });
});
//# sourceMappingURL=schemaSelectionHandlers.test.js.map