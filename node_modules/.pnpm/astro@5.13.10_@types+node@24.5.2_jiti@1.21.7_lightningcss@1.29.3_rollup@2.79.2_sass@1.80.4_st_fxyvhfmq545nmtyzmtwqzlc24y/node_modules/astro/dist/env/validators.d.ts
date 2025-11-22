import type { EnvFieldType } from './schema.js';
export type ValidationResultValue = EnvFieldType['default'];
export type ValidationResultErrors = ['missing'] | ['type'] | Array<string>;
interface ValidationResultValid {
    ok: true;
    value: ValidationResultValue;
}
export interface ValidationResultInvalid {
    ok: false;
    errors: ValidationResultErrors;
}
type ValidationResult = ValidationResultValid | ValidationResultInvalid;
export declare function getEnvFieldType(options: EnvFieldType): string;
export declare function validateEnvVariable(value: string | undefined, options: EnvFieldType): ValidationResult;
export {};
