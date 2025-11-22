import Plugin from '@swup/plugin';
import type { DelegateEvent, DelegateEventHandler, DelegateEventUnsubscribe, PageData, HookDefaultHandler } from 'swup';
import { Queue } from './queue.js';
import { Observer } from './observer.js';
declare module 'swup' {
    interface Swup {
        /**
         * Preload links by passing in either:
         * - a URL or an array of URLs
         * - a link element or an array of link elements
         */
        preload?: SwupPreloadPlugin['preload'];
        /**
         * Preload any links on the current page manually marked for preloading.
         */
        preloadLinks?: () => void;
    }
    interface HookDefinitions {
        'link:hover': {
            el: HTMLAnchorElement | SVGAElement;
            event: DelegateEvent;
        };
        'page:preload': {
            url: string;
            page?: PageData;
        };
    }
    interface HookReturnValues {
        'page:preload': Promise<PageData>;
    }
}
export type AnchorElement = HTMLAnchorElement | SVGAElement;
type VisibleLinkPreloadOptions = {
    /** Enable preloading of links entering the viewport */
    enabled: boolean;
    /** How much area of a link must be visible to preload it: 0 to 1.0 */
    threshold: number;
    /** How long a link must be visible to preload it, in milliseconds */
    delay: number;
    /** Containers to look for links in */
    containers: string[];
    /** Callback for opting out selected elements from preloading */
    ignore: (el: AnchorElement) => boolean;
};
export type PluginOptions = {
    /** The *concurrency limit* for simultaneous requests when preloading. */
    throttle: number;
    /** Preload the initial page to allow instant back-button navigation. */
    preloadInitialPage: boolean;
    /** Preload links when they are hovered, touched or focused. */
    preloadHoveredLinks: boolean;
    /** Preload links when they enter the viewport. */
    preloadVisibleLinks: VisibleLinkPreloadOptions;
};
export type PluginInitOptions = Omit<PluginOptions, 'preloadVisibleLinks'> & {
    /** Preload links when they enter the viewport. */
    preloadVisibleLinks: boolean | Partial<VisibleLinkPreloadOptions>;
};
type PreloadOptions = {
    /** Priority of this preload: `true` for high, `false` for low. */
    priority?: boolean;
};
export default class SwupPreloadPlugin extends Plugin {
    name: string;
    requires: {
        swup: string;
    };
    defaults: PluginOptions;
    options: PluginOptions;
    protected queue: Queue;
    protected preloadObserver?: Observer;
    protected preloadPromises: Map<string, Promise<void | PageData>>;
    protected mouseEnterDelegate?: DelegateEventUnsubscribe;
    protected touchStartDelegate?: DelegateEventUnsubscribe;
    protected focusDelegate?: DelegateEventUnsubscribe;
    constructor(options?: Partial<PluginInitOptions>);
    mount(): void;
    unmount(): void;
    /**
     * Before core page load: return existing preload promise if available.
     */
    protected onPageLoad: HookDefaultHandler<'page:load'>;
    /**
     * When hovering over a link: preload the linked page with high priority.
     */
    protected onMouseEnter: DelegateEventHandler;
    /**
     * When touching a link: preload the linked page with high priority.
     */
    protected onTouchStart: DelegateEventHandler;
    /**
     * When focussing a link: preload the linked page with high priority.
     */
    protected onFocus: DelegateEventHandler;
    /**
     * Preload links.
     *
     * The method accepts either:
     * - a URL or an array of URLs
     * - a link element or an array of link elements
     *
     * It returns either:
     * - a Promise resolving to the page data, if requesting a single page
     * - a Promise resolving to an array of page data, if requesting multiple pages
     */
    preload(url: string, options?: PreloadOptions): Promise<PageData | void>;
    preload(urls: string[], options?: PreloadOptions): Promise<(PageData | void)[]>;
    preload(el: AnchorElement, options?: PreloadOptions): Promise<PageData | void>;
    preload(els: AnchorElement[], options?: PreloadOptions): Promise<(PageData | void)[]>;
    preload(input: string | AnchorElement, options?: PreloadOptions): Promise<PageData | void>;
    /**
     * Preload any links on the current page manually marked for preloading.
     *
     * Links are marked for preloading by:
     * - adding a `data-swup-preload` attribute to the link itself
     * - adding a `data-swup-preload-all` attribute to a container of multiple links
     */
    preloadLinks(): void;
    /**
     * Register handlers for preloading on attention:
     *  - mouseenter
     *  - touchstart
     *  - focus
     */
    protected preloadLinksOnAttention(): void;
    /**
     * Start observing links in the viewport for preloading.
     * Calling this repeatedly re-checks for links after DOM updates.
     */
    protected preloadVisibleLinks(): void;
    /**
     * Stop observing links in the viewport for preloading.
     */
    protected stopPreloadingVisibleLinks(): void;
    /**
     * Check whether a URL and/or element should trigger a preload.
     */
    protected shouldPreload(location: string, { el }?: {
        el?: AnchorElement;
    }): boolean;
    /**
     * Perform the actual preload fetch and trigger the preload hook.
     */
    protected performPreload(href: string): Promise<PageData>;
}
export {};
