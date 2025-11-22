/// <reference types="node" />
import { TextDocuments, Disposable, ClientCapabilities, WorkspaceFolder } from 'vscode-languageserver';
import { CustomFormatterOptions, SchemaConfiguration } from './languageservice/yamlLanguageService';
import { ISchemaAssociations } from './requestTypes';
import { URI } from 'vscode-uri';
import { JSONSchema } from './languageservice/jsonSchema';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { YamlVersion } from './languageservice/parser/yamlParser07';
export interface Settings {
    yaml: {
        format: CustomFormatterOptions;
        schemas: JSONSchemaSettings[];
        validate: boolean;
        hover: boolean;
        completion: boolean;
        customTags: Array<string>;
        schemaStore: {
            url: string;
            enable: boolean;
        };
        disableDefaultProperties: boolean;
        disableAdditionalProperties: boolean;
        suggest: {
            parentSkeletonSelectedFirst: boolean;
        };
        style: {
            flowMapping: 'allow' | 'forbid';
            flowSequence: 'allow' | 'forbid';
        };
        keyOrdering: boolean;
        maxItemsComputed: number;
        yamlVersion: YamlVersion;
    };
    http: {
        proxy: string;
        proxyStrictSSL: boolean;
    };
    yamlEditor: {
        'editor.tabSize': number;
        'editor.insertSpaces': boolean;
        'editor.formatOnType': boolean;
    };
    vscodeEditor: {
        detectIndentation: boolean;
    };
    files: {
        associations: Map<string, string>;
    };
}
export interface JSONSchemaSettings {
    fileMatch?: string[];
    url?: string;
    schema?: JSONSchema;
}
export declare class SettingsState {
    yamlConfigurationSettings: JSONSchemaSettings[];
    schemaAssociations: ISchemaAssociations | SchemaConfiguration[] | undefined;
    formatterRegistration: PromiseLike<Disposable>;
    specificValidatorPaths: any[];
    schemaConfigurationSettings: any[];
    yamlShouldValidate: boolean;
    yamlFormatterSettings: CustomFormatterOptions;
    yamlShouldHover: boolean;
    yamlShouldCompletion: boolean;
    schemaStoreSettings: any[];
    customTags: any[];
    schemaStoreEnabled: boolean;
    schemaStoreUrl: string;
    indentation: string | undefined;
    disableAdditionalProperties: boolean;
    disableDefaultProperties: boolean;
    suggest: {
        parentSkeletonSelectedFirst: boolean;
    };
    style: {
        flowMapping: 'allow' | 'forbid';
        flowSequence: 'allow' | 'forbid';
    };
    keyOrdering: boolean;
    maxItemsComputed: number;
    pendingValidationRequests: {
        [uri: string]: NodeJS.Timer;
    };
    validationDelayMs: number;
    documents: TextDocuments<TextDocument> | TextDocumentTestManager;
    capabilities: ClientCapabilities;
    workspaceRoot: URI;
    workspaceFolders: WorkspaceFolder[];
    clientDynamicRegisterSupport: boolean;
    hierarchicalDocumentSymbolSupport: boolean;
    hasWorkspaceFolderCapability: boolean;
    hasConfigurationCapability: boolean;
    useVSCodeContentRequest: boolean;
    yamlVersion: YamlVersion;
    useSchemaSelectionRequests: boolean;
    hasWsChangeWatchedFileDynamicRegistration: boolean;
    fileExtensions: string[];
}
export declare class TextDocumentTestManager extends TextDocuments<TextDocument> {
    testTextDocuments: Map<string, TextDocument>;
    constructor();
    get(uri: string): TextDocument | undefined;
    set(textDocument: TextDocument): void;
}
