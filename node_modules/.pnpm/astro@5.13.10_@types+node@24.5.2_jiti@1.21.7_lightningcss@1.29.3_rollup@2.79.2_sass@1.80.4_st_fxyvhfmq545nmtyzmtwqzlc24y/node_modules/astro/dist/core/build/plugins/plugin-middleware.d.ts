import type { BuildInternals } from '../internal.js';
import type { AstroBuildPlugin } from '../plugin.js';
import type { StaticBuildOptions } from '../types.js';
export declare function pluginMiddleware(opts: StaticBuildOptions, internals: BuildInternals): AstroBuildPlugin;
