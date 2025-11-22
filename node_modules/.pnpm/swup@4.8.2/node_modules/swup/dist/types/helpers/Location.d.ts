/**
 * A helper for creating a Location from either an element
 * or a URL object/string
 *
 */
export declare class Location extends URL {
    constructor(url: URL | string, base?: string);
    /**
     * The full local path including query params.
     */
    get url(): string;
    /**
     * Instantiate a Location from an element's href attribute
     * @param el
     * @returns new Location instance
     */
    static fromElement(el: Element): Location;
    /**
     * Instantiate a Location from a URL object or string
     * @param url
     * @returns new Location instance
     */
    static fromUrl(url: URL | string): Location;
}
//# sourceMappingURL=Location.d.ts.map