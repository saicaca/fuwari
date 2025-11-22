"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const testHelper_1 = require("./utils/testHelper");
const verifyError_1 = require("./utils/verifyError");
const serviceSetup_1 = require("./utils/serviceSetup");
const errorMessages_1 = require("./utils/errorMessages");
const assert = require("assert");
const path = require("path");
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const chai_1 = require("chai");
const yamlSettings_1 = require("../src/yamlSettings");
const schemaUrls_1 = require("../src/languageservice/utils/schemaUrls");
describe('Validation Tests', () => {
    let languageSettingsSetup;
    let validationHandler;
    let languageService;
    let yamlSettings;
    let telemetry;
    let schemaProvider;
    before(() => {
        languageSettingsSetup = new serviceSetup_1.ServiceSetup()
            .withValidate()
            .withCompletion()
            .withCustomTags(['!Test', '!Ref sequence'])
            .withSchemaFileMatch({ uri: schemaUrls_1.KUBERNETES_SCHEMA_URL, fileMatch: ['.drone.yml'] })
            .withSchemaFileMatch({ uri: 'https://json.schemastore.org/drone', fileMatch: ['.drone.yml'] })
            .withSchemaFileMatch({ uri: schemaUrls_1.KUBERNETES_SCHEMA_URL, fileMatch: ['test.yml'] })
            .withSchemaFileMatch({
            uri: 'https://raw.githubusercontent.com/composer/composer/master/res/composer-schema.json',
            fileMatch: ['test.yml'],
        });
        const { languageService: langService, validationHandler: valHandler, yamlSettings: settings, telemetry: testTelemetry, schemaProvider: testSchemaProvider, } = (0, testHelper_1.setupLanguageService)(languageSettingsSetup.languageSettings);
        languageService = langService;
        validationHandler = valHandler;
        yamlSettings = settings;
        telemetry = testTelemetry;
        schemaProvider = testSchemaProvider;
    });
    function parseSetup(content, customSchemaID) {
        const testTextDocument = (0, testHelper_1.setupSchemaIDTextDocument)(content, customSchemaID);
        yamlSettings.documents = new yamlSettings_1.TextDocumentTestManager();
        yamlSettings.documents.set(testTextDocument);
        return validationHandler.validateTextDocument(testTextDocument);
    }
    afterEach(() => {
        schemaProvider.deleteSchema(testHelper_1.SCHEMA_ID);
    });
    describe('Boolean tests', () => {
        it('Boolean true test', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    analytics: {
                        type: 'boolean',
                    },
                },
            });
            const content = 'analytics: true';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
        it('Basic false test', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    analytics: {
                        type: 'boolean',
                    },
                },
            });
            const content = 'analytics: false';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
        it('Test that boolean value without quotations is valid', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    analytics: {
                        type: 'boolean',
                    },
                },
            });
            const content = '%YAML 1.1\n---\nanalytics: no';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
        it('Test that boolean value in quotations is interpreted as string not boolean', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    analytics: {
                        type: 'boolean',
                    },
                },
            });
            const content = 'analytics: "no"';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.strictEqual(result.length, 1);
                assert.deepStrictEqual(result[0], (0, verifyError_1.createDiagnosticWithData)(errorMessages_1.BooleanTypeError, 0, 11, 0, 15, vscode_languageserver_types_1.DiagnosticSeverity.Error, `yaml-schema: file:///${testHelper_1.SCHEMA_ID}`, `file:///${testHelper_1.SCHEMA_ID}`));
            })
                .then(done, done);
        });
        it('Error on incorrect value type (boolean)', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    cwd: {
                        type: 'string',
                    },
                },
            });
            const content = 'cwd: False';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 1);
                assert.deepEqual(result[0], (0, verifyError_1.createDiagnosticWithData)(errorMessages_1.StringTypeError, 0, 5, 0, 10, vscode_languageserver_types_1.DiagnosticSeverity.Error, `yaml-schema: file:///${testHelper_1.SCHEMA_ID}`, `file:///${testHelper_1.SCHEMA_ID}`));
            })
                .then(done, done);
        });
    });
    describe('String tests', () => {
        it('Test that boolean inside of quotations is of type string', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    analytics: {
                        type: 'string',
                    },
                },
            });
            const content = 'analytics: "no"';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
        it('Type string validates under children', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    scripts: {
                        type: 'object',
                        properties: {
                            register: {
                                type: 'string',
                            },
                        },
                    },
                },
            });
            const content = 'registry:\n  register: file://test_url';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
        it('Type String does not error on valid node', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    cwd: {
                        type: 'string',
                    },
                },
            });
            const content = 'cwd: this';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
        it('Error on incorrect value type (string)', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    analytics: {
                        type: 'boolean',
                    },
                },
            });
            const content = 'analytics: hello';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 1);
                assert.deepEqual(result[0], (0, verifyError_1.createDiagnosticWithData)(errorMessages_1.BooleanTypeError, 0, 11, 0, 16, vscode_languageserver_types_1.DiagnosticSeverity.Error, `yaml-schema: file:///${testHelper_1.SCHEMA_ID}`, `file:///${testHelper_1.SCHEMA_ID}`));
            })
                .then(done, done);
        });
        it('Test that boolean is invalid when no strings present and schema wants string', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    cwd: {
                        type: 'string',
                    },
                },
            });
            const content = '%YAML 1.1\n---\ncwd: no';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 1);
                assert.deepEqual(result[0], (0, verifyError_1.createDiagnosticWithData)(errorMessages_1.StringTypeError, 2, 5, 2, 7, vscode_languageserver_types_1.DiagnosticSeverity.Error, `yaml-schema: file:///${testHelper_1.SCHEMA_ID}`, `file:///${testHelper_1.SCHEMA_ID}`));
            })
                .then(done, done);
        });
    });
    describe('Pattern tests', () => {
        it('Test a valid Unicode pattern', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    prop: {
                        type: 'string',
                        pattern: '^tes\\p{Letter}$',
                    },
                },
            });
            parseSetup('prop: "tesT"')
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
        it('Test an invalid Unicode pattern', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    prop: {
                        type: 'string',
                        pattern: '^tes\\p{Letter}$',
                    },
                },
            });
            parseSetup('prop: "tes "')
                .then(function (result) {
                assert.equal(result.length, 1);
                assert.ok(result[0].message.startsWith('String does not match the pattern'));
                assert.deepEqual(result[0], (0, verifyError_1.createDiagnosticWithData)(result[0].message, 0, 6, 0, 12, vscode_languageserver_types_1.DiagnosticSeverity.Error, `yaml-schema: file:///${testHelper_1.SCHEMA_ID}`, `file:///${testHelper_1.SCHEMA_ID}`));
            })
                .then(done, done);
        });
        it('Test a valid Unicode patternProperty', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                patternProperties: {
                    '^tes\\p{Letter}$': true,
                },
                additionalProperties: false,
            });
            parseSetup('tesT: true')
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
        it('Test an invalid Unicode patternProperty', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                patternProperties: {
                    '^tes\\p{Letter}$': true,
                },
                additionalProperties: false,
            });
            parseSetup('tes9: true')
                .then(function (result) {
                assert.equal(result.length, 1);
                assert.deepEqual(result[0], (0, verifyError_1.createDiagnosticWithData)('Property tes9 is not allowed.', 0, 0, 0, 4, vscode_languageserver_types_1.DiagnosticSeverity.Error, `yaml-schema: file:///${testHelper_1.SCHEMA_ID}`, `file:///${testHelper_1.SCHEMA_ID}`));
            })
                .then(done, done);
        });
    });
    describe('Number tests', () => {
        it('Type Number does not error on valid node', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    timeout: {
                        type: 'number',
                    },
                },
            });
            const content = 'timeout: 60000';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
        it('Error on incorrect value type (number)', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    cwd: {
                        type: 'string',
                    },
                },
            });
            const content = 'cwd: 100000';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 1);
                assert.deepEqual(result[0], (0, verifyError_1.createDiagnosticWithData)(errorMessages_1.StringTypeError, 0, 5, 0, 11, vscode_languageserver_types_1.DiagnosticSeverity.Error, `yaml-schema: file:///${testHelper_1.SCHEMA_ID}`, `file:///${testHelper_1.SCHEMA_ID}`));
            })
                .then(done, done);
        });
    });
    describe('Null tests', () => {
        it('Basic test on nodes with null', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                additionalProperties: false,
                properties: {
                    columns: {
                        type: 'object',
                        patternProperties: {
                            '^[a-zA-Z]+$': {
                                type: 'object',
                                properties: {
                                    int: {
                                        type: 'null',
                                    },
                                    long: {
                                        type: 'null',
                                    },
                                    id: {
                                        type: 'null',
                                    },
                                    unique: {
                                        type: 'null',
                                    },
                                },
                                oneOf: [
                                    {
                                        required: ['int'],
                                    },
                                    {
                                        required: ['long'],
                                    },
                                ],
                            },
                        },
                    },
                },
            });
            const content = 'columns:\n  ColumnA: { int, id }\n  ColumnB: { long, unique }\n  ColumnC: { long, unique }';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
    });
    describe('Object tests', () => {
        it('Basic test on nodes with children', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    scripts: {
                        type: 'object',
                        properties: {
                            preinstall: {
                                type: 'string',
                            },
                            postinstall: {
                                type: 'string',
                            },
                        },
                    },
                },
            });
            const content = 'scripts:\n  preinstall: test1\n  postinstall: test2';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
        it('Test with multiple nodes with children', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    analytics: {
                        type: 'boolean',
                    },
                    cwd: {
                        type: 'string',
                    },
                    scripts: {
                        type: 'object',
                        properties: {
                            preinstall: {
                                type: 'string',
                            },
                            postinstall: {
                                type: 'string',
                            },
                        },
                    },
                },
            });
            const content = 'analytics: true\ncwd: this\nscripts:\n  preinstall: test1\n  postinstall: test2';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
        it('Type Object does not error on valid node', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    registry: {
                        type: 'object',
                        properties: {
                            search: {
                                type: 'string',
                            },
                        },
                    },
                },
            });
            const content = 'registry:\n  search: file://test_url';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
        it('Error on incorrect value type (object)', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                title: 'Object',
                properties: {
                    scripts: {
                        type: 'object',
                        properties: {
                            search: {
                                type: 'string',
                            },
                        },
                    },
                },
            });
            const content = 'scripts: test';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 1);
                assert.deepEqual(result[0], (0, verifyError_1.createDiagnosticWithData)('Incorrect type. Expected "object(Object)".', 0, 9, 0, 13, vscode_languageserver_types_1.DiagnosticSeverity.Error, `yaml-schema: Object`, `file:///${testHelper_1.SCHEMA_ID}`));
            })
                .then(done, done);
        });
    });
    describe('Array tests', () => {
        it('Type Array does not error on valid node', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    resolvers: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                },
            });
            const content = 'resolvers:\n  - test\n  - test\n  - test';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
        it('Error on incorrect value type (array)', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    resolvers: {
                        type: 'array',
                    },
                },
            });
            const content = 'resolvers: test';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 1);
                assert.deepEqual(result[0], (0, verifyError_1.createDiagnosticWithData)(errorMessages_1.ArrayTypeError, 0, 11, 0, 15, vscode_languageserver_types_1.DiagnosticSeverity.Error, `yaml-schema: file:///${testHelper_1.SCHEMA_ID}`, `file:///${testHelper_1.SCHEMA_ID}`));
            })
                .then(done, done);
        });
    });
    describe('Anchor tests', () => {
        it('Anchor should not error', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    default: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                            },
                        },
                    },
                },
            });
            const content = 'default: &DEFAULT\n  name: Anchor\nanchor_test:\n  <<: *DEFAULT';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
        it('Anchor with multiple references should not error', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    default: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                            },
                        },
                    },
                },
            });
            const content = 'default: &DEFAULT\n  name: Anchor\nanchor_test:\n  <<: *DEFAULT\nanchor_test2:\n  <<: *DEFAULT';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
        it('Multiple Anchor in array of references should not error', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    default: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                            },
                        },
                    },
                },
            });
            const content = 'default: &DEFAULT\n  name: Anchor\ncustomname: &CUSTOMNAME\n  custom_name: Anchor\nanchor_test:\n  <<: [*DEFAULT, *CUSTOMNAME]';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
        it('Multiple Anchors being referenced in same level at same time for yaml 1.1', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    customize: {
                        type: 'object',
                        properties: {
                            register: {
                                type: 'string',
                            },
                        },
                    },
                },
            });
            const content = '%YAML 1.1\n---\ndefault: &DEFAULT\n  name: Anchor\ncustomname: &CUSTOMNAME\n  custom_name: Anchor\nanchor_test:\n  <<: *DEFAULT\n  <<: *CUSTOMNAME\n';
            const result = await parseSetup(content);
            assert.strictEqual(result.length, 0);
        });
        it('Multiple Anchors being referenced in same level at same time for yaml generate error for 1.2', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    customize: {
                        type: 'object',
                        properties: {
                            register: {
                                type: 'string',
                            },
                        },
                    },
                },
            });
            const content = 'default: &DEFAULT\n  name: Anchor\ncustomname: &CUSTOMNAME\n  custom_name: Anchor\nanchor_test:\n  <<: *DEFAULT\n  <<: *CUSTOMNAME\n';
            const result = await parseSetup(content);
            assert.strictEqual(result.length, 1);
            assert.deepStrictEqual(result[0], (0, verifyError_1.createExpectedError)('Map keys must be unique', 6, 2, 6, 18, vscode_languageserver_types_1.DiagnosticSeverity.Error));
        });
        it('Nested object anchors should expand properly', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                additionalProperties: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                        akey: {
                            type: 'string',
                        },
                    },
                    required: ['akey'],
                },
            });
            const content = `
        l1: &l1
          akey: avalue

        l2: &l2
          <<: *l1

        l3: &l3
          <<: *l2

        l4:
          <<: *l3
      `;
            const validator = await parseSetup(content);
            assert.strictEqual(validator.length, 0);
        });
        it('Anchor reference with a validation error in a sub-object emits the error in the right location', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    src: {},
                    dest: {
                        type: 'object',
                        properties: {
                            outer: {
                                type: 'object',
                                required: ['otherkey'],
                            },
                        },
                    },
                },
                required: ['src', 'dest'],
            });
            const content = `
        src: &src
          outer:
            akey: avalue

        dest:
          <<: *src
      `;
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 1);
                // The key thing we're checking is *where* the validation error gets reported.
                // "outer" isn't required to contain "otherkey" inside "src", but it is inside
                // "dest". Since "outer" doesn't appear inside "dest" because of the alias, we
                // need to move the error into "src".
                assert.deepEqual(result[0], (0, verifyError_1.createDiagnosticWithData)(errorMessages_1.MissingRequiredPropWarning.replace('{0}', 'otherkey'), 2, 10, 2, 15, vscode_languageserver_types_1.DiagnosticSeverity.Error, `yaml-schema: file:///${testHelper_1.SCHEMA_ID}`, `file:///${testHelper_1.SCHEMA_ID}`));
            })
                .then(done, done);
        });
        it('Array Anchor merge', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    arr: {
                        type: 'array',
                        items: {
                            type: 'number',
                        },
                    },
                    obj: {
                        properties: {
                            arr2: {
                                type: 'array',
                                items: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            });
            const content = `
arr: &a
  - 1
  - 2
obj:
  <<: *a
  arr2:
    - << *a
`;
            const result = await parseSetup(content);
            assert.equal(result.length, 0);
        });
    });
    describe('Custom tag tests', () => {
        it('Custom Tags without type', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    analytics: {
                        type: 'boolean',
                    },
                },
            });
            const content = 'analytics: !Test false';
            const result = await parseSetup(content);
            assert.equal(result.length, 1);
            assert.deepStrictEqual(result[0], (0, verifyError_1.createDiagnosticWithData)(errorMessages_1.BooleanTypeError, 0, 17, 0, 22, vscode_languageserver_types_1.DiagnosticSeverity.Error, `yaml-schema: file:///${testHelper_1.SCHEMA_ID}`, `file:///${testHelper_1.SCHEMA_ID}`));
        });
        it('Custom Tags with type', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    resolvers: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                },
            });
            const content = 'resolvers: !Ref\n  - test';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
        it('Include with value should not error', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    customize: {
                        type: 'string',
                    },
                },
            });
            const content = 'customize: !include customize.yaml';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
        it('Include without value should error', (done) => {
            const content = 'customize: !include';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 1);
                assert.deepEqual(result[0], (0, verifyError_1.createExpectedError)(errorMessages_1.IncludeWithoutValueError, 0, 11, 0, 19));
            })
                .then(done, done);
        });
    });
    describe('Multiple type tests', function () {
        it('Do not error when there are multiple types in schema and theyre valid', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    license: {
                        type: ['string', 'boolean'],
                    },
                },
            });
            const content = 'license: MIT';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
    });
    describe('Invalid YAML errors', function () {
        it('Error when theres a finished untyped item', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    cwd: {
                        type: 'string',
                    },
                    analytics: {
                        type: 'boolean',
                    },
                },
            });
            const content = 'cwd: hello\nan';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 1);
                assert.deepEqual(result[0], (0, verifyError_1.createExpectedError)(errorMessages_1.BlockMappingEntryError, 1, 0, 1, 2));
            })
                .then(done, done);
        });
        it('Error when theres no value for a node', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    cwd: {
                        type: 'string',
                    },
                },
            });
            const content = 'cwd:';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 1);
                assert.deepEqual(result[0], (0, verifyError_1.createDiagnosticWithData)(errorMessages_1.StringTypeError, 0, 4, 0, 4, vscode_languageserver_types_1.DiagnosticSeverity.Error, `yaml-schema: file:///${testHelper_1.SCHEMA_ID}`, `file:///${testHelper_1.SCHEMA_ID}`));
            })
                .then(done, done);
        });
    });
    describe('Test with no schemas', () => {
        it('Duplicate properties are reported', (done) => {
            const content = 'kind: a\ncwd: b\nkind: c';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 1);
                assert.deepEqual(result[0], (0, verifyError_1.createExpectedError)(errorMessages_1.DuplicateKeyError, 2, 0, 2, 7));
            })
                .then(done, done);
        });
    });
    describe('Test anchors', function () {
        it('Test that anchors with a schema do not report Property << is not allowed', (done) => {
            const schema = {
                type: 'object',
                properties: {
                    sample: {
                        type: 'object',
                        properties: {
                            prop1: {
                                type: 'string',
                            },
                            prop2: {
                                type: 'string',
                            },
                        },
                        additionalProperties: false,
                    },
                },
                $schema: 'http://json-schema.org/draft-07/schema#',
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'test: &test\n  prop1: hello\nsample:\n  <<: *test\n  prop2: another_test';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
    });
    describe('Test with custom kubernetes schemas', function () {
        it('Test that properties that match multiple enums get validated properly', (done) => {
            languageService.configure(languageSettingsSetup.withKubernetes().languageSettings);
            yamlSettings.specificValidatorPaths = ['*.yml', '*.yaml'];
            const schema = {
                definitions: {
                    ImageStreamImport: {
                        type: 'object',
                        properties: {
                            kind: {
                                type: 'string',
                                enum: ['ImageStreamImport'],
                            },
                        },
                    },
                    ImageStreamLayers: {
                        type: 'object',
                        properties: {
                            kind: {
                                type: 'string',
                                enum: ['ImageStreamLayers'],
                            },
                        },
                    },
                },
                oneOf: [
                    {
                        $ref: '#/definitions/ImageStreamImport',
                    },
                    {
                        $ref: '#/definitions/ImageStreamLayers',
                    },
                ],
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'kind: ';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 2);
                // eslint-disable-next-line
                assert.equal(result[1].message, `Value is not accepted. Valid values: "ImageStreamImport", "ImageStreamLayers".`);
            })
                .then(done, done);
        });
    });
    // https://github.com/redhat-developer/yaml-language-server/issues/118
    describe('Null literals', () => {
        ['NULL', 'Null', 'null', '~', ''].forEach((content) => {
            it(`Test type null is parsed from [${content}]`, (done) => {
                const schema = {
                    type: 'object',
                    properties: {
                        nulltest: {
                            type: 'null',
                        },
                    },
                };
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const validator = parseSetup('nulltest: ' + content);
                validator
                    .then(function (result) {
                    assert.equal(result.length, 0);
                })
                    .then(done, done);
            });
        });
        it('Test type null is working correctly in array', (done) => {
            const schema = {
                properties: {
                    values: {
                        type: 'array',
                        items: {
                            type: 'null',
                        },
                    },
                },
                required: ['values'],
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'values: [Null, NULL, null, ~,]';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
    });
    describe('Multi Document schema validation tests', () => {
        it('Document does not error when --- is present with schema', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    cwd: {
                        type: 'string',
                    },
                },
            });
            const content = '---\n# this is a test\ncwd: this';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
        it('Multi Document does not error when --- is present with schema', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    cwd: {
                        type: 'string',
                    },
                },
            });
            const content = '---\n# this is a test\ncwd: this...\n---\n# second comment\ncwd: hello\n...';
            const validator = parseSetup(content);
            validator
                .then(function (result) {
                assert.equal(result.length, 0);
            })
                .then(done, done);
        });
    });
    describe('Schema with title', () => {
        it('validator uses schema title instead of url', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                title: 'Schema Super title',
                properties: {
                    analytics: {
                        type: 'string',
                    },
                },
            });
            const content = 'analytics: 1';
            const result = await parseSetup(content);
            (0, chai_1.expect)(result[0]).deep.equal((0, verifyError_1.createDiagnosticWithData)(errorMessages_1.StringTypeError, 0, 11, 0, 12, vscode_languageserver_types_1.DiagnosticSeverity.Error, 'yaml-schema: Schema Super title', 'file:///default_schema_id.yaml'));
        });
    });
    describe('Multiple schema for single file', () => {
        after(() => {
            // remove Kubernetes setting not to affect next tests
            languageService.configure(languageSettingsSetup.withKubernetes(false).languageSettings);
            yamlSettings.specificValidatorPaths = [];
        });
        it('should add proper source to diagnostic', async () => {
            const content = `
      abandoned: v1
      archive:
        exclude:
          asd: asd`;
            languageService.configure(languageSettingsSetup.withKubernetes().languageSettings);
            yamlSettings.specificValidatorPaths = ['*.yml', '*.yaml'];
            const result = await parseSetup(content, 'file://~/Desktop/vscode-yaml/test.yml');
            (0, chai_1.expect)(result[0]).deep.equal((0, verifyError_1.createDiagnosticWithData)(errorMessages_1.ArrayTypeError, 4, 10, 4, 18, vscode_languageserver_types_1.DiagnosticSeverity.Error, 'yaml-schema: Package', 'https://raw.githubusercontent.com/composer/composer/master/res/composer-schema.json'));
        });
        it('should add proper source to diagnostic in case of drone', async () => {
            const content = `
      apiVersion: v1
      kind: Deployment
      `;
            const result = await parseSetup(content, 'file://~/Desktop/vscode-yaml/.drone.yml');
            (0, chai_1.expect)(result[5]).deep.equal((0, verifyError_1.createDiagnosticWithData)((0, errorMessages_1.propertyIsNotAllowed)('apiVersion'), 1, 6, 1, 16, vscode_languageserver_types_1.DiagnosticSeverity.Error, 'yaml-schema: Drone CI configuration file', 'https://json.schemastore.org/drone', {
                properties: [
                    'type',
                    'environment',
                    'steps',
                    'volumes',
                    'services',
                    'image_pull_secrets',
                    'node',
                    'concurrency',
                    'name',
                    'platform',
                    'workspace',
                    'clone',
                    'trigger',
                    'depends_on',
                ],
            }));
        });
    });
    describe('Conditional Schema', () => {
        it('validator use "then" block if "if" valid', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                default: [],
                properties: {
                    name: {
                        type: 'string',
                    },
                    var: {
                        type: 'string',
                    },
                },
                if: {
                    properties: {
                        var: {
                            type: 'string',
                        },
                    },
                },
                then: {
                    required: ['pineapple'],
                },
                else: {
                    required: ['tomato'],
                },
                additionalProperties: true,
            });
            const content = `
      name: aName
      var: something
      inputs:`;
            const result = await parseSetup(content);
            (0, chai_1.expect)(result[0].message).to.eq('Missing property "pineapple".');
        });
        describe('filePatternAssociation', () => {
            const schema = {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                    },
                },
                if: {
                    filePatternAssociation: testHelper_1.SCHEMA_ID,
                },
                then: {
                    required: ['pineapple'],
                },
                else: {
                    required: ['tomato'],
                },
            };
            it('validator use "then" block if "if" match filePatternAssociation', async () => {
                schema.if.filePatternAssociation = testHelper_1.SCHEMA_ID;
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = 'name: aName';
                const result = await parseSetup(content);
                (0, chai_1.expect)(result.map((r) => r.message)).to.deep.eq(['Missing property "pineapple".']);
            });
            it('validator use "then" block if "if" match filePatternAssociation - regexp', async () => {
                schema.if.filePatternAssociation = '*.yaml'; // SCHEMA_ID: "default_schema_id.yaml"
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = 'name: aName';
                const result = await parseSetup(content);
                (0, chai_1.expect)(result.map((r) => r.message)).to.deep.eq(['Missing property "pineapple".']);
            });
            it('validator use "else" block if "if" not match filePatternAssociation', async () => {
                schema.if.filePatternAssociation = 'wrong';
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = 'name: aName';
                const result = await parseSetup(content);
                (0, chai_1.expect)(result.map((r) => r.message)).to.deep.eq(['Missing property "tomato".']);
            });
        });
    });
    describe('Schema with uri-reference', () => {
        it('should validate multiple uri-references', async () => {
            const schemaWithURIReference = {
                type: 'object',
                properties: {
                    one: {
                        type: 'string',
                        format: 'uri-reference',
                    },
                },
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schemaWithURIReference);
            let content = `
      one: '//foo/bar'
      `;
            let result = await parseSetup(content);
            (0, chai_1.expect)(result.length).to.eq(0);
            content = `
      one: '#/components/schemas/service'
      `;
            result = await parseSetup(content);
            (0, chai_1.expect)(result.length).to.eq(0);
            content = `
      one: 'some/relative/path/foo.schema.yaml'
      `;
            result = await parseSetup(content);
            (0, chai_1.expect)(result.length).to.eq(0);
            content = `
      one: 'http://foo/bar'
      `;
            result = await parseSetup(content);
            (0, chai_1.expect)(result.length).to.eq(0);
        });
        it('should not validate empty uri-reference', async () => {
            const schemaWithURIReference = {
                type: 'object',
                properties: {
                    one: {
                        type: 'string',
                        format: 'uri-reference',
                    },
                },
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schemaWithURIReference);
            const content = `
      one: ''
      `;
            const result = await parseSetup(content);
            (0, chai_1.expect)(result.length).to.eq(1);
            (0, chai_1.expect)(result[0].message).to.eq('String is not a URI: URI expected.');
        });
    });
    describe('Multiple similar schemas validation', () => {
        const sharedSchemaId = 'sharedSchema.json';
        before(() => {
            // remove Kubernetes setting set by previous test
            languageService.configure(languageSettingsSetup.withKubernetes(false).languageSettings);
            yamlSettings.specificValidatorPaths = [];
        });
        afterEach(() => {
            schemaProvider.deleteSchema(testHelper_1.SCHEMA_ID);
            schemaProvider.deleteSchema(sharedSchemaId);
        });
        it('should distinguish types in error "Incorrect type (Expected "type1 | type2 | type3")"', async () => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const schema = require(path.join(__dirname, './fixtures/testMultipleSimilarSchema.json'));
            schemaProvider.addSchemaWithUri(testHelper_1.SCHEMA_ID, 'file:///sharedSchema.json', schema.sharedSchema);
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema.schema);
            const content = 'test_anyOf_objects:\n  ';
            const result = await parseSetup(content);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].message, 'Incorrect type. Expected "type1 | type2 | type3".');
            assert.strictEqual(result[0].source, 'yaml-schema: file:///sharedSchema.json | file:///default_schema_id.yaml');
            assert.deepStrictEqual(result[0].data.schemaUri, [
                'file:///sharedSchema.json',
                'file:///default_schema_id.yaml',
            ]);
        });
        it('should combine types in "Incorrect type error"', async () => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const schema = require(path.join(__dirname, './fixtures/testMultipleSimilarSchema.json'));
            schemaProvider.addSchemaWithUri(testHelper_1.SCHEMA_ID, 'file:///sharedSchema.json', schema.sharedSchema);
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema.schema);
            const content = 'test_anyOf_objects:\n  propA:';
            const result = await parseSetup(content);
            assert.strictEqual(result.length, 3);
            assert.strictEqual(result[2].message, 'Incorrect type. Expected "string".');
            assert.strictEqual(result[2].source, 'yaml-schema: file:///sharedSchema.json | file:///default_schema_id.yaml');
        });
        it('should combine const value', async () => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const schema = require(path.join(__dirname, './fixtures/testMultipleSimilarSchema.json'));
            schemaProvider.addSchemaWithUri(testHelper_1.SCHEMA_ID, 'file:///sharedSchema.json', schema.sharedSchema);
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema.schema);
            const content = 'test_anyOf_objects:\n  constA:';
            const result = await parseSetup(content);
            assert.strictEqual(result.length, 4);
            assert.strictEqual(result[3].message, 'Value must be "constForType1" | "constForType3".');
            assert.strictEqual(result[3].source, 'yaml-schema: file:///sharedSchema.json | file:///default_schema_id.yaml');
        });
        it('should distinguish types in error: "Missing property from multiple schemas"', async () => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const schema = require(path.join(__dirname, './fixtures/testMultipleSimilarSchema.json'));
            schemaProvider.addSchemaWithUri(sharedSchemaId, 'file:///sharedSchema.json', schema.sharedSchema);
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema.schema);
            const content = 'test_anyOf_objects:\n  someProp:';
            const result = await parseSetup(content);
            assert.strictEqual(result.length, 3);
            assert.strictEqual(result[0].message, 'Missing property "objA".');
            assert.strictEqual(result[0].source, 'yaml-schema: file:///sharedSchema.json | file:///default_schema_id.yaml');
            assert.deepStrictEqual(result[0].data.schemaUri, [
                'file:///sharedSchema.json',
                'file:///default_schema_id.yaml',
            ]);
            assert.strictEqual(result[1].message, 'Missing property "propA".');
            assert.strictEqual(result[1].source, 'yaml-schema: file:///sharedSchema.json | file:///default_schema_id.yaml');
            assert.deepStrictEqual(result[1].data.schemaUri, [
                'file:///sharedSchema.json',
                'file:///default_schema_id.yaml',
            ]);
            assert.strictEqual(result[2].message, 'Missing property "constA".');
            assert.strictEqual(result[2].source, 'yaml-schema: file:///sharedSchema.json | file:///default_schema_id.yaml');
            assert.deepStrictEqual(result[2].data.schemaUri, [
                'file:///sharedSchema.json',
                'file:///default_schema_id.yaml',
            ]);
        });
    });
    describe('Empty document validation', () => {
        it('should provide validation for empty document', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    scripts: {
                        type: 'string',
                    },
                },
                required: ['scripts'],
            });
            const content = '';
            const result = await parseSetup(content);
            assert.strictEqual(result.length, 1);
            assert.deepStrictEqual(result[0], (0, verifyError_1.createDiagnosticWithData)(errorMessages_1.MissingRequiredPropWarning.replace('{0}', 'scripts'), 0, 0, 0, 0, vscode_languageserver_types_1.DiagnosticSeverity.Error, `yaml-schema: file:///${testHelper_1.SCHEMA_ID}`, `file:///${testHelper_1.SCHEMA_ID}`));
        });
        it('should provide validation for document which contains only whitespaces', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    scripts: {
                        type: 'string',
                    },
                },
                required: ['scripts'],
            });
            const content = '  \n   \n';
            const result = await parseSetup(content);
            assert.deepStrictEqual(result[0], (0, verifyError_1.createDiagnosticWithData)(errorMessages_1.MissingRequiredPropWarning.replace('{0}', 'scripts'), 0, 0, 0, 1, vscode_languageserver_types_1.DiagnosticSeverity.Error, `yaml-schema: file:///${testHelper_1.SCHEMA_ID}`, `file:///${testHelper_1.SCHEMA_ID}`));
        });
    });
    describe('Additional properties validation', () => {
        it('should allow additional props on object by default', async () => {
            const schema = {
                type: 'object',
                properties: {
                    prop1: {
                        type: 'string',
                    },
                },
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = `prop2: you could be there 'prop2'`;
            const result = await parseSetup(content);
            (0, chai_1.expect)(result.length).to.eq(0);
        });
        describe('Additional properties validation with enabled disableAdditionalProperties', () => {
            before(() => {
                languageSettingsSetup.languageSettings.disableAdditionalProperties = true;
                languageService.configure(languageSettingsSetup.languageSettings);
            });
            after(() => {
                languageSettingsSetup.languageSettings.disableAdditionalProperties = false;
            });
            it('should return additional prop error when there is extra prop', async () => {
                const schema = {
                    type: 'object',
                    properties: {
                        prop1: {
                            type: 'string',
                        },
                    },
                };
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = `prop2: you should not be there 'prop2'`;
                const result = await parseSetup(content);
                (0, chai_1.expect)(result.length).to.eq(1);
                (0, chai_1.expect)(result[0].message).to.eq('Property prop2 is not allowed.');
                (0, chai_1.expect)(result[0].data?.properties).to.deep.eq(['prop1']);
            });
            it('should return additional prop error when there is unknown prop - suggest missing props)', async () => {
                const schema = {
                    type: 'object',
                    properties: {
                        prop1: {
                            type: 'string',
                        },
                        prop2: {
                            type: 'string',
                        },
                    },
                };
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = `prop1: value1\npropX: you should not be there 'propX'`;
                const result = await parseSetup(content);
                (0, chai_1.expect)(result.map((r) => ({
                    message: r.message,
                    properties: r.data?.properties,
                }))).to.deep.eq([
                    {
                        message: 'Property propX is not allowed.',
                        properties: ['prop2'],
                    },
                ]);
            });
            it('should allow additional props on object when additionalProp is true on object', async () => {
                const schema = {
                    type: 'object',
                    properties: {
                        prop1: {
                            type: 'string',
                        },
                    },
                    additionalProperties: true,
                };
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = `prop2: you could be there 'prop2'`;
                const result = await parseSetup(content);
                (0, chai_1.expect)(result.length).to.eq(0);
            });
        });
    });
    describe('Bug fixes', () => {
        it('schema should validate additionalProp oneOf', async () => {
            const schema = {
                properties: {
                    env: {
                        $ref: 'https://json.schemastore.org/github-workflow.json#/definitions/env',
                    },
                },
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = `env: \${{ matrix.env1 }`;
            const result = await parseSetup(content);
            (0, chai_1.expect)(result).to.be.not.empty;
            (0, chai_1.expect)(telemetry.messages).to.be.empty;
            (0, chai_1.expect)(result.length).to.eq(1);
            assert.deepStrictEqual(result[0].message, 'String does not match the pattern of "^.*\\$\\{\\{(.|[\r\n])*\\}\\}.*$".');
        });
        it('schema should validate ipv4 format - Negative Case', async () => {
            const schema = {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'ipv4',
                },
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = `- 10.15.12.500`;
            const result = await parseSetup(content);
            (0, chai_1.expect)(result).to.be.not.empty;
            (0, chai_1.expect)(telemetry.messages).to.be.empty;
            (0, chai_1.expect)(result.length).to.eq(1);
            assert.deepStrictEqual(result[0].message, 'String does not match IPv4 format.');
        });
        it('schema should validate ipv4 format - Positive Case', async () => {
            const schema = {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'ipv4',
                },
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = `- 255.255.255.255`;
            const result = await parseSetup(content);
            (0, chai_1.expect)(result).to.be.empty;
            (0, chai_1.expect)(telemetry.messages).to.be.empty;
        });
        it('schema should validate ipv6 format - Negative Case', async () => {
            const schema = {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'ipv6',
                },
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = `- 10.15.12.500`;
            const result = await parseSetup(content);
            (0, chai_1.expect)(result).to.be.not.empty;
            (0, chai_1.expect)(telemetry.messages).to.be.empty;
            (0, chai_1.expect)(result.length).to.eq(1);
            assert.deepStrictEqual(result[0].message, 'String does not match IPv6 format.');
        });
        it('schema should validate ipv6 format - Positive Case', async () => {
            const schema = {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'ipv6',
                },
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = `- 2001:0db8:85a3:0000:0000:8a2e:0370:7334\n- 2001:0db8:85a3:0000:0000:8a2e:0370:7334\n- FEDC:BA98:7654:3210:FEDC:BA98:7654:3210\n- 1080::8:800:200C:417A\n- FF01::101\n- ::1`;
            const result = await parseSetup(content);
            (0, chai_1.expect)(result).to.be.empty;
            (0, chai_1.expect)(telemetry.messages).to.be.empty;
        });
        it('should handle not valid schema object', async () => {
            const schema = 'Foo';
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = `foo: bar`;
            const result = await parseSetup(content);
            (0, chai_1.expect)(result).to.have.length(1);
            (0, chai_1.expect)(result[0].message).to.include("Schema 'default_schema_id.yaml' is not valid");
            (0, chai_1.expect)(telemetry.messages).to.be.empty;
        });
        it('should handle bad schema refs', async () => {
            const schema = {
                type: 'object',
                properties: {
                    bar: {
                        oneOf: ['array', 'boolean'],
                    },
                },
                additionalProperties: true,
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = `bar: ddd`;
            const result = await parseSetup(content);
            (0, chai_1.expect)(result.length).to.eq(1);
            (0, chai_1.expect)(telemetry.messages).to.be.empty;
        });
        it('should not use same AST for completion and validation', async () => {
            const schema = {
                type: 'object',
                properties: {
                    container: {
                        type: 'object',
                        properties: {
                            image: {
                                type: 'string',
                            },
                            command: {
                                type: 'array',
                                items: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = `container:
  image: alpine
  command:
  - aaa
  - bbb
  - dddddd
  - ccc`;
            const testTextDocument = (0, testHelper_1.setupSchemaIDTextDocument)(content);
            yamlSettings.documents = new yamlSettings_1.TextDocumentTestManager();
            yamlSettings.documents.set(testTextDocument);
            await languageService.doComplete(testTextDocument, vscode_languageserver_types_1.Position.create(6, 8), false);
            const result = await validationHandler.validateTextDocument(testTextDocument);
            (0, chai_1.expect)(result).to.be.empty;
        });
    });
    describe('Enum tests', () => {
        afterEach(() => {
            schemaProvider.deleteSchema(testHelper_1.SCHEMA_ID);
        });
        it('Enum Validation with invalid enum value', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    first: {
                        type: 'string',
                        enum: ['a', 'b'],
                    },
                    second: {
                        type: 'number',
                        enum: [1, 2],
                    },
                },
            });
            const content = 'first: c\nsecond: 3';
            const result = await parseSetup(content);
            (0, chai_1.expect)(result.length).to.eq(2);
            (0, chai_1.expect)(telemetry.messages).to.be.empty;
        });
        it('Enum Validation with invalid type', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    first: {
                        type: 'string',
                        enum: ['a', 'b'],
                    },
                    second: {
                        type: 'number',
                        enum: [1, 2],
                    },
                },
            });
            const content = 'first: c\nsecond: a';
            const result = await parseSetup(content);
            (0, chai_1.expect)(result.length).to.eq(3);
            (0, chai_1.expect)(telemetry.messages).to.be.empty;
        });
        it('Enum Validation with invalid data', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                definitions: {
                    rule: {
                        description: 'A rule',
                        type: 'object',
                        properties: {
                            kind: {
                                description: 'The kind of rule',
                                type: 'string',
                                enum: ['tested'],
                            },
                        },
                        required: ['kind'],
                        additionalProperties: false,
                    },
                },
                properties: {
                    rules: {
                        description: 'Rule list',
                        type: 'array',
                        items: {
                            $ref: '#/definitions/rule',
                        },
                        minProperties: 1,
                        additionalProperties: false,
                    },
                },
            });
            const content = 'rules:\n    - kind: test';
            const result = await parseSetup(content);
            (0, chai_1.expect)(result.length).to.eq(1);
            (0, chai_1.expect)(result[0].message).to.eq('Value is not accepted. Valid values: "tested".');
        });
        it('value matches more than one schema in oneOf - but among one is format matches', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    repository: {
                        oneOf: [
                            {
                                type: 'string',
                                format: 'uri',
                            },
                            {
                                type: 'string',
                                pattern: '^@',
                            },
                        ],
                    },
                },
            });
            const content = `repository: '@bittrr'`;
            const result = await parseSetup(content);
            (0, chai_1.expect)(result.length).to.eq(0);
            (0, chai_1.expect)(telemetry.messages).to.be.empty;
        });
        it('value matches more than one schema in oneOf', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    foo: {},
                    bar: {},
                },
                oneOf: [
                    {
                        required: ['foo'],
                    },
                    {
                        required: ['bar'],
                    },
                ],
            });
            const content = `foo: bar\nbar: baz`;
            const result = await parseSetup(content);
            (0, chai_1.expect)(result.length).to.eq(1);
            (0, chai_1.expect)(result[0].message).to.eq('Matches multiple schemas when only one must validate.');
            (0, chai_1.expect)(telemetry.messages).to.be.empty;
        });
    });
    it('Nested AnyOf const should correctly evaluate and merge problems', async () => {
        // note that 'missing form property' is necessary to trigger the bug (there has to be some problem in both subSchemas)
        // order of the object in `anyOf` is also important
        const schema = {
            type: 'object',
            properties: {
                options: {
                    anyOf: [
                        {
                            type: 'object',
                            properties: {
                                form: {
                                    type: 'string',
                                },
                                provider: {
                                    type: 'string',
                                    const: 'test1',
                                },
                            },
                            required: ['form', 'provider'],
                        },
                        {
                            type: 'object',
                            properties: {
                                form: {
                                    type: 'string',
                                },
                                provider: {
                                    anyOf: [
                                        {
                                            type: 'string',
                                            const: 'testX',
                                        },
                                    ],
                                },
                            },
                            required: ['form', 'provider'],
                        },
                    ],
                },
            },
        };
        schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
        const content = `options:\n  provider: testX`;
        const result = await parseSetup(content);
        assert.deepEqual(result.map((e) => e.message), ['Missing property "form".'] // not inclide provider error
        );
    });
});
//# sourceMappingURL=schemaValidation.test.js.map