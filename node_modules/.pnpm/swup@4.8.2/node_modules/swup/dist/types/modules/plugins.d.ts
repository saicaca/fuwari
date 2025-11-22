import type Swup from '../Swup.js';
export type Plugin = {
    /** Identify as a swup plugin */
    isSwupPlugin: true;
    /** Name of this plugin */
    name: string;
    /** Version of this plugin. Currently not in use, defined here for backward compatiblity. */
    version?: string;
    /** The swup instance that mounted this plugin */
    swup?: Swup;
    /** Version requirements of this plugin. Example: `{ swup: '>=4' }` */
    requires?: Record<string, string | string[]>;
    /** Run on mount */
    mount: () => void;
    /** Run on unmount */
    unmount: () => void;
    _beforeMount?: () => void;
    _afterUnmount?: () => void;
    _checkRequirements?: () => boolean;
};
/** Install a plugin. */
export declare const use: (this: Swup, plugin: unknown) => Plugin[] | undefined;
/** Uninstall a plugin. */
export declare function unuse(this: Swup, pluginOrName: Plugin | string): Plugin[] | undefined;
/** Find a plugin by name or reference. */
export declare function findPlugin(this: Swup, pluginOrName: Plugin | string): Plugin | undefined;
//# sourceMappingURL=plugins.d.ts.map