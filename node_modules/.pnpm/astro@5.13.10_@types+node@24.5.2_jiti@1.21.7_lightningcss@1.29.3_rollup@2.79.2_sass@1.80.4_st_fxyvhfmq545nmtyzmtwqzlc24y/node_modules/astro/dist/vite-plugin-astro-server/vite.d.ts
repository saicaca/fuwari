import type { ModuleLoader, ModuleNode } from '../core/module-loader/index.js';
/** recursively crawl the module graph to get all style files imported by parent id */
export declare function crawlGraph(loader: ModuleLoader, _id: string, isRootFile: boolean, scanned?: Set<string>): AsyncGenerator<ModuleNode, void, unknown>;
