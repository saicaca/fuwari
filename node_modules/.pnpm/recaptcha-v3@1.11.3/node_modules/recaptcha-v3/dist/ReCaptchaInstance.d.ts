import type { IReCaptchaInstance } from "./grecaptcha/grecaptcha";
export declare class ReCaptchaInstance {
    private readonly siteKey;
    private readonly recaptchaID;
    private readonly recaptcha;
    private styleContainer;
    constructor(siteKey: string, recaptchaID: string, recaptcha: IReCaptchaInstance);
    execute(action?: string): Promise<string>;
    getSiteKey(): string;
    hideBadge(): void;
    showBadge(): void;
}
