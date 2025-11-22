import type { SerializedRouteData } from '../../../types/astro.js';
import type { AstroConfig } from '../../../types/public/config.js';
import type { RouteData } from '../../../types/public/internal.js';
export declare function serializeRouteData(routeData: RouteData, trailingSlash: AstroConfig['trailingSlash']): SerializedRouteData;
export declare function deserializeRouteData(rawRouteData: SerializedRouteData): RouteData;
