import type { RoutesList } from '../../types/astro.js';
import type { RouteData, SSRManifest } from '../../types/public/internal.js';
import { getSetCookiesFromResponse } from '../cookies/index.js';
import { AstroIntegrationLogger } from '../logger/core.js';
export { deserializeManifest } from './common.js';
type ErrorPagePath = `${string}/404` | `${string}/500` | `${string}/404/` | `${string}/500/` | `${string}404.html` | `${string}500.html`;
export interface RenderOptions {
    /**
     * Whether to automatically add all cookies written by `Astro.cookie.set()` to the response headers.
     *
     * When set to `true`, they will be added to the `Set-Cookie` header as comma-separated key=value pairs. You can use the standard `response.headers.getSetCookie()` API to read them individually.
     *
     * When set to `false`, the cookies will only be available from `App.getSetCookieFromResponse(response)`.
     *
     * @default {false}
     */
    addCookieHeader?: boolean;
    /**
     * The client IP address that will be made available as `Astro.clientAddress` in pages, and as `ctx.clientAddress` in API routes and middleware.
     *
     * Default: `request[Symbol.for("astro.clientAddress")]`
     */
    clientAddress?: string;
    /**
     * The mutable object that will be made available as `Astro.locals` in pages, and as `ctx.locals` in API routes and middleware.
     */
    locals?: object;
    /**
     * A custom fetch function for retrieving prerendered pages - 404 or 500.
     *
     * If not provided, Astro will fallback to its default behavior for fetching error pages.
     *
     * When a dynamic route is matched but ultimately results in a 404, this function will be used
     * to fetch the prerendered 404 page if available. Similarly, it may be used to fetch a
     * prerendered 500 error page when necessary.
     *
     * @param {ErrorPagePath} url - The URL of the prerendered 404 or 500 error page to fetch.
     * @returns {Promise<Response>} A promise resolving to the prerendered response.
     */
    prerenderedErrorPageFetch?: (url: ErrorPagePath) => Promise<Response>;
    /**
     * **Advanced API**: you probably do not need to use this.
     *
     * Default: `app.match(request)`
     */
    routeData?: RouteData;
}
export interface RenderErrorOptions {
    locals?: App.Locals;
    routeData?: RouteData;
    response?: Response;
    status: 404 | 500;
    /**
     * Whether to skip middleware while rendering the error page. Defaults to false.
     */
    skipMiddleware?: boolean;
    /**
     * Allows passing an error to 500.astro. It will be available through `Astro.props.error`.
     */
    error?: unknown;
    clientAddress: string | undefined;
    prerenderedErrorPageFetch: (url: ErrorPagePath) => Promise<Response>;
}
export declare class App {
    #private;
    constructor(manifest: SSRManifest, streaming?: boolean);
    getAdapterLogger(): AstroIntegrationLogger;
    set setManifestData(newManifestData: RoutesList);
    removeBase(pathname: string): string;
    /**
     * Given a `Request`, it returns the `RouteData` that matches its `pathname`. By default, prerendered
     * routes aren't returned, even if they are matched.
     *
     * When `allowPrerenderedRoutes` is `true`, the function returns matched prerendered routes too.
     * @param request
     * @param allowPrerenderedRoutes
     */
    match(request: Request, allowPrerenderedRoutes?: boolean): RouteData | undefined;
    render(request: Request, renderOptions?: RenderOptions): Promise<Response>;
    setCookieHeaders(response: Response): Generator<string, string[], any>;
    /**
     * Reads all the cookies written by `Astro.cookie.set()` onto the passed response.
     * For example,
     * ```ts
     * for (const cookie_ of App.getSetCookieFromResponse(response)) {
     *     const cookie: string = cookie_
     * }
     * ```
     * @param response The response to read cookies from.
     * @returns An iterator that yields key-value pairs as equal-sign-separated strings.
     */
    static getSetCookieFromResponse: typeof getSetCookiesFromResponse;
}
