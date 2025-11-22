import type { AstroConfig, AstroIntegrationLogger } from "astro";
import type { Plugin } from "vite";
import type { IntegrationOptions } from "../typings/integration";
interface PluginContext extends Pick<AstroConfig, "root" | "output"> {
    logger: AstroIntegrationLogger;
}
export declare function createPlugin({ include, iconDir, svgoOptions }: IntegrationOptions, ctx: PluginContext): Plugin;
export {};
