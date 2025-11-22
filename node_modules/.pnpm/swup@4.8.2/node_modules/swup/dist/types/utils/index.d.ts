/** Find an element by selector. */
export declare const query: (selector: string, context?: Document | Element) => HTMLElement | null;
/** Find a set of elements by selector. */
export declare const queryAll: (selector: string, context?: Document | Element) => HTMLElement[];
/** Return a Promise that resolves after the next event loop. */
export declare const nextTick: () => Promise<void>;
/** Check if an object is a Promise or a Thenable */
export declare function isPromise<T>(obj: unknown): obj is PromiseLike<T>;
/** Call a function as a Promise. Resolves with the returned Promsise or immediately. */
export declare function runAsPromise(func: Function, args?: unknown[]): Promise<unknown>;
/**
 * Force a layout reflow, e.g. after adding classnames
 * @see https://stackoverflow.com/a/21665117/3759615
 */
export declare function forceReflow(element?: HTMLElement): void;
/**
 * Read data attribute from closest element with that attribute.
 *
 * Returns `undefined` if no element is found or attribute is missing.
 * Returns `true` if attribute is present without a value.
 */
export declare function getContextualAttr(el: Element | undefined, attr: string): string | boolean | undefined;
//# sourceMappingURL=index.d.ts.map