declare global {
    const grecaptcha: IReCaptchaInstance;
    interface Window {
        grecaptcha: IReCaptchaInstance;
    }
}
export interface IReCaptchaInstance {
    ready: (callback: () => void) => void;
    execute: (siteKey: string, options: IExecuteOptions) => Promise<string>;
    render: ((container: string | Element, parameters: IRenderParameters) => string) & ((parameters: IRenderParameters) => string);
    enterprise: Omit<IReCaptchaInstance, "enterprise">;
}
export declare interface IExecuteOptions {
    action?: string;
}
export declare interface IRenderParameters {
    sitekey: string;
    theme?: "light" | "dark";
    badge?: "bottomright" | "bottomleft" | "inline";
    size?: "invisible" | "compact" | "normal";
    tabindex?: number;
}
