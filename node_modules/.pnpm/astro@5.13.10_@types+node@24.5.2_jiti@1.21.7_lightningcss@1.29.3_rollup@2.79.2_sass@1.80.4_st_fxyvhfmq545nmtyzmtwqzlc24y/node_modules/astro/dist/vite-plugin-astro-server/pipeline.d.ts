import type { HeadElements, TryRewriteResult } from '../core/base-pipeline.js';
import type { Logger } from '../core/logger/core.js';
import type { ModuleLoader } from '../core/module-loader/index.js';
import { Pipeline } from '../core/render/index.js';
import type { AstroSettings, ComponentInstance, RoutesList } from '../types/astro.js';
import type { RewritePayload } from '../types/public/common.js';
import type { RouteData, SSRLoadedRenderer, SSRManifest } from '../types/public/internal.js';
export declare class DevPipeline extends Pipeline {
    readonly loader: ModuleLoader;
    readonly logger: Logger;
    readonly manifest: SSRManifest;
    readonly settings: AstroSettings;
    readonly config: import("../types/public/config.js").AstroConfig;
    readonly defaultRoutes: {
        instance: ComponentInstance;
        matchesComponent(filePath: URL): boolean;
        route: string;
        component: string;
    }[];
    renderers: SSRLoadedRenderer[];
    routesList: RoutesList | undefined;
    componentInterner: WeakMap<RouteData, ComponentInstance>;
    private constructor();
    static create(manifestData: RoutesList, { loader, logger, manifest, settings, }: Pick<DevPipeline, 'loader' | 'logger' | 'manifest' | 'settings'>): DevPipeline;
    headElements(routeData: RouteData): Promise<HeadElements>;
    componentMetadata(routeData: RouteData): Promise<Map<string, import("../types/public/internal.js").SSRComponentMetadata>>;
    preload(routeData: RouteData, filePath: URL): Promise<ComponentInstance>;
    clearRouteCache(): void;
    getComponentByRoute(routeData: RouteData): Promise<ComponentInstance>;
    tryRewrite(payload: RewritePayload, request: Request): Promise<TryRewriteResult>;
    setManifestData(manifestData: RoutesList): void;
}
