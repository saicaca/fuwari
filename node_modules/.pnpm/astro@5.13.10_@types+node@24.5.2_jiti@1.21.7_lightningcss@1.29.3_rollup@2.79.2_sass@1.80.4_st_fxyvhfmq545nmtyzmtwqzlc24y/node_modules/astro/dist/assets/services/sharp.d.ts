import type { SharpOptions } from 'sharp';
import { type LocalImageService } from './service.js';
export interface SharpImageServiceConfig {
    /**
     * The `limitInputPixels` option passed to Sharp. See https://sharp.pixelplumbing.com/api-constructor for more information
     */
    limitInputPixels?: SharpOptions['limitInputPixels'];
}
declare const sharpService: LocalImageService<SharpImageServiceConfig>;
export default sharpService;
