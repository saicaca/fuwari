import type { ComponentInstance } from '../../types/astro.js';
import type { RewritePayload } from '../../types/public/common.js';
import type { RouteData, SSRResult } from '../../types/public/internal.js';
import { Pipeline, type TryRewriteResult } from '../base-pipeline.js';
import type { SinglePageBuiltModule } from '../build/types.js';
export declare class AppPipeline extends Pipeline {
    static create({ logger, manifest, runtimeMode, renderers, resolve, serverLike, streaming, defaultRoutes, }: Pick<AppPipeline, 'logger' | 'manifest' | 'runtimeMode' | 'renderers' | 'resolve' | 'serverLike' | 'streaming' | 'defaultRoutes'>): AppPipeline;
    headElements(routeData: RouteData): Pick<SSRResult, 'scripts' | 'styles' | 'links'>;
    componentMetadata(): void;
    getComponentByRoute(routeData: RouteData): Promise<ComponentInstance>;
    tryRewrite(payload: RewritePayload, request: Request): Promise<TryRewriteResult>;
    getModuleForRoute(route: RouteData): Promise<SinglePageBuiltModule>;
}
