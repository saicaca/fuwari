export function onIdle(callback, { timeoutFallback = 1000 } = {}) {
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => callback());
    }
    else {
        setTimeout(() => callback(), timeoutFallback);
    }
}
export function onWindowLoad(callback) {
    if (document.readyState === 'complete') {
        setTimeout(() => callback(), 0);
    }
    else {
        window.addEventListener('load', () => callback());
    }
}
export function onIdleAfterLoad(callback, { delayAfterLoad = 0 } = {}) {
    onWindowLoad(() => {
        if (delayAfterLoad > 0) {
            setTimeout(() => onIdle(callback), delayAfterLoad);
        }
        else {
            onIdle(callback);
        }
    });
}
