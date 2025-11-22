import type http from 'node:http';
import type { ComponentInstance, RoutesList } from '../types/astro.js';
import type { RouteData } from '../types/public/internal.js';
import type { DevPipeline } from './pipeline.js';
type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (...args: any) => Promise<infer R> ? R : any;
interface MatchedRoute {
    route: RouteData;
    filePath: URL;
    resolvedPathname: string;
    preloadedComponent: ComponentInstance;
    mod: ComponentInstance;
}
export declare function matchRoute(pathname: string, routesList: RoutesList, pipeline: DevPipeline): Promise<MatchedRoute | undefined>;
interface HandleRoute {
    matchedRoute: AsyncReturnType<typeof matchRoute>;
    url: URL;
    pathname: string;
    body: BodyInit | undefined;
    routesList: RoutesList;
    incomingRequest: http.IncomingMessage;
    incomingResponse: http.ServerResponse;
    pipeline: DevPipeline;
}
export declare function handleRoute({ matchedRoute, url, pathname, body, pipeline, routesList, incomingRequest, incomingResponse, }: HandleRoute): Promise<void>;
export {};
