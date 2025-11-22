import type { AstroSettings } from '../../../types/astro.js';
import type { RouteData } from '../../../types/public/internal.js';
import type { Logger } from '../../logger/core.js';
export declare function getRoutePrerenderOption(content: string, route: RouteData, settings: AstroSettings, logger: Logger): Promise<void>;
