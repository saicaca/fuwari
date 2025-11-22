import type { ModuleInfo, ModuleLoader } from '../core/module-loader/index.js';
type GetPrerenderStatusParams = {
    filePath: URL;
    loader: ModuleLoader;
};
export declare function getPrerenderStatus({ filePath, loader, }: GetPrerenderStatusParams): boolean | undefined;
export declare function getPrerenderMetadata(moduleInfo: ModuleInfo): any;
export {};
