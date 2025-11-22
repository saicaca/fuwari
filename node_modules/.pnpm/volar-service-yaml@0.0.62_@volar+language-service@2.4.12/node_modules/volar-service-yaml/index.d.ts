import type { Disposable, DocumentSelector, ProviderResult, LanguageServiceContext, LanguageServicePlugin } from '@volar/language-service';
import * as yaml from 'yaml-language-server';
export interface Provide {
    'yaml/languageService': () => yaml.LanguageService;
}
/**
 * Create a Volar language service for YAML documents.
 */
export declare function create({ documentSelector, getWorkspaceContextService, getLanguageSettings, onDidChangeLanguageSettings, }?: {
    documentSelector?: DocumentSelector;
    getWorkspaceContextService?(context: LanguageServiceContext): yaml.WorkspaceContextService;
    getLanguageSettings?(context: LanguageServiceContext): ProviderResult<yaml.LanguageSettings>;
    onDidChangeLanguageSettings?(listener: () => void, context: LanguageServiceContext): Disposable;
}): LanguageServicePlugin;
//# sourceMappingURL=index.d.ts.map