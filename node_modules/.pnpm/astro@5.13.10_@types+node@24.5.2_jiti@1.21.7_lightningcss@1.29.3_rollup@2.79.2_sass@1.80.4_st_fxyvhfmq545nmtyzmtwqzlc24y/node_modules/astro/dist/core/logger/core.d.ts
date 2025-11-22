export interface LogWritable<T> {
    write: (chunk: T) => boolean;
}
export type LoggerLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';
/**
 * Defined logger labels. Add more as needed, but keep them high-level & reusable,
 * rather than specific to a single command, function, use, etc. The label will be
 * shown in the log message to the user, so it should be relevant.
 */
type LoggerLabel = 'add' | 'build' | 'check' | 'config' | 'content' | 'crypto' | 'deprecated' | 'markdown' | 'router' | 'types' | 'vite' | 'watch' | 'middleware' | 'preferences' | 'redirects' | 'sync' | 'session' | 'toolbar' | 'assets' | 'env' | 'update' | 'adapter' | 'islands' | 'SKIP_FORMAT';
export interface LogOptions {
    dest: LogWritable<LogMessage>;
    level: LoggerLevel;
}
/** @lintignore */
export declare const dateTimeFormat: Intl.DateTimeFormat;
export interface LogMessage {
    label: string | null;
    level: LoggerLevel;
    message: string;
    newLine: boolean;
}
export declare const levels: Record<LoggerLevel, number>;
export declare function isLogLevelEnabled(configuredLogLevel: LoggerLevel, level: LoggerLevel): boolean;
export declare function debug(...args: any[]): void;
/**
 * Get the prefix for a log message.
 * This includes the timestamp, log level, and label all properly formatted
 * with colors. This is shared across different loggers, so it's defined here.
 */
export declare function getEventPrefix({ level, label }: LogMessage): string;
/** Print out a timer message for debug() */
export declare function timerMessage(message: string, startTime?: number): string;
export declare class Logger {
    options: LogOptions;
    constructor(options: LogOptions);
    info(label: LoggerLabel | null, message: string, newLine?: boolean): void;
    warn(label: LoggerLabel | null, message: string, newLine?: boolean): void;
    error(label: LoggerLabel | null, message: string, newLine?: boolean): void;
    debug(label: LoggerLabel, ...messages: any[]): void;
    level(): LoggerLevel;
    forkIntegrationLogger(label: string): AstroIntegrationLogger;
}
export declare class AstroIntegrationLogger {
    options: LogOptions;
    label: string;
    constructor(logging: LogOptions, label: string);
    /**
     * Creates a new logger instance with a new label, but the same log options.
     */
    fork(label: string): AstroIntegrationLogger;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    debug(message: string): void;
}
export {};
