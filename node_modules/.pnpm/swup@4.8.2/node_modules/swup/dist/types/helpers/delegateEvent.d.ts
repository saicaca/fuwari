import { type DelegateEventHandler, type DelegateOptions, type EventType } from 'delegate-it';
import type { ParseSelector } from 'typed-query-selector/parser.js';
export type DelegateEventUnsubscribe = {
    destroy: () => void;
};
/** Register a delegated event listener. */
export declare const delegateEvent: <Selector extends string, TElement extends Element = ParseSelector<Selector, HTMLElement>, TEvent extends EventType = keyof GlobalEventHandlersEventMap>(selector: Selector, type: TEvent, callback: DelegateEventHandler<GlobalEventHandlersEventMap[TEvent], TElement>, options?: DelegateOptions) => DelegateEventUnsubscribe;
//# sourceMappingURL=delegateEvent.d.ts.map