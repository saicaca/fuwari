type RedirectTemplate = {
    from?: string;
    absoluteLocation: string | URL;
    status: number;
    relativeLocation: string;
};
export declare function redirectTemplate({ status, absoluteLocation, relativeLocation, from, }: RedirectTemplate): string;
export {};
