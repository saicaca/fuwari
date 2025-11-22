import delegate from './delegate.js';
// This type isn't exported as a declaration, so it needs to be duplicated above
async function oneEvent(selector, type, options = {}) {
    return new Promise(resolve => {
        options.once = true;
        if (options.signal?.aborted) {
            resolve(undefined);
        }
        options.signal?.addEventListener('abort', () => {
            resolve(undefined);
        });
        delegate(selector, type, resolve, options);
    });
}
export default oneEvent;
