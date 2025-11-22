import type { BuildInternals } from '../internal.js';
import type { AstroBuildPlugin } from '../plugin.js';
import type { StaticBuildOptions } from '../types.js';
export declare const ASTRO_PAGE_MODULE_ID = "@astro-page:";
export declare const ASTRO_PAGE_RESOLVED_MODULE_ID: string;
export declare function pluginPages(opts: StaticBuildOptions, internals: BuildInternals): AstroBuildPlugin;
