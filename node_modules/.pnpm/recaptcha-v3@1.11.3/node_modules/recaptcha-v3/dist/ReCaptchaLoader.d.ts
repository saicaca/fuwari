import { ReCaptchaInstance } from "./ReCaptchaInstance";
import type { IRenderParameters } from "./grecaptcha/grecaptcha";
declare class ReCaptchaLoader {
    private static loadingState;
    private static instance;
    private static instanceSiteKey;
    private static successfulLoadingConsumers;
    private static errorLoadingRunnable;
    private static readonly SCRIPT_LOAD_DELAY;
    static load(siteKey: string, options?: IReCaptchaLoaderOptions): Promise<ReCaptchaInstance>;
    static getInstance(): ReCaptchaInstance;
    private static setLoadingState;
    private static getLoadingState;
    private loadScript;
    private buildQueryString;
    private waitForScriptToLoad;
    private doExplicitRender;
}
export interface IReCaptchaLoaderOptions {
    useRecaptchaNet?: boolean;
    useEnterprise?: boolean;
    autoHideBadge?: boolean;
    renderParameters?: {
        [key: string]: string;
    };
    explicitRenderParameters?: IReCaptchaExplicitRenderParameters;
    customUrl?: string;
}
export type IReCaptchaExplicitRenderParameters = {
    container?: string | Element;
} & Omit<IRenderParameters, "sitekey">;
export declare const load: typeof ReCaptchaLoader.load;
export declare const getInstance: typeof ReCaptchaLoader.getInstance;
export {};
