import { JSONSchema, JSONSchemaRef } from '../jsonSchema';
import { ASTNode, ObjectASTNode, ArrayASTNode, BooleanASTNode, NumberASTNode, StringASTNode, NullASTNode, PropertyASTNode, YamlNode } from '../jsonASTTypes';
import { ErrorCode } from 'vscode-json-languageservice';
import { Diagnostic, DiagnosticSeverity, Range } from 'vscode-languageserver-types';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Node, Pair } from 'yaml';
export interface IRange {
    offset: number;
    length: number;
}
export declare const formats: {
    'color-hex': {
        errorMessage: string;
        pattern: RegExp;
    };
    'date-time': {
        errorMessage: string;
        pattern: RegExp;
    };
    date: {
        errorMessage: string;
        pattern: RegExp;
    };
    time: {
        errorMessage: string;
        pattern: RegExp;
    };
    email: {
        errorMessage: string;
        pattern: RegExp;
    };
    ipv4: {
        errorMessage: string;
        pattern: RegExp;
    };
    ipv6: {
        errorMessage: string;
        pattern: RegExp;
    };
};
export declare const YAML_SOURCE = "YAML";
export declare enum ProblemType {
    missingRequiredPropWarning = "missingRequiredPropWarning",
    typeMismatchWarning = "typeMismatchWarning",
    constWarning = "constWarning"
}
export declare const ProblemTypeMessages: Record<ProblemType, string>;
export interface IProblem {
    location: IRange;
    severity: DiagnosticSeverity;
    code?: ErrorCode;
    message: string;
    source?: string;
    problemType?: ProblemType;
    problemArgs?: string[];
    schemaUri?: string[];
    data?: Record<string, unknown>;
}
export declare abstract class ASTNodeImpl {
    abstract readonly type: 'object' | 'property' | 'array' | 'number' | 'boolean' | 'null' | 'string';
    offset: number;
    length: number;
    readonly parent: ASTNode;
    location: string;
    readonly internalNode: YamlNode;
    constructor(parent: ASTNode, internalNode: YamlNode, offset: number, length?: number);
    getNodeFromOffsetEndInclusive(offset: number): ASTNode;
    get children(): ASTNode[];
    toString(): string;
}
export declare class NullASTNodeImpl extends ASTNodeImpl implements NullASTNode {
    type: 'null';
    value: any;
    constructor(parent: ASTNode, internalNode: Node, offset: number, length?: number);
}
export declare class BooleanASTNodeImpl extends ASTNodeImpl implements BooleanASTNode {
    type: 'boolean';
    value: boolean;
    constructor(parent: ASTNode, internalNode: Node, boolValue: boolean, offset: number, length?: number);
}
export declare class ArrayASTNodeImpl extends ASTNodeImpl implements ArrayASTNode {
    type: 'array';
    items: ASTNode[];
    constructor(parent: ASTNode, internalNode: Node, offset: number, length?: number);
    get children(): ASTNode[];
}
export declare class NumberASTNodeImpl extends ASTNodeImpl implements NumberASTNode {
    type: 'number';
    isInteger: boolean;
    value: number;
    constructor(parent: ASTNode, internalNode: Node, offset: number, length?: number);
}
export declare class StringASTNodeImpl extends ASTNodeImpl implements StringASTNode {
    type: 'string';
    value: string;
    constructor(parent: ASTNode, internalNode: Node, offset: number, length?: number);
}
export declare class PropertyASTNodeImpl extends ASTNodeImpl implements PropertyASTNode {
    type: 'property';
    keyNode: StringASTNode;
    valueNode: ASTNode;
    colonOffset: number;
    constructor(parent: ObjectASTNode, internalNode: Pair, offset: number, length?: number);
    get children(): ASTNode[];
}
export declare class ObjectASTNodeImpl extends ASTNodeImpl implements ObjectASTNode {
    type: 'object';
    properties: PropertyASTNode[];
    constructor(parent: ASTNode, internalNode: Node, offset: number, length?: number);
    get children(): ASTNode[];
}
export declare function asSchema(schema: JSONSchemaRef): JSONSchema | undefined;
export interface JSONDocumentConfig {
    collectComments?: boolean;
}
export interface IApplicableSchema {
    node: ASTNode;
    inverted?: boolean;
    schema: JSONSchema;
}
export declare enum EnumMatch {
    Key = 0,
    Enum = 1
}
export interface ISchemaCollector {
    schemas: IApplicableSchema[];
    add(schema: IApplicableSchema): void;
    merge(other: ISchemaCollector): void;
    include(node: ASTNode): boolean;
    newSub(): ISchemaCollector;
}
export declare class ValidationResult {
    problems: IProblem[];
    propertiesMatches: number;
    propertiesValueMatches: number;
    primaryValueMatches: number;
    enumValueMatch: boolean;
    enumValues: any[];
    constructor(isKubernetes: boolean);
    hasProblems(): boolean;
    mergeAll(validationResults: ValidationResult[]): void;
    merge(validationResult: ValidationResult): void;
    mergeEnumValues(validationResult: ValidationResult): void;
    /**
     * Merge multiple warnings with same problemType together
     * @param subValidationResult another possible result
     */
    mergeWarningGeneric(subValidationResult: ValidationResult, problemTypesToMerge: ProblemType[]): void;
    mergePropertyMatch(propertyValidationResult: ValidationResult): void;
    private mergeSources;
    compareGeneric(other: ValidationResult): number;
    compareKubernetes(other: ValidationResult): number;
}
export declare function newJSONDocument(root: ASTNode, diagnostics?: Diagnostic[]): JSONDocument;
export declare function getNodeValue(node: ASTNode): any;
export declare function contains(node: ASTNode, offset: number, includeRightBound?: boolean): boolean;
export declare function findNodeAtOffset(node: ASTNode, offset: number, includeRightBound: boolean): ASTNode;
export declare class JSONDocument {
    readonly root: ASTNode;
    readonly syntaxErrors: Diagnostic[];
    readonly comments: Range[];
    isKubernetes: boolean;
    disableAdditionalProperties: boolean;
    uri: string;
    constructor(root: ASTNode, syntaxErrors?: Diagnostic[], comments?: Range[]);
    getNodeFromOffset(offset: number, includeRightBound?: boolean): ASTNode | undefined;
    getNodeFromOffsetEndInclusive(offset: number): ASTNode;
    visit(visitor: (node: ASTNode) => boolean): void;
    validate(textDocument: TextDocument, schema: JSONSchema): Diagnostic[];
    /**
     * This method returns the list of applicable schemas
     *
     * currently used @param didCallFromAutoComplete flag to differentiate the method call, when it is from auto complete
     * then user still types something and skip the validation for timebeing untill completed.
     * On https://github.com/redhat-developer/yaml-language-server/pull/719 the auto completes need to populate the list of enum string which matches to the enum
     * and on https://github.com/redhat-developer/vscode-yaml/issues/803 the validation should throw the error based on the enum string.
     *
     * @param schema schema
     * @param focusOffset  offsetValue
     * @param exclude excluded Node
     * @param didCallFromAutoComplete true if method called from AutoComplete
     * @returns array of applicable schemas
     */
    getMatchingSchemas(schema: JSONSchema, focusOffset?: number, exclude?: ASTNode, didCallFromAutoComplete?: boolean): IApplicableSchema[];
}
