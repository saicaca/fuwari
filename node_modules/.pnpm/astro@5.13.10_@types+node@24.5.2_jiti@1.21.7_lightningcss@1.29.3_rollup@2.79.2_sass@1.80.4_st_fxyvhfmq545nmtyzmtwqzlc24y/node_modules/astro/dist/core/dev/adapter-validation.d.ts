import type { AstroSettings } from '../../types/astro.js';
import type { AstroAdapter } from '../../types/public/integrations.js';
import type { Logger } from '../logger/core.js';
export declare function warnMissingAdapter(logger: Logger, settings: AstroSettings): void;
export declare function validateSetAdapter(logger: Logger, settings: AstroSettings, adapter: AstroAdapter, maybeConflictingIntegration: string, command?: 'dev' | 'build' | string): void;
