import type { Plugin as VitePlugin } from 'vite';
import type { Logger } from '../core/logger/core.js';
import type { AstroSettings, RoutesList } from '../types/astro.js';
interface AstroPluginScannerOptions {
    settings: AstroSettings;
    logger: Logger;
    routesList: RoutesList;
}
export default function astroScannerPlugin({ settings, logger, routesList, }: AstroPluginScannerOptions): VitePlugin;
export {};
