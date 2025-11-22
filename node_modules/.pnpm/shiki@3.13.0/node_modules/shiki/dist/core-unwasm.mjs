import { setDefaultWasmLoader } from '@shikijs/engine-oniguruma';
export * from '@shikijs/core';

setDefaultWasmLoader(() => import('shiki/wasm'));
