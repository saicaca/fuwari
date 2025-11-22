import type { ModuleLoader } from '../module-loader/index.js';
/**
 * It accepts a module loader and the astro settings, and it attempts to load the middlewares defined in the configuration.
 *
 * If not middlewares were not set, the function returns an empty array.
 */
export declare function loadMiddleware(moduleLoader: ModuleLoader): Promise<Record<string, any>>;
