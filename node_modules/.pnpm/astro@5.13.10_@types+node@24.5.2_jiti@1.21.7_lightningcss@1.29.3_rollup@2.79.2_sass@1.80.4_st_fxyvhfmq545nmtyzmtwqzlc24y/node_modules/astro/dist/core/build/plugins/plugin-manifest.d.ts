import { type BuildInternals } from '../internal.js';
import type { AstroBuildPlugin } from '../plugin.js';
import type { StaticBuildOptions } from '../types.js';
export declare const SSR_MANIFEST_VIRTUAL_MODULE_ID = "@astrojs-manifest";
export declare const RESOLVED_SSR_MANIFEST_VIRTUAL_MODULE_ID: string;
export declare function pluginManifest(options: StaticBuildOptions, internals: BuildInternals): AstroBuildPlugin;
