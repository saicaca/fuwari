import type { SSRManifest } from '../core/app/types.js';
import type { MiddlewareHandler } from '../types/public/common.js';
export declare function createI18nMiddleware(i18n: SSRManifest['i18n'], base: SSRManifest['base'], trailingSlash: SSRManifest['trailingSlash'], format: SSRManifest['buildFormat']): MiddlewareHandler;
