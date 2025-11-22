declare global {
    const __DEV__: boolean;
    const MICROBUNDLE_TARGET: string;
    interface Window {
        process?: any;
    }
}
/**
 * Export the __DEV__ variable. This will become false in production builds from consumers
 */
export declare const __TEST__: boolean;
export declare const __DEV__: boolean;
//# sourceMappingURL=env.d.ts.map