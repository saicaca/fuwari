import Plugin from '@swup/plugin';
import type { DelegateEvent, DelegateEventUnsubscribe, Handler } from 'swup';
import { trackKeys } from './keys.js';
declare module 'swup' {
    interface HookDefinitions {
        'form:submit': {
            el: HTMLFormElement;
            event: DelegatedSubmitEvent;
        };
        'form:submit:newtab': {
            el: HTMLFormElement;
            event: DelegatedSubmitEvent;
        };
    }
}
type DelegatedSubmitEvent = DelegateEvent<SubmitEvent, HTMLFormElement>;
type Options = {
    formSelector: string;
    inlineFormSelector: string;
    stripEmptyParams: boolean;
};
export default class SwupFormsPlugin extends Plugin {
    name: string;
    requires: {
        swup: string;
    };
    defaults: Options;
    options: Options;
    specialKeys: ReturnType<typeof trackKeys>;
    formSubmitDelegate?: DelegateEventUnsubscribe;
    constructor(options?: Partial<Options>);
    mount(): void;
    unmount(): void;
    /**
     * Handles form 'submit' events during the capture phase
     */
    beforeFormSubmit(event: DelegatedSubmitEvent): void;
    /**
     * Submits a form through swup
     */
    submitForm(event: DelegatedSubmitEvent): void;
    /**
     * Handles visits triggered by forms matching [data-swup-inline-form]
     */
    prepareInlineForms: Handler<'visit:start'>;
}
export {};
