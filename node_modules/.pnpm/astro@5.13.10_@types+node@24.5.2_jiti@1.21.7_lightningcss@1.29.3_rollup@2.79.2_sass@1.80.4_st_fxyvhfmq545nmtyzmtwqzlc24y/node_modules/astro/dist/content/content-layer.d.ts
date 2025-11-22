import type { FSWatcher } from 'vite';
import type { Logger } from '../core/logger/core.js';
import type { AstroSettings } from '../types/astro.js';
import type { RefreshContentOptions } from '../types/public/content.js';
import type { MutableDataStore } from './mutable-data-store.js';
interface ContentLayerOptions {
    store: MutableDataStore;
    settings: AstroSettings;
    logger: Logger;
    watcher?: FSWatcher;
}
declare class ContentLayer {
    #private;
    constructor({ settings, logger, store, watcher }: ContentLayerOptions);
    /**
     * Whether the content layer is currently loading content
     */
    get loading(): boolean;
    /**
     * Watch for changes to the content config and trigger a sync when it changes.
     */
    watchContentConfig(): void;
    unwatchContentConfig(): void;
    dispose(): void;
    /**
     * Enqueues a sync job that runs the `load()` method of each collection's loader, which will load the data and save it in the data store.
     * The loader itself is responsible for deciding whether this will clear and reload the full collection, or
     * perform an incremental update. After the data is loaded, the data store is written to disk. Jobs are queued,
     * so that only one sync can run at a time. The function returns a promise that resolves when this sync job is complete.
     */
    sync(options?: RefreshContentOptions): Promise<void>;
    regenerateCollectionFileManifest(): Promise<void>;
}
/**
 * Get the path to the data store file.
 * During development, this is in the `.astro` directory so that the Vite watcher can see it.
 * In production, it's in the cache directory so that it's preserved between builds.
 */
export declare function getDataStoreFile(settings: AstroSettings, isDev: boolean): URL;
export declare const globalContentLayer: {
    init: (options: ContentLayerOptions) => ContentLayer;
    get: () => ContentLayer | null;
    dispose: () => void;
};
export {};
