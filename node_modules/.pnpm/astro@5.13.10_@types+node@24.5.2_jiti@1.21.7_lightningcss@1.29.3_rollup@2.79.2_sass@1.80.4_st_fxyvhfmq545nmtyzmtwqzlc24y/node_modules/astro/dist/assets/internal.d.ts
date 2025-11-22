import type { AstroConfig } from '../types/public/config.js';
import { type ImageService } from './services/service.js';
import { type GetImageResult, type UnresolvedImageTransform } from './types.js';
export declare function getConfiguredImageService(): Promise<ImageService>;
export declare function getImage(options: UnresolvedImageTransform, imageConfig: AstroConfig['image']): Promise<GetImageResult>;
