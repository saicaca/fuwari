import type { PluginContext } from 'rollup';
import { z } from 'zod';
export declare function createImage(pluginContext: PluginContext, shouldEmitFile: boolean, entryFilePath: string, experimentalSvgEnabled: boolean): () => z.ZodEffects<z.ZodString, z.ZodNever | {
    ASTRO_ASSET: string;
    src: string;
    format: import("../assets/types.js").ImageInputFormat;
    width: number;
    height: number;
    fsPath: string;
    orientation?: number | undefined;
}, string>;
