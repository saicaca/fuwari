export function onIdle(
  callback: () => any,
  { timeoutFallback = 1000 }: { timeoutFallback?: number } = {}
): void {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => callback());
  } else {
    setTimeout(() => callback(), timeoutFallback);
  }
}

export function onWindowLoad(callback: () => any): void {
  if (document.readyState === 'complete') {
    setTimeout(() => callback(), 0);
  } else {
    window.addEventListener('load', () => callback());
  }
}

export function onIdleAfterLoad(
  callback: () => any,
  { delayAfterLoad = 0 }: { delayAfterLoad?: number } = {}
): void {
  onWindowLoad(() => {
    if (delayAfterLoad > 0) {
      setTimeout(() => onIdle(callback), delayAfterLoad)
    } else {
      onIdle(callback);
    }
  });
}
