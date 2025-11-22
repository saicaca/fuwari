import { ExpressiveCodeEngineConfig, ExpressiveCodeEngine } from '@expressive-code/core';
export * from '@expressive-code/core';
import { PluginFramesOptions } from '@expressive-code/plugin-frames';
export * from '@expressive-code/plugin-frames';
import { PluginShikiOptions } from '@expressive-code/plugin-shiki';
export * from '@expressive-code/plugin-shiki';
export * from '@expressive-code/plugin-text-markers';

interface ExpressiveCodeConfig extends ExpressiveCodeEngineConfig {
    /**
     * The Shiki plugin adds syntax highlighting to code blocks.
     *
     * This plugin is enabled by default. Set this to `false` to disable it.
     * You can also configure the plugin by setting this to an options object.
     */
    shiki?: PluginShikiOptions | boolean | undefined;
    /**
     * The Text Markers plugin allows to highlight lines and inline ranges
     * in code blocks in various styles (e.g. marked, inserted, deleted).
     *
     * This plugin is enabled by default. Set this to `false` to disable it.
     */
    textMarkers?: boolean | undefined;
    /**
     * The Frames plugin adds an editor or terminal frame around code blocks,
     * including an optional title displayed as a tab or window caption.
     *
     * This plugin is enabled by default. Set this to `false` to disable it.
     * You can also configure the plugin by setting this to an options object.
     */
    frames?: PluginFramesOptions | boolean | undefined;
}
declare class ExpressiveCode extends ExpressiveCodeEngine {
    constructor({ shiki, textMarkers, frames, ...baseConfig }?: ExpressiveCodeConfig);
}

export { ExpressiveCode, ExpressiveCodeConfig };
