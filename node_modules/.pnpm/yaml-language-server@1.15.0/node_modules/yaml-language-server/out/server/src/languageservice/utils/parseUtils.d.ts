import { ErrorCode } from 'vscode-json-languageservice/lib/umd/jsonLanguageTypes';
export declare const DUPLICATE_KEY_REASON = "duplicate key";
/**
 * An individual YAML diagnostic,
 * after formatting.
 */
export interface YAMLDocDiagnostic {
    message: string;
    location: {
        start: number;
        end: number;
        toLineEnd: boolean;
    };
    severity: 1 | 2;
    source?: string;
    code: ErrorCode;
}
