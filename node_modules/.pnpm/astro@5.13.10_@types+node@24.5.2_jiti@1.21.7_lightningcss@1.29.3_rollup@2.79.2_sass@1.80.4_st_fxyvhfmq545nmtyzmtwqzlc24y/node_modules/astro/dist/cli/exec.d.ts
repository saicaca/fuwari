import { type Options } from 'tinyexec';
/**
 * Improve tinyexec error logging and set `throwOnError` to `true` by default
 */
export declare function exec(command: string, args?: string[], options?: Partial<Options>): PromiseLike<import("tinyexec").Output>;
