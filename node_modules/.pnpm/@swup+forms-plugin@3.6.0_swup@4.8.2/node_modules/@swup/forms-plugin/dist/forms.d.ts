export type FormMethod = 'GET' | 'POST';
export type FormInfo = {
    origin: string;
    action: string;
    href: string;
    url: string;
    hash: string;
    method: FormMethod;
    target: string | null;
    data: FormData;
    body: URLSearchParams | FormData | undefined;
    encoding: string;
};
/**
 * Get information about where and how a form will submit
 */
export declare function getFormInfo(form: HTMLFormElement, submitter?: HTMLElement | null, { stripEmptyParams }?: {
    stripEmptyParams?: boolean;
}): FormInfo;
/**
* Get a form attribute either from the form, or the submitter element if present
*/
export declare function getFormAttr(attr: 'method', form: HTMLFormElement, submitter?: HTMLElement | null): FormMethod;
export declare function getFormAttr(attr: 'action', form: HTMLFormElement, submitter?: HTMLElement | null): string;
export declare function getFormAttr(attr: 'enctype', form: HTMLFormElement, submitter?: HTMLElement | null): string;
export declare function getFormAttr(attr: string, form: HTMLFormElement, submitter: HTMLElement | null, defaultValue: string): string;
export declare function getFormAttr(attr: string, form: HTMLFormElement, submitter?: HTMLElement | null, defaultValue?: string): string | null;
/**
 * Strip empty params from a FormData object, returning a new FormData object
 * @see https://stackoverflow.com/a/64029534/586823
 */
export declare function stripEmptyFormParams(data: FormData): FormData;
/**
 * Appends query parameters to a URL
 */
export declare function appendQueryParams(url: string, params: FormData): string;
/**
 * Force a form to open in a new tab by setting the target attribute to _blank
 * @returns A function to restore the original target attribute
 */
export declare function forceFormToOpenInNewTab(form: HTMLFormElement): () => void;
