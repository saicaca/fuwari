import type { AstroSettings } from '../../types/astro.js';
import type { AstroConfig } from '../../types/public/config.js';
export declare function createBaseSettings(config: AstroConfig): AstroSettings;
export declare function createSettings(config: AstroConfig, cwd?: string): Promise<AstroSettings>;
