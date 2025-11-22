import type { Rollup, Plugin as VitePlugin } from 'vite';
import type { BuildInternals } from './internal.js';
import type { StaticBuildOptions, ViteBuildReturn } from './types.js';
type RollupOutputArray = Extract<ViteBuildReturn, Array<any>>;
type OutputChunkorAsset = RollupOutputArray[number]['output'][number];
type OutputChunk = Extract<OutputChunkorAsset, {
    type: 'chunk';
}>;
export type BuildTarget = 'server' | 'client';
type MutateChunk = (chunk: OutputChunk, targets: BuildTarget[], newCode: string) => void;
interface BuildBeforeHookResult {
    enforce?: 'after-user-plugins';
    vitePlugin: VitePlugin | VitePlugin[] | undefined;
}
export type AstroBuildPlugin = {
    targets: BuildTarget[];
    hooks?: {
        'build:before'?: (opts: {
            target: BuildTarget;
            input: Set<string>;
        }) => BuildBeforeHookResult | Promise<BuildBeforeHookResult>;
        'build:post'?: (opts: {
            ssrOutputs: RollupOutputArray;
            clientOutputs: RollupOutputArray;
            mutate: MutateChunk;
        }) => void | Promise<void>;
    };
};
export declare function createPluginContainer(options: StaticBuildOptions, internals: BuildInternals): {
    options: StaticBuildOptions;
    internals: BuildInternals;
    register(plugin: AstroBuildPlugin): void;
    runBeforeHook(target: BuildTarget, input: Set<string>): Promise<{
        vitePlugins: (VitePlugin<any> | VitePlugin<any>[])[];
        lastVitePlugins: (VitePlugin<any> | VitePlugin<any>[])[];
    }>;
    runPostHook(ssrOutputs: Rollup.RollupOutput[], clientOutputs: Rollup.RollupOutput[]): Promise<Map<string, {
        targets: BuildTarget[];
        code: string;
    }>>;
};
export type AstroBuildPluginContainer = ReturnType<typeof createPluginContainer>;
export {};
