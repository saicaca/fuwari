import type { ModuleLoader } from '../core/module-loader/index.js';
import type { AstroConfig } from '../types/public/config.js';
import type { DevPipeline } from './pipeline.js';
export declare function recordServerError(loader: ModuleLoader, config: AstroConfig, { logger }: DevPipeline, _err: unknown): {
    error: Error;
    errorWithMetadata: import("../core/errors/errors.js").ErrorWithMetadata;
};
