import type { ImageTransform } from '../types.js';
/**
 * Converts a file path and transformation properties of the transformation image service, into a formatted filename.
 *
 * The formatted filename follows this structure:
 *
 * `<prefixDirname>/<baseFilename>_<hash><outputExtension>`
 *
 * - `prefixDirname`: If the image is an ESM imported image, this is the directory name of the original file path; otherwise, it will be an empty string.
 * - `baseFilename`: The base name of the file or a hashed short name if the file is a `data:` URI.
 * - `hash`: A unique hash string generated to distinguish the transformed file.
 * - `outputExtension`: The desired output file extension derived from the `transform.format` or the original file extension.
 *
 * ## Example
 * - Input: `filePath = '/images/photo.jpg'`, `transform = { format: 'png', src: '/images/photo.jpg' }`, `hash = 'abcd1234'`.
 * - Output: `/images/photo_abcd1234.png`
 *
 * @param {string} filePath - The original file path or data URI of the source image.
 * @param {ImageTransform} transform - An object representing the transformation properties, including format and source.
 * @param {string} hash - A unique hash used to differentiate the transformed file.
 * @return {string} The generated filename based on the provided input, transformations, and hash.
 */
export declare function propsToFilename(filePath: string, transform: ImageTransform, hash: string): string;
/**
 * Transforms the provided `transform` object into a hash string based on selected properties
 * and the specified `imageService`.
 *
 * @param {ImageTransform} transform - The transform object containing various image transformation properties.
 * @param {string} imageService - The name of the image service related to the transform.
 * @param {string[]} propertiesToHash - An array of property names from the `transform` object that should be used to generate the hash.
 * @return {string} A hashed string created from the specified properties of the `transform` object and the image service.
 */
export declare function hashTransform(transform: ImageTransform, imageService: string, propertiesToHash: string[]): string;
