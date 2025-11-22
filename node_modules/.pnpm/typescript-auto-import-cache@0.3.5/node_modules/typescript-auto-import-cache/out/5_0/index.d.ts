import { createProject } from './project';
import type { LanguageService, LanguageServiceHost, UserPreferences } from 'typescript/lib/tsserverlibrary';
export default function (ts: typeof import('typescript/lib/tsserverlibrary'), sys: import('typescript/lib/tsserverlibrary').System, host: LanguageServiceHost, createLanguageService: (host: LanguageServiceHost) => LanguageService, _createProject?: typeof createProject): {
    languageService: LanguageService;
    setPreferences(newPreferences: UserPreferences): void;
    projectUpdated(path: string): void;
};
