import { FormattingOptions, LanguagePlugin, LanguageServicePlugin } from '@volar/language-service';
import { URI } from 'vscode-uri';
export declare function createFormatter(languages: LanguagePlugin<URI>[], services: LanguageServicePlugin[]): {
    env: import("@volar/language-service").LanguageServiceEnvironment;
    format: (content: string, languageId: string, options: FormattingOptions) => Promise<string>;
    settings: {};
};
