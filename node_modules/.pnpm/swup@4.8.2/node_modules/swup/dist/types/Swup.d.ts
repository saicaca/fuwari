import { type DelegateEvent } from 'delegate-it';
import { Location } from './helpers.js';
import { type DelegateEventUnsubscribe } from './helpers/delegateEvent.js';
import { Cache } from './modules/Cache.js';
import { Classes } from './modules/Classes.js';
import { type Visit, createVisit } from './modules/Visit.js';
import { Hooks, type HookInitOptions } from './modules/Hooks.js';
import { awaitAnimations } from './modules/awaitAnimations.js';
import { navigate, performNavigation, type NavigationToSelfAction } from './modules/navigate.js';
import { fetchPage } from './modules/fetchPage.js';
import { unuse, findPlugin, type Plugin } from './modules/plugins.js';
import { isSameResolvedUrl, resolveUrl } from './modules/resolveUrl.js';
/** Options for customizing swup's behavior. */
export type Options = {
    /** Whether history visits are animated. Default: `false` */
    animateHistoryBrowsing: boolean;
    /** Selector for detecting animation timing. Default: `[class*="transition-"]` */
    animationSelector: string | false;
    /** Elements on which to add animation classes. Default: `html` element */
    animationScope: 'html' | 'containers';
    /** Enable in-memory page cache. Default: `true` */
    cache: boolean;
    /** Content containers to be replaced on page visits. Default: `['#swup']` */
    containers: string[];
    /** Callback for ignoring visits. Receives the element and event that triggered the visit. */
    ignoreVisit: (url: string, { el, event }: {
        el?: Element;
        event?: Event;
    }) => boolean;
    /** Selector for links that trigger visits. Default: `'a[href]'` */
    linkSelector: string;
    /** How swup handles links to the same page. Default: `scroll` */
    linkToSelf: NavigationToSelfAction;
    /** Enable native animations using the View Transitions API. */
    native: boolean;
    /** Hook handlers to register. */
    hooks: Partial<HookInitOptions>;
    /** Plugins to register on startup. */
    plugins: Plugin[];
    /** Custom headers sent along with fetch requests. */
    requestHeaders: Record<string, string>;
    /** Rewrite URLs before loading them. */
    resolveUrl: (url: string) => string;
    /** Callback for telling swup to ignore certain popstate events.  */
    skipPopStateHandling: (event: PopStateEvent) => boolean;
    /** Request timeout in milliseconds. */
    timeout: number;
};
/** Swup page transition library. */
export default class Swup {
    /** Library version */
    readonly version: string;
    /** Options passed into the instance */
    options: Options;
    /** Default options before merging user options */
    readonly defaults: Options;
    /** Registered plugin instances */
    plugins: Plugin[];
    /** Data about the current visit */
    visit: Visit;
    /** Cache instance */
    readonly cache: Cache;
    /** Hook registry */
    readonly hooks: Hooks;
    /** Animation class manager */
    readonly classes: Classes;
    /** Location of the currently visible page */
    location: Location;
    /** URL of the currently visible page @deprecated Use swup.location.url instead */
    get currentPageUrl(): string;
    /** Index of the current history entry */
    protected currentHistoryIndex: number;
    /** Delegated event subscription handle */
    protected clickDelegate?: DelegateEventUnsubscribe;
    /** Navigation status */
    protected navigating: boolean;
    /** Run anytime a visit ends */
    protected onVisitEnd?: () => Promise<unknown>;
    /** Install a plugin */
    use: (this: Swup, plugin: unknown) => Plugin[] | undefined;
    /** Uninstall a plugin */
    unuse: typeof unuse;
    /** Find a plugin by name or instance */
    findPlugin: typeof findPlugin;
    /** Log a message. Has no effect unless debug plugin is installed */
    log: (message: string, context?: unknown) => void;
    /** Navigate to a new URL */
    navigate: typeof navigate;
    /** Actually perform a navigation */
    protected performNavigation: typeof performNavigation;
    /** Create a new context for this visit */
    protected createVisit: typeof createVisit;
    /** Register a delegated event listener */
    delegateEvent: <Selector extends string, TElement extends Element = import("typed-query-selector/parser.js").ParseSelector<Selector, HTMLElement>, TEvent extends import("delegate-it").EventType = keyof GlobalEventHandlersEventMap>(selector: Selector, type: TEvent, callback: import("delegate-it").DelegateEventHandler<GlobalEventHandlersEventMap[TEvent], TElement>, options?: import("delegate-it").DelegateOptions) => DelegateEventUnsubscribe;
    /** Fetch a page from the server */
    fetchPage: typeof fetchPage;
    /** Resolve when animations on the page finish */
    awaitAnimations: typeof awaitAnimations;
    protected renderPage: (this: Swup, visit: Visit, page: import("./modules/fetchPage.js").PageData) => Promise<void>;
    /** Replace the content after page load */
    replaceContent: (this: Swup, visit: Visit) => boolean;
    protected animatePageIn: (this: Swup, visit: Visit) => Promise<void>;
    protected animatePageOut: (this: Swup, visit: Visit) => Promise<void>;
    protected scrollToContent: (this: Swup, visit: Visit) => boolean;
    /** Find the anchor element for a given hash */
    getAnchorElement: (hash?: string) => Element | null;
    /** Get the current page URL */
    getCurrentUrl: ({ hash }?: {
        hash?: boolean;
    }) => string;
    /** Resolve a URL to its final location */
    resolveUrl: typeof resolveUrl;
    /** Check if two URLs resolve to the same location */
    protected isSameResolvedUrl: typeof isSameResolvedUrl;
    constructor(options?: Partial<Options>);
    /** Enable this instance, adding listeners and classnames. */
    enable(): Promise<void>;
    /** Disable this instance, removing listeners and classnames. */
    destroy(): Promise<void>;
    /** Determine if a visit should be ignored by swup, based on URL or trigger element. */
    shouldIgnoreVisit(href: string, { el, event }?: {
        el?: Element;
        event?: Event;
    }): boolean;
    protected handleLinkClick(event: DelegateEvent<MouseEvent>): void;
    protected handlePopState(event: PopStateEvent): void;
    /** Determine whether an element will open a new tab when clicking/activating. */
    protected triggerWillOpenNewWindow(triggerEl: Element): boolean;
}
//# sourceMappingURL=Swup.d.ts.map