import type { Handler } from 'swup';
/**
 * Do not scroll if clicking on a link to the same page
 * and the route matches a fragment rule
 */
export declare const onLinkToSelf: Handler<'link:self'>;
/**
 * Prepare fragment visits
 */
export declare const onVisitStart: Handler<'visit:start'>;
/**
 * Skips the out-animation for <template> fragment elements
 */
export declare const maybeSkipOutAnimation: Handler<'animation:out:await'>;
/**
 * Skips the in-animation for <template> fragment elements
 */
export declare const maybeSkipInAnimation: Handler<'animation:in:await'>;
/**
 * Runs directly before replacing the content
 */
export declare const beforeContentReplace: Handler<'content:replace'>;
/**
 * Runs after the content was replaced
 */
export declare const onContentReplace: Handler<'content:replace'>;
/**
 * Remove possible fragment rule names from fragment elements
 */
export declare const onVisitEnd: Handler<'visit:end'>;
//# sourceMappingURL=handlers.d.ts.map