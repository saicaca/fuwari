export declare const highlight: (s: string) => string;
/**
 * A slim wrapper around console statements
 */
export default class Logger {
    log(...args: any): void;
    warn(...args: any): void;
    error(...args: any): void;
    logIf(condition: boolean, ...args: any): void;
    warnIf(condition: boolean, ...args: any): void;
    errorIf(condition: boolean, ...args: any): void;
}
//# sourceMappingURL=Logger.d.ts.map