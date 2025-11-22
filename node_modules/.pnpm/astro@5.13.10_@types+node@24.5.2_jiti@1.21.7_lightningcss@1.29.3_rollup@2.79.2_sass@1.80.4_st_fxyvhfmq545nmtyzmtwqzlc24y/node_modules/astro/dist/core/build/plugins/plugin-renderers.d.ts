import type { AstroBuildPlugin } from '../plugin.js';
import type { StaticBuildOptions } from '../types.js';
export declare const RENDERERS_MODULE_ID = "@astro-renderers";
export declare const RESOLVED_RENDERERS_MODULE_ID = "\0@astro-renderers";
export declare function pluginRenderers(opts: StaticBuildOptions): AstroBuildPlugin;
