import { TextDocument } from 'vscode-languageserver-textdocument';
import { JSONDocument } from './jsonParser07';
import { Document, LineCounter } from 'yaml';
import { ASTNode, YamlNode } from '../jsonASTTypes';
import { ParserOptions } from './yamlParser07';
import { YAMLDocDiagnostic } from '../utils/parseUtils';
import { TextBuffer } from '../utils/textBuffer';
import { Token } from 'yaml/dist/parse/cst';
/**
 * These documents are collected into a final YAMLDocument
 * and passed to the `parseYAML` caller.
 */
export declare class SingleYAMLDocument extends JSONDocument {
    private lineCounter;
    private _internalDocument;
    root: ASTNode;
    currentDocIndex: number;
    private _lineComments;
    constructor(lineCounter?: LineCounter);
    /**
     * Create a deep copy of this document
     */
    clone(): SingleYAMLDocument;
    private collectLineComments;
    /**
     * Updates the internal AST tree of the object
     * from the internal node. This is call whenever the
     * internalDocument is set but also can be called to
     * reflect any changes on the underlying document
     * without setting the internalDocument explicitly.
     */
    updateFromInternalDocument(): void;
    set internalDocument(document: Document);
    get internalDocument(): Document;
    get lineComments(): string[];
    set lineComments(val: string[]);
    get errors(): YAMLDocDiagnostic[];
    get warnings(): YAMLDocDiagnostic[];
    getNodeFromPosition(positionOffset: number, textBuffer: TextBuffer, configuredIndentation?: number): [YamlNode | undefined, boolean];
    findClosestNode(offset: number, textBuffer: TextBuffer, configuredIndentation?: number): YamlNode;
    private getProperParentByIndentation;
    getParent(node: YamlNode): YamlNode | undefined;
}
/**
 * Contains the SingleYAMLDocuments, to be passed
 * to the `parseYAML` caller.
 */
export declare class YAMLDocument {
    documents: SingleYAMLDocument[];
    tokens: Token[];
    private errors;
    private warnings;
    constructor(documents: SingleYAMLDocument[], tokens: Token[]);
}
export declare class YamlDocuments {
    private cache;
    /**
     * Get cached YAMLDocument
     * @param document TextDocument to parse
     * @param parserOptions YAML parserOptions
     * @param addRootObject if true and document is empty add empty object {} to force schema usage
     * @returns the YAMLDocument
     */
    getYamlDocument(document: TextDocument, parserOptions?: ParserOptions, addRootObject?: boolean): YAMLDocument;
    /**
     * For test purpose only!
     */
    clear(): void;
    private ensureCache;
}
export declare const yamlDocumentsCache: YamlDocuments;
