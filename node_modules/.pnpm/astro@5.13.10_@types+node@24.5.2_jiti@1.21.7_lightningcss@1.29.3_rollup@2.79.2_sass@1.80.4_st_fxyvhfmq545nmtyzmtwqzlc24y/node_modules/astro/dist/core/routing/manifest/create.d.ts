import nodeFs from 'node:fs';
import type { AstroSettings, RoutesList } from '../../../types/astro.js';
import type { Logger } from '../../logger/core.js';
interface CreateRouteManifestParams {
    /** Astro Settings object */
    settings: AstroSettings;
    /** Current working directory */
    cwd?: string;
    /** fs module, for testing */
    fsMod?: typeof nodeFs;
}
/** Create manifest of all static routes */
export declare function createRoutesList(params: CreateRouteManifestParams, logger: Logger, { dev }?: {
    dev?: boolean;
}): Promise<RoutesList>;
export declare function resolveInjectedRoute(entrypoint: string, root: URL, cwd?: string): {
    resolved: string;
    component: string;
};
export {};
