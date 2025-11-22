import type { SharpImageServiceConfig } from '../assets/services/sharp.js';
import type { ImageServiceConfig } from '../types/public/index.js';
export { defineAstroFontProvider, fontProviders } from '../assets/fonts/providers/index.js';
export type { AstroFontProvider } from '../assets/fonts/types.js';
export { mergeConfig } from '../core/config/merge.js';
export { validateConfig } from '../core/config/validate.js';
export { envField } from '../env/config.js';
export { defineConfig, getViteConfig } from './index.js';
/**
 * Return the configuration needed to use the Sharp-based image service
 */
export declare function sharpImageService(config?: SharpImageServiceConfig): ImageServiceConfig;
/**
 * Return the configuration needed to use the passthrough image service. This image services does not perform
 * any image transformations, and is mainly useful when your platform does not support other image services, or you are
 * not using Astro's built-in image processing.
 * See: https://docs.astro.build/en/guides/images/#configure-no-op-passthrough-service
 */
export declare function passthroughImageService(): ImageServiceConfig;
