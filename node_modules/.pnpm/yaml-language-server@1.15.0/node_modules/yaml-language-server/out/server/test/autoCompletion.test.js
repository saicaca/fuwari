"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-var-requires */
const testHelper_1 = require("./utils/testHelper");
const assert = require("assert");
const path = require("path");
const verifyError_1 = require("./utils/verifyError");
const serviceSetup_1 = require("./utils/serviceSetup");
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const chai_1 = require("chai");
const yamlSettings_1 = require("../src/yamlSettings");
describe('Auto Completion Tests', () => {
    let languageSettingsSetup;
    let languageService;
    let languageHandler;
    let yamlSettings;
    let schemaProvider;
    before(() => {
        languageSettingsSetup = new serviceSetup_1.ServiceSetup().withCompletion().withSchemaFileMatch({
            uri: 'http://google.com',
            fileMatch: ['bad-schema.yaml'],
        });
        const { languageService: langService, languageHandler: langHandler, yamlSettings: settings, schemaProvider: testSchemaProvider, } = (0, testHelper_1.setupLanguageService)(languageSettingsSetup.languageSettings);
        languageService = langService;
        languageHandler = langHandler;
        yamlSettings = settings;
        schemaProvider = testSchemaProvider;
    });
    /**
     * Generates a completion list for the given document and caret (cursor) position.
     * @param content The content of the document.
     * @param position The position of the caret in the document.
     * Alternatively, `position` can be omitted if the caret is located in the content using `|` bookends.
     * For example, `content = 'ab|c|d'` places the caret over the `'c'`, at `position = 2`
     * @returns A list of valid completions.
     */
    function parseSetup(content, position) {
        if (typeof position === 'undefined') {
            ({ content, position } = (0, testHelper_1.caretPosition)(content));
        }
        const testTextDocument = (0, testHelper_1.setupSchemaIDTextDocument)(content);
        yamlSettings.documents = new yamlSettings_1.TextDocumentTestManager();
        yamlSettings.documents.set(testTextDocument);
        return languageHandler.completionHandler({
            position: testTextDocument.positionAt(position),
            textDocument: testTextDocument,
        });
    }
    afterEach(() => {
        schemaProvider.deleteSchema(testHelper_1.SCHEMA_ID);
        languageService.configure(languageSettingsSetup.languageSettings);
    });
    describe('YAML Completion Tests', function () {
        describe('JSON Schema Tests', function () {
            it('Autocomplete on root without word', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                        },
                    },
                });
                const content = '';
                const completion = parseSetup(content, 0);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('name', 'name: ', 0, 0, 0, 0, 10, 2, {
                        documentation: '',
                    }));
                })
                    .then(done, done);
            });
            it('Autocomplete on root with partial word', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                        },
                    },
                });
                const content = 'na'; // len: 2
                const completion = parseSetup(content, 2);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('name', 'name: ', 0, 0, 0, 2, 10, 2, {
                        documentation: '',
                    }));
                })
                    .then(done, done);
            });
            it('Autocomplete on default value (without :)', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            default: 'yaml',
                        },
                    },
                });
                const content = 'name'; // len: 4
                const completion = parseSetup(content, 10);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('name', 'name: ${1:yaml}', 0, 0, 0, 4, 10, 2, {
                        documentation: '',
                    }));
                })
                    .then(done, done);
            });
            it('Autocomplete on default value (without value content)', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            default: 'yaml',
                        },
                    },
                });
                const content = 'name: '; // len: 6
                const completion = parseSetup(content, 12);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('yaml', 'yaml', 0, 6, 0, 6, 12, 2, {
                        detail: 'Default value',
                    }));
                })
                    .then(done, done);
            });
            it('Autocomplete on default value with \\"', async () => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            default: '"yaml"',
                        },
                    },
                });
                const content = 'name: '; // len: 6
                const completion = await parseSetup(content, 6);
                assert.strictEqual(completion.items.length, 1);
                assert.deepStrictEqual(completion.items[0], (0, verifyError_1.createExpectedCompletion)('"yaml"', '"yaml"', 0, 6, 0, 6, 12, 2, {
                    detail: 'Default value',
                }));
            });
            it('Autocomplete name and value with \\"', async () => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            default: '"yaml"',
                        },
                    },
                });
                const content = 'nam|e|'; // len: 4, pos: 3
                const completion = await parseSetup(content);
                assert.strictEqual(completion.items.length, 1);
                assert.deepStrictEqual(completion.items[0], (0, verifyError_1.createExpectedCompletion)('name', 'name: ${1:"yaml"}', 0, 0, 0, 4, 10, 2, {
                    documentation: '',
                }));
            });
            it('Autocomplete on default value (with value content)', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            default: 'yaml',
                        },
                    },
                });
                const content = 'name: ya'; // len: 8
                const completion = parseSetup(content, 15);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('yaml', 'yaml', 0, 6, 0, 8, 12, 2, {
                        detail: 'Default value',
                    }));
                })
                    .then(done, done);
            });
            it('Autocomplete on default value (with value content contains dash)', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            default: 'yaml-language',
                        },
                    },
                });
                const content = 'name: yaml-';
                const completion = parseSetup(content, content.length);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('yaml-language', 'yaml-language', 0, 6, 0, 11, 12, 2, {
                        detail: 'Default value',
                    }));
                })
                    .then(done, done);
            });
            it('Autocomplete on boolean value (without value content)', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        yaml: {
                            type: 'boolean',
                        },
                    },
                });
                const content = 'yaml: '; // len: 6
                const completion = parseSetup(content, 11);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 2);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('true', 'true', 0, 6, 0, 6, 12, 2, {
                        documentation: '',
                    }));
                    assert.deepEqual(result.items[1], (0, verifyError_1.createExpectedCompletion)('false', 'false', 0, 6, 0, 6, 12, 2, {
                        documentation: '',
                    }));
                })
                    .then(done, done);
            });
            it('Autocomplete on boolean value with key of `null`', () => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        validation: {
                            type: 'object',
                            additionalProperties: false,
                            properties: {
                                null: {
                                    type: 'boolean',
                                    default: false,
                                },
                            },
                        },
                    },
                });
                const content = ''; // len: 0
                const completion = parseSetup(content, 0);
                completion.then(function (result) {
                    (0, chai_1.expect)(result.items.length).equal(1);
                    (0, chai_1.expect)(result.items[0].insertText).equal('validation:\n  \\"null\\": ${1:false}');
                });
            });
            it('Autocomplete on boolean value (with value content)', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        yaml: {
                            type: 'boolean',
                        },
                    },
                });
                const content = 'yaml: fal'; // len: 9
                const completion = parseSetup(content, 11);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 2);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('true', 'true', 0, 6, 0, 9, 12, 2, {
                        documentation: '',
                    }));
                    assert.deepEqual(result.items[1], (0, verifyError_1.createExpectedCompletion)('false', 'false', 0, 6, 0, 9, 12, 2, {
                        documentation: '',
                    }));
                })
                    .then(done, done);
            });
            it('Autocomplete on number value (without value content)', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        timeout: {
                            type: 'number',
                            default: 60000,
                        },
                    },
                });
                const content = 'timeout: '; // len: 9
                const completion = parseSetup(content, 9);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('60000', '60000', 0, 9, 0, 9, 12, 2, {
                        detail: 'Default value',
                    }));
                })
                    .then(done, done);
            });
            it('Autocomplete on number value (with value content)', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        timeout: {
                            type: 'number',
                            default: 60000,
                        },
                    },
                });
                const content = 'timeout: 6'; // len: 10
                const completion = parseSetup(content, 10);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('60000', '60000', 0, 9, 0, 10, 12, 2, {
                        detail: 'Default value',
                    }));
                })
                    .then(done, done);
            });
            it('Autocomplete key in middle of file', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        scripts: {
                            type: 'object',
                            properties: {
                                sample: {
                                    type: 'string',
                                    enum: ['test'],
                                },
                            },
                        },
                    },
                });
                const content = 'scripts:\n  |s|ample'; // len: 17, pos: 11
                const completion = parseSetup(content);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('sample', 'sample: ${1:test}', 1, 2, 1, 8, 10, 2, {
                        documentation: '',
                    }));
                })
                    .then(done, done);
            });
            it('Autocomplete key with default value in middle of file', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        scripts: {
                            type: 'object',
                            properties: {
                                sample: {
                                    type: 'string',
                                    default: 'test',
                                },
                            },
                        },
                    },
                });
                const content = 'scripts:\n  |s|am'; // len: 14, pos: 11
                const completion = parseSetup(content);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('sample', 'sample: ${1:test}', 1, 2, 1, 5, 10, 2, {
                        documentation: '',
                    }));
                })
                    .then(done, done);
            });
            it('Autocomplete without default value - not required', async () => {
                const languageSettingsSetup = new serviceSetup_1.ServiceSetup().withCompletion();
                languageSettingsSetup.languageSettings.disableDefaultProperties = true;
                languageService.configure(languageSettingsSetup.languageSettings);
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        scripts: {
                            type: 'object',
                            properties: {
                                sample: {
                                    type: 'string',
                                    default: 'test',
                                },
                                objectSample: {
                                    type: 'object',
                                },
                            },
                        },
                    },
                });
                const content = '';
                const result = await parseSetup(content, 0);
                (0, chai_1.expect)(result.items.length).to.be.equal(1);
                (0, chai_1.expect)(result.items[0]).to.deep.equal((0, verifyError_1.createExpectedCompletion)('scripts', 'scripts:\n  ', 0, 0, 0, 0, 10, 2, {
                    documentation: '',
                }));
            });
            it('Autocomplete without default value - required', async () => {
                const languageSettingsSetup = new serviceSetup_1.ServiceSetup().withCompletion();
                languageSettingsSetup.languageSettings.disableDefaultProperties = true;
                languageService.configure(languageSettingsSetup.languageSettings);
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        scripts: {
                            type: 'object',
                            properties: {
                                sample: {
                                    type: 'string',
                                    default: 'test',
                                },
                                objectSample: {
                                    type: 'object',
                                },
                            },
                            required: ['sample', 'objectSample'],
                        },
                    },
                });
                const content = '';
                const result = await parseSetup(content, 0);
                (0, chai_1.expect)(result.items.length).to.be.equal(1);
                (0, chai_1.expect)(result.items[0]).to.deep.equal((0, verifyError_1.createExpectedCompletion)('scripts', 'scripts:\n  sample: ${1:test}\n  objectSample:\n    $2', 0, 0, 0, 0, 10, 2, {
                    documentation: '',
                }));
            });
            it('Autocomplete second key in middle of file', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        scripts: {
                            type: 'object',
                            properties: {
                                sample: {
                                    type: 'string',
                                    enum: ['test'],
                                },
                                myOtherSample: {
                                    type: 'string',
                                    enum: ['test'],
                                },
                            },
                        },
                    },
                });
                const content = 'scripts:\n  sample: test\n  myOth|e|r'; // len: 33, pos: 31
                const completion = parseSetup(content);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('myOtherSample', 'myOtherSample: ${1:test}', 2, 2, 2, 9, 10, 2, {
                        documentation: '',
                    }));
                })
                    .then(done, done);
            });
            it('Autocomplete does not happen right after key object', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        timeout: {
                            type: 'number',
                            default: 60000,
                        },
                    },
                });
                const content = 'timeout:'; // len: 8
                const completion = parseSetup(content, 9);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 0);
                })
                    .then(done, done);
            });
            it('Autocomplete does not happen right after : under an object', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        scripts: {
                            type: 'object',
                            properties: {
                                sample: {
                                    type: 'string',
                                    enum: ['test'],
                                },
                                myOtherSample: {
                                    type: 'string',
                                    enum: ['test'],
                                },
                            },
                        },
                    },
                });
                const content = 'scripts:\n  sample:'; // len: 18
                const completion = parseSetup(content, 21);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 0);
                })
                    .then(done, done);
            });
            it('Autocomplete with defaultSnippet markdown', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        scripts: {
                            type: 'object',
                            properties: {},
                            defaultSnippets: [
                                {
                                    label: 'myOtherSample snippet',
                                    body: { myOtherSample: {} },
                                    markdownDescription: 'snippet\n```yaml\nmyOtherSample:\n```\n',
                                },
                            ],
                        },
                    },
                });
                const content = 'scripts: ';
                const completion = parseSetup(content, content.length);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.equal(result.items[0].insertText, '\n  myOtherSample:');
                    assert.equal(result.items[0].documentation.value, 'snippet\n```yaml\nmyOtherSample:\n```\n');
                })
                    .then(done, done);
            });
            it('Autocomplete on multi yaml documents in a single file on root', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        timeout: {
                            type: 'number',
                            default: 60000,
                        },
                    },
                });
                const content = '---\ntimeout: 10\n...\n---\n...'; // len: 27
                const completion = parseSetup(content, 28);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('timeout', 'timeout: ${1:60000}', 4, 0, 4, 3, 10, 2, {
                        documentation: '',
                    }));
                })
                    .then(done, done);
            });
            it('Autocomplete on multi yaml documents in a single file on scalar', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        timeout: {
                            type: 'number',
                            default: 60000,
                        },
                    },
                });
                const content = '---\ntimeout: 10\n...\n---\nti|m|e \n...'; // len: 33, pos: 26
                const completion = parseSetup(content);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('timeout', 'timeout: ${1:60000}', 4, 0, 4, 4, 10, 2, {
                        documentation: '',
                    }));
                })
                    .then(done, done);
            });
            it('Autocompletion has no results on value when they are not available', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        time: {
                            type: 'string',
                        },
                    },
                });
                const content = 'time: '; // len: 6
                const completion = parseSetup(content, 6);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 0);
                })
                    .then(done, done);
            });
            it('Test that properties that have multiple types get auto completed properly', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        scripts: {
                            type: ['string', 'boolean'],
                            enum: ['test', false, true],
                        },
                    },
                });
                const content = 'scripts: '; // len: 9
                const completion = parseSetup(content, 9);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 3);
                    assert.equal(result.items[0].label, 'test');
                    assert.equal(result.items[1].label, 'false');
                    assert.equal(result.items[2].label, 'true');
                })
                    .then(done, done);
            });
            it('Test that properties that have multiple enums get auto completed properly', (done) => {
                const schema = {
                    definitions: {
                        ImageBuild: {
                            type: 'object',
                            properties: {
                                kind: {
                                    type: 'string',
                                    enum: ['ImageBuild', 'ImageBuilder'],
                                },
                            },
                        },
                        ImageStream: {
                            type: 'object',
                            properties: {
                                kind: {
                                    type: 'string',
                                    enum: ['ImageStream', 'ImageStreamBuilder'],
                                },
                            },
                        },
                    },
                    oneOf: [
                        {
                            $ref: '#/definitions/ImageBuild',
                        },
                        {
                            $ref: '#/definitions/ImageStream',
                        },
                    ],
                };
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = 'kind: '; // len: 6
                const validator = parseSetup(content, 6);
                validator
                    .then(function (result) {
                    assert.equal(result.items.length, 4);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('ImageBuild', 'ImageBuild', 0, 6, 0, 6, 12, 2, {
                        documentation: undefined,
                    }));
                    assert.deepEqual(result.items[1], (0, verifyError_1.createExpectedCompletion)('ImageBuilder', 'ImageBuilder', 0, 6, 0, 6, 12, 2, {
                        documentation: undefined,
                    }));
                    assert.deepEqual(result.items[2], (0, verifyError_1.createExpectedCompletion)('ImageStream', 'ImageStream', 0, 6, 0, 6, 12, 2, {
                        documentation: undefined,
                    }));
                    assert.deepEqual(result.items[3], (0, verifyError_1.createExpectedCompletion)('ImageStreamBuilder', 'ImageStreamBuilder', 0, 6, 0, 6, 12, 2, {
                        documentation: undefined,
                    }));
                })
                    .then(done, done);
            });
            it('Insert required attributes at correct level', (done) => {
                const schema = require(path.join(__dirname, './fixtures/testRequiredProperties.json'));
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = '- top:\n    prop1: demo\n- ';
                const completion = parseSetup(content, content.length);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('top', 'top:\n      prop1: ', 2, 2, 2, 2, 10, 2, {
                        documentation: '',
                    }));
                })
                    .then(done, done);
            });
            it('Insert required attributes at correct level even on first element', (done) => {
                const schema = require(path.join(__dirname, './fixtures/testRequiredProperties.json'));
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = '- ';
                const completion = parseSetup(content, content.length);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('top', 'top:\n    prop1: ', 0, 2, 0, 2, 10, 2, {
                        documentation: '',
                    }));
                })
                    .then(done, done);
            });
            it('Provide the 3 types when none provided', (done) => {
                const schema = require(path.join(__dirname, './fixtures/testArrayMaxProperties.json'));
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = '- ';
                const completion = parseSetup(content, content.length);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 3);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('prop1', 'prop1: ', 0, 2, 0, 2, 10, 2, {
                        documentation: '',
                    }));
                    assert.deepEqual(result.items[1], (0, verifyError_1.createExpectedCompletion)('prop2', 'prop2: ', 0, 2, 0, 2, 10, 2, {
                        documentation: '',
                    }));
                    assert.deepEqual(result.items[2], (0, verifyError_1.createExpectedCompletion)('prop3', 'prop3: ', 0, 2, 0, 2, 10, 2, {
                        documentation: '',
                    }));
                })
                    .then(done, done);
            });
            it('Provide the 2 types when one is provided', (done) => {
                const schema = require(path.join(__dirname, './fixtures/testArrayMaxProperties.json'));
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = '- prop1:\n  ';
                const completion = parseSetup(content, content.length);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 2);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('prop2', 'prop2: ', 1, 2, 1, 2, 10, 2, {
                        documentation: '',
                    }));
                    assert.deepEqual(result.items[1], (0, verifyError_1.createExpectedCompletion)('prop3', 'prop3: ', 1, 2, 1, 2, 10, 2, {
                        documentation: '',
                    }));
                })
                    .then(done, done);
            });
            it('Provide the 2 types when one is provided and the second is typed', (done) => {
                const schema = require(path.join(__dirname, './fixtures/testArrayMaxProperties.json'));
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = '- prop1:\n  p';
                const completion = parseSetup(content, content.length);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 2);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('prop2', 'prop2: ', 1, 2, 1, 3, 10, 2, {
                        documentation: '',
                    }));
                    assert.deepEqual(result.items[1], (0, verifyError_1.createExpectedCompletion)('prop3', 'prop3: ', 1, 2, 1, 3, 10, 2, {
                        documentation: '',
                    }));
                })
                    .then(done, done);
            });
            it('Provide no completion when maxProperties reached', (done) => {
                const schema = require(path.join(__dirname, './fixtures/testArrayMaxProperties.json'));
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = '- prop1:\n  prop2:\n  ';
                const completion = parseSetup(content, content.length);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 0);
                })
                    .then(done, done);
            });
            it('Autocompletion should escape @', async () => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        '@type': {
                            type: 'string',
                            enum: ['foo'],
                        },
                    },
                });
                const content = '';
                const completion = await parseSetup(content, 0);
                (0, chai_1.expect)(completion.items.length).to.be.equal(1);
                (0, chai_1.expect)(completion.items[0]).to.deep.equal((0, verifyError_1.createExpectedCompletion)('@type', '"@type": ${1:foo}', 0, 0, 0, 0, 10, 2, {
                    documentation: '',
                }));
            });
            it('Autocompletion should escape colon when indicating map', async () => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        'test: colon': {
                            type: 'object',
                            properties: {
                                none: {
                                    type: 'boolean',
                                    enum: [true],
                                },
                            },
                        },
                    },
                });
                const content = '';
                const completion = await parseSetup(content, 0);
                (0, chai_1.expect)(completion.items.length).to.be.equal(1);
                (0, chai_1.expect)(completion.items[0]).to.deep.equal((0, verifyError_1.createExpectedCompletion)('test: colon', '"test: colon":\n  ', 0, 0, 0, 0, 10, 2, {
                    documentation: '',
                }));
            });
            it('Autocompletion should not escape colon when no white-space following', async () => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        'test:colon': {
                            type: 'object',
                            properties: {
                                none: {
                                    type: 'boolean',
                                    enum: [true],
                                },
                            },
                        },
                    },
                });
                const content = '';
                const completion = await parseSetup(content, 0);
                (0, chai_1.expect)(completion.items.length).to.be.equal(1);
                (0, chai_1.expect)(completion.items[0]).to.deep.equal((0, verifyError_1.createExpectedCompletion)('test:colon', 'test:colon:\n  ', 0, 0, 0, 0, 10, 2, {
                    documentation: '',
                }));
            });
            it('Autocompletion should not escape colon when no key part present', async () => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        ':colon': {
                            type: 'object',
                            properties: {
                                none: {
                                    type: 'boolean',
                                    enum: [true],
                                },
                            },
                        },
                    },
                });
                const content = '';
                const completion = await parseSetup(content, 0);
                (0, chai_1.expect)(completion.items.length).to.be.equal(1);
                (0, chai_1.expect)(completion.items[0]).to.deep.equal((0, verifyError_1.createExpectedCompletion)(':colon', ':colon:\n  ', 0, 0, 0, 0, 10, 2, {
                    documentation: '',
                }));
            });
            describe('Conditional Schema', () => {
                const schema = {
                    type: 'object',
                    title: 'basket',
                    properties: {
                        name: { type: 'string' },
                    },
                    if: {
                        filePatternAssociation: testHelper_1.SCHEMA_ID,
                    },
                    then: {
                        properties: {
                            pineapple: { type: 'string' },
                        },
                        required: ['pineapple'],
                    },
                    else: {
                        properties: {
                            tomato: { type: 'string' },
                        },
                        required: ['tomato'],
                    },
                };
                it('should suggest "then" block if "if" match filePatternAssociation', async () => {
                    schema.if.filePatternAssociation = testHelper_1.SCHEMA_ID;
                    schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                    const content = 'name: aName\n ';
                    const completion = await parseSetup(content, content.length);
                    (0, chai_1.expect)(completion.items.map((i) => i.label)).to.deep.equal(['pineapple', 'basket']);
                });
            });
        });
        describe('Array Specific Tests', function () {
            it('Should insert empty array item', (done) => {
                const schema = require(path.join(__dirname, './fixtures/testStringArray.json'));
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = 'fooBa'; // len: 5
                const completion = parseSetup(content, content.lastIndexOf('Ba') + 2); // pos: 3+2
                completion
                    .then(function (result) {
                    assert.strictEqual('fooBar:\n  - ${1}', result.items[0].insertText);
                })
                    .then(done, done);
            });
            it('Array autocomplete without word and extra space', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        authors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: {
                                        type: 'string',
                                    },
                                },
                            },
                        },
                    },
                });
                const content = 'authors:\n  - '; // len: 13
                const completion = parseSetup(content, 14);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('name', 'name: ', 1, 4, 1, 4, 10, 2, {
                        documentation: '',
                    }));
                })
                    .then(done, done);
            });
            it('Array autocomplete without word and autocompletion beside -', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        authors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: {
                                        type: 'string',
                                    },
                                },
                            },
                        },
                    },
                });
                const content = 'authors:\n  -'; // len: 12
                const completion = parseSetup(content, 13);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('name', ' name: ', 1, 3, 1, 3, 10, 2, {
                        documentation: '',
                    }));
                })
                    .then(done, done);
            });
            it('Array autocomplete without word on space before array symbol', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        authors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: {
                                        type: 'string',
                                    },
                                    email: {
                                        type: 'string',
                                    },
                                },
                            },
                        },
                    },
                });
                const content = 'authors:\n  - name: test\n  '; // len: 26
                const completion = parseSetup(content, 26);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('- (array item) object', '- ', 2, 2, 2, 2, 9, 2, {
                        documentation: { kind: 'markdown', value: 'Create an item of an array type `object`\n ```\n- \n```' },
                    }));
                })
                    .then(done, done);
            });
            it('Array autocomplete on empty node with array from schema', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        authors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: {
                                        type: 'string',
                                    },
                                    email: {
                                        type: 'string',
                                    },
                                },
                            },
                        },
                    },
                });
                const content = 'authors:\n'; // len: 9
                const completion = parseSetup(content, 9);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('- (array item) object', '- ', 1, 0, 1, 0, 9, 2, {
                        documentation: { kind: 'markdown', value: 'Create an item of an array type `object`\n ```\n- \n```' },
                    }));
                })
                    .then(done, done);
            });
            it('Array autocomplete with letter', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        authors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: {
                                        type: 'string',
                                    },
                                },
                            },
                        },
                    },
                });
                const content = 'authors:\n  - n'; // len: 14
                const completion = parseSetup(content, 14);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('name', 'name: ', 1, 4, 1, 5, 10, 2, {
                        documentation: '',
                    }));
                })
                    .then(done, done);
            });
            it('Array autocomplete without word (second item)', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        authors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: {
                                        type: 'string',
                                    },
                                    email: {
                                        type: 'string',
                                    },
                                },
                            },
                        },
                    },
                });
                const content = 'authors:\n  - name: test\n    '; // len: 28
                const completion = parseSetup(content, 32);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('email', 'email: ', 2, 4, 2, 4, 10, 2, {
                        documentation: '',
                    }));
                })
                    .then(done, done);
            });
            it('Array autocomplete with letter (second item)', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        authors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: {
                                        type: 'string',
                                    },
                                    email: {
                                        type: 'string',
                                    },
                                },
                            },
                        },
                    },
                });
                const content = 'authors:\n  - name: test\n   | |e'; // len: 29, pos: 27
                const completion = parseSetup(content);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('email', 'email: ', 2, 3, 2, 3, 10, 2, {
                        documentation: '',
                    }));
                })
                    .then(done, done);
            });
            it('Autocompletion after array', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        authors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: {
                                        type: 'string',
                                    },
                                    email: {
                                        type: 'string',
                                    },
                                },
                            },
                        },
                        load: {
                            type: 'boolean',
                        },
                    },
                });
                const content = 'authors:\n  - name: test\n'; // len: 24
                const completion = parseSetup(content, 24);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('load', 'load: ', 2, 0, 2, 0, 10, 2, {
                        documentation: '',
                    }));
                })
                    .then(done, done);
            });
            it('Autocompletion after array with depth - no indent', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        archive: {
                            type: 'object',
                            properties: {
                                exclude: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: {
                                                type: 'string',
                                                default: 'test',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        include: {
                            type: 'string',
                            default: 'test',
                        },
                    },
                });
                const content = 'archive:\n  exclude:\n    - name: test\n|\n|'; // len: 38, pos: 37
                const completion = parseSetup(content); //don't test on the last row
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    const expectedCompletion = (0, verifyError_1.createExpectedCompletion)('include', 'include: ${1:test}', 3, 0, 3, 0, 10, 2, {
                        documentation: '',
                    });
                    assert.deepEqual(result.items[0], expectedCompletion);
                })
                    .then(done, done);
            });
            it('Autocompletion after array with depth - indent', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        archive: {
                            type: 'object',
                            properties: {
                                exclude: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: {
                                                type: 'string',
                                                default: 'test',
                                            },
                                        },
                                    },
                                },
                                include: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                });
                const content = 'archive:\n  exclude:\n    - nam\n    | |'; // len: 35, pos: 34
                const completion = parseSetup(content);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('- (array item) object', '- name: ${1:test}', 3, 4, 3, 5, 9, 2, {
                        documentation: { kind: 'markdown', value: 'Create an item of an array type `object`\n ```\n- name: test\n```' },
                    }));
                })
                    .then(done, done);
            });
            it('Array of enum autocomplete without word on array symbol', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        references: {
                            type: 'array',
                            items: {
                                enum: ['Test'],
                            },
                        },
                    },
                });
                const content = 'references:\n  -'; // len: 15
                const completion = parseSetup(content, 29);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('Test', ' Test', 1, 3, 1, 3, 12, 2, {
                        documentation: undefined,
                    }));
                })
                    .then(done, done);
            });
            it('Array of enum autocomplete without word', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        references: {
                            type: 'array',
                            items: {
                                enum: ['Test'],
                            },
                        },
                    },
                });
                const content = 'references:\n  - '; // len: 16
                const completion = parseSetup(content, 30);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('Test', 'Test', 1, 4, 1, 4, 12, 2, {
                        documentation: undefined,
                    }));
                })
                    .then(done, done);
            });
            it('Array of enum autocomplete with letter', (done) => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        references: {
                            type: 'array',
                            items: {
                                enum: ['Test'],
                            },
                        },
                    },
                });
                const content = 'references:\n  - T'; // len: 17
                const completion = parseSetup(content, 31);
                completion
                    .then(function (result) {
                    assert.equal(result.items.length, 1);
                    assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('Test', 'Test', 1, 4, 1, 5, 12, 2, {
                        documentation: undefined,
                    }));
                })
                    .then(done, done);
            });
            it('Array of objects autocomplete with 4 space indentation check', async () => {
                const languageSettingsSetup = new serviceSetup_1.ServiceSetup().withCompletion().withIndentation('    ');
                languageService.configure(languageSettingsSetup.languageSettings);
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                    type: 'object',
                    properties: {
                        metadata: {
                            type: 'object',
                            properties: {
                                ownerReferences: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            apiVersion: {
                                                type: 'string',
                                            },
                                            kind: {
                                                type: 'string',
                                            },
                                            name: {
                                                type: 'string',
                                            },
                                            uid: {
                                                type: 'string',
                                            },
                                        },
                                        required: ['apiVersion', 'kind', 'name', 'uid'],
                                    },
                                },
                            },
                        },
                    },
                });
                const content = 'metadata:\n    ownerReferences'; // len: 29
                const completion = await parseSetup(content, 29);
                (0, chai_1.expect)(completion.items[0]).deep.eq((0, verifyError_1.createExpectedCompletion)('ownerReferences', 'ownerReferences:\n    - apiVersion: $1\n      kind: $2\n      name: $3\n      uid: $4', 1, 4, 1, 19, 10, 2, { documentation: '' }));
            });
        });
        it('Array of objects autocomplete with 2 space indentation check', async () => {
            const languageSettingsSetup = new serviceSetup_1.ServiceSetup().withCompletion().withIndentation('  ');
            languageService.configure(languageSettingsSetup.languageSettings);
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    metadata: {
                        type: 'object',
                        properties: {
                            ownerReferences: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        apiVersion: {
                                            type: 'string',
                                        },
                                        kind: {
                                            type: 'string',
                                        },
                                        name: {
                                            type: 'string',
                                        },
                                        uid: {
                                            type: 'string',
                                        },
                                    },
                                    required: ['apiVersion', 'kind', 'name', 'uid'],
                                },
                            },
                        },
                    },
                },
            });
            const content = 'metadata:\n  ownerReferences'; // len: 27
            const completion = await parseSetup(content, 27);
            (0, chai_1.expect)(completion.items[0]).deep.eq((0, verifyError_1.createExpectedCompletion)('ownerReferences', 'ownerReferences:\n  - apiVersion: $1\n    kind: $2\n    name: $3\n    uid: $4', 1, 2, 1, 17, 10, 2, { documentation: '' }));
        });
        it('Array of objects autocomplete with 3 space indentation check', async () => {
            const languageSettingsSetup = new serviceSetup_1.ServiceSetup().withCompletion().withIndentation('   ');
            languageService.configure(languageSettingsSetup.languageSettings);
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    metadata: {
                        type: 'object',
                        properties: {
                            ownerReferences: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        apiVersion: {
                                            type: 'string',
                                        },
                                        kind: {
                                            type: 'string',
                                        },
                                        name: {
                                            type: 'string',
                                        },
                                        uid: {
                                            type: 'string',
                                        },
                                    },
                                    required: ['apiVersion', 'kind', 'name', 'uid'],
                                },
                            },
                        },
                    },
                },
            });
            const content = 'metadata:\n   ownerReference|s|'; // len: 28, pos: 27
            const completion = await parseSetup(content);
            (0, chai_1.expect)(completion.items[0]).deep.eq((0, verifyError_1.createExpectedCompletion)('ownerReferences', 'ownerReferences:\n   - apiVersion: $1\n     kind: $2\n     name: $3\n     uid: $4', 1, 3, 1, 18, 10, 2, { documentation: '' }));
        });
        it('Array completion - should not suggest const', async () => {
            languageService.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    test: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                constProp: {
                                    type: 'string',
                                    const: 'const1',
                                },
                            },
                        },
                    },
                },
            });
            const content = 'test:\n  - constProp:\n    ';
            const result = await parseSetup(content, content.length);
            (0, chai_1.expect)(result.items.length).to.be.equal(0);
        });
        it('Object in array with 4 space indentation check', async () => {
            const languageSettingsSetup = new serviceSetup_1.ServiceSetup().withCompletion().withIndentation('    ');
            languageService.configure(languageSettingsSetup.languageSettings);
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    rules: {
                        type: 'array',
                        items: {
                            title: 'rules item',
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'string',
                                },
                                notes: {
                                    type: 'string',
                                },
                                links: {
                                    type: 'array',
                                    items: {
                                        properties: {
                                            rel: {
                                                type: 'string',
                                            },
                                            url: {
                                                type: 'string',
                                            },
                                        },
                                    },
                                },
                                nomination: {
                                    type: 'string',
                                    pattern: '[a-z0-9_]+',
                                },
                                weight: {
                                    type: 'number',
                                    minimum: 1,
                                },
                                criteria: {
                                    type: 'array',
                                    minItems: 1,
                                    items: {
                                        type: 'object',
                                        properties: {
                                            field: {
                                                type: 'string',
                                            },
                                            operator: {
                                                type: 'string',
                                            },
                                            operand: {
                                                type: 'string',
                                            },
                                        },
                                        required: ['field', 'operator', 'operand'],
                                        additionalProperties: false,
                                    },
                                },
                            },
                            required: ['id', 'weight', 'criteria', 'nomination'],
                        },
                    },
                },
            });
            const content = 'rules:\n    -|\n|'; // len: 13, pos: 12
            const completion = await parseSetup(content);
            (0, chai_1.expect)(completion.items.find((i) => i.label === 'rules item').textEdit.newText).equal(' id: $1\n  nomination: $2\n  weight: ${3:0}\n  criteria:\n      - field: $4\n        operator: $5\n        operand: $6');
        });
    });
    describe('JSON Schema 7 Specific Tests', function () {
        it('Autocomplete works with examples', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    foodItems: {
                        type: 'string',
                        examples: ['Apple', 'Banana'],
                        default: 'Carrot',
                    },
                },
            });
            const content = 'foodItems: '; // len: 11
            const completion = parseSetup(content, 12);
            completion
                .then(function (result) {
                assert.equal(result.items.length, 3);
                assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('Carrot', 'Carrot', 0, 11, 0, 11, 12, 2, {
                    detail: 'Default value',
                }));
                assert.deepEqual(result.items[1], (0, verifyError_1.createExpectedCompletion)('Apple', 'Apple', 0, 11, 0, 11, 12, 2, {}));
                assert.deepEqual(result.items[2], (0, verifyError_1.createExpectedCompletion)('Banana', 'Banana', 0, 11, 0, 11, 12, 2, {}));
            })
                .then(done, done);
        });
        it('Autocomplete works with const', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    fruit: {
                        const: 'Apple',
                    },
                },
            });
            const content = 'fruit: Ap|p|'; // len: 10, pos: 9
            const completion = parseSetup(content);
            completion
                .then(function (result) {
                assert.equal(result.items.length, 1);
                assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('Apple', 'Apple', 0, 7, 0, 10, 12, 2, {
                    documentation: undefined,
                }));
            })
                .then(done, done);
        });
        it('Autocomplete should suggest prop with const value', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    fruit: {
                        const: 'Apple',
                    },
                },
            });
            const content = '';
            const completion = parseSetup(content, 0);
            completion
                .then(function (result) {
                assert.equal(result.items.length, 1);
                assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('fruit', 'fruit: Apple', 0, 0, 0, 0, 10, 2, {
                    documentation: '',
                }));
            })
                .then(done, done);
        });
        it('Should insert quotation value if there is special char', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    from: {
                        type: 'string',
                        const: '@test',
                    },
                },
            });
            const content = 'from: ';
            const completion = await parseSetup(content, content.length);
            (0, chai_1.expect)(completion.items.length).equal(1);
            (0, chai_1.expect)(completion.items[0]).to.deep.equal((0, verifyError_1.createExpectedCompletion)('@test', '"@test"', 0, 6, 0, 6, 12, 2, {
                documentation: undefined,
            }));
        });
    });
    describe('Indentation Specific Tests', function () {
        it('Indent should be considered with position relative to slash', (done) => {
            const schema = require(path.join(__dirname, './fixtures/testArrayIndent.json'));
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'install:\n  - he'; // len: 15
            const completion = parseSetup(content, content.lastIndexOf('he') + 2); // pos: 13+2
            completion
                .then(function (result) {
                assert.equal(result.items.length, 2);
                assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('helm', 'helm:\n    name: ', 1, 4, 1, 6, 10, 2, {
                    documentation: '',
                }));
            })
                .then(done, done);
        });
        it('Large indent should be considered with position relative to slash', (done) => {
            const schema = require(path.join(__dirname, './fixtures/testArrayIndent.json'));
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'install:\n -            he'; // len: 25
            const completion = parseSetup(content, content.lastIndexOf('he') + 2); // pos: 23+2
            completion
                .then(function (result) {
                assert.equal(result.items.length, 2);
                assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('helm', 'helm:\n               name: ', 1, 14, 1, 16, 10, 2, {
                    documentation: '',
                }));
            })
                .then(done, done);
        });
        it('Tab indent should be considered with position relative to slash', (done) => {
            const schema = require(path.join(__dirname, './fixtures/testArrayIndent.json'));
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'install:\n -\t             he'; // len: 27
            const completion = parseSetup(content, content.lastIndexOf('he') + 2); // pos: 25+2
            completion
                .then(function (result) {
                assert.equal(result.items.length, 2);
                assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('helm', 'helm:\n \t               name: ', 1, 16, 1, 18, 10, 2, {
                    documentation: '',
                }));
            })
                .then(done, done);
        });
    });
    describe('Yaml schema defined in file', function () {
        const uri = (0, testHelper_1.toFsPath)(path.join(__dirname, './fixtures/testArrayMaxProperties.json'));
        it('Provide completion from schema declared in file', (done) => {
            const content = `# yaml-language-server: $schema=${uri}\n- `;
            const completion = parseSetup(content, content.length);
            completion
                .then(function (result) {
                assert.equal(result.items.length, 3);
            })
                .then(done, done);
        });
        it('Provide completion from schema declared in file with several attributes', (done) => {
            const content = `# yaml-language-server: $schema=${uri} anothermodeline=value\n- `;
            const completion = parseSetup(content, content.length);
            completion
                .then(function (result) {
                assert.equal(result.items.length, 3);
            })
                .then(done, done);
        });
        it('Provide completion from schema declared in file with several documents', async () => {
            const documentContent1 = `# yaml-language-server: $schema=${uri} anothermodeline=value\n- `; // 149
            const content = `${documentContent1}|\n|---\n- `; // len: 156, pos: 149
            const result = await parseSetup(content);
            assert.equal(result.items.length, 3, `Expecting 3 items in completion but found ${result.items.length}`);
            const resultDoc2 = await parseSetup(content, content.length);
            assert.equal(resultDoc2.items.length, 0, `Expecting no items in completion but found ${resultDoc2.items.length}`);
        });
        it('should handle absolute path', async () => {
            const documentContent = `# yaml-language-server: $schema=${path.join(__dirname, './fixtures/testArrayMaxProperties.json')} anothermodeline=value\n- `; // len: 142
            const content = `${documentContent}|\n|---\n- `; // len: 149, pos: 142
            const result = await parseSetup(content);
            assert.strictEqual(result.items.length, 3, `Expecting 3 items in completion but found ${result.items.length}`);
        });
        it('should handle relative path', async () => {
            const documentContent = `# yaml-language-server: $schema=./fixtures/testArrayMaxProperties.json anothermodeline=value\n- `; // 95
            const content = `${documentContent}\n---\n- `;
            const testTextDocument = (0, testHelper_1.setupSchemaIDTextDocument)(content, path.join(__dirname, 'test.yaml'));
            yamlSettings.documents = new yamlSettings_1.TextDocumentTestManager();
            yamlSettings.documents.set(testTextDocument);
            const result = await languageHandler.completionHandler({
                position: testTextDocument.positionAt(documentContent.length),
                textDocument: testTextDocument,
            });
            assert.strictEqual(result.items.length, 3, `Expecting 3 items in completion but found ${result.items.length}`);
        });
        const inlineSchemaLabel = 'Inline schema';
        it('should provide modeline completion on first character with no schema associated and no modeline yet', async () => {
            const testTextDocument = (0, testHelper_1.setupSchemaIDTextDocument)('', path.join(__dirname, 'test.yaml'));
            yamlSettings.documents = new yamlSettings_1.TextDocumentTestManager();
            yamlSettings.documents.set(testTextDocument);
            const result = await languageHandler.completionHandler({
                position: testTextDocument.positionAt(0),
                textDocument: testTextDocument,
            });
            assert.strictEqual(result.items.length, 1, `Expecting 1 item in completion but found ${result.items.length}`);
            assert.strictEqual(result.items[0].label, inlineSchemaLabel);
        });
        it('should not provide modeline completion on first character when schema is associated', async () => {
            const specificSchemaId = path.join(__dirname, 'test.yaml');
            const testTextDocument = (0, testHelper_1.setupSchemaIDTextDocument)('', specificSchemaId);
            schemaProvider.addSchema(specificSchemaId, {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                    },
                },
            });
            yamlSettings.documents = new yamlSettings_1.TextDocumentTestManager();
            yamlSettings.documents.set(testTextDocument);
            const result = await languageHandler.completionHandler({
                position: testTextDocument.positionAt(0),
                textDocument: testTextDocument,
            });
            assert.strictEqual(result.items.length, 1, `Expecting 1 item in completion but found ${result.items.length}`);
            assert.notStrictEqual(result.items[0].label, inlineSchemaLabel);
        });
        it('should not provide modeline completion on first character when modeline already present', async () => {
            const testTextDocument = (0, testHelper_1.setupSchemaIDTextDocument)('# yaml-language-server:', path.join(__dirname, 'test.yaml'));
            yamlSettings.documents = new yamlSettings_1.TextDocumentTestManager();
            yamlSettings.documents.set(testTextDocument);
            const result = await languageHandler.completionHandler({
                position: testTextDocument.positionAt(0),
                textDocument: testTextDocument,
            });
            assert.strictEqual(result.items.length, 0, `Expecting 0 item in completion but found ${result.items.length}`);
        });
        it('should provide schema id completion in modeline', async () => {
            const modeline = '# yaml-language-server: $schema=';
            const testTextDocument = (0, testHelper_1.setupSchemaIDTextDocument)(modeline, path.join(__dirname, 'test.yaml'));
            yamlSettings.documents = new yamlSettings_1.TextDocumentTestManager();
            yamlSettings.documents.set(testTextDocument);
            const result = await languageHandler.completionHandler({
                position: testTextDocument.positionAt(modeline.length),
                textDocument: testTextDocument,
            });
            assert.strictEqual(result.items.length, 1, `Expecting 1 item in completion but found ${result.items.length}`);
            assert.strictEqual(result.items[0].label, 'http://google.com');
        });
        it('should provide schema id completion in modeline for any line', async () => {
            const modeline = 'foo:\n  bar\n# yaml-language-server: $schema=';
            const testTextDocument = (0, testHelper_1.setupSchemaIDTextDocument)(modeline, path.join(__dirname, 'test.yaml'));
            yamlSettings.documents = new yamlSettings_1.TextDocumentTestManager();
            yamlSettings.documents.set(testTextDocument);
            const result = await languageHandler.completionHandler({
                position: testTextDocument.positionAt(modeline.length),
                textDocument: testTextDocument,
            });
            assert.strictEqual(result.items.length, 1, `Expecting 1 item in completion but found ${result.items.length}`);
            assert.strictEqual(result.items[0].label, 'http://google.com');
        });
    });
    describe('Configuration based indentation', () => {
        it('4 space indentation', async () => {
            const languageSettingsSetup = new serviceSetup_1.ServiceSetup().withCompletion().withIndentation('    ');
            languageService.configure(languageSettingsSetup.languageSettings);
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    scripts: {
                        type: 'object',
                        properties: {
                            sample: {
                                type: 'string',
                                enum: ['test'],
                            },
                            myOtherSample: {
                                type: 'string',
                                enum: ['test'],
                            },
                        },
                    },
                },
            });
            const content = 'scripts:\n    sample: test\n    myOt|h|er'; // len: 37, pos: 34
            const completion = await parseSetup(content);
            assert.strictEqual(completion.items.length, 1);
            assert.deepStrictEqual(completion.items[0], (0, verifyError_1.createExpectedCompletion)('myOtherSample', 'myOtherSample: ${1:test}', 2, 4, 2, 11, 10, 2, {
                documentation: '',
            }));
        });
    });
    describe('Bug fixes', () => {
        it('Object in array completion indetetion', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    components: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'string',
                                },
                                settings: {
                                    type: 'object',
                                    required: ['data'],
                                    properties: {
                                        data: {
                                            type: 'object',
                                            required: ['arrayItems'],
                                            properties: {
                                                arrayItems: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        required: ['id'],
                                                        properties: {
                                                            show: {
                                                                type: 'boolean',
                                                                default: true,
                                                            },
                                                            id: {
                                                                type: 'string',
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            const content = 'components:\n  - id: jsakdh\n    setti'; // len: 36
            const completion = await parseSetup(content, 36);
            (0, chai_1.expect)(completion.items).lengthOf(1);
            (0, chai_1.expect)(completion.items[0].textEdit.newText).to.equal('settings:\n  data:\n    arrayItems:\n      - show: ${1:true}\n        id: $2');
        });
        it('Object completion', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    env: {
                        type: 'object',
                        default: {
                            KEY: 'VALUE',
                        },
                    },
                },
            });
            const content = 'env: '; // len: 5
            const completion = parseSetup(content, 5);
            completion
                .then(function (result) {
                assert.equal(result.items.length, 1);
                assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('Default value', '\n  ${1:KEY}: ${2:VALUE}\n', 0, 5, 0, 5, 9, 2, {
                    detail: 'Default value',
                }));
            })
                .then(done, done);
        });
        it('Complex default object completion', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    env: {
                        type: 'object',
                        default: {
                            KEY: 'VALUE',
                            KEY2: {
                                TEST: 'TEST2',
                            },
                            KEY3: ['Test', 'Test2'],
                        },
                    },
                },
            });
            const content = 'env: '; // len: 5
            const completion = parseSetup(content, 5);
            completion
                .then(function (result) {
                assert.equal(result.items.length, 1);
                assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('Default value', '\n  ${1:KEY}: ${2:VALUE}\n  ${3:KEY2}:\n    ${4:TEST}: ${5:TEST2}\n  ${6:KEY3}:\n    - ${7:Test}\n    - ${8:Test2}\n', 0, 5, 0, 5, 9, 2, {
                    detail: 'Default value',
                }));
            })
                .then(done, done);
        });
        it('should handle array schema without items', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'array',
                items: {
                    anyOf: [
                        {
                            type: 'object',
                            properties: {
                                fooBar: {
                                    type: 'object',
                                    properties: {
                                        name: {
                                            type: 'string',
                                        },
                                        aaa: {
                                            type: 'array',
                                        },
                                    },
                                    required: ['name', 'aaa'],
                                },
                            },
                        },
                    ],
                },
            });
            const content = '---\n- |\n|'; // len: 7, pos: 6
            const completion = await parseSetup(content);
            (0, chai_1.expect)(completion.items).lengthOf(1);
            (0, chai_1.expect)(completion.items[0].label).eq('fooBar');
            (0, chai_1.expect)(completion.items[0].insertText).eq('fooBar:\n    name: $1\n    aaa:\n      - $2');
        });
        it('auto completion based on the list indentation', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        prop1: {
                            type: 'string',
                        },
                        prop2: {
                            type: 'string',
                        },
                        Object: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    env_prop1: {
                                        type: 'string',
                                    },
                                },
                            },
                        },
                    },
                },
            });
            const content = '- prop1: value\n  object:\n  - env_prop1: value\n  '; // len: 48
            const completion = await parseSetup(content, 49);
            (0, chai_1.expect)(completion.items).lengthOf(2);
            (0, chai_1.expect)(completion.items[0].label).eq('prop2');
            (0, chai_1.expect)(completion.items[0].insertText).eq('prop2: ');
        });
        it('should complete string which contains number in default value', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    env: {
                        type: 'integer',
                        default: '1',
                    },
                    enum: {
                        type: 'string',
                        default: '1',
                    },
                },
            });
            const content = 'enu|m|'; // len: 4, pos: 3
            const completion = await parseSetup(content);
            const enumItem = completion.items.find((i) => i.label === 'enum');
            (0, chai_1.expect)(enumItem).to.not.undefined;
            (0, chai_1.expect)(enumItem.textEdit.newText).equal('enum: ${1:"1"}');
            const envItem = completion.items.find((i) => i.label === 'env');
            (0, chai_1.expect)(envItem).to.not.undefined;
            (0, chai_1.expect)(envItem.textEdit.newText).equal('env: ${1:1}');
        });
        it('should complete string which contains number in examples values', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    fooBar: {
                        type: 'string',
                        examples: ['test', '1', 'true'],
                    },
                },
            });
            const content = 'fooBar: |\n|'; // len: 9, pos: 8
            const completion = await parseSetup(content);
            const testItem = completion.items.find((i) => i.label === 'test');
            (0, chai_1.expect)(testItem).to.not.undefined;
            (0, chai_1.expect)(testItem.textEdit.newText).equal('test');
            const oneItem = completion.items.find((i) => i.label === '1');
            (0, chai_1.expect)(oneItem).to.not.undefined;
            (0, chai_1.expect)(oneItem.textEdit.newText).equal('"1"');
            const trueItem = completion.items.find((i) => i.label === 'true');
            (0, chai_1.expect)(trueItem).to.not.undefined;
            (0, chai_1.expect)(trueItem.textEdit.newText).equal('"true"');
        });
        it('should provide label as string for examples completion item', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    fooBar: {
                        type: 'array',
                        items: {
                            type: 'string',
                            examples: ['test'],
                        },
                    },
                },
            });
            const content = 'fooBar: |\n|'; // len: 9, pos: 8
            const completion = await parseSetup(content);
            (0, chai_1.expect)(completion.items).length(1);
        });
        it('should provide completion for flow map', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: { A: { type: 'string', enum: ['a1', 'a2'] }, B: { type: 'string', enum: ['b1', 'b2'] } },
            });
            const content = '{A: |,| B: b1}'; // len: 12, pos: 4
            const completion = await parseSetup(content);
            (0, chai_1.expect)(completion.items).lengthOf(2);
            (0, chai_1.expect)(completion.items[0]).eql((0, verifyError_1.createExpectedCompletion)('a1', 'a1', 0, 4, 0, 4, 12, vscode_languageserver_types_1.InsertTextFormat.Snippet, { documentation: undefined }));
            (0, chai_1.expect)(completion.items[1]).eql((0, verifyError_1.createExpectedCompletion)('a2', 'a2', 0, 4, 0, 4, 12, vscode_languageserver_types_1.InsertTextFormat.Snippet, { documentation: undefined }));
        });
        it('should provide completion for "null" enum value', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    kind: {
                        enum: ['project', null],
                    },
                },
            });
            const content = 'kind: |\n|'; // len: 7, pos: 6
            const completion = await parseSetup(content);
            (0, chai_1.expect)(completion.items).lengthOf(2);
            (0, chai_1.expect)(completion.items[0]).eql((0, verifyError_1.createExpectedCompletion)('project', 'project', 0, 6, 0, 6, 12, vscode_languageserver_types_1.InsertTextFormat.Snippet, { documentation: undefined }));
            (0, chai_1.expect)(completion.items[1]).eql((0, verifyError_1.createExpectedCompletion)('null', 'null', 0, 6, 0, 6, 12, vscode_languageserver_types_1.InsertTextFormat.Snippet, { documentation: undefined }));
        });
        it('should provide completion for empty file', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                oneOf: [
                    {
                        type: 'object',
                        description: 'dummy schema',
                    },
                    {
                        properties: {
                            kind: {
                                type: 'string',
                            },
                        },
                        type: 'object',
                        additionalProperties: false,
                    },
                    {
                        properties: {
                            name: {
                                type: 'string',
                            },
                        },
                        type: 'object',
                        additionalProperties: false,
                    },
                ],
            });
            const content = ' \n\n|\n|'; // len: 4, pos: 3
            const completion = await parseSetup(content);
            (0, chai_1.expect)(completion.items).lengthOf(2);
            (0, chai_1.expect)(completion.items[0]).eql((0, verifyError_1.createExpectedCompletion)('kind', 'kind: ', 2, 0, 2, 0, 10, vscode_languageserver_types_1.InsertTextFormat.Snippet, { documentation: '' }));
            (0, chai_1.expect)(completion.items[1]).eql((0, verifyError_1.createExpectedCompletion)('name', 'name: ', 2, 0, 2, 0, 10, vscode_languageserver_types_1.InsertTextFormat.Snippet, { documentation: '' }));
        });
        it('should not provide additional ":" on existing property completion', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    kind: {
                        type: 'string',
                    },
                },
                required: ['kind'],
            });
            const content = 'kin|d|: 111\n'; // len: 10, pos: 3
            const completion = await parseSetup(content);
            (0, chai_1.expect)(completion.items).lengthOf(2);
            (0, chai_1.expect)(completion.items[0]).eql((0, verifyError_1.createExpectedCompletion)('kind', 'kind', 0, 0, 0, 4, 10, vscode_languageserver_types_1.InsertTextFormat.Snippet, { documentation: '' }));
        });
        it('should not provide additional ":" on existing property completion when try to complete partial property', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    kind: {
                        type: 'string',
                    },
                },
                required: ['kind'],
            });
            const content = 'k|i|: 111\n'; // len: 8, pos: 1
            const completion = await parseSetup(content);
            (0, chai_1.expect)(completion.items).lengthOf(2);
            (0, chai_1.expect)(completion.items[0]).eql((0, verifyError_1.createExpectedCompletion)('kind', 'kind', 0, 0, 0, 2, 10, vscode_languageserver_types_1.InsertTextFormat.Snippet, { documentation: '' }));
        });
        it('should use markdownDescription for property completion', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    kind: {
                        type: 'string',
                        description: 'Kind is a string value representing the REST',
                        markdownDescription: '**kind** (string)\n\nKind is a string value representing the REST resource this object represents.',
                    },
                },
                required: ['kind'],
            });
            const content = 'k|i|n'; // len: 3, pos: 1
            const completion = await parseSetup(content);
            (0, chai_1.expect)(completion.items).lengthOf(2);
            (0, chai_1.expect)(completion.items[0]).eql((0, verifyError_1.createExpectedCompletion)('kind', 'kind: ', 0, 0, 0, 3, 10, vscode_languageserver_types_1.InsertTextFormat.Snippet, {
                documentation: {
                    kind: vscode_languageserver_types_1.MarkupKind.Markdown,
                    value: '**kind** (string)\n\nKind is a string value representing the REST resource this object represents.',
                },
            }));
        });
        it('should follow $ref in additionalItems', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    test: {
                        $ref: '#/definitions/Recur',
                    },
                },
                definitions: {
                    Recur: {
                        type: 'array',
                        items: [
                            {
                                type: 'string',
                                enum: ['and'],
                            },
                        ],
                        additionalItems: {
                            $ref: '#/definitions/Recur',
                        },
                    },
                },
            });
            const content = 'test:\n  - and\n  - - '; // len: 20
            const completion = await parseSetup(content, 20);
            (0, chai_1.expect)(completion.items).lengthOf(1);
            (0, chai_1.expect)(completion.items[0]).eql((0, verifyError_1.createExpectedCompletion)('and', 'and', 2, 6, 2, 6, 12, vscode_languageserver_types_1.InsertTextFormat.Snippet, { documentation: undefined }));
        });
        it('should follow $ref in additionalItems: extra space after cursor', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    test: {
                        $ref: '#/definitions/Recur',
                    },
                },
                definitions: {
                    Recur: {
                        type: 'array',
                        items: [
                            {
                                type: 'string',
                                enum: ['and'],
                            },
                        ],
                        additionalItems: {
                            $ref: '#/definitions/Recur',
                        },
                    },
                },
            });
            const content = 'test:\n  - and\n  - - | | '; // len: 22, pos: 20
            const completion = await parseSetup(content);
            (0, chai_1.expect)(completion.items).lengthOf(1);
            (0, chai_1.expect)(completion.items[0]).eql((0, verifyError_1.createExpectedCompletion)('and', 'and', 2, 6, 2, 8, 12, vscode_languageserver_types_1.InsertTextFormat.Snippet, { documentation: undefined }));
        });
        it('should follow $ref in additionalItems for flow style array', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    test: {
                        $ref: '#/definitions/Recur',
                    },
                },
                definitions: {
                    Recur: {
                        type: 'array',
                        items: [
                            {
                                type: 'string',
                                enum: ['and'],
                            },
                        ],
                        additionalItems: {
                            $ref: '#/definitions/Recur',
                        },
                    },
                },
            });
            const content = 'test:\n  - and\n  - |[|]'; // len: 20, pos: 18
            const completion = await parseSetup(content);
            (0, chai_1.expect)(completion.items).lengthOf(1);
            (0, chai_1.expect)(completion.items[0]).eql((0, verifyError_1.createExpectedCompletion)('and', 'and', 2, 4, 2, 4, 12, vscode_languageserver_types_1.InsertTextFormat.Snippet, { documentation: undefined }));
        });
        it('completion should handle bad schema', async () => {
            const doc = (0, testHelper_1.setupSchemaIDTextDocument)('foo:\n bar', 'bad-schema.yaml');
            yamlSettings.documents = new yamlSettings_1.TextDocumentTestManager();
            yamlSettings.documents.set(doc);
            const result = await languageHandler.completionHandler({
                position: vscode_languageserver_types_1.Position.create(0, 1),
                textDocument: doc,
            });
            (0, chai_1.expect)(result.items).to.be.empty;
        });
        it('should convert to string non string completion label', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    version: {
                        default: 2.1,
                        enum: [2, 2.1],
                    },
                },
            });
            const content = 'version: '; // len: 9
            const completion = await parseSetup(content, 9);
            (0, chai_1.expect)(completion.items).lengthOf(2);
            (0, chai_1.expect)(completion.items[0]).eql((0, verifyError_1.createExpectedCompletion)('2', '2', 0, 9, 0, 9, 12, vscode_languageserver_types_1.InsertTextFormat.Snippet, { documentation: undefined }));
            (0, chai_1.expect)(completion.items[1]).eql((0, verifyError_1.createExpectedCompletion)('2.1', '2.1', 0, 9, 0, 9, 12, vscode_languageserver_types_1.InsertTextFormat.Snippet, { documentation: undefined }));
        });
    });
    describe('Array completion', () => {
        it('Simple array object completion with "-" without any item', (done) => {
            const schema = require(path.join(__dirname, './fixtures/testArrayCompletionSchema.json'));
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'test_simpleArrayObject:\n  -';
            const completion = parseSetup(content, content.length);
            completion
                .then(function (result) {
                assert.equal(result.items.length, 2);
                assert.equal(result.items[0].label, 'obj1');
                assert.equal(result.items[0].insertText, ' obj1:\n    ');
            })
                .then(done, done);
        });
        it('Simple array object completion without "-" after array item', (done) => {
            const schema = require(path.join(__dirname, './fixtures/testArrayCompletionSchema.json'));
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'test_simpleArrayObject:\n  - obj1:\n      name: 1\n  ';
            const completion = parseSetup(content, content.length);
            completion
                .then(function (result) {
                assert.equal(result.items.length, 1);
                assert.equal(result.items[0].label, '- (array item) obj1');
            })
                .then(done, done);
        });
        it('Simple array object completion with "-" after array item', (done) => {
            const schema = require(path.join(__dirname, './fixtures/testArrayCompletionSchema.json'));
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'test_simpleArrayObject:\n  - obj1:\n      name: 1\n  -';
            const completion = parseSetup(content, content.length);
            completion
                .then(function (result) {
                assert.equal(result.items.length, 2);
                assert.equal(result.items[0].label, 'obj1');
                assert.equal(result.items[0].insertText, ' obj1:\n    ');
            })
                .then(done, done);
        });
        it('Array anyOf two objects completion with "- " without any item', (done) => {
            const schema = require(path.join(__dirname, './fixtures/testArrayCompletionSchema.json'));
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'test_array_anyOf_2objects:\n  - ';
            const completion = parseSetup(content, content.length);
            completion
                .then(function (result) {
                assert.equal(result.items.length, 4);
                assert.equal(result.items[0].label, 'obj1');
                assert.equal(result.items[0].kind, 10);
                assert.equal(result.items[1].label, 'obj1');
                assert.equal(result.items[1].kind, 7);
            })
                .then(done, done);
        });
        it('Array anyOf two objects completion with "-" without any item', (done) => {
            const schema = require(path.join(__dirname, './fixtures/testArrayCompletionSchema.json'));
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'test_array_anyOf_2objects:\n  -';
            const completion = parseSetup(content, content.length);
            completion
                .then(function (result) {
                assert.equal(result.items.length, 4);
                assert.equal(result.items[0].label, 'obj1');
                assert.equal(result.items[0].insertText, ' obj1:\n    ');
            })
                .then(done, done);
        });
        it('Simple array object completion without "-" befor array empty item', (done) => {
            const schema = require(path.join(__dirname, './fixtures/testArrayCompletionSchema.json'));
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'test_simpleArrayObject:\n  |\n|  -'; // len: 30, pos: 26
            const completion = parseSetup(content);
            completion
                .then(function (result) {
                assert.equal(result.items.length, 1);
                assert.equal(result.items[0].label, '- (array item) obj1');
            })
                .then(done, done);
        });
        it('Array anyOf two objects completion without "-" after array item', (done) => {
            const schema = require(path.join(__dirname, './fixtures/testArrayCompletionSchema.json'));
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'test_array_anyOf_2objects:\n  - obj1:\n      name: 1\n  ';
            const completion = parseSetup(content, content.length);
            completion
                .then(function (result) {
                (0, chai_1.expect)(result.items.map((i) => i.label)).deep.eq(['- (array item) obj1', '- (array item) obj2']);
            })
                .then(done, done);
        });
        it('Array nested anyOf without "-" should return all array items', (done) => {
            const schema = require(path.join(__dirname, './fixtures/testArrayCompletionSchema.json'));
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'test_array_nested_anyOf:\n  - obj1:\n    name:1\n  ';
            const completion = parseSetup(content, content.length);
            completion
                .then(function (result) {
                (0, chai_1.expect)(result.items.map((i) => i.label)).deep.eq(['- (array item) obj1', '- (array item) obj2', '- (array item) obj3']);
            })
                .then(done, done);
        });
        it('Array anyOf two objects completion with "-" after array item', (done) => {
            const schema = require(path.join(__dirname, './fixtures/testArrayCompletionSchema.json'));
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'test_array_anyOf_2objects:\n  - obj1:\n      name: 1\n  -';
            const completion = parseSetup(content, content.length);
            completion
                .then(function (result) {
                assert.equal(result.items.length, 4);
                assert.equal(result.items[0].label, 'obj1');
                assert.equal(result.items[0].insertText, ' obj1:\n    ');
            })
                .then(done, done);
        });
        it('Array anyOf two objects completion indentation', async () => {
            const schema = require(path.join(__dirname, './fixtures/testArrayCompletionSchema.json'));
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'test_array_anyOf_2objects:\n  - obj';
            const completion = await parseSetup(content, content.length);
            (0, chai_1.expect)(completion.items.length).is.equal(4);
            const obj1 = completion.items.find((it) => it.label === 'obj1');
            (0, chai_1.expect)(obj1).is.not.undefined;
            (0, chai_1.expect)(obj1.textEdit.newText).equal('obj1:\n    ');
        });
        it('Autocomplete key in nested object while typing', (done) => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    parent: {
                        type: 'object',
                        properties: {
                            child: {
                                type: 'object',
                                properties: {
                                    prop: {
                                        type: 'string',
                                        default: 'test',
                                    },
                                },
                            },
                        },
                    },
                },
            });
            const content = 'parent:\n  child:\n    p';
            const completion = parseSetup(content, content.length);
            completion
                .then(function (result) {
                assert.strictEqual(result.items.length, 1);
                assert.deepEqual(result.items[0], (0, verifyError_1.createExpectedCompletion)('prop', 'prop: ${1:test}', 2, 4, 2, 5, 10, 2, {
                    documentation: '',
                }));
            })
                .then(done, done);
        });
    });
    describe('Parent Completion', () => {
        const obj1 = {
            properties: {
                type: {
                    const: 'typeObj1',
                },
                options: {
                    type: 'object',
                    properties: {
                        label: {
                            type: 'string',
                        },
                    },
                    required: ['label'],
                },
            },
            required: ['type', 'options'],
            type: 'object',
            description: 'Description1',
            title: 'Object1',
        };
        const obj2 = {
            properties: {
                type: {
                    const: 'typeObj2',
                },
                options: {
                    type: 'object',
                    properties: {
                        description: {
                            type: 'string',
                        },
                    },
                    required: ['description'],
                },
            },
            required: ['type', 'options'],
            type: 'object',
        };
        it('Should suggest all possible option in oneOf when content empty', async () => {
            const schema = {
                type: 'object',
                oneOf: [
                    {
                        additionalProperties: false,
                        properties: {
                            A: {
                                type: 'string',
                            },
                        },
                        required: ['A'],
                    },
                    {
                        additionalProperties: false,
                        properties: {
                            B: {
                                type: 'string',
                            },
                        },
                        required: ['B'],
                    },
                ],
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = '';
            const result = await parseSetup(content, content.length);
            (0, chai_1.expect)(result.items.length).equal(4);
            (0, chai_1.expect)(result.items[0]).to.deep.equal((0, verifyError_1.createExpectedCompletion)('A', 'A: ', 0, 0, 0, 0, 10, 2, {
                documentation: '',
            }));
            (0, chai_1.expect)(result.items[2]).to.deep.equal((0, verifyError_1.createExpectedCompletion)('B', 'B: ', 0, 0, 0, 0, 10, 2, {
                documentation: '',
            }));
        });
        it('Should suggest complete object skeleton', async () => {
            const schema = {
                definitions: { obj1, obj2 },
                anyOf: [
                    {
                        $ref: '#/definitions/obj1',
                    },
                    {
                        $ref: '#/definitions/obj2',
                    },
                ],
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = '';
            const result = await parseSetup(content, content.length);
            (0, chai_1.expect)(result.items.length).equal(5);
            (0, chai_1.expect)(result.items[0]).to.deep.equal((0, verifyError_1.createExpectedCompletion)('type', 'type: ${1|typeObj1,typeObj2|}', 0, 0, 0, 0, 10, 2, { documentation: '' }));
            (0, chai_1.expect)(result.items[1]).to.deep.equal((0, verifyError_1.createExpectedCompletion)('Object1', 'type: typeObj1\noptions:\n  label: ', 0, 0, 0, 0, 7, 2, {
                documentation: {
                    kind: 'markdown',
                    value: 'Description1\n\n----\n\n```yaml\ntype: typeObj1\noptions:\n  label: \n```',
                },
                sortText: '_Object1',
            }));
            (0, chai_1.expect)(result.items[2]).to.deep.equal((0, verifyError_1.createExpectedCompletion)('options', 'options:\n  label: ', 0, 0, 0, 0, 10, 2, { documentation: '' }));
            (0, chai_1.expect)(result.items[3]).to.deep.equal((0, verifyError_1.createExpectedCompletion)('obj2', 'type: typeObj2\noptions:\n  description: ', 0, 0, 0, 0, 7, 2, {
                documentation: {
                    kind: 'markdown',
                    value: '```yaml\ntype: typeObj2\noptions:\n  description: \n```',
                },
                sortText: '_obj2',
            }));
            (0, chai_1.expect)(result.items[4]).to.deep.equal((0, verifyError_1.createExpectedCompletion)('options', 'options:\n  description: ', 0, 0, 0, 0, 10, 2, { documentation: '' }));
        });
        it('Should suggest complete object skeleton - array', async () => {
            const schema = {
                definitions: { obj1, obj2 },
                items: {
                    anyOf: [
                        {
                            $ref: '#/definitions/obj1',
                        },
                        {
                            $ref: '#/definitions/obj2',
                        },
                    ],
                },
                type: 'array',
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = '- ';
            const result = await parseSetup(content, content.length);
            (0, chai_1.expect)(result.items.length).equal(5);
            (0, chai_1.expect)(result.items[0]).to.deep.equal((0, verifyError_1.createExpectedCompletion)('type', 'type: ${1|typeObj1,typeObj2|}', 0, 2, 0, 2, 10, 2, { documentation: '' }));
            (0, chai_1.expect)(result.items[1]).to.deep.equal((0, verifyError_1.createExpectedCompletion)('Object1', 'type: typeObj1\n  options:\n    label: ', 0, 2, 0, 2, 7, 2, {
                documentation: {
                    kind: 'markdown',
                    value: 'Description1\n\n----\n\n```yaml\n  type: typeObj1\n  options:\n    label: \n```',
                },
                sortText: '_Object1',
            }));
            (0, chai_1.expect)(result.items[2]).to.deep.equal((0, verifyError_1.createExpectedCompletion)('options', 'options:\n    label: ', 0, 2, 0, 2, 10, 2, { documentation: '' }));
            (0, chai_1.expect)(result.items[3]).to.deep.equal((0, verifyError_1.createExpectedCompletion)('obj2', 'type: typeObj2\n  options:\n    description: ', 0, 2, 0, 2, 7, 2, {
                documentation: {
                    kind: 'markdown',
                    value: '```yaml\n  type: typeObj2\n  options:\n    description: \n```',
                },
                sortText: '_obj2',
            }));
            (0, chai_1.expect)(result.items[4]).to.deep.equal((0, verifyError_1.createExpectedCompletion)('options', 'options:\n    description: ', 0, 2, 0, 2, 10, 2, { documentation: '' }));
        });
        it('Should not agregate suggested text from different schemas', async () => {
            const schema = {
                definitions: { obj1, obj2 },
                anyOf: [
                    {
                        $ref: '#/definitions/obj1',
                    },
                    {
                        $ref: '#/definitions/obj1',
                    },
                ],
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = '';
            const result = await parseSetup(content, content.length);
            (0, chai_1.expect)(result.items.length).equal(3);
            (0, chai_1.expect)(result.items[1]).to.deep.equal((0, verifyError_1.createExpectedCompletion)('Object1', 'type: typeObj1\noptions:\n  label: ', 0, 0, 0, 0, 7, 2, {
                documentation: {
                    kind: 'markdown',
                    value: 'Description1\n\n----\n\n```yaml\ntype: typeObj1\noptions:\n  label: \n```',
                },
                sortText: '_Object1',
            }));
        });
        it('Should suggest rest of the parent object', async () => {
            const schema = {
                definitions: { obj1 },
                $ref: '#/definitions/obj1',
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'type: typeObj1\n';
            const result = await parseSetup(content, content.length);
            (0, chai_1.expect)(result.items.length).equal(2);
            (0, chai_1.expect)(result.items[1]).to.deep.equal((0, verifyError_1.createExpectedCompletion)('Object1', 'options:\n  label: ', 1, 0, 1, 0, 7, 2, {
                documentation: {
                    kind: 'markdown',
                    value: 'Description1\n\n----\n\n```yaml\noptions:\n  label: \n```',
                },
                sortText: '_Object1',
            }));
        });
        it('Should reindex $x', async () => {
            const schema = {
                properties: {
                    options: {
                        type: 'object',
                        properties: {
                            label: {
                                type: 'string',
                            },
                        },
                        required: ['label'],
                    },
                    prop1: {
                        type: 'string',
                    },
                },
                required: ['type', 'options', 'prop1'],
                type: 'object',
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = '';
            const result = await parseSetup(content, content.length);
            (0, chai_1.expect)(result.items.length).equal(3);
            (0, chai_1.expect)(result.items[1]).to.deep.equal((0, verifyError_1.createExpectedCompletion)('object', 'options:\n  label: $1\nprop1: $2', 0, 0, 0, 0, 7, 2, {
                documentation: {
                    kind: 'markdown',
                    value: '```yaml\noptions:\n  label: \nprop1: \n```',
                },
                sortText: '_object',
            }));
        });
        describe('Select parent skeleton first', () => {
            beforeEach(() => {
                const languageSettingsSetup = new serviceSetup_1.ServiceSetup().withCompletion();
                languageSettingsSetup.languageSettings.parentSkeletonSelectedFirst = true;
                languageService.configure(languageSettingsSetup.languageSettings);
            });
            it('Should suggest complete object skeleton', async () => {
                const schema = {
                    definitions: { obj1, obj2 },
                    anyOf: [
                        {
                            $ref: '#/definitions/obj1',
                        },
                        {
                            $ref: '#/definitions/obj2',
                        },
                    ],
                };
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = '';
                const result = await parseSetup(content, content.length);
                (0, chai_1.expect)(result.items.map((i) => i.label)).to.have.members(['Object1', 'obj2']);
            });
            it('Should suggest complete object skeleton - nested', async () => {
                const schema = {
                    definitions: { obj1, obj2 },
                    properties: {
                        name: {
                            anyOf: [
                                {
                                    $ref: '#/definitions/obj1',
                                },
                                {
                                    $ref: '#/definitions/obj2',
                                },
                            ],
                        },
                    },
                };
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = 'name:\n  ';
                const result = await parseSetup(content, content.length);
                (0, chai_1.expect)(result.items.map((i) => i.label)).to.have.members(['Object1', 'obj2']);
            });
            it('Should suggest complete object skeleton - array', async () => {
                const schema = {
                    definitions: { obj1, obj2 },
                    items: {
                        anyOf: [
                            {
                                $ref: '#/definitions/obj1',
                            },
                            {
                                $ref: '#/definitions/obj2',
                            },
                        ],
                    },
                    type: 'array',
                };
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = '- ';
                const result = await parseSetup(content, content.length);
                (0, chai_1.expect)(result.items.map((i) => i.label)).to.have.members(['Object1', 'obj2']);
            });
            it('Should suggest rest of the parent object', async () => {
                const schema = {
                    definitions: { obj1 },
                    $ref: '#/definitions/obj1',
                };
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = 'type: typeObj1\n';
                const result = await parseSetup(content, content.length);
                (0, chai_1.expect)(result.items.map((i) => i.label)).to.have.members(['options', 'Object1']);
            });
            it('Should suggest all feature when user is typing', async () => {
                const schema = {
                    definitions: { obj1 },
                    $ref: '#/definitions/obj1',
                };
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = 'ty';
                const result = await parseSetup(content, content.length);
                (0, chai_1.expect)(result.items.map((i) => i.label)).to.have.members(['type', 'options', 'Object1']);
            });
            it('Should suggest all properties in empty yaml with now required props', async () => {
                const schema = {
                    properties: {
                        fruit: {},
                        vegetable: {},
                    },
                };
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = '';
                const result = await parseSetup(content, content.length);
                (0, chai_1.expect)(result.items.map((i) => i.label)).to.have.members(['fruit', 'vegetable']);
            });
        });
        it('Should function when settings are undefined', async () => {
            languageService.configure({ completion: true });
            const content = '';
            await parseSetup(content, 0);
        });
    });
});
//# sourceMappingURL=autoCompletion.test.js.map