import Plugin from '@swup/plugin';
import type { Swup, HookName, HookArguments } from 'swup';
declare global {
    interface Window {
        swup?: Swup;
    }
}
type Options = {
    globalInstance: boolean;
};
export default class SwupDebugPlugin extends Plugin {
    name: string;
    requires: {
        swup: string;
    };
    defaults: Options;
    options: Options;
    originalSwupLog?: Swup['log'];
    originalSwupHookCall?: Swup['hooks']['call'];
    originalSwupHookCallSync?: Swup['hooks']['callSync'];
    constructor(options?: {});
    mount(): void;
    unmount(): void;
    setLogImplementation(): void;
    restoreLogImplementation(): void;
    proxyHooksThroughConsole(): void;
    restoreHooksImplementation(): void;
    setGlobalInstance(): void;
    unsetGlobalInstance(): void;
    checkDocumentTitle(): void;
    checkContainers(): void;
    checkAnimationSelector(): void;
    logHook<T extends HookName>(hook: T, args: HookArguments<T>): void;
    callHook: Swup['hooks']['call'];
    callHookSync: Swup['hooks']['callSync'];
    log(str: string, object: any): void;
    warn(str: string): void;
    error(str: string): void;
}
export {};
