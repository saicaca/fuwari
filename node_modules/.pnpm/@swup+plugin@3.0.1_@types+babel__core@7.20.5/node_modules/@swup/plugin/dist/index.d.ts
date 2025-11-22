import type Swup from 'swup';
import type { Plugin, HookName, HookOptions, HookUnregister, Handler } from 'swup';
export default abstract class SwupPlugin implements Plugin {
    /** Name of the plugin */
    abstract name: string;
    /** Identify as a swup plugin */
    isSwupPlugin: true;
    swup: Swup;
    /** Version of this plugin. Currently not in use, defined here for backward compatiblity. */
    version?: string;
    /** Version requirements of this plugin. Example: `{ swup: '>=4' }` */
    requires?: Record<string, string | string[]>;
    private handlersToUnregister;
    /** Run on mount */
    mount(): void;
    /** Run on unmount */
    unmount(): void;
    _beforeMount(): void;
    _afterUnmount(): void;
    _checkRequirements(): boolean;
    /**
     * Register a new hook handler.
     *
     * On plugin unmount, the handler will automatically be unregistered.
     * The handler function is lexically bound to the plugin instance for convenience.
     * @see swup.hooks.on
     */
    protected on<T extends HookName>(hook: T, handler: Handler<T>, options?: HookOptions): HookUnregister;
    protected once<T extends HookName>(hook: T, handler: Handler<T>, options?: HookOptions): HookUnregister;
    protected before<T extends HookName>(hook: T, handler: Handler<T>, options?: HookOptions): HookUnregister;
    protected replace<T extends HookName>(hook: T, handler: Handler<T>, options?: HookOptions): HookUnregister;
    protected off<T extends HookName>(hook: T, handler?: Handler<T>): void;
}
