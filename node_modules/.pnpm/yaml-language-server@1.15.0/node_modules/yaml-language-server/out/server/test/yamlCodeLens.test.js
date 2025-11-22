"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chai = require("chai");
const yamlCodeLens_1 = require("../src/languageservice/services/yamlCodeLens");
const yamlSchemaService_1 = require("../src/languageservice/services/yamlSchemaService");
const testHelper_1 = require("./utils/testHelper");
const vscode_languageserver_protocol_1 = require("vscode-languageserver-protocol");
const commands_1 = require("../src/commands");
const telemetry_1 = require("../src/languageserver/telemetry");
const expect = chai.expect;
chai.use(sinonChai);
describe('YAML CodeLens', () => {
    const sandbox = sinon.createSandbox();
    let yamlSchemaService;
    let telemetryStub;
    let telemetry;
    beforeEach(() => {
        yamlSchemaService = sandbox.createStubInstance(yamlSchemaService_1.YAMLSchemaService);
        telemetryStub = sandbox.createStubInstance(telemetry_1.TelemetryImpl);
        telemetry = telemetryStub;
    });
    afterEach(() => {
        sandbox.restore();
    });
    function createCommand(title, command, arg) {
        return {
            title,
            command,
            arguments: [arg],
        };
    }
    function createCodeLens(title, command, arg) {
        const lens = vscode_languageserver_protocol_1.CodeLens.create(vscode_languageserver_protocol_1.Range.create(0, 0, 0, 0));
        lens.command = createCommand(title, command, arg);
        return lens;
    }
    it('should provides CodeLens with jumpToSchema command', async () => {
        const doc = (0, testHelper_1.setupTextDocument)('foo: bar');
        const schema = {
            url: 'some://url/to/schema.json',
        };
        yamlSchemaService.getSchemaForResource.resolves({ schema });
        const codeLens = new yamlCodeLens_1.YamlCodeLens(yamlSchemaService, telemetry);
        const result = await codeLens.getCodeLens(doc);
        expect(result).is.not.empty;
        expect(result[0].command).is.not.undefined;
        expect(result[0].command).is.deep.equal(createCommand('schema.json', commands_1.YamlCommands.JUMP_TO_SCHEMA, 'some://url/to/schema.json'));
    });
    it('should place CodeLens at beginning of the file and it has command', async () => {
        const doc = (0, testHelper_1.setupTextDocument)('foo: bar');
        const schema = {
            url: 'some://url/to/schema.json',
        };
        yamlSchemaService.getSchemaForResource.resolves({ schema });
        const codeLens = new yamlCodeLens_1.YamlCodeLens(yamlSchemaService, telemetry);
        const result = await codeLens.getCodeLens(doc);
        expect(result[0].range).is.deep.equal(vscode_languageserver_protocol_1.Range.create(0, 0, 0, 0));
        expect(result[0].command).is.deep.equal(createCommand('schema.json', commands_1.YamlCommands.JUMP_TO_SCHEMA, 'some://url/to/schema.json'));
    });
    it('should place one CodeLens at beginning of the file for multiple documents', async () => {
        const doc = (0, testHelper_1.setupTextDocument)('foo: bar\n---\nfoo: bar');
        const schema = {
            url: 'some://url/to/schema.json',
        };
        yamlSchemaService.getSchemaForResource.resolves({ schema });
        const codeLens = new yamlCodeLens_1.YamlCodeLens(yamlSchemaService, telemetry);
        const result = await codeLens.getCodeLens(doc);
        expect(result.length).to.eq(1);
        expect(result[0].range).is.deep.equal(vscode_languageserver_protocol_1.Range.create(0, 0, 0, 0));
        expect(result[0].command).is.deep.equal(createCommand('schema.json', commands_1.YamlCommands.JUMP_TO_SCHEMA, 'some://url/to/schema.json'));
    });
    it('command name should contains schema title', async () => {
        const doc = (0, testHelper_1.setupTextDocument)('foo: bar');
        const schema = {
            url: 'some://url/to/schema.json',
            title: 'fooBar',
        };
        yamlSchemaService.getSchemaForResource.resolves({ schema });
        const codeLens = new yamlCodeLens_1.YamlCodeLens(yamlSchemaService, telemetry);
        const result = await codeLens.getCodeLens(doc);
        expect(result[0].command).is.deep.equal(createCommand('fooBar (schema.json)', commands_1.YamlCommands.JUMP_TO_SCHEMA, 'some://url/to/schema.json'));
    });
    it('command name should contains schema title and description', async () => {
        const doc = (0, testHelper_1.setupTextDocument)('foo: bar');
        const schema = {
            url: 'some://url/to/schema.json',
            title: 'fooBar',
            description: 'fooBarDescription',
        };
        yamlSchemaService.getSchemaForResource.resolves({ schema });
        const codeLens = new yamlCodeLens_1.YamlCodeLens(yamlSchemaService, telemetry);
        const result = await codeLens.getCodeLens(doc);
        expect(result[0].command).is.deep.equal(createCommand('fooBar - fooBarDescription (schema.json)', commands_1.YamlCommands.JUMP_TO_SCHEMA, 'some://url/to/schema.json'));
    });
    it('should provide lens for oneOf schemas', async () => {
        const doc = (0, testHelper_1.setupTextDocument)('foo: bar');
        const schema = {
            oneOf: [
                {
                    url: 'some://url/schema1.json',
                },
                {
                    url: 'some://url/schema2.json',
                },
            ],
        };
        yamlSchemaService.getSchemaForResource.resolves({ schema });
        const codeLens = new yamlCodeLens_1.YamlCodeLens(yamlSchemaService, telemetry);
        const result = await codeLens.getCodeLens(doc);
        expect(result).has.length(2);
        expect(result).is.deep.equal([
            createCodeLens('schema1.json', commands_1.YamlCommands.JUMP_TO_SCHEMA, 'some://url/schema1.json'),
            createCodeLens('schema2.json', commands_1.YamlCommands.JUMP_TO_SCHEMA, 'some://url/schema2.json'),
        ]);
    });
    it('should provide lens for allOf schemas', async () => {
        const doc = (0, testHelper_1.setupTextDocument)('foo: bar');
        const schema = {
            allOf: [
                {
                    url: 'some://url/schema1.json',
                },
                {
                    url: 'some://url/schema2.json',
                },
            ],
        };
        yamlSchemaService.getSchemaForResource.resolves({ schema });
        const codeLens = new yamlCodeLens_1.YamlCodeLens(yamlSchemaService, telemetry);
        const result = await codeLens.getCodeLens(doc);
        expect(result).has.length(2);
        expect(result).is.deep.equal([
            createCodeLens('schema1.json', commands_1.YamlCommands.JUMP_TO_SCHEMA, 'some://url/schema1.json'),
            createCodeLens('schema2.json', commands_1.YamlCommands.JUMP_TO_SCHEMA, 'some://url/schema2.json'),
        ]);
    });
    it('should provide lens for anyOf schemas', async () => {
        const doc = (0, testHelper_1.setupTextDocument)('foo: bar');
        const schema = {
            anyOf: [
                {
                    url: 'some://url/schema1.json',
                },
                {
                    url: 'some://url/schema2.json',
                },
            ],
        };
        yamlSchemaService.getSchemaForResource.resolves({ schema });
        const codeLens = new yamlCodeLens_1.YamlCodeLens(yamlSchemaService, telemetry);
        const result = await codeLens.getCodeLens(doc);
        expect(result).has.length(2);
        expect(result).is.deep.equal([
            createCodeLens('schema1.json', commands_1.YamlCommands.JUMP_TO_SCHEMA, 'some://url/schema1.json'),
            createCodeLens('schema2.json', commands_1.YamlCommands.JUMP_TO_SCHEMA, 'some://url/schema2.json'),
        ]);
    });
});
//# sourceMappingURL=yamlCodeLens.test.js.map