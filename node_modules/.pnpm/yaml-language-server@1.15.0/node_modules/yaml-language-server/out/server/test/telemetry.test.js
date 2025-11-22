"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chai = require("chai");
const schemaUrls_1 = require("../src/languageservice/utils/schemaUrls");
const telemetry_1 = require("../src/languageserver/telemetry");
const vscode_uri_1 = require("vscode-uri");
const expect = chai.expect;
chai.use(sinonChai);
describe('Telemetry Tests', () => {
    const sandbox = sinon.createSandbox();
    let telemetry;
    beforeEach(() => {
        const telemetryInstance = new telemetry_1.TelemetryImpl({});
        telemetry = sandbox.stub(telemetryInstance);
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('Kubernetos schema mapping', () => {
        it('should not report if schema is not k8s', () => {
            (0, schemaUrls_1.checkSchemaURI)([], vscode_uri_1.URI.parse('file:///some/path'), 'file:///some/path/to/schema.json', telemetry);
            expect(telemetry.send).not.called;
        });
        it('should report if schema is k8s', () => {
            (0, schemaUrls_1.checkSchemaURI)([], vscode_uri_1.URI.parse('file:///some/path'), 'kubernetes', telemetry);
            expect(telemetry.send).calledOnceWith({ name: 'yaml.schema.configured', properties: { kubernetes: true } });
        });
    });
});
//# sourceMappingURL=telemetry.test.js.map