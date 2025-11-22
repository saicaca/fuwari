import type * as vite from 'vite';
import type { ImageMetadata } from '../../types.js';
type FileEmitter = vite.Rollup.EmitFile;
type ImageMetadataWithContents = ImageMetadata & {
    contents?: Buffer;
};
/**
 * Processes an image file and emits its metadata and optionally its contents. This function supports both build and development modes.
 *
 * @param {string | undefined} id - The identifier or path of the image file to process. If undefined, the function returns immediately.
 * @param {boolean} _watchMode - **Deprecated**: Indicates if the method is operating in watch mode. This parameter will be removed or updated in the future.
 * @param {boolean} _experimentalSvgEnabled - **Deprecated**: A flag to enable experimental handling of SVG files. Embeds SVG file data if set to true.
 * @param {FileEmitter | undefined} [fileEmitter] - Function for emitting files during the build process. May throw in certain scenarios.
 * @return {Promise<ImageMetadataWithContents | undefined>} Resolves to metadata with optional image contents or `undefined` if processing fails.
 */
export declare function emitESMImage(id: string | undefined, 
/** @deprecated */
_watchMode: boolean, 
/** @deprecated */
_experimentalSvgEnabled: boolean, fileEmitter?: FileEmitter): Promise<ImageMetadataWithContents | undefined>;
/**
 * Processes an image file and emits its metadata and optionally its contents. This function supports both build and development modes.
 *
 * @param {string | undefined} id - The identifier or path of the image file to process. If undefined, the function returns immediately.
 * @param {FileEmitter | undefined} [fileEmitter] - Function for emitting files during the build process. May throw in certain scenarios.
 * @return {Promise<ImageMetadataWithContents | undefined>} Resolves to metadata with optional image contents or `undefined` if processing fails.
 */
export declare function emitImageMetadata(id: string | undefined, fileEmitter?: FileEmitter): Promise<ImageMetadataWithContents | undefined>;
export {};
