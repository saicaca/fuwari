import type { IncomingMessage, ServerResponse } from 'node:http';
import type { RouteData } from '../../types/public/internal.js';
import type { RenderOptions } from './index.js';
import { App } from './index.js';
import type { NodeAppHeadersJson, SSRManifest } from './types.js';
export { apply as applyPolyfills } from '../polyfill.js';
/**
 * Allow the request body to be explicitly overridden. For example, this
 * is used by the Express JSON middleware.
 */
interface NodeRequest extends IncomingMessage {
    body?: unknown;
}
export declare class NodeApp extends App {
    headersMap: NodeAppHeadersJson | undefined;
    setHeadersMap(headers: NodeAppHeadersJson): void;
    match(req: NodeRequest | Request, allowPrerenderedRoutes?: boolean): RouteData | undefined;
    render(request: NodeRequest | Request, options?: RenderOptions): Promise<Response>;
    /**
     * @deprecated Instead of passing `RouteData` and locals individually, pass an object with `routeData` and `locals` properties.
     * See https://github.com/withastro/astro/pull/9199 for more information.
     */
    render(request: NodeRequest | Request, routeData?: RouteData, locals?: object): Promise<Response>;
    /**
     * Converts a NodeJS IncomingMessage into a web standard Request.
     * ```js
     * import { NodeApp } from 'astro/app/node';
     * import { createServer } from 'node:http';
     *
     * const server = createServer(async (req, res) => {
     *     const request = NodeApp.createRequest(req);
     *     const response = await app.render(request);
     *     await NodeApp.writeResponse(response, res);
     * })
     * ```
     */
    static createRequest(req: NodeRequest, { skipBody }?: {
        skipBody?: boolean | undefined;
    }): Request;
    /**
     * Streams a web-standard Response into a NodeJS Server Response.
     * ```js
     * import { NodeApp } from 'astro/app/node';
     * import { createServer } from 'node:http';
     *
     * const server = createServer(async (req, res) => {
     *     const request = NodeApp.createRequest(req);
     *     const response = await app.render(request);
     *     await NodeApp.writeResponse(response, res);
     * })
     * ```
     * @param source WhatWG Response
     * @param destination NodeJS ServerResponse
     */
    static writeResponse(source: Response, destination: ServerResponse): Promise<ServerResponse<IncomingMessage> | undefined>;
}
export declare function loadManifest(rootFolder: URL): Promise<SSRManifest>;
export declare function loadApp(rootFolder: URL): Promise<NodeApp>;
