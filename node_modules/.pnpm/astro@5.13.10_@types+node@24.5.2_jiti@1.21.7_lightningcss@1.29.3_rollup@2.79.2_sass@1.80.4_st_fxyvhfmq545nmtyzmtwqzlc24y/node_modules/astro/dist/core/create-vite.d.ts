import nodeFs from 'node:fs';
import * as vite from 'vite';
import type { AstroSettings, RoutesList } from '../types/astro.js';
import type { SSRManifest } from './app/types.js';
import type { Logger } from './logger/core.js';
type CreateViteOptions = {
    settings: AstroSettings;
    logger: Logger;
    mode: string;
    fs?: typeof nodeFs;
    sync: boolean;
    routesList: RoutesList;
    manifest: SSRManifest;
} & ({
    command: 'dev';
    manifest: SSRManifest;
} | {
    command: 'build';
    manifest?: SSRManifest;
});
/** Return a base vite config as a common starting point for all Vite commands. */
export declare function createVite(commandConfig: vite.InlineConfig, { settings, logger, mode, command, fs, sync, routesList, manifest }: CreateViteOptions): Promise<vite.InlineConfig>;
export {};
