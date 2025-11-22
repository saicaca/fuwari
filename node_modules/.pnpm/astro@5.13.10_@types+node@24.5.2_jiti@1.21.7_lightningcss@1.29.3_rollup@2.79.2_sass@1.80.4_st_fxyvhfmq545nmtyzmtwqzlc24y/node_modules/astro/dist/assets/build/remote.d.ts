export type RemoteCacheEntry = {
    data?: string;
    expires: number;
    etag?: string;
    lastModified?: string;
};
export declare function loadRemoteImage(src: string): Promise<{
    data: Buffer<ArrayBuffer>;
    expires: number;
    etag: string | undefined;
    lastModified: string | undefined;
}>;
/**
 * Revalidate a cached remote asset using its entity-tag or modified date.
 * Uses the [If-None-Match](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-None-Match) and [If-Modified-Since](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Modified-Since)
 * headers to check with the remote server if the cached version of a remote asset is still up to date.
 * The remote server may respond that the cached asset is still up-to-date if the entity-tag or modification time matches (304 Not Modified), or respond with an updated asset (200 OK)
 * @param src - url to remote asset
 * @param revalidationData - an object containing the stored Entity-Tag of the cached asset and/or the Last Modified time
 * @returns An ImageData object containing the asset data, a new expiry time, and the asset's etag. The data buffer will be empty if the asset was not modified.
 */
export declare function revalidateRemoteImage(src: string, revalidationData: {
    etag?: string;
    lastModified?: string;
}): Promise<{
    data: Buffer<ArrayBuffer>;
    expires: number;
    etag: string | undefined;
    lastModified: string | undefined;
}>;
