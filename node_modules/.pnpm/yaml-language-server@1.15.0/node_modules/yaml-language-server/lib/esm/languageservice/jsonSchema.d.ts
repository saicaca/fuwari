import { CompletionItemKind } from 'vscode-json-languageservice';
import { SchemaVersions } from './yamlTypes';
export declare type JSONSchemaRef = JSONSchema | boolean;
export interface JSONSchema {
    id?: string;
    $id?: string;
    $schema?: string;
    url?: string;
    type?: string | string[];
    title?: string;
    closestTitle?: string;
    versions?: SchemaVersions;
    default?: any;
    definitions?: {
        [name: string]: JSONSchema;
    };
    description?: string;
    properties?: JSONSchemaMap;
    patternProperties?: JSONSchemaMap;
    additionalProperties?: boolean | JSONSchemaRef;
    minProperties?: number;
    maxProperties?: number;
    dependencies?: JSONSchemaMap | {
        [prop: string]: string[];
    };
    items?: JSONSchemaRef | JSONSchemaRef[];
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
    additionalItems?: boolean | JSONSchemaRef;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: boolean | number;
    exclusiveMaximum?: boolean | number;
    multipleOf?: number;
    required?: string[];
    $ref?: string;
    _$ref?: string;
    anyOf?: JSONSchemaRef[];
    allOf?: JSONSchemaRef[];
    oneOf?: JSONSchemaRef[];
    not?: JSONSchemaRef;
    enum?: any[];
    format?: string;
    const?: any;
    contains?: JSONSchemaRef;
    propertyNames?: JSONSchemaRef;
    examples?: any[];
    $comment?: string;
    if?: JSONSchemaRef;
    then?: JSONSchemaRef;
    else?: JSONSchemaRef;
    defaultSnippets?: {
        label?: string;
        description?: string;
        markdownDescription?: string;
        type?: string;
        suggestionKind?: CompletionItemKind;
        sortText?: string;
        body?: any;
        bodyText?: string;
    }[];
    errorMessage?: string;
    patternErrorMessage?: string;
    deprecationMessage?: string;
    enumDescriptions?: string[];
    markdownEnumDescriptions?: string[];
    markdownDescription?: string;
    doNotSuggest?: boolean;
    allowComments?: boolean;
    schemaSequence?: JSONSchema[];
    filePatternAssociation?: string;
}
export interface JSONSchemaMap {
    [name: string]: JSONSchemaRef;
}
