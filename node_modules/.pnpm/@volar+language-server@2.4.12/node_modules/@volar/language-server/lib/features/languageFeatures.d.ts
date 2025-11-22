import type { LanguageServerState } from '../types.js';
export declare function register(server: LanguageServerState, documents: ReturnType<typeof import('./textDocuments')['register']>, configurations: ReturnType<typeof import('./configurations')['register']>): {
    requestRefresh: (clearDiagnostics: boolean) => Promise<void>;
};
