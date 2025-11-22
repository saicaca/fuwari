import type Swup from '../Swup.js';
/** A page object as used by swup and its cache. */
export interface PageData {
    /** The URL of the page */
    url: string;
    /** The complete HTML response received from the server */
    html: string;
}
/** Define how a page is fetched. */
export interface FetchOptions extends Omit<RequestInit, 'cache'> {
    /** The request method. */
    method?: 'GET' | 'POST';
    /** The body of the request: raw string, form data object or URL params. */
    body?: string | FormData | URLSearchParams;
    /** The request timeout in milliseconds. */
    timeout?: number;
}
export declare class FetchError extends Error {
    url: string;
    status?: number;
    aborted: boolean;
    timedOut: boolean;
    constructor(message: string, details: {
        url: string;
        status?: number;
        aborted?: boolean;
        timedOut?: boolean;
    });
}
/**
 * Fetch a page from the server, return it and cache it.
 */
export declare function fetchPage(this: Swup, url: URL | string, options?: FetchOptions): Promise<PageData>;
//# sourceMappingURL=fetchPage.d.ts.map