import type { ModuleLoader } from './module-loader/index.js';
/**
 * Re-implementation of Vite's normalizePath that can be used without Vite
 */
export declare function normalizePath(id: string): string;
/**
 * Resolve the hydration paths so that it can be imported in the client
 */
export declare function resolvePath(specifier: string, importer: string): string;
export declare function rootRelativePath(root: URL, idOrUrl: URL | string, shouldPrependForwardSlash?: boolean): string;
/**
 * Simulate Vite's resolve and import analysis so we can import the id as an URL
 * through a script tag or a dynamic import as-is.
 */
export declare function resolveIdToUrl(loader: ModuleLoader, id: string, root?: URL): Promise<string>;
