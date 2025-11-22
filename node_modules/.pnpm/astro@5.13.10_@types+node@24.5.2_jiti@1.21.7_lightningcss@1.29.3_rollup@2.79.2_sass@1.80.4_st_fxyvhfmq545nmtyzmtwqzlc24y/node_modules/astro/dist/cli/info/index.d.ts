import type { AstroConfig, AstroUserConfig } from '../../types/public/config.js';
import { type Flags } from '../flags.js';
interface InfoOptions {
    flags: Flags;
}
export declare function getInfoOutput({ userConfig, print, }: {
    userConfig: AstroUserConfig | AstroConfig;
    print: boolean;
}): Promise<string>;
export declare function printInfo({ flags }: InfoOptions): Promise<void>;
export declare function readFromClipboard(): string;
export {};
