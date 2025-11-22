import { SettingsState } from '../../src/yamlSettings';
import { FileSystem } from '../../src/languageservice/services/schemaRequestHandler';
import { LanguageService, LanguageSettings } from '../../src';
import { ValidationHandler } from '../../src/languageserver/handlers/validationHandlers';
import { LanguageHandlers } from '../../src/languageserver/handlers/languageHandlers';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { TestTelemetry } from './testsTypes';
import { JSONSchema } from '../../src/languageservice/jsonSchema';
export declare function toFsPath(str: unknown): string;
export declare const TEST_URI = "file://~/Desktop/vscode-k8s/test.yaml";
export declare const SCHEMA_ID = "default_schema_id.yaml";
export declare function setupTextDocument(content: string): TextDocument;
export declare function setupSchemaIDTextDocument(content: string, customSchemaID?: string): TextDocument;
export declare const testFileSystem: FileSystem;
export interface TestLanguageServerSetup {
    languageService: LanguageService;
    validationHandler: ValidationHandler;
    languageHandler: LanguageHandlers;
    yamlSettings: SettingsState;
    telemetry: TestTelemetry;
    schemaProvider: TestCustomSchemaProvider;
}
export declare function setupLanguageService(languageSettings: LanguageSettings): TestLanguageServerSetup;
/**
 * Derives the absolute `position` of the caret given `content` containing a virtual caret.
 * @param content The content of the document.
 * The caret is located in the content using `|` bookends.
 * For example, `content = 'ab|c|d'` places the caret over the `'c'`, at `position = 2`
 * @returns The absolute position of the caret.
 */
export declare function caretPosition(content: string): {
    position: number;
    content: string;
};
export declare class TestCustomSchemaProvider {
    private schemas;
    private static self;
    private constructor();
    static instance(): TestCustomSchemaProvider;
    /**
     * Adds a schema to the list of custom schemas.
     * @param doc The uri of the document
     * @param schema The JSON schema object.
     */
    addSchema(doc: string, schema: JSONSchema): void;
    /**
     * Adds a schema to the list of custom schemas.
     * @param doc The uri of the document
     * @param uri The uri of the schema
     * @param schema The JSON schema object.
     */
    addSchemaWithUri(doc: string, uri: string, schema: JSONSchema): void;
    /**
     * Deletes a schema from the list of custom schemas.
     * @param doc The uri of the document
     */
    deleteSchema(doc: string): void;
    /**
     * Checks if a schema exists for a given document.
     * @param doc The uri of the document
     * @returns True if a schema exists for the document, false otherwise.
     */
    has(doc: string): boolean;
    /**
     * Returns the schemas for a given document
     * @param doc The uri of the document.
     * @returns The uris of the schemas
     * @throws Error if no schema found
     */
    getSchemas(doc: string): string | string[];
    /**
     * Returns the content of a schema for a given uri.
     * @param uri The uri of the schema.
     * @returns The content of the schema as a string, or null if the schema is not found.
     */
    getContentForSchema(uri: string): string | null;
}
export declare function schemaItSelfCustomSchemaProvider(uri: string): Promise<string | string[]>;
