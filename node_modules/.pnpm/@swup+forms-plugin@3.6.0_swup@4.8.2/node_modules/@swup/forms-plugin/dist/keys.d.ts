/**
 * Track currently pressed keys
 */
export declare function trackKeys(keys: string[]): {
    watch: () => void;
    unwatch: () => void;
    readonly pressed: boolean;
};
