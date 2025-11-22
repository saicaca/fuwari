import type http from 'node:http';
import type { RoutesList } from '../types/astro.js';
import type { DevServerController } from './controller.js';
import type { DevPipeline } from './pipeline.js';
type HandleRequest = {
    pipeline: DevPipeline;
    routesList: RoutesList;
    controller: DevServerController;
    incomingRequest: http.IncomingMessage;
    incomingResponse: http.ServerResponse;
};
/** The main logic to route dev server requests to pages in Astro. */
export declare function handleRequest({ pipeline, routesList, controller, incomingRequest, incomingResponse, }: HandleRequest): Promise<void>;
export {};
