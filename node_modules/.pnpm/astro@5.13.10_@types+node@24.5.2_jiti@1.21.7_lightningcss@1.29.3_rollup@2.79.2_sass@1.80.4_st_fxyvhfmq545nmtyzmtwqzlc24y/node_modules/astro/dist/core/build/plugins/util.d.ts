import type { BuildOptions, Rollup, Plugin as VitePlugin } from 'vite';
import type { BuildInternals } from '../internal.js';
import type { PageBuildData } from '../types.js';
type OutputOptionsHook = Extract<VitePlugin['outputOptions'], Function>;
type OutputOptions = Parameters<OutputOptionsHook>[0];
type ExtendManualChunksHooks = {
    before?: Rollup.GetManualChunk;
    after?: Rollup.GetManualChunk;
};
export declare function extendManualChunks(outputOptions: OutputOptions, hooks: ExtendManualChunksHooks): void;
export declare const ASTRO_PAGE_EXTENSION_POST_PATTERN = "@_@";
/**
 * Generate a unique key to identify each page in the build process.
 * @param route Usually pageData.route.route
 * @param componentPath Usually pageData.component
 */
export declare function makePageDataKey(route: string, componentPath: string): string;
/**
 * Prevents Rollup from triggering other plugins in the process by masking the extension (hence the virtual file).
 * Inverse function of getComponentFromVirtualModulePageName() below.
 * @param virtualModulePrefix The prefix used to create the virtual module
 * @param path Page component path
 */
export declare function getVirtualModulePageName(virtualModulePrefix: string, path: string): string;
/**
 * From the VirtualModulePageName, and the internals, get all pageDatas that use this
 * component as their entry point.
 * @param virtualModulePrefix The prefix used to create the virtual module
 * @param id Virtual module name
 */
export declare function getPagesFromVirtualModulePageName(internals: BuildInternals, virtualModulePrefix: string, id: string): PageBuildData[];
export declare function shouldInlineAsset(assetContent: string, assetPath: string, assetsInlineLimit: NonNullable<BuildOptions['assetsInlineLimit']>): boolean;
export {};
