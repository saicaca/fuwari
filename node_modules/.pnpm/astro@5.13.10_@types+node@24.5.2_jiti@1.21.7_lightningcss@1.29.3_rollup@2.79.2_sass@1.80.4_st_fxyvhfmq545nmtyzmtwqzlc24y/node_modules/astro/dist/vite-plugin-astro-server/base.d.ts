import type * as vite from 'vite';
import type { Logger } from '../core/logger/core.js';
import type { AstroSettings } from '../types/astro.js';
export declare function baseMiddleware(settings: AstroSettings, logger: Logger): vite.Connect.NextHandleFunction;
