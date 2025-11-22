/**
 * Utilities for extracting information from `Request`
 */
/**
 * Returns the first value associated to the `x-forwarded-for` header.
 *
 * @param {Request} request
 */
export declare function getClientIpAddress(request: Request): string | undefined;
