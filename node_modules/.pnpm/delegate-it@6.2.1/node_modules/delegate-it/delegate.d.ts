import type { ParseSelector } from 'typed-query-selector/parser.d.js';
export type DelegateOptions = AddEventListenerOptions & {
    base?: EventTarget;
};
export type EventType = keyof GlobalEventHandlersEventMap;
export type DelegateEventHandler<TEvent extends Event = Event, TElement extends Element = Element> = (event: DelegateEvent<TEvent, TElement>) => void;
export type DelegateEvent<TEvent extends Event = Event, TElement extends Element = Element> = TEvent & {
    delegateTarget: TElement;
};
/**
 * Delegates event to a selector.
 * @param options A boolean value setting options.capture or an options object of type AddEventListenerOptions
 */
declare function delegate<Selector extends string, TElement extends Element = ParseSelector<Selector, HTMLElement>, TEventType extends EventType = EventType>(selector: Selector | readonly Selector[], type: TEventType, callback: DelegateEventHandler<GlobalEventHandlersEventMap[TEventType], TElement>, options?: DelegateOptions): void;
declare function delegate<TElement extends Element = HTMLElement, TEventType extends EventType = EventType>(selector: string | readonly string[], type: TEventType, callback: DelegateEventHandler<GlobalEventHandlersEventMap[TEventType], TElement>, options?: DelegateOptions): void;
export default delegate;
