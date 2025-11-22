import type * as fs from 'node:fs';
import type { TypedEventEmitter } from '../../types/typed-emitter.js';
export type LoaderEvents = {
    'file-add': (msg: [path: string, stats?: fs.Stats | undefined]) => void;
    'file-change': (msg: [path: string, stats?: fs.Stats | undefined]) => void;
    'file-unlink': (msg: [path: string, stats?: fs.Stats | undefined]) => void;
    'hmr-error': (msg: {
        type: 'error';
        err: {
            message: string;
            stack: string;
        };
    }) => void;
};
export type ModuleLoaderEventEmitter = TypedEventEmitter<LoaderEvents>;
export interface ModuleLoader {
    import: (src: string) => Promise<Record<string, any>>;
    resolveId: (specifier: string, parentId: string | undefined) => Promise<string | undefined>;
    getModuleById: (id: string) => ModuleNode | undefined;
    getModulesByFile: (file: string) => Set<ModuleNode> | undefined;
    getModuleInfo: (id: string) => ModuleInfo | null;
    eachModule(callbackfn: (value: ModuleNode, key: string) => void): void;
    invalidateModule(mod: ModuleNode): void;
    fixStacktrace: (error: Error) => void;
    clientReload: () => void;
    webSocketSend: (msg: any) => void;
    isHttps: () => boolean;
    events: TypedEventEmitter<LoaderEvents>;
}
export interface ModuleNode {
    id: string | null;
    url: string;
    file: string | null;
    ssrModule: Record<string, any> | null;
    ssrTransformResult: {
        deps?: string[];
        dynamicDeps?: string[];
    } | null;
    ssrError: Error | null;
    importedModules: Set<ModuleNode>;
    importers: Set<ModuleNode>;
}
export interface ModuleInfo {
    id: string;
    meta?: Record<string, any>;
}
export declare function createLoader(overrides: Partial<ModuleLoader>): ModuleLoader;
