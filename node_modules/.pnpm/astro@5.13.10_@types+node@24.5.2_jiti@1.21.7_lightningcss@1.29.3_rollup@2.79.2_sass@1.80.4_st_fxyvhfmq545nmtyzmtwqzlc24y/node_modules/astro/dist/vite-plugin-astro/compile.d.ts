import { type ESBuildTransformResult } from 'vite';
import { type CompileProps, type CompileResult } from '../core/compile/index.js';
import type { Logger } from '../core/logger/core.js';
import type { CompileMetadata } from './types.js';
interface CompileAstroOption {
    compileProps: CompileProps;
    astroFileToCompileMetadata: Map<string, CompileMetadata>;
    logger: Logger;
}
export interface CompileAstroResult extends Omit<CompileResult, 'map'> {
    map: ESBuildTransformResult['map'];
}
export declare function compileAstro({ compileProps, astroFileToCompileMetadata, logger, }: CompileAstroOption): Promise<CompileAstroResult>;
export {};
