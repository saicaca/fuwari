"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const yamlSettings_1 = require("../src/yamlSettings");
const serviceSetup_1 = require("./utils/serviceSetup");
const testHelper_1 = require("./utils/testHelper");
const chai_1 = require("chai");
const verifyError_1 = require("./utils/verifyError");
const path = require("path");
describe('Auto Completion Fix Tests', () => {
    let languageSettingsSetup;
    let languageService;
    let languageHandler;
    let yamlSettings;
    let schemaProvider;
    before(() => {
        languageSettingsSetup = new serviceSetup_1.ServiceSetup().withCompletion().withSchemaFileMatch({
            uri: 'https://raw.githubusercontent.com/yannh/kubernetes-json-schema/master/v1.22.4-standalone-strict/all.json',
            fileMatch: [testHelper_1.SCHEMA_ID],
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
     * @param line starts with 0 index
     * @param character starts with 1 index
     * @returns A list of valid completions.
     */
    function parseSetup(content, line, character) {
        const testTextDocument = (0, testHelper_1.setupSchemaIDTextDocument)(content);
        yamlSettings.documents = new yamlSettings_1.TextDocumentTestManager();
        yamlSettings.documents.set(testTextDocument);
        return languageHandler.completionHandler({
            position: vscode_languageserver_types_1.Position.create(line, character),
            textDocument: testTextDocument,
        });
    }
    /**
     * Generates a completion list for the given document and caret (cursor) position.
     * @param content The content of the document.
     * The caret is located in the content using `|` bookends.
     * For example, `content = 'ab|c|d'` places the caret over the `'c'`, at `position = 2`
     * @returns A list of valid completions.
     */
    function parseCaret(content) {
        const { position, content: content2 } = (0, testHelper_1.caretPosition)(content);
        const testTextDocument = (0, testHelper_1.setupSchemaIDTextDocument)(content2);
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
    it('should show completion on map under array', async () => {
        schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    from: {
                        type: 'object',
                        properties: {
                            foo: {
                                type: 'boolean',
                            },
                        },
                    },
                },
            },
        });
        const content = '- from:\n   | |'; // len: 12, pos: 11
        const completion = await parseCaret(content);
        (0, chai_1.expect)(completion.items).lengthOf(1);
        (0, chai_1.expect)(completion.items[0]).eql((0, verifyError_1.createExpectedCompletion)('foo', 'foo: ', 1, 3, 1, 4, 10, 2, {
            documentation: '',
        }));
    });
    it('completion with array objects', async () => {
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
                    prop3: {
                        type: 'string',
                    },
                },
            },
        });
        const content = '- prop1: a\n   | |'; // len: 12, pos: 11
        const completion = await parseCaret(content);
        (0, chai_1.expect)(completion.items).lengthOf(2);
        (0, chai_1.expect)(completion.items[0]).eql((0, verifyError_1.createExpectedCompletion)('prop2', 'prop2: ', 1, 3, 1, 4, 10, 2, {
            documentation: '',
        }));
        (0, chai_1.expect)(completion.items[1]).eql((0, verifyError_1.createExpectedCompletion)('prop3', 'prop3: ', 1, 3, 1, 4, 10, 2, {
            documentation: '',
        }));
    });
    it('should show completion on array empty array item', async () => {
        schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    from: {
                        type: 'object',
                        properties: {
                            foo: {
                                type: 'boolean',
                            },
                        },
                    },
                },
            },
        });
        const content = '- '; // len: 2
        const completion = await parseSetup(content, 0, 2);
        (0, chai_1.expect)(completion.items).lengthOf(1);
        (0, chai_1.expect)(completion.items[0]).eql((0, verifyError_1.createExpectedCompletion)('from', 'from:\n    ', 0, 2, 0, 2, 10, 2, {
            documentation: '',
        }));
    });
    it('should show completion items in the middle of map in array', async () => {
        const content = `apiVersion: v1
kind: Pod
metadata:
  name: foo
spec:
  containers:
    - name: test
      
      image: alpine
    `; // len: 90
        const completion = await parseSetup(content, 7, 6);
        (0, chai_1.expect)(completion.items).length.greaterThan(1);
    });
    it('should show completion on array item on first line', async () => {
        const content = '-d'; // len: 2
        const completion = await parseSetup(content, 0, 1);
        (0, chai_1.expect)(completion.items).is.empty;
    });
    it('should complete without error on map inside array', async () => {
        const content = '- foo\n- bar:\n    so'; // len: 19
        const completion = await parseSetup(content, 2, 6);
        (0, chai_1.expect)(completion.items).is.empty;
    });
    it('should complete  array', async () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const schema = require(path.join(__dirname, './fixtures/test-nested-object-array.json'));
        schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
        const content = `objA:
  - name: nameA1
      
objB:
  size: midle
  name: nameB2  
`; // len: 67
        const completion = await parseSetup(content, 2, 4);
        (0, chai_1.expect)(completion.items).is.not.empty;
    });
    it('should complete array item for "oneOf" schema', async () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const schema = require(path.join(__dirname, './fixtures/test-completion-oneOf.json'));
        schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
        const content = `metadata:
  Selector:
    query:
      - 
`; // len: 42
        const completion = await parseSetup(content, 3, 8);
        (0, chai_1.expect)(completion.items).length(5);
        (0, chai_1.expect)(completion.items.map((it) => it.label)).to.have.members(['NOT', 'attribute', 'operation', 'value', 'FUNC_item']);
    });
    it('Autocomplete with short nextLine - nested object', async () => {
        schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
            type: 'object',
            properties: {
                example: {
                    type: 'object',
                    properties: {
                        sample: {
                            type: 'object',
                            properties: {
                                detail: {
                                    type: 'object',
                                },
                            },
                        },
                    },
                },
                a: {
                    type: 'string',
                    description: 'short prop name because of distance to the cursor',
                },
            },
        });
        const content = 'example:\n  sample:\n    '; // len: 23
        const completion = await parseSetup(content + '\na: test', 2, 4);
        (0, chai_1.expect)(completion.items.length).equal(1);
        (0, chai_1.expect)(completion.items[0]).to.be.deep.equal((0, verifyError_1.createExpectedCompletion)('detail', 'detail:\n  ', 2, 4, 2, 4, 10, 2, {
            documentation: '',
        }));
    });
    it('Should suggest valid matches from oneOf', async () => {
        schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
            oneOf: [
                {
                    type: 'object',
                    properties: {
                        spec: {
                            type: 'object',
                        },
                    },
                },
                {
                    properties: {
                        spec: {
                            type: 'object',
                            required: ['bar'],
                            properties: {
                                bar: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            ],
        });
        const content = '|s|'; // len: 1, pos: 1
        const completion = await parseCaret(content);
        (0, chai_1.expect)(completion.items.length).equal(1);
        (0, chai_1.expect)(completion.items[0]).to.be.deep.equal((0, verifyError_1.createExpectedCompletion)('spec', 'spec:\n  bar: ', 0, 0, 0, 1, 10, 2, {
            documentation: '',
        }));
    });
    it('Should suggest all the matches from allOf', async () => {
        schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
            allOf: [
                {
                    type: 'object',
                    properties: {
                        spec: {
                            type: 'object',
                        },
                    },
                },
                {
                    properties: {
                        spec: {
                            type: 'object',
                            required: ['bar'],
                            properties: {
                                bar: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            ],
        });
        const content = '|s|'; // len: 1, pos: 1
        const completion = await parseCaret(content);
        (0, chai_1.expect)(completion.items.length).equal(2);
        (0, chai_1.expect)(completion.items[0]).to.be.deep.equal((0, verifyError_1.createExpectedCompletion)('spec', 'spec:\n  ', 0, 0, 0, 1, 10, 2, {
            documentation: '',
        }));
        (0, chai_1.expect)(completion.items[1]).to.be.deep.equal((0, verifyError_1.createExpectedCompletion)('spec', 'spec:\n  bar: ', 0, 0, 0, 1, 10, 2, {
            documentation: '',
        }));
    });
    it('Autocomplete with a new line inside the object', async () => {
        schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
            type: 'object',
            properties: {
                example: {
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
                        },
                    },
                },
            },
        });
        const content = 'example:\n  sample:\n    |\n|    prop2: value2'; // len: 41, pos: 23
        const completion = await parseCaret(content);
        (0, chai_1.expect)(completion.items.length).equal(1);
        (0, chai_1.expect)(completion.items[0]).to.be.deep.equal((0, verifyError_1.createExpectedCompletion)('prop1', 'prop1: ', 2, 4, 2, 4, 10, 2, {
            documentation: '',
        }));
    });
    it('Autocomplete on the first array item', async () => {
        schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
            type: 'object',
            properties: {
                examples: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            sample: {
                                type: 'object',
                                properties: {
                                    prop1: {
                                        type: 'string',
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        const content = 'examples:\n  |\n|  - sample:\n      prop1: value1'; // len: 44, pos: 12
        const completion = await parseCaret(content);
        (0, chai_1.expect)(completion.items.length).equal(1);
        (0, chai_1.expect)(completion.items[0]).to.be.deep.equal((0, verifyError_1.createExpectedCompletion)('- (array item) object', '- ', 1, 2, 1, 2, 9, 2, {
            documentation: {
                kind: 'markdown',
                value: 'Create an item of an array type `object`\n ```\n- \n```',
            },
        }));
    });
    it('Array of enum autocomplete of irregular order', async () => {
        schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
            type: 'object',
            properties: {
                apiVersion: {
                    type: 'string',
                },
                metadata: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                        },
                    },
                },
                kind: {
                    type: 'string',
                    enum: ['Pod', 'PodTemplate'],
                },
            },
        });
        const content = 'kind: Po'; // len: 8
        const completion = await parseSetup(content, 1, 9);
        (0, chai_1.expect)(completion.items.length).equal(2);
        (0, chai_1.expect)(completion.items[0].insertText).equal('Pod');
        (0, chai_1.expect)(completion.items[1].insertText).equal('PodTemplate');
    });
    it('Test that properties have enum of string type with number', async () => {
        schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
            type: 'object',
            properties: {
                version: {
                    type: 'array',
                    items: {
                        enum: ['12.1', 13, '13.1', '14.0', 'all', 14.4, false, null, ['test']],
                        type: ['string', 'integer', 'number', 'boolean', 'object', 'array'],
                    },
                },
            },
        });
        const content = 'version:\n  - ';
        const completion = await parseSetup(content, 2, 0);
        (0, chai_1.expect)(completion.items).lengthOf(9);
        (0, chai_1.expect)(completion.items[0].insertText).equal('"12.1"');
        (0, chai_1.expect)(completion.items[1].insertText).equal('13');
        (0, chai_1.expect)(completion.items[4].insertText).equal('all');
        (0, chai_1.expect)(completion.items[5].insertText).equal('14.4');
        (0, chai_1.expect)(completion.items[6].insertText).equal('false');
        (0, chai_1.expect)(completion.items[7].insertText).equal('null');
        (0, chai_1.expect)(completion.items[8].insertText).equal('\n  - ${1:test}\n');
    });
    it('Autocomplete indent on array when parent is array', async () => {
        schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
            type: 'object',
            properties: {
                examples: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            objectWithArray: {
                                type: 'array',
                                items: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            },
        });
        const content = 'examples:\n  - '; // len: 14
        const completion = await parseSetup(content, 1, 4);
        (0, chai_1.expect)(completion.items.length).equal(1);
        (0, chai_1.expect)(completion.items[0]).to.be.deep.equal((0, verifyError_1.createExpectedCompletion)('objectWithArray', 'objectWithArray:\n    - ${1}', 1, 4, 1, 4, 10, 2, {
            documentation: '',
        }));
    });
    it('Autocomplete indent on array object when parent is array', async () => {
        schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
            type: 'object',
            properties: {
                examples: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            objectWithArray: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    required: ['item', 'item2'],
                                    properties: {
                                        item: { type: 'string' },
                                        item2: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        const content = 'examples:\n  - '; // len: 14
        const completion = await parseSetup(content, 1, 4);
        (0, chai_1.expect)(completion.items.length).equal(1);
        (0, chai_1.expect)(completion.items[0]).to.be.deep.equal((0, verifyError_1.createExpectedCompletion)('objectWithArray', 'objectWithArray:\n    - item: $1\n      item2: $2', 1, 4, 1, 4, 10, 2, {
            documentation: '',
        }));
    });
    it('Autocomplete indent on array object when parent is array of an array', async () => {
        schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
            type: 'object',
            properties: {
                array1: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['thing1'],
                        properties: {
                            thing1: {
                                type: 'object',
                                required: ['array2'],
                                properties: {
                                    array2: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            required: ['thing2', 'type'],
                                            properties: {
                                                type: {
                                                    type: 'string',
                                                },
                                                thing2: {
                                                    type: 'object',
                                                    required: ['item1', 'item2'],
                                                    properties: {
                                                        item1: { type: 'string' },
                                                        item2: { type: 'string' },
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
        const content = 'array1:\n  - ';
        const completion = await parseSetup(content, 1, 4);
        (0, chai_1.expect)(completion.items[0].insertText).to.be.equal('thing1:\n    array2:\n      - type: $1\n        thing2:\n          item1: $2\n          item2: $3');
    });
    describe('array indent on different index position', () => {
        const schema = {
            type: 'object',
            properties: {
                objectWithArray: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['item', 'item2'],
                        properties: {
                            item: { type: 'string' },
                            item2: {
                                type: 'object',
                                required: ['prop1', 'prop2'],
                                properties: {
                                    prop1: { type: 'string' },
                                    prop2: { type: 'string' },
                                },
                            },
                        },
                    },
                },
            },
        };
        it('array indent on the first item', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'objectWithArray:\n  - '; // len: 21
            const completion = await parseSetup(content, 1, 4);
            (0, chai_1.expect)(completion.items.length).equal(3);
            (0, chai_1.expect)(completion.items[0]).to.be.deep.equal((0, verifyError_1.createExpectedCompletion)('item', 'item: ', 1, 4, 1, 4, 10, 2, {
                documentation: '',
            }));
            (0, chai_1.expect)(completion.items[2]).to.be.deep.equal((0, verifyError_1.createExpectedCompletion)('item2', 'item2:\n    prop1: $1\n    prop2: $2', 1, 4, 1, 4, 10, 2, {
                documentation: '',
            }));
        });
        it('array indent on the second item', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'objectWithArray:\n  - item: first line\n    '; // len: 42
            const completion = await parseSetup(content, 2, 4);
            (0, chai_1.expect)(completion.items.length).equal(2);
            (0, chai_1.expect)(completion.items[0]).to.be.deep.equal((0, verifyError_1.createExpectedCompletion)('item2', 'item2:\n  prop1: $1\n  prop2: $2', 2, 4, 2, 4, 10, 2, {
                documentation: '',
            }));
        });
    });
    describe('merge properties from anyOf objects', () => {
        it('should merge different simple values', async () => {
            const schema = {
                anyOf: [
                    {
                        properties: {
                            simplePropWithSimpleValue: { type: 'string', const: 'const value' },
                        },
                    },
                    {
                        properties: {
                            simplePropWithSimpleValue: { type: 'boolean', default: false },
                        },
                    },
                    {
                        properties: {
                            simplePropWithSimpleValue: { type: 'null', default: null },
                        },
                    },
                    {
                        properties: {
                            simplePropWithSimpleValue: { type: 'string' },
                        },
                    },
                ],
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = '';
            const completion = await parseSetup(content, 0, 1);
            (0, chai_1.expect)(completion.items.length).equal(1);
            (0, chai_1.expect)(completion.items[0].insertText).to.be.equal('simplePropWithSimpleValue: ${1|const value,false,null|}');
        });
        it('should autocomplete as single item with same value', async () => {
            const schema = {
                anyOf: [
                    {
                        properties: {
                            simplePropWithSameValue: { type: 'string', const: 'const value 1' },
                            obj1: { properties: { prop1: { type: 'string' } } },
                        },
                    },
                    {
                        properties: {
                            simplePropWithSameValue: { type: 'string', const: 'const value 1' },
                            obj1: { properties: { prop1: { type: 'string' } } },
                        },
                    },
                ],
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = '';
            const completion = await parseSetup(content, 0, 1);
            (0, chai_1.expect)(completion.items.length).equal(2);
            (0, chai_1.expect)(completion.items[0].insertText).to.be.equal('simplePropWithSameValue: const value 1');
            (0, chai_1.expect)(completion.items[1].insertText).to.be.equal('obj1:\n  ');
        });
        it('should not merge objects', async () => {
            const schema = {
                anyOf: [
                    {
                        properties: {
                            obj1: { properties: { prop1: { type: 'string' } }, required: ['prop1'] },
                        },
                    },
                    {
                        properties: {
                            obj1: { properties: { prop2: { type: 'string', const: 'value' } }, required: ['prop2'] },
                        },
                    },
                ],
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = '';
            const completion = await parseSetup(content, 0, 1);
            (0, chai_1.expect)(completion.items.length).equal(2);
            (0, chai_1.expect)(completion.items[0].label).to.be.equal('obj1');
            (0, chai_1.expect)(completion.items[0].insertText).to.be.equal('obj1:\n  prop1: ');
            (0, chai_1.expect)(completion.items[1].label).to.be.equal('obj1');
            (0, chai_1.expect)(completion.items[1].insertText).to.be.equal('obj1:\n  prop2: ${1:value}');
        });
        it('Autocomplete should not suggest items for parent object', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    scripts: {
                        type: 'object',
                        properties: {
                            sample: {
                                type: 'string',
                            },
                        },
                    },
                    scripts2: {
                        type: 'string',
                    },
                },
            });
            const content = 'scripts:   \n  sample: | |';
            const completion = await parseSetup(content, 0, 9); // before line brake
            (0, chai_1.expect)(completion.items.length).equal(0);
        });
        it('autoCompletion when value is null inside anyOf object', async () => {
            const schema = {
                anyOf: [
                    {
                        properties: {
                            prop: {
                                const: 'const value',
                            },
                        },
                    },
                    {
                        properties: {
                            prop: {
                                type: 'null',
                            },
                        },
                    },
                ],
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = '';
            const completion = await parseSetup(content, 0, 6);
            (0, chai_1.expect)(completion.items.length).equal(1);
            (0, chai_1.expect)(completion.items[0].label).to.be.equal('prop');
            (0, chai_1.expect)(completion.items[0].insertText).to.be.equal('prop: ${1|const value,null|}');
        });
    });
    describe('extra space after cursor', () => {
        it('simple const', async () => {
            const schema = {
                properties: {
                    prop: {
                        const: 'const',
                    },
                },
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'prop: | | '; // len: 8, pos: 6
            const completion = await parseCaret(content);
            (0, chai_1.expect)(completion.items.length).equal(1);
            (0, chai_1.expect)(completion.items[0].label).to.be.equal('const');
            (0, chai_1.expect)(completion.items[0].textEdit).to.be.deep.equal({ newText: 'const', range: vscode_languageserver_types_1.Range.create(0, 6, 0, 8) });
        });
        it('partial key with trailing spaces', async () => {
            const schema = {
                properties: {
                    name: {
                        const: 'my name',
                    },
                },
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'na  ';
            const completion = await parseSetup(content, 0, 2);
            (0, chai_1.expect)(completion.items.length).equal(1);
            (0, chai_1.expect)(completion.items[0]).eql((0, verifyError_1.createExpectedCompletion)('name', 'name: my name', 0, 0, 0, 4, 10, 2, {
                documentation: '',
            }));
        });
        it('partial key with trailing spaces with new line', async () => {
            const schema = {
                properties: {
                    name: {
                        const: 'my name',
                    },
                },
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'na  \n';
            const completion = await parseSetup(content, 0, 2);
            (0, chai_1.expect)(completion.items.length).equal(1);
            (0, chai_1.expect)(completion.items[0]).eql((0, verifyError_1.createExpectedCompletion)('name', 'name: my name', 0, 0, 0, 5, 10, 2, {
                documentation: '',
            }));
        });
        it('partial key with leading and trailing spaces', async () => {
            const schema = {
                properties: {
                    name: {
                        const: 'my name',
                    },
                },
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = '  na  ';
            const completion = await parseSetup(content, 0, 2);
            (0, chai_1.expect)(completion.items.length).equal(1);
            (0, chai_1.expect)(completion.items[0]).eql((0, verifyError_1.createExpectedCompletion)('name', 'name: my name', 0, 2, 0, 4, 10, 2, {
                documentation: '',
            }));
        });
        it('partial key with trailing spaces with special chars inside the array', async () => {
            const schema = {
                type: 'object',
                properties: {
                    array: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                'name / 123': {
                                    const: 'my name',
                                },
                            },
                        },
                    },
                },
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'array:\n - name /   ';
            const completion = await parseSetup(content, 1, 9);
            (0, chai_1.expect)(completion.items.length).equal(1);
            (0, chai_1.expect)(completion.items[0]).eql((0, verifyError_1.createExpectedCompletion)('name / 123', 'name / 123: my name', 1, 3, 1, 12, 10, 2, {
                documentation: '',
            }));
        });
        describe('partial value with trailing spaces', () => {
            it('partial value with trailing spaces', async () => {
                const schema = {
                    properties: {
                        name: {
                            const: 'my name',
                        },
                    },
                };
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = 'name: my| |   ';
                const completion = await parseCaret(content);
                (0, chai_1.expect)(completion.items.length).equal(1);
                (0, chai_1.expect)(completion.items[0]).eql((0, verifyError_1.createExpectedCompletion)('my name', 'my name', 0, 6, 0, 12, 12, 2, {
                    documentation: undefined,
                }));
            });
            it('partial value with trailing spaces with new line', async () => {
                const schema = {
                    properties: {
                        name: {
                            const: 'my name',
                        },
                    },
                };
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = 'name: my| |   \n';
                const completion = await parseCaret(content);
                (0, chai_1.expect)(completion.items.length).equal(1);
                (0, chai_1.expect)(completion.items[0]).eql((0, verifyError_1.createExpectedCompletion)('my name', 'my name', 0, 6, 0, 13, 12, 2, {
                    documentation: undefined,
                }));
            });
            it('partial value with leading and trailing spaces', async () => {
                const schema = {
                    properties: {
                        name: {
                            const: 'my name',
                        },
                    },
                };
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = 'name:   my na| |   ';
                const completion = await parseCaret(content);
                (0, chai_1.expect)(completion.items.length).equal(1);
                (0, chai_1.expect)(completion.items[0]).eql((0, verifyError_1.createExpectedCompletion)('my name', 'my name', 0, 6, 0, 17, 12, 2, {
                    documentation: undefined,
                }));
            });
            it('partial value with trailing spaces with special chars inside the array', async () => {
                const schema = {
                    type: 'object',
                    properties: {
                        array: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: {
                                        const: 'my name / 123',
                                    },
                                },
                            },
                        },
                    },
                };
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = 'array:\n - name: my name /| |  ';
                const completion = await parseCaret(content);
                (0, chai_1.expect)(completion.items.length).equal(1);
                (0, chai_1.expect)(completion.items[0]).eql((0, verifyError_1.createExpectedCompletion)('my name / 123', 'my name / 123', 1, 9, 1, 21, 12, 2, {
                    documentation: undefined,
                }));
            });
        });
        it('object - 2nd nested property', async () => {
            const schema = {
                properties: {
                    parent: {
                        properties: {
                            prop1: {
                                const: 'const1',
                            },
                            prop2: {
                                const: 'const2',
                            },
                        },
                    },
                },
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'parent:\n  prop1: const1\n  prop2:   ';
            const completion = await parseSetup(content, 2, 9);
            (0, chai_1.expect)(completion.items.length).equal(1);
            (0, chai_1.expect)(completion.items[0].label).to.be.equal('const2');
            (0, chai_1.expect)(completion.items[0].textEdit).to.be.deep.equal({
                newText: 'const2',
                range: vscode_languageserver_types_1.Range.create(2, 9, 2, 11),
            });
        });
        it('array - 2nd nested property', async () => {
            const schema = {
                properties: {
                    arrayObj: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                item1: {
                                    type: 'string',
                                },
                                item2: {
                                    const: 'const2',
                                },
                            },
                            required: ['item1', 'item2'],
                        },
                    },
                },
            };
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'arrayObj:\n  - item1: test\n  - item2:   ';
            const completion = await parseSetup(content, 2, 11);
            (0, chai_1.expect)(completion.items.length).equal(1);
            (0, chai_1.expect)(completion.items[0].label).to.be.equal('const2');
            (0, chai_1.expect)(completion.items[0].textEdit).to.be.deep.equal({
                newText: 'const2',
                range: vscode_languageserver_types_1.Range.create(2, 11, 2, 13),
            });
        });
        describe('array object item', () => {
            const schema = {
                properties: {
                    arrayObj: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                item1: {
                                    type: 'string',
                                },
                                item2: {
                                    type: 'string',
                                },
                            },
                            required: ['item1', 'item2'],
                        },
                    },
                },
            };
            it('1st item', async () => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = 'arrayObj:\n  -   ';
                const completion = await parseSetup(content, 1, 4);
                (0, chai_1.expect)(completion.items.length).equal(3);
                (0, chai_1.expect)(completion.items[1].textEdit).to.be.deep.equal({
                    newText: 'item1: $1\n  item2: $2',
                    range: vscode_languageserver_types_1.Range.create(1, 4, 1, 6), // removes extra spaces after cursor
                });
            });
            it('next item', async () => {
                schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
                const content = 'arrayObj:\n  - item1: a\n  - item2: b\n  -   ';
                const completion = await parseSetup(content, 3, 4);
                (0, chai_1.expect)(completion.items.length).equal(3);
                (0, chai_1.expect)(completion.items[1].textEdit).to.be.deep.equal({
                    newText: 'item1: $1\n  item2: $2',
                    range: vscode_languageserver_types_1.Range.create(3, 4, 3, 6), // removes extra spaces after cursor
                });
            });
        });
        it('array completion - should suggest correct indent when extra spaces after cursor', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    test: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                objA: {
                                    type: 'object',
                                    required: ['itemA'],
                                    properties: {
                                        itemA: {
                                            type: 'string',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            const content = 'test:\n  -               ';
            const result = await parseSetup(content, 1, 4);
            (0, chai_1.expect)(result.items.length).to.be.equal(1);
            (0, chai_1.expect)(result.items[0].insertText).to.be.equal('objA:\n    itemA: ');
        });
        it('array of arrays completion - should suggest correct indent when extra spaces after cursor', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    array1: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['array2'],
                            properties: {
                                array2: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        required: ['objA'],
                                        properties: {
                                            objA: {
                                                type: 'object',
                                                required: ['itemA'],
                                                properties: {
                                                    itemA: {
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
            });
            const content = 'array1:\n  -               ';
            const result = await parseSetup(content, 1, 4);
            (0, chai_1.expect)(result.items.length).to.be.equal(2);
            (0, chai_1.expect)(result.items[0].insertText).to.be.equal('array2:\n    - objA:\n        itemA: ');
        });
        it('object of array of arrays completion - should suggest correct indent when extra spaces after cursor', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, {
                type: 'object',
                properties: {
                    array1: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                array2: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            objA: {
                                                type: 'object',
                                                required: ['itemA'],
                                                properties: {
                                                    itemA: {
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
            });
            const content = 'array1:\n  - array2:\n      -               ';
            const result = await parseSetup(content, 2, 8);
            (0, chai_1.expect)(result.items.length).to.be.equal(1);
            (0, chai_1.expect)(result.items[0].insertText).to.be.equal('objA:\n    itemA: ');
        });
    }); //'extra space after cursor'
    it('should suggest from additionalProperties', async () => {
        const schema = {
            type: 'object',
            additionalProperties: {
                anyOf: [
                    {
                        type: 'string',
                        const: 'test1',
                    },
                ],
            },
        };
        schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
        const content = 'value: ';
        const completion = await parseSetup(content, 0, content.length);
        (0, chai_1.expect)(completion.items.length).equal(1);
        (0, chai_1.expect)(completion.items[0].insertText).to.be.equal('test1');
    });
    it('should suggest defaultSnippets from additionalProperties', async () => {
        const schema = {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                },
            },
            additionalProperties: {
                anyOf: [
                    {
                        type: 'string',
                        defaultSnippets: [{ label: 'snippet', body: 'snippetBody' }],
                    },
                ],
            },
        };
        schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
        const content = 'value: |\n|';
        const completion = await parseCaret(content);
        (0, chai_1.expect)(completion.items.map((i) => i.insertText)).to.be.deep.equal(['snippetBody']);
    });
    describe('should suggest prop of the object (based on not completed prop name)', () => {
        const schema = {
            definitions: {
                Obj: {
                    anyOf: [
                        { type: 'string' },
                        {
                            type: 'object',
                            properties: {
                                prop1: { type: 'string' },
                            },
                            required: ['prop1'],
                        },
                    ],
                },
            },
            properties: {
                test1: {
                    properties: {
                        nested: { $ref: '#/definitions/Obj' },
                    },
                },
                test2: { $ref: '#/definitions/Obj' },
            },
        };
        const content = `
test2: 
  pr
test1:
  nested: 
    pr
`;
        it('nested object', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const completion = await parseSetup(content, 5, 6);
            (0, chai_1.expect)(completion.items.length).equal(2);
            (0, chai_1.expect)(completion.items[0].label).to.be.equal('prop1');
        });
        it('root object', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const completion = await parseSetup(content, 2, 4);
            (0, chai_1.expect)(completion.items.length).equal(2);
            (0, chai_1.expect)(completion.items[0].label).to.be.equal('prop1');
        });
    });
    describe('should suggest property before indented comment', () => {
        const schema = {
            type: 'object',
            properties: {
                example: {
                    type: 'object',
                    properties: {
                        prop1: {
                            type: 'string',
                        },
                        prop2: {
                            type: 'string',
                        },
                        prop3: {
                            type: 'string',
                        },
                    },
                },
            },
        };
        it('completion should handle indented comment on new line', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'example:\n  prop1: "test"\n  \n    #comment';
            const completion = await parseSetup(content, 2, 2);
            (0, chai_1.expect)(completion.items.length).equal(2);
            (0, chai_1.expect)(completion.items[0]).to.be.deep.equal((0, verifyError_1.createExpectedCompletion)('prop2', 'prop2: ', 2, 2, 2, 2, vscode_languageserver_types_1.CompletionItemKind.Property, vscode_languageserver_types_1.InsertTextFormat.Snippet, {
                documentation: '',
            }));
        });
        it('completion should handle comment at same indent level on new line', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'example:\n  prop1: "test"\n  \n  #comment';
            const completion = await parseSetup(content, 2, 2);
            (0, chai_1.expect)(completion.items.length).equal(2);
            (0, chai_1.expect)(completion.items[0]).to.be.deep.equal((0, verifyError_1.createExpectedCompletion)('prop2', 'prop2: ', 2, 2, 2, 2, vscode_languageserver_types_1.CompletionItemKind.Property, vscode_languageserver_types_1.InsertTextFormat.Snippet, {
                documentation: '',
            }));
        });
        it('completion should handle suggestion without comment on next line', async () => {
            schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
            const content = 'example:\n  prop1: "test"\n  \n  prop3: "test"';
            const completion = await parseSetup(content, 2, 2);
            (0, chai_1.expect)(completion.items.length).equal(1);
            (0, chai_1.expect)(completion.items[0]).to.be.deep.equal((0, verifyError_1.createExpectedCompletion)('prop2', 'prop2: ', 2, 2, 2, 2, vscode_languageserver_types_1.CompletionItemKind.Property, vscode_languageserver_types_1.InsertTextFormat.Snippet, {
                documentation: '',
            }));
        });
    });
    it('should suggest property of unknown object', async () => {
        const schema = {
            type: 'object',
            additionalProperties: true,
            propertyNames: {
                title: 'property',
                description: 'Property Description',
            },
        };
        schemaProvider.addSchema(testHelper_1.SCHEMA_ID, schema);
        const content = '';
        const completion = await parseSetup(content, 0, content.length);
        (0, chai_1.expect)(completion.items.length).equal(1);
        (0, chai_1.expect)(completion.items[0].insertText).to.be.equal('${1:property}: ');
        (0, chai_1.expect)(completion.items[0].documentation).to.be.equal('Property Description');
    });
});
//# sourceMappingURL=autoCompletionFix.test.js.map