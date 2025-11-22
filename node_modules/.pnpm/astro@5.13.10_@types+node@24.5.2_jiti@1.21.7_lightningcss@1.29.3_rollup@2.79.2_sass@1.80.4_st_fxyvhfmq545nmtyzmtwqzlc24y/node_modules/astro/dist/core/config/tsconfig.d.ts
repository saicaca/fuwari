import { type TSConfckParseResult } from 'tsconfck';
import type { CompilerOptions, TypeAcquisition } from 'typescript';
export declare const defaultTSConfig: TSConfig;
export type frameworkWithTSSettings = 'vue' | 'react' | 'preact' | 'solid-js';
export declare const presets: Map<frameworkWithTSSettings, TSConfig>;
type TSConfigResult<T = object> = Promise<(TSConfckParseResult & T) | 'invalid-config' | 'missing-config' | 'unknown-error'>;
/**
 * Load a tsconfig.json or jsconfig.json is the former is not found
 * @param root The root directory to search in, defaults to `process.cwd()`.
 * @param findUp Whether to search for the config file in parent directories, by default only the root directory is searched.
 */
export declare function loadTSConfig(root: string | undefined, findUp?: boolean): Promise<TSConfigResult<{
    rawConfig: TSConfig;
}>>;
export declare function updateTSConfigForFramework(target: TSConfig, framework: frameworkWithTSSettings): TSConfig;
type StripEnums<T extends Record<string, any>> = {
    [K in keyof T]: T[K] extends boolean ? T[K] : T[K] extends string ? T[K] : T[K] extends object ? T[K] : T[K] extends Array<any> ? T[K] : T[K] extends undefined ? undefined : any;
};
export interface TSConfig {
    compilerOptions?: StripEnums<CompilerOptions>;
    compileOnSave?: boolean;
    extends?: string;
    files?: string[];
    include?: string[];
    exclude?: string[];
    typeAcquisition?: TypeAcquisition;
}
export {};
