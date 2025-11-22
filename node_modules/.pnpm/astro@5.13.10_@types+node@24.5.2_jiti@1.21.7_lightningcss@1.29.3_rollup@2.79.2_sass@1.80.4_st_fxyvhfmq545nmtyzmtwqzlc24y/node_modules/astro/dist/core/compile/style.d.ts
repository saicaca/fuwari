import type { TransformOptions } from '@astrojs/compiler';
import { type ResolvedConfig } from 'vite';
import type { CompileCssResult } from './types.js';
export type PartialCompileCssResult = Pick<CompileCssResult, 'isGlobal' | 'dependencies'>;
export declare function createStylePreprocessor({ filename, viteConfig, cssPartialCompileResults, cssTransformErrors, }: {
    filename: string;
    viteConfig: ResolvedConfig;
    cssPartialCompileResults: Partial<CompileCssResult>[];
    cssTransformErrors: Error[];
}): TransformOptions['preprocessStyle'];
