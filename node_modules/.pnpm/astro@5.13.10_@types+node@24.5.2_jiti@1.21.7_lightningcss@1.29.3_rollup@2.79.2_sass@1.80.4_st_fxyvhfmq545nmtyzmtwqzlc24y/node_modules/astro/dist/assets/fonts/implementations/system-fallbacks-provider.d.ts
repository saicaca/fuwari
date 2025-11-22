import type { SystemFallbacksProvider } from '../definitions.js';
export declare const DEFAULT_FALLBACKS: {
    serif: "Times New Roman"[];
    'sans-serif': "Arial"[];
    monospace: "Courier New"[];
    'system-ui': ("Arial" | "BlinkMacSystemFont" | "Segoe UI" | "Roboto" | "Helvetica Neue")[];
    'ui-serif': "Times New Roman"[];
    'ui-sans-serif': "Arial"[];
    'ui-monospace': "Courier New"[];
};
export declare function createSystemFallbacksProvider(): SystemFallbacksProvider;
