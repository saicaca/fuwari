import type { HmrContext } from 'vite';
import type { Logger } from '../core/logger/core.js';
import type { CompileMetadata } from './types.js';
interface HandleHotUpdateOptions {
    logger: Logger;
    astroFileToCompileMetadata: Map<string, CompileMetadata>;
}
export declare function handleHotUpdate(ctx: HmrContext, { logger, astroFileToCompileMetadata }: HandleHotUpdateOptions): Promise<import("vite").ModuleNode[] | undefined>;
export declare function isStyleOnlyChanged(oldCode: string, newCode: string): boolean;
export {};
