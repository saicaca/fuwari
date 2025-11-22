import type { MiddlewareHandler } from '../../types/public/common.js';
/**
 * Returns a middleware function in charge to check the `origin` header.
 *
 * @private
 */
export declare function createOriginCheckMiddleware(): MiddlewareHandler;
