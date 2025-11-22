"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const jsonParser07_1 = require("./../src/languageservice/parser/jsonParser07");
const vscode_json_languageservice_1 = require("vscode-json-languageservice");
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
describe('JSON Parser', () => {
    function isValid(json) {
        const { jsonDoc } = toDocument(json);
        assert.equal(jsonDoc.syntaxErrors.length, 0);
    }
    function isInvalid(json, ...expectedErrors) {
        const { jsonDoc } = toDocument(json);
        if (expectedErrors.length === 0) {
            assert.ok(jsonDoc.syntaxErrors.length > 0, json);
        }
        else {
            assert.deepEqual(jsonDoc.syntaxErrors.map((e) => e.code), expectedErrors, json);
        }
        // these should be caught by the parser, not the last-ditch guard
        assert.notEqual(jsonDoc.syntaxErrors[0].message, 'Invalid JSON', json);
    }
    function toDocument(text) {
        const textDoc = vscode_languageserver_types_1.TextDocument.create('foo://bar/file.json', 'json', 0, text);
        const ls = (0, vscode_json_languageservice_1.getLanguageService)({});
        const jsonDoc = ls.parseJSONDocument(textDoc);
        return { textDoc, jsonDoc };
    }
    function toRange(text, offset, length) {
        const textDoc = vscode_languageserver_types_1.TextDocument.create('foo://bar/file.json', 'json', 0, text);
        return vscode_languageserver_types_1.Range.create(textDoc.positionAt(offset), textDoc.positionAt(offset + length));
    }
    function validate(text, schema) {
        const { textDoc, jsonDoc } = toDocument(text);
        return jsonDoc.validate(textDoc, schema);
    }
    function assertObject(node, expectedProperties) {
        assert.equal(node.type, 'object');
        assert.equal(node.properties.length, expectedProperties.length);
        const keyList = node.properties.map((p) => p.keyNode.value);
        assert.deepEqual(keyList, expectedProperties);
    }
    it('Invalid body', function () {
        const { jsonDoc } = toDocument('*');
        assert.equal(jsonDoc.syntaxErrors.length, 1);
        isInvalid('{}[]');
    });
    it('Trailing Whitespace', function () {
        isValid('{}\n\n');
    });
    it('No content', function () {
        isValid('');
        isValid('   ');
        isValid('\n\n');
        isValid('/*hello*/  ');
    });
    it('Objects', function () {
        isValid('{}');
        isValid('{"key": "value"}');
        isValid('{"key1": true, "key2": 3, "key3": [null], "key4": { "nested": {}}}');
        isValid('{"constructor": true }');
        isInvalid('{');
        isInvalid('{3:3}');
        isInvalid("{'key': 3}");
        isInvalid('{"key" 3}', vscode_json_languageservice_1.ErrorCode.ColonExpected);
        isInvalid('{"key":3 "key2": 4}', vscode_json_languageservice_1.ErrorCode.CommaExpected);
        isInvalid('{"key":42, }', vscode_json_languageservice_1.ErrorCode.TrailingComma);
        isInvalid('{"key:42', vscode_json_languageservice_1.ErrorCode.UnexpectedEndOfString, vscode_json_languageservice_1.ErrorCode.ColonExpected);
    });
    it('Arrays', function () {
        isValid('[]');
        isValid('[1, 2]');
        isValid('[1, "string", false, {}, [null]]');
        isInvalid('[');
        isInvalid('[,]', vscode_json_languageservice_1.ErrorCode.ValueExpected);
        isInvalid('[1 2]', vscode_json_languageservice_1.ErrorCode.CommaExpected);
        isInvalid('[true false]', vscode_json_languageservice_1.ErrorCode.CommaExpected);
        isInvalid('[1, ]', vscode_json_languageservice_1.ErrorCode.TrailingComma);
        isInvalid('[[]', vscode_json_languageservice_1.ErrorCode.CommaOrCloseBacketExpected);
        isInvalid('["something"');
        isInvalid('[magic]');
    });
    it('Strings', function () {
        isValid('["string"]');
        isValid('["\\"\\\\\\/\\b\\f\\n\\r\\t\\u1234\\u12AB"]');
        isValid('["\\\\"]');
        isInvalid('["');
        isInvalid('["]');
        isInvalid('["\\z"]');
        isInvalid('["\\u"]');
        isInvalid('["\\u123"]');
        isInvalid('["\\u123Z"]');
        isInvalid("['string']");
        isInvalid('"\tabc"', vscode_json_languageservice_1.ErrorCode.InvalidCharacter);
    });
    it('Numbers', function () {
        isValid('[0, -1, 186.1, 0.123, -1.583e+4, 1.583E-4, 5e8]');
        isInvalid('[+1]');
        isInvalid('[01]');
        isInvalid('[1.]');
        isInvalid('[1.1+3]');
        isInvalid('[1.4e]');
        isInvalid('[-A]');
    });
    it('Comments', function () {
        isValid('/*d*/ { } /*e*/');
        isInvalid('/*d { }');
    });
    it('Simple AST', function () {
        {
            const { jsonDoc } = toDocument('{}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const node = jsonDoc.getNodeFromOffset(1);
            assert.equal(node.type, 'object');
            assert.strictEqual(jsonDoc.getNodeFromOffset(2), undefined);
        }
        {
            const { jsonDoc } = toDocument('[null]');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const node = jsonDoc.getNodeFromOffset(2);
            assert.equal(node.type, 'null');
        }
        {
            const { jsonDoc } = toDocument('{"a":true}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            let node = jsonDoc.getNodeFromOffset(3);
            assert.equal(node.type, 'string');
            node = jsonDoc.getNodeFromOffset(4);
            assert.equal(node.type, 'property');
            node = jsonDoc.getNodeFromOffset(0);
            assert.equal(node.type, 'object');
            node = jsonDoc.getNodeFromOffset(10);
            assert.equal(node, undefined);
            node = jsonDoc.getNodeFromOffset(5);
            assert.equal(node.type, 'boolean');
        }
    });
    it('Nested AST', function () {
        const content = '{\n\t"key" : {\n\t"key2": 42\n\t}\n}';
        const { jsonDoc } = toDocument(content);
        assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
    });
    it('Nested AST in Array', function () {
        const { jsonDoc } = toDocument('{"key":[{"key2":42}]}');
        assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
    });
    it('Multiline', function () {
        {
            const content = '{\n\t\n}';
            const { jsonDoc } = toDocument(content);
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const node = jsonDoc.getNodeFromOffset(content.indexOf('\t') + 1);
            assert.notEqual(node, null);
        }
        {
            const content = '{\n"first":true\n\n}';
            const { jsonDoc } = toDocument(content);
            let node = jsonDoc.getNodeFromOffset(content.length - 2);
            assert.equal(node.type, 'object');
            node = jsonDoc.getNodeFromOffset(content.length - 4);
            assert.equal(node.type, 'boolean');
        }
    });
    it('Expand errors to entire tokens', function () {
        const content = '{\n"key":32,\nerror\n}';
        const { jsonDoc } = toDocument(content);
        assert.equal(jsonDoc.syntaxErrors.length, 2);
        assert.deepEqual(jsonDoc.syntaxErrors[0].range, toRange(content, content.indexOf('error'), 5));
    });
    it('Errors at the end of the file', function () {
        const content = '{\n"key":32\n ';
        const { jsonDoc } = toDocument(content);
        assert.equal(jsonDoc.syntaxErrors.length, 1);
        assert.deepEqual(jsonDoc.syntaxErrors[0].range, toRange(content, 9, 1));
    });
    it('Getting keys out of an object', function () {
        const content = '{\n"key":32,\n\n"key2":45}';
        const { jsonDoc } = toDocument(content);
        assert.equal(jsonDoc.syntaxErrors.length, 0);
        const node = jsonDoc.getNodeFromOffset(content.indexOf('32,\n') + 4);
        assertObject(node, ['key', 'key2']);
    });
    it('Missing colon', function () {
        const content = '{\n"key":32,\n"key2"\n"key3": 4 }';
        const { jsonDoc } = toDocument(content);
        assert.equal(jsonDoc.syntaxErrors.length, 1);
        assert.equal(jsonDoc.syntaxErrors[0].code, vscode_json_languageservice_1.ErrorCode.ColonExpected);
        const root = jsonDoc.root;
        assertObject(root, ['key', 'key2', 'key3']);
    });
    it('Missing comma', function () {
        const content = '{\n"key":32,\n"key2": 1 \n"key3": 4 }';
        const { jsonDoc } = toDocument(content);
        assert.equal(jsonDoc.syntaxErrors.length, 1);
        assert.equal(jsonDoc.syntaxErrors[0].code, vscode_json_languageservice_1.ErrorCode.CommaExpected);
        assertObject(jsonDoc.root, ['key', 'key2', 'key3']);
    });
    it('Validate types', function () {
        const str = '{"number": 3.4, "integer": 42, "string": "some string", "boolean":true, "null":null, "object":{}, "array":[1, 2]}';
        const { textDoc, jsonDoc } = toDocument(str);
        assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
        let semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
        });
        assert.strictEqual(semanticErrors.length, 0);
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'array',
        });
        assert.strictEqual(semanticErrors.length, 1);
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                number: {
                    type: 'number',
                },
                integer: {
                    type: 'integer',
                },
                string: {
                    type: 'string',
                },
                boolean: {
                    type: 'boolean',
                },
                null: {
                    type: 'null',
                },
                object: {
                    type: 'object',
                },
                array: {
                    type: 'array',
                },
            },
        });
        assert.strictEqual(semanticErrors.length, 0);
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                number: {
                    type: 'array',
                },
                integer: {
                    type: 'string',
                },
                string: {
                    type: 'object',
                },
                boolean: {
                    type: 'null',
                },
                null: {
                    type: 'integer',
                },
                object: {
                    type: 'boolean',
                },
                array: {
                    type: 'number',
                },
            },
        });
        assert.strictEqual(semanticErrors.length, 7);
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                number: {
                    type: 'integer',
                },
            },
        });
        assert.strictEqual(semanticErrors.length, 1);
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                integer: {
                    type: 'number',
                },
            },
        });
        assert.strictEqual(semanticErrors.length, 0);
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                array: {
                    type: 'array',
                    items: {
                        type: 'integer',
                    },
                },
            },
        });
        assert.strictEqual(semanticErrors.length, 0);
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                array: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                },
            },
        });
        assert.strictEqual(semanticErrors.length, 2);
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                array: false,
            },
        });
        assert.strictEqual(semanticErrors.length, 1);
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                array: true,
            },
        });
        assert.strictEqual(semanticErrors.length, 0);
    });
    it('Required properties', function () {
        const str = '{"integer": 42, "string": "some string", "boolean":true}';
        const { textDoc, jsonDoc } = toDocument(str);
        assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
        let semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            required: ['string'],
        });
        assert.strictEqual(semanticErrors.length, 0);
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            required: ['notpresent'],
        });
        assert.strictEqual(semanticErrors.length, 1);
    });
    it('Arrays', function () {
        const str = '[1, 2, 3]';
        const { textDoc, jsonDoc } = toDocument(str);
        assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
        let semanticErrors = jsonDoc.validate(textDoc, {
            type: 'array',
            items: {
                type: 'number',
            },
            minItems: 1,
            maxItems: 5,
        });
        assert.strictEqual(semanticErrors.length, 0);
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'array',
            items: {
                type: 'number',
            },
            minItems: 10,
        });
        assert.strictEqual(semanticErrors.length, 1);
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'array',
            items: {
                type: 'number',
            },
            maxItems: 2,
        });
        assert.strictEqual(semanticErrors.length, 1);
    });
    it('Strings', function () {
        const str = '{"one":"test"}';
        const { textDoc, jsonDoc } = toDocument(str);
        assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
        let semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                one: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 10,
                },
            },
        });
        assert.strictEqual(semanticErrors.length, 0);
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                one: {
                    type: 'string',
                    minLength: 10,
                },
            },
        });
        assert.strictEqual(semanticErrors.length, 1);
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                one: {
                    type: 'string',
                    maxLength: 3,
                },
            },
        });
        assert.strictEqual(semanticErrors.length, 1);
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                one: {
                    type: 'string',
                    pattern: '^test$',
                },
            },
        });
        assert.strictEqual(semanticErrors.length, 0);
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                one: {
                    type: 'string',
                    pattern: 'fail',
                },
            },
        });
        assert.strictEqual(semanticErrors.length, 1);
        const schemaWithURI = {
            type: 'object',
            properties: {
                one: {
                    type: 'string',
                    format: 'uri',
                },
            },
        };
        semanticErrors = jsonDoc.validate(textDoc, schemaWithURI);
        assert.strictEqual(semanticErrors.length, 1);
        assert.strictEqual(semanticErrors[0].message, 'String is not a URI: URI with a scheme is expected.');
        semanticErrors = validate('{"one":"http://foo/bar"}', schemaWithURI);
        assert.strictEqual(semanticErrors.length, 0);
        semanticErrors = validate('{"one":""}', schemaWithURI);
        assert.strictEqual(semanticErrors.length, 1);
        assert.strictEqual(semanticErrors[0].message, 'String is not a URI: URI expected.');
        semanticErrors = validate('{"one":"//foo/bar"}', schemaWithURI);
        assert.strictEqual(semanticErrors.length, 1);
        assert.strictEqual(semanticErrors[0].message, 'String is not a URI: URI with a scheme is expected.');
        const schemaWithURIReference = {
            type: 'object',
            properties: {
                one: {
                    type: 'string',
                    format: 'uri-reference',
                },
            },
        };
        semanticErrors = validate('{"one":""}', schemaWithURIReference);
        assert.strictEqual(semanticErrors.length, 1, 'uri-reference');
        assert.strictEqual(semanticErrors[0].message, 'String is not a URI: URI expected.');
        semanticErrors = validate('{"one":"//foo/bar"}', schemaWithURIReference);
        assert.strictEqual(semanticErrors.length, 0, 'uri-reference');
        const schemaWithEMail = {
            type: 'object',
            properties: {
                mail: {
                    type: 'string',
                    format: 'email',
                },
            },
        };
        semanticErrors = validate('{"mail":"foo@bar.com"}', schemaWithEMail);
        assert.strictEqual(semanticErrors.length, 0, 'email');
        semanticErrors = validate('{"mail":"foo"}', schemaWithEMail);
        assert.strictEqual(semanticErrors.length, 1, 'email');
        assert.strictEqual(semanticErrors[0].message, 'String is not an e-mail address.');
        const schemaWithColor = {
            type: 'object',
            properties: {
                color: {
                    type: 'string',
                    format: 'color-hex',
                },
            },
        };
        semanticErrors = validate('{"color":"#FF00FF"}', schemaWithColor);
        assert.strictEqual(semanticErrors.length, 0, 'email');
        semanticErrors = validate('{"color":"#FF00F"}', schemaWithColor);
        assert.strictEqual(semanticErrors.length, 1, 'email');
        assert.strictEqual(semanticErrors[0].message, 'Invalid color format. Use #RGB, #RGBA, #RRGGBB or #RRGGBBAA.');
        const schemaWithDateTime = {
            type: 'object',
            properties: {
                'date-time': {
                    type: 'string',
                    format: 'date-time',
                },
                date: {
                    type: 'string',
                    format: 'date',
                },
                time: {
                    type: 'string',
                    format: 'time',
                },
            },
        };
        semanticErrors = validate('{"date-time":"1985-04-12T23:20:50.52Z"}', schemaWithDateTime);
        assert.strictEqual(semanticErrors.length, 0, 'date-time');
        semanticErrors = validate('{"date-time":"1996-12-19T16:39:57-08:00"}', schemaWithDateTime);
        assert.strictEqual(semanticErrors.length, 0, 'date-time');
        semanticErrors = validate('{"date-time":"1990-12-31T23:59:60Z"}', schemaWithDateTime);
        assert.strictEqual(semanticErrors.length, 0, 'date-time');
        semanticErrors = validate('{"date-time":"1937-01-01T12:00:27.87+00:20"}', schemaWithDateTime);
        assert.strictEqual(semanticErrors.length, 0, 'date-time');
        semanticErrors = validate('{"date-time":"198a-04-12T23:20:50.52Z"}', schemaWithDateTime);
        assert.strictEqual(semanticErrors.length, 1, 'date-time');
        assert.strictEqual(semanticErrors[0].message, 'String is not a RFC3339 date-time.');
        semanticErrors = validate('{"date-time":"198a-04-12"}', schemaWithDateTime);
        assert.strictEqual(semanticErrors.length, 1, 'date-time');
        assert.strictEqual(semanticErrors[0].message, 'String is not a RFC3339 date-time.');
        semanticErrors = validate('{"date-time":""}', schemaWithDateTime);
        assert.strictEqual(semanticErrors.length, 1, 'date-time');
        assert.strictEqual(semanticErrors[0].message, 'String is not a RFC3339 date-time.');
        semanticErrors = validate('{"date":"1937-01-01"}', schemaWithDateTime);
        assert.strictEqual(semanticErrors.length, 0, 'date');
        semanticErrors = validate('{"date":"23:20:50.52Z"}', schemaWithDateTime);
        assert.strictEqual(semanticErrors.length, 1, 'date');
        assert.strictEqual(semanticErrors[0].message, 'String is not a RFC3339 date.');
        semanticErrors = validate('{"time":"23:20:50.52Z"}', schemaWithDateTime);
        assert.strictEqual(semanticErrors.length, 0, 'time');
        semanticErrors = validate('{"time":"198a-04-12T23:20:50.52Z"}', schemaWithDateTime);
        assert.strictEqual(semanticErrors.length, 1, 'time');
        assert.strictEqual(semanticErrors[0].message, 'String is not a RFC3339 time.');
    });
    it('Numbers', function () {
        const str = '{"one": 13.45e+1}';
        const { textDoc, jsonDoc } = toDocument(str);
        assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
        let semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                one: {
                    type: 'number',
                    minimum: 1,
                    maximum: 135,
                },
            },
        });
        assert.strictEqual(semanticErrors.length, 0);
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                one: {
                    type: 'number',
                    minimum: 200,
                },
            },
        });
        assert.strictEqual(semanticErrors.length, 1, 'below minimum');
        assert.strictEqual(semanticErrors[0].message, 'Value is below the minimum of 200.');
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                one: {
                    type: 'number',
                    maximum: 130,
                },
            },
        });
        assert.strictEqual(semanticErrors.length, 1, 'above maximum');
        assert.strictEqual(semanticErrors[0].message, 'Value is above the maximum of 130.');
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                one: {
                    type: 'number',
                    minimum: 134.5,
                    exclusiveMinimum: true,
                },
            },
        });
        assert.strictEqual(semanticErrors.length, 1, 'at exclusive mininum');
        assert.strictEqual(semanticErrors[0].message, 'Value is below the exclusive minimum of 134.5.');
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                one: {
                    type: 'number',
                    minimum: 134.5,
                    exclusiveMinimum: false,
                },
            },
        });
        assert.strictEqual(semanticErrors.length, 0);
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                one: {
                    type: 'number',
                    exclusiveMinimum: 134.5,
                },
            },
        });
        assert.strictEqual(semanticErrors.length, 1, 'at exclusive mininum');
        assert.strictEqual(semanticErrors[0].message, 'Value is below the exclusive minimum of 134.5.');
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                one: {
                    type: 'number',
                    maximum: 134.5,
                    exclusiveMaximum: true,
                },
            },
        });
        assert.strictEqual(semanticErrors.length, 1, 'at exclusive mininum');
        assert.strictEqual(semanticErrors[0].message, 'Value is above the exclusive maximum of 134.5.');
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                one: {
                    type: 'number',
                    maximum: 134.5,
                    exclusiveMaximum: false,
                },
            },
        });
        assert.strictEqual(semanticErrors.length, 0);
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                one: {
                    type: 'number',
                    exclusiveMaximum: 134.5,
                },
            },
        });
        assert.strictEqual(semanticErrors.length, 1, 'at exclusive mininum');
        assert.strictEqual(semanticErrors[0].message, 'Value is above the exclusive maximum of 134.5.');
        semanticErrors = jsonDoc.validate(textDoc, {
            type: 'object',
            properties: {
                one: {
                    type: 'number',
                    minimum: 134.5,
                    maximum: 134.5,
                },
            },
        });
        assert.strictEqual(semanticErrors.length, 0, 'equal to min and max');
    });
    it('getNodeFromOffset', function () {
        const content = '{"a": 1,\n\n"d": 2}';
        const { jsonDoc } = toDocument(content);
        assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
        const node = jsonDoc.getNodeFromOffset(content.indexOf(': 2') + 1);
        assert.strictEqual(node.type, 'property');
    });
    it('Duplicate keys', function () {
        {
            const { jsonDoc } = toDocument('{"a": 1, "a": 2}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 2, 'Keys should not be the same');
        }
        {
            const { jsonDoc } = toDocument('{"a": { "a": 2, "a": 3}}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 2, 'Keys should not be the same');
        }
        {
            const { jsonDoc } = toDocument('[{ "a": 2, "a": 3, "a": 7}]');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 3, 'Keys should not be the same');
        }
    });
    it('allOf', function () {
        const schema = {
            id: 'test://schemas/main',
            allOf: [
                {
                    type: 'object',
                },
                {
                    properties: {
                        prop1: {
                            type: 'number',
                        },
                    },
                },
                {
                    properties: {
                        prop2: {
                            type: 'boolean',
                        },
                    },
                },
            ],
        };
        {
            const { textDoc, jsonDoc } = toDocument('{"prop1": 42, "prop2": true}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"prop1": 42, "prop2": 123}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
    });
    it('anyOf', function () {
        const schema = {
            id: 'test://schemas/main',
            anyOf: [
                {
                    properties: {
                        prop1: {
                            type: 'number',
                        },
                    },
                },
                {
                    properties: {
                        prop2: {
                            type: 'boolean',
                        },
                    },
                },
            ],
        };
        {
            const str = '{"prop1": 42, "prop2": true}';
            const { textDoc, jsonDoc } = toDocument(str);
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"prop1": 42, "prop2": 123}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"prop1": "a string", "prop2": 123}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
    });
    it('oneOf', function () {
        const schema = {
            id: 'test://schemas/main',
            oneOf: [
                {
                    properties: {
                        prop1: {
                            type: 'number',
                        },
                    },
                },
                {
                    properties: {
                        prop2: {
                            type: 'boolean',
                        },
                    },
                },
            ],
        };
        {
            const { textDoc, jsonDoc } = toDocument('{"prop1": 42, "prop2": true}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"prop1": 42, "prop2": 123}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"prop1": "a string", "prop2": 123}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
    });
    it('not', function () {
        const schema = {
            id: 'test://schemas/main',
            not: {
                properties: {
                    prop1: {
                        type: 'number',
                    },
                },
            },
        };
        {
            const { textDoc, jsonDoc } = toDocument('{"prop1": 42, "prop2": true}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"prop1": "test"}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
    });
    it('if/then/else', function () {
        const schema = {
            id: 'test://schemas/main',
            if: {
                properties: {
                    foo: {
                        const: 'bar',
                    },
                },
            },
            then: {
                properties: {
                    abc: {
                        type: 'boolean',
                    },
                },
            },
            else: {
                properties: {
                    abc: {
                        type: 'string',
                    },
                },
            },
        };
        {
            const { textDoc, jsonDoc } = toDocument('{"foo": "bar", "abc": true}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"foo": "bar", "abc": "baz"}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"foo": "test", "abc": true}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"foo": "test", "abc": "baz"}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
    });
    it('nested if/then/else', function () {
        const schema = {
            id: 'test://schemas/main',
            if: {
                properties: {
                    foo: {
                        const: 'bar',
                    },
                },
            },
            then: {
                properties: {
                    abc: {
                        type: 'boolean',
                    },
                },
            },
            else: {
                if: {
                    properties: {
                        foo: {
                            const: 'baz',
                        },
                    },
                },
                then: {
                    properties: {
                        abc: {
                            type: 'array',
                        },
                    },
                },
                else: {
                    properties: {
                        abc: {
                            type: 'string',
                        },
                    },
                },
            },
        };
        {
            const { textDoc, jsonDoc } = toDocument('{"foo": "bar", "abc": true}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"foo": "bar", "abc": "baz"}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"foo": "baz", "abc": []}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"foo": "baz", "abc": "baz"}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"foo": "test", "abc": true}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"foo": "test", "abc": "baz"}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
    });
    it('minProperties', function () {
        const { textDoc, jsonDoc } = toDocument('{"prop1": 42, "prop2": true}');
        const schema = {
            minProperties: 2,
        };
        let semanticErrors = jsonDoc.validate(textDoc, schema);
        assert.strictEqual(semanticErrors.length, 0);
        schema.minProperties = 1;
        semanticErrors = jsonDoc.validate(textDoc, schema);
        assert.strictEqual(semanticErrors.length, 0);
        schema.minProperties = 3;
        semanticErrors = jsonDoc.validate(textDoc, schema);
        assert.strictEqual(semanticErrors.length, 1);
    });
    it('maxProperties', function () {
        const { textDoc, jsonDoc } = toDocument('{"prop1": 42, "prop2": true}');
        const schema = {
            maxProperties: 2,
        };
        let semanticErrors = jsonDoc.validate(textDoc, schema);
        assert.strictEqual(semanticErrors.length, 0);
        schema.maxProperties = 3;
        semanticErrors = jsonDoc.validate(textDoc, schema);
        assert.strictEqual(semanticErrors.length, 0);
        schema.maxProperties = 1;
        semanticErrors = jsonDoc.validate(textDoc, schema);
        assert.strictEqual(semanticErrors.length, 1);
    });
    it('patternProperties', function () {
        let schema = {
            id: 'test://schemas/main',
            patternProperties: {
                '^prop\\d$': {
                    type: 'number',
                },
            },
        };
        {
            const { textDoc, jsonDoc } = toDocument('{"prop1": 42, "prop2": 42}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"prop1": 42, "prop2": true}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"prop1": 42, "prop2": 123, "aprop3": true}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        schema = {
            id: 'test://schemas/main',
            patternProperties: {
                '^prop\\d$': true,
                '^invalid$': false,
            },
        };
        {
            const { textDoc, jsonDoc } = toDocument('{"prop1": 42 }');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"invalid": 42 }');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
    });
    it('additionalProperties', function () {
        let schema = {
            additionalProperties: {
                type: 'number',
            },
        };
        {
            const { textDoc, jsonDoc } = toDocument('{"prop1": 42, "prop2": 42}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"prop1": 42, "prop2": true}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
        schema = {
            properties: {
                prop1: {
                    type: 'boolean',
                },
            },
            additionalProperties: {
                type: 'number',
            },
        };
        {
            const { textDoc, jsonDoc } = toDocument('{"prop1": true, "prop2": 42}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        schema = {
            properties: {
                prop1: {
                    type: 'boolean',
                },
            },
            additionalProperties: false,
        };
        {
            const { textDoc, jsonDoc } = toDocument('{"prop1": true, "prop2": 42}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"prop1": true}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
    });
    it('enum', function () {
        let schema = {
            properties: {
                prop: {
                    enum: ['violin', 'harmonica', 'banjo'],
                },
            },
        };
        {
            const { textDoc, jsonDoc } = toDocument('{"prop": "harmonica"}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"prop": "harp"}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
        schema = {
            properties: {
                prop: {
                    enum: [1, 42, 999],
                },
            },
        };
        {
            const { textDoc, jsonDoc } = toDocument('{"prop": 42}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"prop": 1337}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
        schema = {
            properties: {
                prop: {
                    enum: ['violin', { name: 'David' }, null],
                },
            },
        };
        {
            const { textDoc, jsonDoc } = toDocument('{"prop": { "name": "David" }}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
    });
    it('const', function () {
        const schema = {
            properties: {
                prop: {
                    const: 'violin',
                },
            },
        };
        {
            const { textDoc, jsonDoc } = toDocument('{"prop": "violin"}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"prop": "harmonica"}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
            assert.strictEqual(semanticErrors[0].code, vscode_json_languageservice_1.ErrorCode.EnumValueMismatch);
        }
        {
            const schema = {
                properties: {
                    prop: {
                        const: { foo: 2 },
                    },
                },
            };
            const { textDoc, jsonDoc } = toDocument('{"prop": { "foo": 2 }');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
    });
    it('oneOf const', function () {
        const schema = {
            properties: {
                prop: {
                    oneOf: [
                        {
                            const: 0,
                            title: 'Value of 0',
                        },
                        {
                            const: 1,
                            title: 'Value of 1',
                        },
                        {
                            const: 2,
                            title: 'Value of 2',
                        },
                    ],
                },
            },
        };
        {
            const { textDoc, jsonDoc } = toDocument('{"prop": 0}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"prop": 4}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
            assert.strictEqual(semanticErrors[0].code, vscode_json_languageservice_1.ErrorCode.EnumValueMismatch);
        }
    });
    it('propertyNames', function () {
        const schema = {
            propertyNames: {
                type: 'string',
                minLength: 2,
                maxLength: 6,
            },
        };
        {
            const { textDoc, jsonDoc } = toDocument('{"violin": true}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"harmonica": false, "violin": true}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
            assert.strictEqual(semanticErrors[0].message, 'String is longer than the maximum length of 6.');
        }
    });
    it('uniqueItems', function () {
        const { textDoc, jsonDoc } = toDocument('[1, 2, 3]');
        const schema = {
            type: 'array',
            uniqueItems: true,
        };
        {
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('[1, 2, 3, 2]');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
        {
            const { textDoc, jsonDoc } = toDocument('[1, 2, "string", 52, "string"]');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
    });
    it('containsItem', function () {
        const schema = {
            type: 'array',
            contains: { type: 'number', const: 3 },
        };
        {
            const { textDoc, jsonDoc } = toDocument('[1, 2, 3]');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('[1, 2, 5]');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
    });
    it('items as array', function () {
        const schema = {
            type: 'array',
            items: [
                {
                    type: 'integer',
                },
                {
                    type: 'boolean',
                },
                {
                    type: 'string',
                },
            ],
        };
        {
            const { textDoc, jsonDoc } = toDocument('[1, true, "string"]');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('["string", 1, true]');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 3);
        }
        {
            const { textDoc, jsonDoc } = toDocument('[1, true, "string", "another", 42]');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
    });
    it('additionalItems', function () {
        let schema = {
            type: 'array',
            items: [
                {
                    type: 'integer',
                },
                {
                    type: 'boolean',
                },
                {
                    type: 'string',
                },
            ],
            additionalItems: false,
        };
        {
            const { textDoc, jsonDoc } = toDocument('[1, true, "string"]');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('[1, true, "string", 42]');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
        schema = {
            type: 'array',
            items: [
                {
                    type: 'integer',
                },
                {
                    type: 'boolean',
                },
                {
                    type: 'string',
                },
            ],
            additionalItems: {
                type: 'boolean',
            },
        };
        {
            const { textDoc, jsonDoc } = toDocument('[1, true, "string"]');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('[1, true, "string", false, true]');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('[1, true, "string", true, "Hello"]');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
    });
    it('multipleOf', function () {
        const schema = {
            type: 'array',
            items: {
                type: 'integer',
                multipleOf: 2,
            },
        };
        {
            const { textDoc, jsonDoc } = toDocument('[42]');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('[43]');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
    });
    it('dependencies with array', function () {
        const schema = {
            type: 'object',
            properties: {
                a: {
                    type: 'boolean',
                },
            },
            dependencies: {
                a: ['b'],
            },
        };
        {
            const { textDoc, jsonDoc } = toDocument('{"a":true, "b":42}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"a":true}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
    });
    it('dependencies with schema', function () {
        const schema = {
            type: 'object',
            properties: {
                a: {
                    type: 'boolean',
                },
            },
            dependencies: {
                a: {
                    properties: {
                        b: {
                            type: 'integer',
                        },
                    },
                },
            },
        };
        {
            const { textDoc, jsonDoc } = toDocument('{"a":true, "b":42}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"a":true}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"a":true, "b": "string"}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
    });
    it('type as array', function () {
        const schema = {
            type: 'object',
            properties: {
                prop: {
                    type: ['number', 'string'],
                },
            },
        };
        {
            const { textDoc, jsonDoc } = toDocument('{"prop": 42}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"prop": "string"}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 0);
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"prop": true}');
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
        }
    });
    it('deprecated', function () {
        const { textDoc, jsonDoc } = toDocument('{"prop": 42}');
        const schema = {
            type: 'object',
            properties: {
                prop: {
                    deprecationMessage: 'Prop is deprecated',
                },
            },
        };
        const semanticErrors = jsonDoc.validate(textDoc, schema);
        assert.strictEqual(semanticErrors.length, 1);
    });
    it('Strings with spaces', function () {
        const { jsonDoc } = toDocument('{"key1":"first string", "key2":["second string"]}');
        assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
        let node = jsonDoc.getNodeFromOffset(9);
        assert.strictEqual((0, jsonParser07_1.getNodeValue)(node), 'first string');
        node = jsonDoc.getNodeFromOffset(34);
        assert.strictEqual((0, jsonParser07_1.getNodeValue)(node), 'second string');
    });
    it('Schema information on node', function () {
        const { jsonDoc } = toDocument('{"key":42}');
        assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
        const schema = {
            type: 'object',
            properties: {
                key: {
                    oneOf: [
                        {
                            type: 'number',
                            description: 'this is a number',
                        },
                        {
                            type: 'string',
                            description: 'this is a string',
                        },
                    ],
                },
            },
        };
        const node = jsonDoc.getNodeFromOffset(7);
        assert.strictEqual(node.type, 'number');
        assert.strictEqual((0, jsonParser07_1.getNodeValue)(node), 42);
        const matchingSchemas = jsonDoc.getMatchingSchemas(schema);
        const schemas = matchingSchemas.filter((s) => s.node === node && !s.inverted).map((s) => s.schema);
        assert.ok(Array.isArray(schemas));
        // 0 is the most specific schema,
        // 1 is the schema that contained the "oneOf" clause,
        assert.strictEqual(schemas.length, 2);
        assert.strictEqual(schemas[0].description, 'this is a number');
    });
    it('parse with comments', function () {
        function parse(v) {
            const { jsonDoc } = toDocument(v);
            assert.equal(jsonDoc.syntaxErrors.length, 0);
            return (0, jsonParser07_1.getNodeValue)(jsonDoc.root);
        }
        let value = parse('// comment\n{\n"far": "boo"\n}');
        assert.equal(value.far, 'boo');
        value = parse('/* comm\nent\nent */\n{\n"far": "boo"\n}');
        assert.equal(value.far, 'boo');
        value = parse('{\n"far": "boo"\n}');
        assert.equal(value.far, 'boo');
    });
    it('parse with comments collected', function () {
        function assertParse(v, expectedComments) {
            const { jsonDoc } = toDocument(v);
            assert.equal(jsonDoc.comments.length, expectedComments);
        }
        assertParse('// comment\n{\n"far": "boo"\n}', 1);
        assertParse('/* comm\nent\nent */\n{\n"far": "boo"\n}', 1);
        assertParse('{\n"far": "boo"\n}', 0);
    });
    it('validate alternatives', function () {
        const schema = {
            type: 'object',
            properties: {
                key: {
                    oneOf: [
                        {
                            type: 'object',
                            properties: {
                                type: {
                                    enum: ['foo'],
                                },
                                prop1: {
                                    type: 'boolean',
                                },
                                prop2: {
                                    type: 'boolean',
                                },
                            },
                        },
                        {
                            type: 'object',
                            properties: {
                                type: {
                                    enum: ['bar'],
                                },
                                prop2: {
                                    type: 'number',
                                },
                            },
                        },
                    ],
                },
            },
        };
        {
            const { textDoc, jsonDoc } = toDocument('{"key":{"type":"foo", "prop2":1 }}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
            assert.strictEqual(semanticErrors[0].message, 'Incorrect type. Expected "boolean".');
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"key":{"type":"bar", "prop1":true, "prop2":false }}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
            assert.strictEqual(semanticErrors[0].message, 'Incorrect type. Expected "number".');
        }
    });
    it('validate alternatives 2', function () {
        const schema = {
            type: 'object',
            properties: {
                key: {
                    oneOf: [
                        {
                            type: 'object',
                            properties: {
                                type: {
                                    enum: ['foo'],
                                },
                                prop1: {
                                    enum: ['v1, v2'],
                                },
                                prop2: {
                                    enum: ['w1', 'w2'],
                                },
                            },
                        },
                        {
                            type: 'object',
                            properties: {
                                type: {
                                    enum: ['bar'],
                                },
                                prop2: {
                                    enum: ['x1', 'x2'],
                                },
                            },
                        },
                    ],
                },
            },
        };
        {
            const { textDoc, jsonDoc } = toDocument('{"key":{"type":"foo", "prop2":"x1" }}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
            assert.strictEqual(semanticErrors[0].message, 'Value is not accepted. Valid values: "w1", "w2".');
        }
        {
            const { textDoc, jsonDoc } = toDocument('{"key":{"type":"bar", "prop1":"v1", "prop2":"w1" }}');
            assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
            const semanticErrors = jsonDoc.validate(textDoc, schema);
            assert.strictEqual(semanticErrors.length, 1);
            assert.strictEqual(semanticErrors[0].message, 'Value is not accepted. Valid values: "x1", "x2".');
        }
    });
    it('enum value merge', function () {
        const schema = {
            type: 'object',
            properties: {
                key: {
                    oneOf: [
                        {
                            enum: ['a', 'b'],
                        },
                        {
                            enum: ['c', 'd'],
                        },
                    ],
                },
            },
        };
        const { textDoc, jsonDoc } = toDocument('{"key":3 }');
        assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
        const semanticErrors = jsonDoc.validate(textDoc, schema);
        assert.strictEqual(semanticErrors.length, 1);
        assert.strictEqual(semanticErrors[0].message, 'Value is not accepted. Valid values: "a", "b", "c", "d".');
    });
    it('value matches more than one schema in oneOf', function () {
        const schema = {
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
        };
        const { textDoc, jsonDoc } = toDocument('{"repository":"@bitnami"}');
        assert.strictEqual(jsonDoc.syntaxErrors.length, 0);
        const semanticErrors = jsonDoc.validate(textDoc, schema);
        assert.strictEqual(semanticErrors.length, 0);
    });
    it('validate API', async function () {
        const { textDoc, jsonDoc } = toDocument('{ "pages": [  "pages/index", "pages/log", ] }');
        const ls = (0, vscode_json_languageservice_1.getLanguageService)({});
        let res = await ls.doValidation(textDoc, jsonDoc);
        assert.strictEqual(res.length, 1);
        assert.strictEqual(res[0].message, 'Trailing comma');
        res = await ls.doValidation(textDoc, jsonDoc, { trailingCommas: 'error' });
        assert.strictEqual(res.length, 1);
        assert.strictEqual(res[0].message, 'Trailing comma');
        res = await ls.doValidation(textDoc, jsonDoc, { trailingCommas: 'ignore' });
        assert.strictEqual(res.length, 0);
        const schema = { type: 'object', required: ['foo'] };
        res = await ls.doValidation(textDoc, jsonDoc, { trailingCommas: 'ignore' }, schema);
        assert.strictEqual(res.length, 1);
        assert.strictEqual(res[0].message, 'Missing property "foo".');
    });
});
//# sourceMappingURL=jsonParser.test.js.map