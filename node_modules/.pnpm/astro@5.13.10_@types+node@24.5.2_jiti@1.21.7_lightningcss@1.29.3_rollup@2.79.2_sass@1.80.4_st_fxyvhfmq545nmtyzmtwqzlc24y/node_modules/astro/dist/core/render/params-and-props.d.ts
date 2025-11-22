import type { ComponentInstance } from '../../types/astro.js';
import type { Params, Props } from '../../types/public/common.js';
import type { RouteData } from '../../types/public/internal.js';
import type { Logger } from '../logger/core.js';
import type { RouteCache } from './route-cache.js';
interface GetParamsAndPropsOptions {
    mod: ComponentInstance | undefined;
    routeData?: RouteData | undefined;
    routeCache: RouteCache;
    pathname: string;
    logger: Logger;
    serverLike: boolean;
    base: string;
}
export declare function getProps(opts: GetParamsAndPropsOptions): Promise<Props>;
/**
 * When given a route with the pattern `/[x]/[y]/[z]/svelte`, and a pathname `/a/b/c/svelte`,
 * returns the params object: { x: "a", y: "b", z: "c" }.
 */
export declare function getParams(route: RouteData, pathname: string): Params;
export {};
