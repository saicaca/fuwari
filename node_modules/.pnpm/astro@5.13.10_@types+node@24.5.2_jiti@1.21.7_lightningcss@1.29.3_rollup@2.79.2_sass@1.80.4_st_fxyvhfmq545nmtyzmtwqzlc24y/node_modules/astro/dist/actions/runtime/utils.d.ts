import type { APIContext, AstroSharedContext } from '../../types/public/context.js';
import type { SerializedActionResult } from './virtual/shared.js';
export type ActionPayload = {
    actionResult: SerializedActionResult;
    actionName: string;
};
export type Locals = {
    _actionPayload: ActionPayload;
};
export declare const ACTION_API_CONTEXT_SYMBOL: unique symbol;
export declare const formContentTypes: string[];
export declare function hasContentType(contentType: string, expected: string[]): boolean;
export type ActionAPIContext = Pick<APIContext, 'rewrite' | 'request' | 'url' | 'isPrerendered' | 'locals' | 'clientAddress' | 'cookies' | 'currentLocale' | 'generator' | 'routePattern' | 'site' | 'params' | 'preferredLocale' | 'preferredLocaleList' | 'originPathname' | 'session' | 'csp'> & {
    /**
     * @deprecated
     * The use of `rewrite` in Actions is deprecated
     */
    rewrite: AstroSharedContext['rewrite'];
};
export type MaybePromise<T> = T | Promise<T>;
/**
 * Used to preserve the input schema type in the error object.
 * This allows for type inference on the `fields` property
 * when type narrowed to an `ActionInputError`.
 *
 * Example: Action has an input schema of `{ name: z.string() }`.
 * When calling the action and checking `isInputError(result.error)`,
 * `result.error.fields` will be typed with the `name` field.
 */
export type ErrorInferenceObject = Record<string, any>;
export declare function isActionAPIContext(ctx: ActionAPIContext): boolean;
