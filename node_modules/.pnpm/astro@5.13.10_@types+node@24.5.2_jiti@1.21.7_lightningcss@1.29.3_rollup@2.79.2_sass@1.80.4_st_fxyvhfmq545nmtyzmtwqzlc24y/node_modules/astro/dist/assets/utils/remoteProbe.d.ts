import type { ImageMetadata } from '../types.js';
/**
 * Infers the dimensions of a remote image by streaming its data and analyzing it progressively until sufficient metadata is available.
 *
 * @param {string} url - The URL of the remote image from which to infer size metadata.
 * @return {Promise<Omit<ImageMetadata, 'src' | 'fsPath'>>} Returns a promise that resolves to an object containing the image dimensions metadata excluding `src` and `fsPath`.
 * @throws {AstroError} Thrown when the fetching fails or metadata cannot be extracted.
 */
export declare function inferRemoteSize(url: string): Promise<Omit<ImageMetadata, 'src' | 'fsPath'>>;
