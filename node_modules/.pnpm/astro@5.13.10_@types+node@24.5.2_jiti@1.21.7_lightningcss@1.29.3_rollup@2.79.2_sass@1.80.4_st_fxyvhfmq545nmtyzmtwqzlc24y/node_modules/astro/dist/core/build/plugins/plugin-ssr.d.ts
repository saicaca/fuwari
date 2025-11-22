import type { BuildInternals } from '../internal.js';
import type { AstroBuildPlugin } from '../plugin.js';
import type { StaticBuildOptions } from '../types.js';
export declare const RESOLVED_SSR_VIRTUAL_MODULE_ID: string;
export declare function pluginSSR(options: StaticBuildOptions, internals: BuildInternals): AstroBuildPlugin;
