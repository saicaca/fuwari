import { type Handler } from 'swup';
import Plugin from '@swup/plugin';
import { type UpdateCallback } from './morph.js';
type Options = {
    containers: string[];
    updateCallbacks: UpdateCallback[];
};
export default class SwupMorphPlugin extends Plugin {
    name: string;
    requires: {
        swup: string;
    };
    defaults: Options;
    options: Options;
    constructor(options?: Partial<Options>);
    mount(): void;
    protected validateContainers: Handler<'content:replace'>;
    protected morphContainers: Handler<'content:replace'>;
    protected getContainers(oldDoc: Document, newDoc: Document): {
        selector: string;
        outgoing: Element | null;
        incoming: Element | null;
    }[];
    protected getContainerSelectors(): string[];
    protected uniq<T>(array: T[]): T[];
}
export {};
