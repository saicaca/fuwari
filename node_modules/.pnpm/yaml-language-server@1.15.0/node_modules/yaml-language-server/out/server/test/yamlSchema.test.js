"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const SchemaService = require("../src/languageservice/services/yamlSchemaService");
const url = require("url");
const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require("sinon-chai");
const expect = chai.expect;
chai.use(sinonChai);
const workspaceContext = {
    resolveRelativePath: (relativePath, resource) => {
        return url.resolve(resource, relativePath);
    },
};
describe('YAML Schema', () => {
    const sandbox = sinon.createSandbox();
    let requestServiceStub;
    beforeEach(() => {
        requestServiceStub = sandbox.stub();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('Loading yaml scheme', async () => {
        requestServiceStub.resolves(`
    properties:
      fooBar:
        items:
          type: string
        type: array
    type: object
    `);
        const service = new SchemaService.YAMLSchemaService(requestServiceStub, workspaceContext);
        const result = await service.loadSchema('fooScheme.yaml');
        expect(requestServiceStub.calledOnceWith('fooScheme.yaml'));
        expect(result.schema.properties['fooBar']).eql({
            items: { type: 'string' },
            type: 'array',
        });
    });
    it('Error while loading yaml', async () => {
        requestServiceStub.rejects();
        const service = new SchemaService.YAMLSchemaService(requestServiceStub, workspaceContext);
        const result = await service.loadSchema('fooScheme.yaml');
        expect(result.errors).length(1);
        expect(result.errors[0]).includes('Unable to load schema from');
    });
    it('Error while parsing yaml scheme', async () => {
        requestServiceStub.resolves(`%464*&^^&*%@$&^##$`);
        const service = new SchemaService.YAMLSchemaService(requestServiceStub, workspaceContext);
        const result = await service.loadSchema('fooScheme.yaml');
        expect(requestServiceStub.calledOnceWith('fooScheme.yaml'));
        expect(result.errors).length(1);
        expect(result.errors[0]).includes('Unable to parse content from');
    });
});
//# sourceMappingURL=yamlSchema.test.js.map