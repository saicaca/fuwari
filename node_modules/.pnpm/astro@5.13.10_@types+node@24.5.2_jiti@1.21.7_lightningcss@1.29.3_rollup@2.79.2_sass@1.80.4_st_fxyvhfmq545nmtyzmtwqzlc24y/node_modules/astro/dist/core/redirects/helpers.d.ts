import type { RouteData } from '../../types/public/internal.js';
type RedirectRouteData = RouteData & {
    redirect: string;
};
export declare function routeIsRedirect(route: RouteData | undefined): route is RedirectRouteData;
export declare function routeIsFallback(route: RouteData | undefined): route is RedirectRouteData;
export {};
