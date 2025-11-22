import type { ParseSelector } from 'typed-query-selector/parser.d.js';
import { type DelegateEvent, type DelegateOptions, type EventType } from './delegate.js';
/**
 * Delegates event to a selector and resolves after the first event
 */
declare function oneEvent<Selector extends string, TElement extends Element = ParseSelector<Selector, HTMLElement>, TEventType extends EventType = EventType>(selector: Selector | Selector[], type: TEventType, options?: DelegateOptions): Promise<DelegateEvent<GlobalEventHandlersEventMap[TEventType], TElement>>;
declare function oneEvent<TElement extends Element = HTMLElement, TEventType extends EventType = EventType>(selector: string | string[], type: TEventType, options?: DelegateOptions): Promise<DelegateEvent<GlobalEventHandlersEventMap[TEventType], TElement>>;
export default oneEvent;
