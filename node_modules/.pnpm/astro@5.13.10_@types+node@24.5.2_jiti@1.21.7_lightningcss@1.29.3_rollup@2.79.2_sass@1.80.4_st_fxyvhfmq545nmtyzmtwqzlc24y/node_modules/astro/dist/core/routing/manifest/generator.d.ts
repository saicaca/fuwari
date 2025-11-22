import type { AstroConfig } from '../../../types/public/config.js';
import type { RoutePart } from '../../../types/public/internal.js';
export declare function getRouteGenerator(segments: RoutePart[][], addTrailingSlash: AstroConfig['trailingSlash']): (params: Record<string, string | number>) => string;
