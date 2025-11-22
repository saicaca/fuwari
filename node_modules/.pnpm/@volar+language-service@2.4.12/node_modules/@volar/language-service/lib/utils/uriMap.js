"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUriMap = createUriMap;
function createUriMap(caseSensitive = false) {
    const map = new Map();
    const rawUriToNormalizedUri = new Map();
    const normalizedUriToRawUri = new Map();
    return {
        get size() {
            return map.size;
        },
        get [Symbol.toStringTag]() {
            return 'UriMap';
        },
        [Symbol.iterator]() {
            return this.entries();
        },
        clear() {
            rawUriToNormalizedUri.clear();
            normalizedUriToRawUri.clear();
            return map.clear();
        },
        values() {
            return map.values();
        },
        *keys() {
            for (const normalizedUri of map.keys()) {
                yield normalizedUriToRawUri.get(normalizedUri);
            }
            return undefined;
        },
        *entries() {
            for (const [normalizedUri, item] of map.entries()) {
                yield [normalizedUriToRawUri.get(normalizedUri), item];
            }
            return undefined;
        },
        forEach(callbackfn, thisArg) {
            for (const [uri, item] of this.entries()) {
                callbackfn.call(thisArg, item, uri, this);
            }
        },
        delete(uri) {
            return map.delete(toKey(uri));
        },
        get(uri) {
            return map.get(toKey(uri));
        },
        has(uri) {
            return map.has(toKey(uri));
        },
        set(uri, item) {
            map.set(toKey(uri), item);
            return this;
        },
    };
    function toKey(uri) {
        const rawUri = uri.toString();
        if (!rawUriToNormalizedUri.has(rawUri)) {
            let normalizedUri = uri.toString();
            if (!caseSensitive) {
                normalizedUri = normalizedUri.toLowerCase();
            }
            rawUriToNormalizedUri.set(rawUri, normalizedUri);
            normalizedUriToRawUri.set(normalizedUri, uri);
        }
        return rawUriToNormalizedUri.get(rawUri);
    }
}
//# sourceMappingURL=uriMap.js.map