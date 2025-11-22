import Plugin from '@swup/plugin';
export type Options = {
    head: boolean;
    body: boolean;
    optin: boolean;
};
export default class SwupScriptsPlugin extends Plugin {
    name: string;
    requires: {
        swup: string;
    };
    defaults: Options;
    options: Options;
    constructor(options?: Partial<Options>);
    mount(): void;
    runScripts(): void;
    runScript(script: HTMLScriptElement): HTMLScriptElement;
    getScope({ head, body }: Pick<Options, 'head' | 'body'>): Document | HTMLHeadElement | null;
}
//# sourceMappingURL=index.d.ts.map