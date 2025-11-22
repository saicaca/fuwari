import type fsMod from 'node:fs';
import type { Plugin } from 'vite';
import type { Logger } from '../core/logger/core.js';
import type { AstroSettings } from '../types/astro.js';
/**
 * Listen for Astro content directory changes and generate types.
 *
 * This is a separate plugin for `getViteConfig` as the `attachContentServerListeners` API
 * needs to be called at different times in `astro dev` and `getViteConfig`. For `astro dev`,
 * it needs to be called after the Astro server is started (packages/astro/src/core/dev/dev.ts).
 * For `getViteConfig`, it needs to be called after the Vite server is started.
 */
export declare function astroContentListenPlugin({ settings, logger, fs, }: {
    settings: AstroSettings;
    logger: Logger;
    fs: typeof fsMod;
}): Plugin;
