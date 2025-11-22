import { LanguageSettings, SchemasSettings } from '../../src/languageservice/yamlLanguageService';
export declare class ServiceSetup {
    languageSettings: LanguageSettings;
    withValidate(): ServiceSetup;
    withHover(): ServiceSetup;
    withCompletion(): ServiceSetup;
    withFormat(): ServiceSetup;
    withKubernetes(allow?: boolean): ServiceSetup;
    withSchemaFileMatch(schemaFileMatch: SchemasSettings): ServiceSetup;
    withCustomTags(customTags: string[]): ServiceSetup;
    withIndentation(indentation: string): ServiceSetup;
    withFlowMapping(mapping: 'allow' | 'forbid'): ServiceSetup;
    withFlowSequence(sequence: 'allow' | 'forbid'): ServiceSetup;
    withKeyOrdering(order?: boolean): ServiceSetup;
}
