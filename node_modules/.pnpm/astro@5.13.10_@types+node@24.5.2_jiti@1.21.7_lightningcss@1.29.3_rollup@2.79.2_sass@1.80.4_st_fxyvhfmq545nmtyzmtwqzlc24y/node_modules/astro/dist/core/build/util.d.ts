import type { Rollup } from 'vite';
import type { AstroConfig } from '../../types/public/config.js';
import type { ViteBuildReturn } from './types.js';
export declare function getTimeStat(timeStart: number, timeEnd: number): string;
/**
 * Given the Astro configuration, it tells if a slash should be appended or not
 */
export declare function shouldAppendForwardSlash(trailingSlash: AstroConfig['trailingSlash'], buildFormat: AstroConfig['build']['format']): boolean;
export declare function i18nHasFallback(config: AstroConfig): boolean;
export declare function encodeName(name: string): string;
export declare function viteBuildReturnToRollupOutputs(viteBuildReturn: ViteBuildReturn): Rollup.RollupOutput[];
