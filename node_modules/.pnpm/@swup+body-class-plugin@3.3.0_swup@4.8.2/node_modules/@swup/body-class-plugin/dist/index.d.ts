import { Handler } from 'swup';
import Plugin from '@swup/plugin';
type Options = {
    /** If set, only classes beginning with this string will be added/removed. */
    prefix: string;
    /** Additional body attributes to update, besides the classname. */
    attributes: (string | RegExp)[];
};
export default class SwupBodyClassPlugin extends Plugin {
    name: string;
    requires: {
        swup: string;
    };
    defaults: Options;
    options: Options;
    constructor(options?: Partial<Options>);
    mount(): void;
    protected update: Handler<'content:replace'>;
}
export {};
