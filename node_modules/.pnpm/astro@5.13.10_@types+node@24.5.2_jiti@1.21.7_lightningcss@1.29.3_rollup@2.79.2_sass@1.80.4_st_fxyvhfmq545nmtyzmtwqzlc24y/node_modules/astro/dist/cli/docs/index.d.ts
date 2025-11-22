import type { Flags } from '../flags.js';
interface DocsOptions {
    flags: Flags;
}
export declare function docs({ flags }: DocsOptions): Promise<import("tinyexec").Output | undefined>;
export {};
