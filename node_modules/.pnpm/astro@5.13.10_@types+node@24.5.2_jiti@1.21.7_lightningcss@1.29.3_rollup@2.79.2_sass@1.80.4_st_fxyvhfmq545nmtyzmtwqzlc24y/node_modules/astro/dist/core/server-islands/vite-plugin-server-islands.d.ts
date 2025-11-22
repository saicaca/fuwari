import type { Plugin as VitePlugin } from 'vite';
import type { AstroPluginOptions } from '../../types/astro.js';
export declare const VIRTUAL_ISLAND_MAP_ID = "@astro-server-islands";
export declare function vitePluginServerIslands({ settings }: AstroPluginOptions): VitePlugin;
