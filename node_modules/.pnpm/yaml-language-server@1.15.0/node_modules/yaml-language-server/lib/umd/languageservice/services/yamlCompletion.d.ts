import { TextDocument } from 'vscode-languageserver-textdocument';
import { ClientCapabilities } from 'vscode-languageserver';
import { CompletionItem as CompletionItemBase, CompletionList, Position } from 'vscode-languageserver-types';
import { Telemetry } from '../telemetry';
import { YamlDocuments } from '../parser/yaml-documents';
import { LanguageSettings } from '../yamlLanguageService';
import { YAMLSchemaService } from './yamlSchemaService';
import { JSONSchema } from '../jsonSchema';
interface ParentCompletionItemOptions {
    schema: JSONSchema;
    indent?: string;
    insertTexts?: string[];
}
interface CompletionItem extends CompletionItemBase {
    parent?: ParentCompletionItemOptions;
}
export declare class YamlCompletion {
    private schemaService;
    private clientCapabilities;
    private yamlDocument;
    private readonly telemetry?;
    private customTags;
    private completionEnabled;
    private configuredIndentation;
    private yamlVersion;
    private indentation;
    private arrayPrefixIndentation;
    private supportsMarkdown;
    private disableDefaultProperties;
    private parentSkeletonSelectedFirst;
    constructor(schemaService: YAMLSchemaService, clientCapabilities: ClientCapabilities, yamlDocument: YamlDocuments, telemetry?: Telemetry);
    configure(languageSettings: LanguageSettings): void;
    doComplete(document: TextDocument, position: Position, isKubernetes?: boolean, doComplete?: boolean): Promise<CompletionList>;
    updateCompletionText(completionItem: CompletionItem, text: string): void;
    mergeSimpleInsertTexts(label: string, existingText: string, addingText: string, oneOfSchema: boolean): string | undefined;
    getValuesFromInsertText(insertText: string): string[];
    private finalizeParentCompletion;
    private createTempObjNode;
    private addPropertyCompletions;
    private getValueCompletions;
    private addArrayItemValueCompletion;
    private getInsertTextForProperty;
    private getInsertTextForObject;
    private getInsertTextForArray;
    private getInsertTextForGuessedValue;
    private getInsertTextForPlainText;
    private getInsertTextForValue;
    private getInsertTemplateForValue;
    private addSchemaValueCompletions;
    private collectTypes;
    private addDefaultValueCompletions;
    private addEnumValueCompletions;
    private getLabelForValue;
    private collectDefaultSnippets;
    private getInsertTextForSnippetValue;
    private addBooleanValueCompletion;
    private addNullValueCompletion;
    private getLabelForSnippetValue;
    private getCustomTagValueCompletions;
    private addCustomTagValueCompletion;
    private getDocumentationWithMarkdownText;
    private getSuggestionKind;
    private getCurrentWord;
    private fromMarkup;
    private doesSupportMarkdown;
    private findItemAtOffset;
}
export {};
