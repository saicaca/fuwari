import type { Plugin } from 'vite';
import type { BuildInternals } from '../core/build/internal.js';
import type { AstroBuildPlugin } from '../core/build/plugin.js';
import type { StaticBuildOptions } from '../core/build/types.js';
import type { AstroSettings } from '../types/astro.js';
export declare function astroContentAssetPropagationPlugin({ settings, }: {
    settings: AstroSettings;
}): Plugin;
export declare function astroConfigBuildPlugin(options: StaticBuildOptions, internals: BuildInternals): AstroBuildPlugin;
