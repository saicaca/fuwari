import type { PluginContainer } from 'vite';
export declare const frontmatterRE: RegExp;
export declare function loadId(pluginContainer: PluginContainer, id: string): Promise<string | undefined>;
