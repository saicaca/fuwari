import type { Options } from '@sveltejs/vite-plugin-svelte';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import type { AstroIntegration, ContainerRenderer } from 'astro';
export declare function getContainerRenderer(): ContainerRenderer;
export default function svelteIntegration(options?: Options): AstroIntegration;
export { vitePreprocess };
