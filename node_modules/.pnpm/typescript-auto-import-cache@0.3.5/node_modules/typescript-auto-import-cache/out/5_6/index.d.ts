import type { LanguageService, LanguageServiceHost } from 'typescript/lib/tsserverlibrary';
export default function (ts: typeof import('typescript/lib/tsserverlibrary'), sys: import('typescript/lib/tsserverlibrary').System, host: LanguageServiceHost, createLanguageService: (host: LanguageServiceHost) => LanguageService): {
    languageService: LanguageService;
    setPreferences(newPreferences: import("typescript").UserPreferences): void;
    projectUpdated(path: string): void;
};
