import type { DataCollector, Hasher, UrlProxy, UrlProxyContentResolver, UrlResolver } from '../definitions.js';
export declare function createUrlProxy({ contentResolver, hasher, dataCollector, urlResolver, }: {
    contentResolver: UrlProxyContentResolver;
    hasher: Hasher;
    dataCollector: DataCollector;
    urlResolver: UrlResolver;
}): UrlProxy;
