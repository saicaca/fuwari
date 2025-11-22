import type { ResolvedServerUrls } from 'vite';
import type { ZodError } from 'zod';
import { type ErrorWithMetadata } from './errors/index.js';
/**
 * Prestyled messages for the CLI. Used by astro CLI commands.
 */
/** Display each request being served with the path and the status code.  */
export declare function req({ url, method, statusCode, reqTime, isRewrite, }: {
    url: string;
    statusCode: number;
    method?: string;
    reqTime?: number;
    isRewrite?: boolean;
}): string;
/** Display server host and startup time */
export declare function serverStart({ startupTime, resolvedUrls, host, base, }: {
    startupTime: number;
    resolvedUrls: ResolvedServerUrls;
    host: string | boolean;
    base: string;
}): string;
/** Display custom dev server shortcuts */
export declare function serverShortcuts({ key, label }: {
    key: string;
    label: string;
}): string;
export declare function newVersionAvailable({ latestVersion }: {
    latestVersion: string;
}): Promise<string>;
export declare function telemetryNotice(): string;
export declare function telemetryEnabled(): string;
export declare function preferenceEnabled(name: string): string;
export declare function preferenceSet(name: string, value: any): string;
export declare function preferenceGet(name: string, value: any): string;
export declare function preferenceDefaultIntro(name: string): string;
export declare function preferenceDefault(name: string, value: any): string;
export declare function preferenceDisabled(name: string): string;
export declare function preferenceReset(name: string): string;
export declare function telemetryDisabled(): string;
export declare function telemetryReset(): string;
export declare function fsStrictWarning(): string;
export declare function prerelease({ currentVersion }: {
    currentVersion: string;
}): string;
export declare function success(message: string, tip?: string): string;
export declare function actionRequired(message: string): string;
export declare function cancelled(message: string, tip?: string): string;
export declare function formatConfigErrorMessage(err: ZodError): string;
export declare function formatErrorMessage(err: ErrorWithMetadata, showFullStacktrace: boolean): string;
export declare function printHelp({ commandName, headline, usage, tables, description, }: {
    commandName: string;
    headline?: string;
    usage?: string;
    tables?: Record<string, [command: string, help: string][]>;
    description?: string;
}): void;
