import type Swup from '../Swup.js';
import { type FetchOptions } from './fetchPage.js';
import { type VisitInitOptions, type Visit } from './Visit.js';
export type HistoryAction = 'push' | 'replace';
export type HistoryDirection = 'forwards' | 'backwards';
export type NavigationToSelfAction = 'scroll' | 'navigate';
export type CacheControl = Partial<{
    read: boolean;
    write: boolean;
}>;
/** Define how to navigate to a page. */
type NavigationOptions = {
    /** Whether this visit is animated. Default: `true` */
    animate?: boolean;
    /** Name of a custom animation to run. */
    animation?: string;
    /** History action to perform: `push` for creating a new history entry, `replace` for replacing the current entry. Default: `push` */
    history?: HistoryAction;
    /** Whether this visit should read from or write to the cache. */
    cache?: CacheControl;
    /** Custom metadata associated with this visit. */
    meta?: Record<string, unknown>;
};
/**
 * Navigate to a new URL.
 * @param url The URL to navigate to.
 * @param options Options for how to perform this visit.
 * @returns Promise<void>
 */
export declare function navigate(this: Swup, url: string, options?: NavigationOptions & FetchOptions, init?: Omit<VisitInitOptions, 'to'>): void;
/**
 * Start a visit to a new URL.
 *
 * Internal method that assumes the visit context has already been created.
 *
 * As a user, you should call `swup.navigate(url)` instead.
 *
 * @param url The URL to navigate to.
 * @param options Options for how to perform this visit.
 * @returns Promise<void>
 */
export declare function performNavigation(this: Swup, visit: Visit, options?: NavigationOptions & FetchOptions): Promise<void>;
export {};
//# sourceMappingURL=navigate.d.ts.map