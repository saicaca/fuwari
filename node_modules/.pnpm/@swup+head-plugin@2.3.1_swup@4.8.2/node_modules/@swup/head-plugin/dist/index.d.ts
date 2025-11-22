import { Handler } from 'swup';
import Plugin from '@swup/plugin';
type Options = {
    /** Whether to keep orphaned `link`, `style` and `script` tags from the old page. Default: `false` */
    persistAssets: boolean;
    /** Tags that will be persisted when a new page is loaded. Boolean, selector or predicate function. Default: `false` */
    persistTags: boolean | string | ((el: Element) => boolean);
    /** Delay the transition to the new page until all newly added assets have finished loading. Default: `false` */
    awaitAssets: boolean;
    /** Additional attributes of the head element to update. Default: ['lang', 'dir']. */
    attributes: (string | RegExp)[];
    /** How long to wait for assets before continuing anyway. Only applies if `awaitAssets` is enabled. Default: `3000` */
    timeout: number;
};
export default class SwupHeadPlugin extends Plugin {
    name: string;
    requires: {
        swup: string;
    };
    defaults: Options;
    options: Options;
    constructor(options?: Partial<Options>);
    mount(): void;
    updateHead: Handler<'content:replace'>;
    isPersistentTag(el: Element): boolean;
}
export {};
