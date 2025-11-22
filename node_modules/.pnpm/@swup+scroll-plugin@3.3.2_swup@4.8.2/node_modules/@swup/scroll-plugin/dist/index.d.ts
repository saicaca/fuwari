import Plugin from '@swup/plugin';
import { Handler, Visit } from 'swup';
export type Options = {
    doScrollingRightAway: boolean;
    animateScroll: {
        betweenPages: boolean;
        samePageWithHash: boolean;
        samePage: boolean;
    };
    scrollFriction: number;
    scrollAcceleration: number;
    getAnchorElement?: (hash: string) => Element | null;
    offset: number | ((el: Element) => number);
    scrollContainers: `[data-swup-scroll-container]`;
    shouldResetScrollPosition: (trigger: Element) => boolean;
    markScrollTarget?: boolean;
};
type ScrollPosition = {
    top: number;
    left: number;
};
type ScrollPositionsCacheEntry = {
    window: ScrollPosition;
    containers: ScrollPosition[];
};
type ScrollPositionsCache = Record<string, ScrollPositionsCacheEntry>;
declare module 'swup' {
    interface Swup {
        scrollTo?: (offset: number, animate?: boolean) => void;
    }
    interface VisitScroll {
        /** Whether scrolling is animated. Set by Scroll Plugin. */
        animate?: boolean;
        /** Whether the scroll position was reset after page load. Set by Scroll Plugin. */
        scrolledToContent?: boolean;
    }
    interface HookDefinitions {
        'scroll:start': undefined;
        'scroll:end': undefined;
    }
}
/**
 * Scroll Plugin
 */
export default class SwupScrollPlugin extends Plugin {
    name: string;
    requires: {
        swup: string;
    };
    scrl: any;
    defaults: Options;
    options: Options;
    cachedScrollPositions: ScrollPositionsCache;
    previousScrollRestoration?: ScrollRestoration;
    currentCacheKey?: string;
    constructor(options?: Partial<Options>);
    mount(): void;
    /**
     * Runs when the plugin is unmounted
     */
    unmount(): void;
    /**
     * Detects if a scroll should be animated, based on context
     */
    shouldAnimate(context: keyof Options['animateScroll']): boolean;
    /**
     * Get an element based on anchor
     */
    getAnchorElement: (hash?: string) => Element | null;
    /**
     * Get the offset for a scroll
     */
    getOffset: (el?: Element) => number;
    /**
     * Store scroll animation status in visit object before scrolling up
     */
    onBeforeLinkToSelf: Handler<'link:self'>;
    /**
     * Scroll to top on `scroll:top` hook
     */
    handleScrollToTop: Handler<'scroll:top'>;
    /**
     * Store scroll animation status in visit object before scrolling to anchor
     */
    onBeforeLinkToAnchor: Handler<'link:anchor'>;
    /**
     * Scroll to anchor on `scroll:anchor` hook
     */
    handleScrollToAnchor: Handler<'scroll:anchor'>;
    /**
     * Attempts to scroll to an anchor
     */
    maybeScrollToAnchor(hash?: string, animate?: boolean): boolean;
    /**
     * Prepare scrolling before visit:start hook
     */
    onBeforeVisitStart: Handler<'visit:start'>;
    /**
     * Check whether to scroll in `visit:start` hook
     */
    onVisitStart: Handler<'visit:start'>;
    /**
     * Check whether to scroll in `content:scroll` hook
     */
    handleScrollToContent: Handler<'content:scroll'>;
    /**
     * Scrolls the window
     */
    doScrollingBetweenPages: (visit: Visit) => void;
    /**
     * Reset cached scroll positions. Do not reset if:
     * - the visit is a history visit
     * - the visit is triggered by a link and shouldResetScrollPosition(link) returns false
     */
    maybeResetScrollPositions: (visit: Visit) => void;
    /**
     * Stores the scroll positions for the current URL
     */
    cacheScrollPositions(url: string): void;
    /**
     * Resets stored scroll positions for a given URL
     */
    resetScrollPositions(url: string): void;
    /**
     * Get the stored scroll positions for a given URL from the cache
     */
    getCachedScrollPositions(url: string): ScrollPositionsCacheEntry | undefined;
    /**
     * Restore the scroll positions for all matching scrollContainers
     */
    restoreScrollContainers(url: string): void;
    updateScrollTarget(): void;
}
export {};
