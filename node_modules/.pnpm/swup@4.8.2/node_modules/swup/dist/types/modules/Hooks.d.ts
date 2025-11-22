import type { DelegateEvent } from 'delegate-it';
import type Swup from '../Swup.js';
import { Visit } from './Visit.js';
import type { FetchOptions, PageData } from './fetchPage.js';
export interface HookDefinitions {
    'animation:out:start': undefined;
    'animation:out:await': {
        skip: boolean;
    };
    'animation:out:end': undefined;
    'animation:in:start': undefined;
    'animation:in:await': {
        skip: boolean;
    };
    'animation:in:end': undefined;
    'animation:skip': undefined;
    'cache:clear': undefined;
    'cache:set': {
        page: PageData;
    };
    'content:replace': {
        page: PageData;
    };
    'content:scroll': undefined;
    'enable': undefined;
    'disable': undefined;
    'fetch:request': {
        url: string;
        options: FetchOptions;
    };
    'fetch:error': {
        url: string;
        status: number;
        response: Response;
    };
    'fetch:timeout': {
        url: string;
    };
    'history:popstate': {
        event: PopStateEvent;
    };
    'link:click': {
        el: HTMLAnchorElement;
        event: DelegateEvent<MouseEvent>;
    };
    'link:self': undefined;
    'link:anchor': {
        hash: string;
    };
    'link:newtab': {
        href: string;
    };
    'page:load': {
        page?: PageData;
        cache?: boolean;
        options: FetchOptions;
    };
    'page:view': {
        url: string;
        title: string;
    };
    'scroll:top': {
        options: ScrollIntoViewOptions;
    };
    'scroll:anchor': {
        hash: string;
        options: ScrollIntoViewOptions;
    };
    'visit:start': undefined;
    'visit:transition': undefined;
    'visit:abort': undefined;
    'visit:end': undefined;
}
export interface HookReturnValues {
    'content:scroll': Promise<boolean> | boolean;
    'fetch:request': Promise<Response>;
    'page:load': Promise<PageData>;
    'scroll:top': boolean;
    'scroll:anchor': boolean;
}
export type HookArguments<T extends HookName> = HookDefinitions[T];
export type HookName = keyof HookDefinitions;
export type HookNameWithModifier = `${HookName}.${HookModifier}`;
type HookModifier = 'once' | 'before' | 'replace';
/** A generic hook handler. */
export type HookHandler<T extends HookName> = (
/** Context about the current visit. */
visit: Visit, 
/** Local arguments passed into the handler. */
args: HookArguments<T>) => Promise<unknown> | unknown;
/** A default hook handler with an expected return type. */
export type HookDefaultHandler<T extends HookName> = (
/** Context about the current visit. */
visit: Visit, 
/** Local arguments passed into the handler. */
args: HookArguments<T>, 
/** Default handler to be executed. Available if replacing an internal hook handler. */
defaultHandler?: HookDefaultHandler<T>) => T extends keyof HookReturnValues ? HookReturnValues[T] : Promise<unknown> | unknown;
export type Handlers = {
    [K in HookName]: HookHandler<K>[];
};
export type HookInitOptions = {
    [K in HookName as K | `${K}.${HookModifier}`]: HookHandler<K>;
} & {
    [K in HookName as K | `${K}.${HookModifier}.${HookModifier}`]: HookHandler<K>;
};
/** Unregister a previously registered hook handler. */
export type HookUnregister = () => void;
/** Define when and how a hook handler is executed. */
export type HookOptions = {
    /** Execute the hook once, then remove the handler */
    once?: boolean;
    /** Execute the hook before the internal default handler */
    before?: boolean;
    /** Set a priority for when to execute this hook. Lower numbers execute first. Default: `0` */
    priority?: number;
    /** Replace the internal default handler with this hook handler */
    replace?: boolean;
};
export type HookRegistration<T extends HookName, H extends HookHandler<T> | HookDefaultHandler<T> = HookHandler<T>> = {
    id: number;
    hook: T;
    handler: H;
    defaultHandler?: HookDefaultHandler<T>;
} & HookOptions;
type HookEventDetail = {
    hook: HookName;
    args: unknown;
    visit: Visit;
};
export type HookEvent = CustomEvent<HookEventDetail>;
type HookLedger<T extends HookName> = Map<HookHandler<T>, HookRegistration<T>>;
interface HookRegistry extends Map<HookName, HookLedger<HookName>> {
    get<K extends HookName>(key: K): HookLedger<K> | undefined;
    set<K extends HookName>(key: K, value: HookLedger<K>): this;
}
/**
 * Hook registry.
 *
 * Create, trigger and handle hooks.
 *
 */
