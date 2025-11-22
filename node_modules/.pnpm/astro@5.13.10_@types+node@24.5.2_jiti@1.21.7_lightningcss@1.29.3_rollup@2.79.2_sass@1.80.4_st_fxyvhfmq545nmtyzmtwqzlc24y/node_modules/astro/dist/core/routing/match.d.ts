import type { RoutesList } from '../../types/astro.js';
import type { RouteData } from '../../types/public/internal.js';
/** Find matching route from pathname */
export declare function matchRoute(pathname: string, manifest: RoutesList): RouteData | undefined;
/** Finds all matching routes from pathname */
export declare function matchAllRoutes(pathname: string, manifest: RoutesList): RouteData[];
export declare function isRoute404(route: string): boolean;
export declare function isRoute500(route: string): boolean;
/**
 * Determines if the given route matches a 404 or 500 error page.
 *
 * @param {RouteData} route - The route data to check.
 * @returns {boolean} `true` if the route matches a 404 or 500 error page, otherwise `false`.
 */
export declare function isRoute404or500(route: RouteData): boolean;
/**
 * Determines if a given route is associated with the server island component.
 *
 * @param {RouteData} route - The route data object to evaluate.
 * @return {boolean} Returns true if the route's component is the server island component, otherwise false.
 */
export declare function isRouteServerIsland(route: RouteData): boolean;
/**
 * Determines whether the given `Request` is targeted to a "server island" based on its URL.
 *
 * @param {Request} request - The request object to be evaluated.
 * @param {string} [base=''] - The base path provided via configuration.
 * @return {boolean} - Returns `true` if the request is for a server island, otherwise `false`.
 */
export declare function isRequestServerIsland(request: Request, base?: string): boolean;
/**
 * Checks if the given request corresponds to a 404 or 500 route based on the specified base path.
 *
 * @param {Request} request - The HTTP request object to be checked.
 * @param {string} [base=''] - The base path to trim from the request's URL before checking the route. Default is an empty string.
 * @return {boolean} Returns true if the request matches a 404 or 500 route; otherwise, returns false.
 */
export declare function requestIs404Or500(request: Request, base?: string): boolean;
/**
 * Determines whether a given route is an external redirect.
 *
 * @param {RouteData} route - The route object to check.
 * @return {boolean} Returns true if the route is an external redirect, otherwise false.
 */
export declare function isRouteExternalRedirect(route: RouteData): boolean;
