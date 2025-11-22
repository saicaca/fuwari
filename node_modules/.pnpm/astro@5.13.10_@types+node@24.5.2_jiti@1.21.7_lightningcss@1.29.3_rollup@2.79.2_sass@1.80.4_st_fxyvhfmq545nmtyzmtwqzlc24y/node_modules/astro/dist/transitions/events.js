import { updateScrollPosition } from "./router.js";
import { swap } from "./swap-functions.js";
const TRANSITION_BEFORE_PREPARATION = "astro:before-preparation";
const TRANSITION_AFTER_PREPARATION = "astro:after-preparation";
const TRANSITION_BEFORE_SWAP = "astro:before-swap";
const TRANSITION_AFTER_SWAP = "astro:after-swap";
const TRANSITION_PAGE_LOAD = "astro:page-load";
const triggerEvent = (name) => document.dispatchEvent(new Event(name));
const onPageLoad = () => triggerEvent(TRANSITION_PAGE_LOAD);
class BeforeEvent extends Event {
  from;
  to;
  direction;
  navigationType;
  sourceElement;
  info;
  newDocument;
  signal;
  constructor(type, eventInitDict, from, to, direction, navigationType, sourceElement, info, newDocument, signal) {
    super(type, eventInitDict);
    this.from = from;
    this.to = to;
    this.direction = direction;
    this.navigationType = navigationType;
    this.sourceElement = sourceElement;
    this.info = info;
    this.newDocument = newDocument;
    this.signal = signal;
    Object.defineProperties(this, {
      from: { enumerable: true },
      to: { enumerable: true, writable: true },
      direction: { enumerable: true, writable: true },
      navigationType: { enumerable: true },
      sourceElement: { enumerable: true },
      info: { enumerable: true },
      newDocument: { enumerable: true, writable: true },
      signal: { enumerable: true }
    });
  }
}
const isTransitionBeforePreparationEvent = (value) => value.type === TRANSITION_BEFORE_PREPARATION;
class TransitionBeforePreparationEvent extends BeforeEvent {
  formData;
  loader;
  constructor(from, to, direction, navigationType, sourceElement, info, newDocument, signal, formData, loader) {
    super(
      TRANSITION_BEFORE_PREPARATION,
      { cancelable: true },
      from,
      to,
      direction,
      navigationType,
      sourceElement,
      info,
      newDocument,
      signal
    );
    this.formData = formData;
    this.loader = loader.bind(this, this);
    Object.defineProperties(this, {
      formData: { enumerable: true },
      loader: { enumerable: true, writable: true }
    });
  }
}
const isTransitionBeforeSwapEvent = (value) => value.type === TRANSITION_BEFORE_SWAP;
class TransitionBeforeSwapEvent extends BeforeEvent {
  direction;
  viewTransition;
  swap;
  constructor(afterPreparation, viewTransition) {
    super(
      TRANSITION_BEFORE_SWAP,
      void 0,
      afterPreparation.from,
      afterPreparation.to,
      afterPreparation.direction,
      afterPreparation.navigationType,
      afterPreparation.sourceElement,
      afterPreparation.info,
      afterPreparation.newDocument,
      afterPreparation.signal
    );
    this.direction = afterPreparation.direction;
    this.viewTransition = viewTransition;
    this.swap = () => swap(this.newDocument);
    Object.defineProperties(this, {
      direction: { enumerable: true },
      viewTransition: { enumerable: true },
      swap: { enumerable: true, writable: true }
    });
  }
}
async function doPreparation(from, to, direction, navigationType, sourceElement, info, signal, formData, defaultLoader) {
  const event = new TransitionBeforePreparationEvent(
    from,
    to,
    direction,
    navigationType,
    sourceElement,
    info,
    window.document,
    signal,
    formData,
    defaultLoader
  );
  if (document.dispatchEvent(event)) {
    await event.loader();
    if (!event.defaultPrevented) {
      triggerEvent(TRANSITION_AFTER_PREPARATION);
      if (event.navigationType !== "traverse") {
        updateScrollPosition({ scrollX, scrollY });
      }
    }
  }
  return event;
}
async function doSwap(afterPreparation, viewTransition, afterDispatch) {
  const event = new TransitionBeforeSwapEvent(afterPreparation, viewTransition);
  document.dispatchEvent(event);
  if (afterDispatch) {
    await afterDispatch();
  }
  event.swap();
  return event;
}
export {
  TRANSITION_AFTER_PREPARATION,
  TRANSITION_AFTER_SWAP,
  TRANSITION_BEFORE_PREPARATION,
  TRANSITION_BEFORE_SWAP,
  TRANSITION_PAGE_LOAD,
  TransitionBeforePreparationEvent,
  TransitionBeforeSwapEvent,
  doPreparation,
  doSwap,
  isTransitionBeforePreparationEvent,
  isTransitionBeforeSwapEvent,
  onPageLoad,
  triggerEvent
};
