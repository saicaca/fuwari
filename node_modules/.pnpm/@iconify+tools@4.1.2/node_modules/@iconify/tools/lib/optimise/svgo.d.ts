import { PluginConfig } from 'svgo';
import { SVG } from '../svg/index.js';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';

interface CleanupIDsOption {
    cleanupIDs?: string | ((id: string) => string) | false;
}
interface GetSVGOPluginOptions extends CleanupIDsOption {
    animated?: boolean;
    keepShapes?: boolean;
}
/**
 * Get list of plugins
 */
declare function getSVGOPlugins(options: GetSVGOPluginOptions): PluginConfig[];
/**
 * Options
 */
interface SVGOCommonOptions {
    multipass?: boolean;
}
interface SVGOOptionsWithPlugin extends SVGOCommonOptions {
    plugins: PluginConfig[];
}
interface SVGOptionsWithoutPlugin extends SVGOCommonOptions, CleanupIDsOption {
    plugins?: undefined;
    keepShapes?: boolean;
}
type SVGOOptions = SVGOOptionsWithPlugin | SVGOptionsWithoutPlugin;
/**
 * Run SVGO on icon
 */
declare function runSVGO(svg: SVG, options?: SVGOOptions): void;

export { getSVGOPlugins, runSVGO };
