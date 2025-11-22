import type fsMod from 'node:fs';
import type { Plugin as VitePlugin } from 'vite';
import type { BuildInternals } from '../core/build/internal.js';
import type { StaticBuildOptions } from '../core/build/types.js';
import type { AstroSettings } from '../types/astro.js';
/**
 * This plugin is responsible to load the known file `actions/index.js` / `actions.js`
 * If the file doesn't exist, it returns an empty object.
 * @param settings
 */
export declare function vitePluginUserActions({ settings }: {
    settings: AstroSettings;
}): VitePlugin;
/**
 * This plugin is used to retrieve the final entry point of the bundled actions.ts file
 * @param opts
 * @param internals
 */
export declare function vitePluginActionsBuild(opts: StaticBuildOptions, internals: BuildInternals): VitePlugin;
export declare function vitePluginActions({ fs, settings, }: {
    fs: typeof fsMod;
    settings: AstroSettings;
}): VitePlugin;
