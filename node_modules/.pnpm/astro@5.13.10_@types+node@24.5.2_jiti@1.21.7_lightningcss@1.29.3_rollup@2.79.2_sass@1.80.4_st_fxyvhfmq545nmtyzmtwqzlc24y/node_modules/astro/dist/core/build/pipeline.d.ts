import type { AstroSettings, ComponentInstance } from '../../types/astro.js';
import type { RewritePayload } from '../../types/public/common.js';
import type { RouteData, SSRResult } from '../../types/public/internal.js';
import type { SSRManifest } from '../app/types.js';
import type { TryRewriteResult } from '../base-pipeline.js';
import { Pipeline } from '../render/index.js';
import { type BuildInternals } from './internal.js';
import type { PageBuildData, SinglePageBuiltModule, StaticBuildOptions } from './types.js';
/**
 * The build pipeline is responsible to gather the files emitted by the SSR build and generate the pages by executing these files.
 */
export declare class BuildPipeline extends Pipeline {
    #private;
    readonly internals: BuildInternals;
    readonly manifest: SSRManifest;
    readonly options: StaticBuildOptions;
    readonly config: import("../../types/public/config.js").AstroConfig;
    readonly settings: AstroSettings;
    readonly defaultRoutes: {
        instance: ComponentInstance;
        matchesComponent(filePath: URL): boolean;
        route: string;
        component: string;
    }[];
    get outFolder(): URL;
    private constructor();
    getRoutes(): RouteData[];
    static create({ internals, manifest, options, }: Pick<BuildPipeline, 'internals' | 'manifest' | 'options'>): BuildPipeline;
    /**
     * The SSR build emits two important files:
     * - dist/server/manifest.mjs
     * - dist/renderers.mjs
     *
     * These two files, put together, will be used to generate the pages.
     *
     * ## Errors
     *
     * It will throw errors if the previous files can't be found in the file system.
     *
     * @param staticBuildOptions
     */
    static retrieveManifest(settings: AstroSettings, internals: BuildInternals): Promise<SSRManifest>;
    headElements(routeData: RouteData): Pick<SSRResult, 'scripts' | 'styles' | 'links'>;
    componentMetadata(): void;
    /**
     * It collects the routes to generate during the build.
     * It returns a map of page information and their relative entry point as a string.
     */
    retrieveRoutesToGenerate(): Map<PageBuildData, string>;
    getComponentByRoute(routeData: RouteData): Promise<ComponentInstance>;
    tryRewrite(payload: RewritePayload, request: Request): Promise<TryRewriteResult>;
    retrieveSsrEntry(route: RouteData, filePath: string): Promise<SinglePageBuiltModule>;
}
