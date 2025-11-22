"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaItSelfCustomSchemaProvider = exports.TestCustomSchemaProvider = exports.caretPosition = exports.setupLanguageService = exports.testFileSystem = exports.setupSchemaIDTextDocument = exports.setupTextDocument = exports.SCHEMA_ID = exports.TEST_URI = exports.toFsPath = void 0;
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const node_1 = require("vscode-languageserver/node");
const path = require("path");
const fs_1 = require("fs");
const yamlSettings_1 = require("../../src/yamlSettings");
const schemaRequestHandler_1 = require("../../src/languageservice/services/schemaRequestHandler");
const yamlServerInit_1 = require("../../src/yamlServerInit");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const vscode_json_languageservice_1 = require("vscode-json-languageservice");
const yaml_documents_1 = require("../../src/languageservice/parser/yaml-documents");
const testsTypes_1 = require("./testsTypes");
function toFsPath(str) {
    if (typeof str !== 'string') {
        throw new TypeError(`Expected a string, got ${typeof str}`);
    }
    let pathName;
    pathName = path.resolve(str);
    pathName = pathName.replace(/\\/g, '/');
    // Windows drive letter must be prefixed with a slash
    if (pathName[0] !== '/') {
        pathName = `/${pathName}`;
    }
    return encodeURI(`file://${pathName}`).replace(/[?#]/g, encodeURIComponent);
}
exports.toFsPath = toFsPath;
exports.TEST_URI = 'file://~/Desktop/vscode-k8s/test.yaml';
exports.SCHEMA_ID = 'default_schema_id.yaml';
function setupTextDocument(content) {
    yaml_documents_1.yamlDocumentsCache.clear(); // clear cache
    return vscode_languageserver_textdocument_1.TextDocument.create(exports.TEST_URI, 'yaml', 0, content);
}
exports.setupTextDocument = setupTextDocument;
function setupSchemaIDTextDocument(content, customSchemaID) {
    yaml_documents_1.yamlDocumentsCache.clear(); // clear cache
    if (customSchemaID) {
        return vscode_languageserver_textdocument_1.TextDocument.create(customSchemaID, 'yaml', 0, content);
    }
    else {
        return vscode_languageserver_textdocument_1.TextDocument.create(exports.SCHEMA_ID, 'yaml', 0, content);
    }
}
exports.setupSchemaIDTextDocument = setupSchemaIDTextDocument;
exports.testFileSystem = { readFile: (fsPath) => fs_1.promises.readFile(fsPath).then((c) => c.toString()) };
function setupLanguageService(languageSettings) {
    const yamlSettings = new yamlSettings_1.SettingsState();
    process.argv.push('--node-ipc');
    const connection = (0, node_1.createConnection)();
    const schemaRequestHandlerWrapper = (connection, uri) => {
        const testSchemaProvider = TestCustomSchemaProvider.instance();
        const testSchema = testSchemaProvider.getContentForSchema(uri);
        if (testSchema) {
            return Promise.resolve(testSchema);
        }
        return (0, schemaRequestHandler_1.schemaRequestHandler)(connection, uri, yamlSettings.workspaceFolders, yamlSettings.workspaceRoot, yamlSettings.useVSCodeContentRequest, exports.testFileSystem);
    };
    const schemaRequestService = schemaRequestHandlerWrapper.bind(this, connection);
    const telemetry = new testsTypes_1.TestTelemetry(connection);
    const serverInit = new yamlServerInit_1.YAMLServerInit(connection, yamlSettings, schemaRequestHandler_1.workspaceContext, schemaRequestService, telemetry);
    serverInit.connectionInitialized({
        processId: null,
        capabilities: vscode_json_languageservice_1.ClientCapabilities.LATEST,
        rootUri: null,
        workspaceFolders: null,
    });
    const languageService = serverInit.languageService;
    const validationHandler = serverInit.validationHandler;
    const languageHandler = serverInit.languageHandler;
    languageService.configure(languageSettings);
    const schemaProvider = TestCustomSchemaProvider.instance();
    languageService.registerCustomSchemaProvider(schemaItSelfCustomSchemaProvider);
    return {
        languageService,
        validationHandler,
        languageHandler,
        yamlSettings,
        telemetry,
        schemaProvider,
    };
}
exports.setupLanguageService = setupLanguageService;
/**
 * Derives the absolute `position` of the caret given `content` containing a virtual caret.
 * @param content The content of the document.
 * The caret is located in the content using `|` bookends.
 * For example, `content = 'ab|c|d'` places the caret over the `'c'`, at `position = 2`
 * @returns The absolute position of the caret.
 */
function caretPosition(content) {
    // console.log(`was: len: ${content.length}, content: "${content}", str: "${content.substring(position)}"`);
    // Find bookends `|.|` in content
    const position = content.search(/\|[^]\|/); // | -> any char including newline -> |
    if (position === -1)
        throw new Error('Error in test case: no caret found in content');
    // Elide bookends from content
    content = content.substring(0, position) + content.substring(position + 1, position + 2) + content.substring(position + 3);
    // console.log(`now: len: ${content.length}, content: "${content}", pos: ${position}, str: "${content.substring(position)}"`);
    return { position, content };
}
exports.caretPosition = caretPosition;
/*
 * A class that provides custom schemas for testing purposes.
 */
class TestCustomSchemaProvider {
    constructor() {
        this.schemas = new Array(0);
        // use instance only
    }
    static instance() {
        if (!TestCustomSchemaProvider.self) {
            TestCustomSchemaProvider.self = new TestCustomSchemaProvider();
        }
        return TestCustomSchemaProvider.self;
    }
    /**
     * Adds a schema to the list of custom schemas.
     * @param doc The uri of the document
     * @param schema The JSON schema object.
     */
    addSchema(doc, schema) {
        this.addSchemaWithUri(doc, `file:///${doc}`, schema);
    }
    /**
     * Adds a schema to the list of custom schemas.
     * @param doc The uri of the document
     * @param uri The uri of the schema
     * @param schema The JSON schema object.
     */
    addSchemaWithUri(doc, uri, schema) {
        const item = [doc, uri, schema];
        this.schemas.push(item);
    }
    /**
     * Deletes a schema from the list of custom schemas.
     * @param doc The uri of the document
     */
    deleteSchema(doc) {
        const items = this.schemas.filter((item) => item[0] === doc);
        if (items.length > 0) {
            this.schemas = this.schemas.filter((item) => item[0] !== doc);
        }
    }
    /**
     * Checks if a schema exists for a given document.
     * @param doc The uri of the document
     * @returns True if a schema exists for the document, false otherwise.
     */
    has(doc) {
        const item = this.schemas.findIndex((item) => item[0] === doc);
        return item > -1;
    }
    /**
     * Returns the schemas for a given document
     * @param doc The uri of the document.
     * @returns The uris of the schemas
     * @throws Error if no schema found
     */
    getSchemas(doc) {
        if (this.has(doc)) {
            const items = this.schemas.filter((item) => item[0] === doc);
            if (items.length === 1) {
                return items[0][1];
            }
            return items.map((item) => {
                return item[1];
            });
        }
        throw new Error(`Test schema not found for ${doc}`);
    }
    /**
     * Returns the content of a schema for a given uri.
     * @param uri The uri of the schema.
     * @returns The content of the schema as a string, or null if the schema is not found.
     */
    getContentForSchema(uri) {
        const item = this.schemas.findIndex((item) => item[1] === uri);
        if (item < 0) {
            return null;
        }
        return JSON.stringify(this.schemas[item][2]);
    }
}
exports.TestCustomSchemaProvider = TestCustomSchemaProvider;
async function schemaItSelfCustomSchemaProvider(uri) {
    const schemaProvider = TestCustomSchemaProvider.instance();
    if (schemaProvider.has(uri)) {
        return schemaProvider.getSchemas(uri);
    }
    return undefined;
}
exports.schemaItSelfCustomSchemaProvider = schemaItSelfCustomSchemaProvider;
//# sourceMappingURL=testHelper.js.map