export declare class Hooks {
    /** Swup instance this registry belongs to */
    protected swup: Swup;
    /** Map of all registered hook handlers. */
    protected registry: HookRegistry;
    protected readonly hooks: HookName[];
    constructor(swup: Swup);
    /**
     * Create ledgers for all core hooks.
     */
    protected init(): void;
    /**
     * Create a new hook type.
     */
    create(hook: string): void;
    /**
     * Check if a hook type exists.
     */
    exists(hook: HookName): boolean;
    /**
     * Get the ledger with all registrations for a hook.
     */
    protected get<T extends HookName>(hook: T): HookLedger<T> | undefined;
    /**
     * Remove all handlers of all hooks.
     */
    clear(): void;
    /**
     * Register a new hook handler.
     * @param hook Name of the hook to listen for
     * @param handler The handler function to execute
     * @param options Object to specify how and when the handler is executed
     *                Available options:
     *                - `once`: Only execute the handler once
     *                - `before`: Execute the handler before the default handler
     *                - `priority`: Specify the order in which the handlers are executed
     *                - `replace`: Replace the default handler with this handler
     * @returns A function to unregister the handler
     */
    on<T extends HookName, O extends HookOptions>(hook: T, handler: HookDefaultHandler<T>, options: O & {
        replace: true;
    }): HookUnregister;
    on<T extends HookName, O extends HookOptions>(hook: T, handler: HookHandler<T>, options: O): HookUnregister;
    on<T extends HookName>(hook: T, handler: HookHandler<T>): HookUnregister;
    /**
     * Register a new hook handler to run before the default handler.
     * Shortcut for `hooks.on(hook, handler, { before: true })`.
     * @param hook Name of the hook to listen for
     * @param handler The handler function to execute
     * @param options Any other event options (see `hooks.on()` for details)
     * @returns A function to unregister the handler
     * @see on
     */
    before<T extends HookName>(hook: T, handler: HookHandler<T>, options: HookOptions): HookUnregister;
    before<T extends HookName>(hook: T, handler: HookHandler<T>): HookUnregister;
    /**
     * Register a new hook handler to replace the default handler.
     * Shortcut for `hooks.on(hook, handler, { replace: true })`.
     * @param hook Name of the hook to listen for
     * @param handler The handler function to execute instead of the default handler
     * @param options Any other event options (see `hooks.on()` for details)
     * @returns A function to unregister the handler
     * @see on
     */
    replace<T extends HookName>(hook: T, handler: HookDefaultHandler<T>, options: HookOptions): HookUnregister;
    replace<T extends HookName>(hook: T, handler: HookDefaultHandler<T>): HookUnregister;
    /**
     * Register a new hook handler to run once.
     * Shortcut for `hooks.on(hook, handler, { once: true })`.
     * @param hook Name of the hook to listen for
     * @param handler The handler function to execute
     * @param options Any other event options (see `hooks.on()` for details)
     * @see on
     */
    once<T extends HookName>(hook: T, handler: HookHandler<T>, options: HookOptions): HookUnregister;
    once<T extends HookName>(hook: T, handler: HookHandler<T>): HookUnregister;
    /**
     * Unregister a hook handler.
     * @param hook Name of the hook the handler is registered for
     * @param handler The handler function that was registered.
     *                If omitted, all handlers for the hook will be removed.
     */
    off<T extends HookName>(hook: T, handler: HookHandler<T> | HookDefaultHandler<T>): void;
    off<T extends HookName>(hook: T): void;
    /**
     * Trigger a hook asynchronously, executing its default handler and all registered handlers.
     * Will execute all handlers in order and `await` any `Promise`s they return.
     * @param hook Name of the hook to trigger
     * @param visit The visit object this hook belongs to
     * @param args Arguments to pass to the handler
     * @param defaultHandler A default implementation of this hook to execute
     * @returns The resolved return value of the executed default handler
     */
    call<T extends HookName>(hook: T, visit: Visit | undefined, args: HookArguments<T>, defaultHandler?: HookDefaultHandler<T>): Promise<Awaited<ReturnType<HookDefaultHandler<T>>>>;
    call<T extends HookName>(hook: T, args: HookArguments<T>, defaultHandler?: HookDefaultHandler<T>): Promise<Awaited<ReturnType<HookDefaultHandler<T>>>>;
    /**
     * Trigger a hook synchronously, executing its default handler and all registered handlers.
     * Will execute all handlers in order, but will **not** `await` any `Promise`s they return.
     * @param hook Name of the hook to trigger
     * @param visit The visit object this hook belongs to
     * @param args Arguments to pass to the handler
     * @param defaultHandler A default implementation of this hook to execute
     * @returns The (possibly unresolved) return value of the executed default handler
     */
    callSync<T extends HookName>(hook: T, visit: Visit | undefined, args: HookArguments<T>, defaultHandler?: HookDefaultHandler<T>): ReturnType<HookDefaultHandler<T>>;
    callSync<T extends HookName>(hook: T, args: HookArguments<T>, defaultHandler?: HookDefaultHandler<T>): ReturnType<HookDefaultHandler<T>>;
    /**
     * Parse the call arguments for call() and callSync() to allow legacy argument order.
     */
    protected parseCallArgs<T extends HookName>(hook: T, arg1: Visit | HookArguments<T> | undefined, arg2: HookArguments<T> | HookDefaultHandler<T>, arg3?: HookDefaultHandler<T>): [Visit | undefined, HookArguments<T>, HookDefaultHandler<T> | undefined];
    /**
     * Execute the handlers for a hook, in order, as `Promise`s that will be `await`ed.
     * @param registrations The registrations (handler + options) to execute
     * @param args Arguments to pass to the handler
     */
    protected run<T extends HookName>(registrations: HookRegistration<T, HookDefaultHandler<T>>[], visit: Visit | undefined, args: HookArguments<T>, rethrow: true): Promise<Awaited<ReturnType<HookDefaultHandler<T>>>[]>;
    protected run<T extends HookName>(registrations: HookRegistration<T>[], visit: Visit | undefined, args: HookArguments<T>): Promise<unknown[]>;
    /**
     * Execute the handlers for a hook, in order, without `await`ing any returned `Promise`s.
     * @param registrations The registrations (handler + options) to execute
     * @param args Arguments to pass to the handler
     */
    protected runSync<T extends HookName>(registrations: HookRegistration<T, HookDefaultHandler<T>>[], visit: Visit | undefined, args: HookArguments<T>, rethrow: true): ReturnType<HookDefaultHandler<T>>[];
    protected runSync<T extends HookName>(registrations: HookRegistration<T>[], visit: Visit | undefined, args: HookArguments<T>): unknown[];
    /**
     * Get all registered handlers for a hook, sorted by priority and registration order.
     * @param hook Name of the hook
     * @param defaultHandler The optional default handler of this hook
     * @returns An object with the handlers sorted into `before` and `after` arrays,
     *          as well as a flag indicating if the original handler was replaced
     */
    protected getHandlers<T extends HookName>(hook: T, defaultHandler?: HookDefaultHandler<T>): {
        found: boolean;
        before: HookRegistration<T, HookHandler<T>>[];
        handler: HookRegistration<T, HookDefaultHandler<T>>[];
        after: HookRegistration<T, HookHandler<T>>[];
        replaced: boolean;
    };
    /**
     * Sort two hook registrations by priority and registration order.
     * @param a The registration object to compare
     * @param b The other registration object to compare with
     * @returns The sort direction
     */
    protected sortRegistrations<T extends HookName>(a: HookRegistration<T>, b: HookRegistration<T>): number;
    /**
     * Dispatch a custom event on the `document` for a hook. Prefixed with `swup:`
     * @param hook Name of the hook.
     */
    protected dispatchDomEvent<T extends HookName>(hook: T, visit: Visit | undefined, args?: HookArguments<T>): void;
    /**
     * Parse a hook name into the name and any modifiers.
     * @param hook Name of the hook.
     */
    parseName(hook: HookName | HookNameWithModifier): [HookName, Partial<HookOptions>];
}
export {};
//# sourceMappingURL=Hooks.d.ts.map