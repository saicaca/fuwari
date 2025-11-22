import { existsSync, promises as fs } from "node:fs";
import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import PQueue from "p-queue";
import xxhash from "xxhash-wasm";
import { AstroError, AstroErrorData } from "../core/errors/index.js";
import {
  ASSET_IMPORTS_FILE,
  COLLECTIONS_MANIFEST_FILE,
  CONTENT_LAYER_TYPE,
  DATA_STORE_FILE,
  MODULES_IMPORTS_FILE
} from "./consts.js";
import {
  getEntryConfigByExtMap,
  getEntryDataAndImages,
  globalContentConfigObserver,
  loaderReturnSchema,
  safeStringify
} from "./utils.js";
import { createWatcherWrapper } from "./watcher.js";
class ContentLayer {
  #logger;
  #store;
  #settings;
  #watcher;
  #lastConfigDigest;
  #unsubscribe;
  #markdownProcessor;
  #generateDigest;
  #queue;
  constructor({ settings, logger, store, watcher }) {
    watcher?.setMaxListeners(50);
    this.#logger = logger;
    this.#store = store;
    this.#settings = settings;
    if (watcher) {
      this.#watcher = createWatcherWrapper(watcher);
    }
    this.#queue = new PQueue({ concurrency: 1 });
  }
  /**
   * Whether the content layer is currently loading content
   */
  get loading() {
    return this.#queue.size > 0 || this.#queue.pending > 0;
  }
  /**
   * Watch for changes to the content config and trigger a sync when it changes.
   */
  watchContentConfig() {
    this.#unsubscribe?.();
    this.#unsubscribe = globalContentConfigObserver.subscribe(async (ctx) => {
      if (ctx.status === "loaded" && ctx.config.digest !== this.#lastConfigDigest) {
        this.sync();
      }
    });
  }
  unwatchContentConfig() {
    this.#unsubscribe?.();
  }
  dispose() {
    this.#queue.clear();
    this.#unsubscribe?.();
    this.#watcher?.removeAllTrackedListeners();
  }
  async #getGenerateDigest() {
    if (this.#generateDigest) {
      return this.#generateDigest;
    }
    const { h64ToString } = await xxhash();
    this.#generateDigest = (data) => {
      const dataString = typeof data === "string" ? data : JSON.stringify(data);
      return h64ToString(dataString);
    };
    return this.#generateDigest;
  }
  async #getLoaderContext({
    collectionName,
    loaderName = "content",
    parseData,
    refreshContextData
  }) {
    return {
      collection: collectionName,
      store: this.#store.scopedStore(collectionName),
      meta: this.#store.metaStore(collectionName),
      logger: this.#logger.forkIntegrationLogger(loaderName),
      config: this.#settings.config,
      parseData,
      renderMarkdown: this.#processMarkdown.bind(this),
      generateDigest: await this.#getGenerateDigest(),
      watcher: this.#watcher,
      refreshContextData,
      entryTypes: getEntryConfigByExtMap([
        ...this.#settings.contentEntryTypes,
        ...this.#settings.dataEntryTypes
      ])
    };
  }
  async #processMarkdown(content) {
    this.#markdownProcessor ??= await createMarkdownProcessor(this.#settings.config.markdown);
    const { code, metadata } = await this.#markdownProcessor.render(content);
    return {
      html: code,
      metadata
    };
  }
  /**
   * Enqueues a sync job that runs the `load()` method of each collection's loader, which will load the data and save it in the data store.
   * The loader itself is responsible for deciding whether this will clear and reload the full collection, or
   * perform an incremental update. After the data is loaded, the data store is written to disk. Jobs are queued,
   * so that only one sync can run at a time. The function returns a promise that resolves when this sync job is complete.
   */
  sync(options = {}) {
    return this.#queue.add(() => this.#doSync(options));
  }
  async #doSync(options) {
    let contentConfig = globalContentConfigObserver.get();
    const logger = this.#logger.forkIntegrationLogger("content");
    if (contentConfig?.status === "loading") {
      contentConfig = await Promise.race([
        new Promise((resolve) => {
          const unsub = globalContentConfigObserver.subscribe((ctx) => {
            unsub();
            resolve(ctx);
          });
        }),
        new Promise(
          (resolve) => setTimeout(
            () => resolve({ status: "error", error: new Error("Content config loading timed out") }),
            5e3
          )
        )
      ]);
    }
    if (contentConfig?.status === "error") {
      logger.error(`Error loading content config. Skipping sync.
${contentConfig.error.message}`);
      return;
    }
    if (contentConfig?.status !== "loaded") {
      logger.error(`Content config not loaded, skipping sync. Status was ${contentConfig?.status}`);
      return;
    }
    logger.info("Syncing content");
    const {
      vite: _vite,
      integrations: _integrations,
      adapter: _adapter,
      ...hashableConfig
    } = this.#settings.config;
    const astroConfigDigest = safeStringify(hashableConfig);
    const { digest: currentConfigDigest } = contentConfig.config;
    this.#lastConfigDigest = currentConfigDigest;
    let shouldClear = false;
    const previousConfigDigest = await this.#store.metaStore().get("content-config-digest");
    const previousAstroConfigDigest = await this.#store.metaStore().get("astro-config-digest");
    const previousAstroVersion = await this.#store.metaStore().get("astro-version");
    if (previousAstroConfigDigest && previousAstroConfigDigest !== astroConfigDigest) {
      logger.info("Astro config changed");
      shouldClear = true;
    }
    if (previousConfigDigest && previousConfigDigest !== currentConfigDigest) {
      logger.info("Content config changed");
      shouldClear = true;
    }
    if (previousAstroVersion && previousAstroVersion !== "5.13.10") {
      logger.info("Astro version changed");
      shouldClear = true;
    }
    if (shouldClear) {
      logger.info("Clearing content store");
      this.#store.clearAll();
    }
    if ("5.13.10") {
      await this.#store.metaStore().set("astro-version", "5.13.10");
    }
    if (currentConfigDigest) {
      await this.#store.metaStore().set("content-config-digest", currentConfigDigest);
    }
    if (astroConfigDigest) {
      await this.#store.metaStore().set("astro-config-digest", astroConfigDigest);
    }
    if (!options?.loaders?.length) {
      this.#watcher?.removeAllTrackedListeners();
    }
    await Promise.all(
      Object.entries(contentConfig.config.collections).map(async ([name, collection]) => {
        if (collection.type !== CONTENT_LAYER_TYPE) {
          return;
        }
        let { schema } = collection;
        if (!schema && typeof collection.loader === "object") {
          schema = collection.loader.schema;
          if (typeof schema === "function") {
            schema = await schema();
          }
        }
        if (options?.loaders && (typeof collection.loader !== "object" || !options.loaders.includes(collection.loader.name))) {
          return;
        }
        const collectionWithResolvedSchema = { ...collection, schema };
        const parseData = async ({ id, data, filePath = "" }) => {
          const { data: parsedData } = await getEntryDataAndImages(
            {
              id,
              collection: name,
              unvalidatedData: data,
              _internal: {
                rawData: void 0,
                filePath
              }
            },
            collectionWithResolvedSchema,
            false,
            // FUTURE: Remove in this in v6
            id.endsWith(".svg")
          );
          return parsedData;
        };
        const context = await this.#getLoaderContext({
          collectionName: name,
          parseData,
          loaderName: collection.loader.name,
          refreshContextData: options?.context
        });
        if (typeof collection.loader === "function") {
          return simpleLoader(collection.loader, context);
        }
        if (!collection.loader.load) {
          throw new Error(`Collection loader for ${name} does not have a load method`);
        }
        return collection.loader.load(context);
      })
    );
    await fs.mkdir(this.#settings.config.cacheDir, { recursive: true });
    await fs.mkdir(this.#settings.dotAstroDir, { recursive: true });
    const assetImportsFile = new URL(ASSET_IMPORTS_FILE, this.#settings.dotAstroDir);
    await this.#store.writeAssetImports(assetImportsFile);
    const modulesImportsFile = new URL(MODULES_IMPORTS_FILE, this.#settings.dotAstroDir);
    await this.#store.writeModuleImports(modulesImportsFile);
    await this.#store.waitUntilSaveComplete();
    logger.info("Synced content");
    if (this.#settings.config.experimental.contentIntellisense) {
      await this.regenerateCollectionFileManifest();
    }
  }
  async regenerateCollectionFileManifest() {
    const collectionsManifest = new URL(COLLECTIONS_MANIFEST_FILE, this.#settings.dotAstroDir);
    this.#logger.debug("content", "Regenerating collection file manifest");
    if (existsSync(collectionsManifest)) {
      try {
        const collections = await fs.readFile(collectionsManifest, "utf-8");
        const collectionsJson = JSON.parse(collections);
        collectionsJson.entries ??= {};
        for (const { hasSchema, name } of collectionsJson.collections) {
          if (!hasSchema) {
            continue;
          }
          const entries = this.#store.values(name);
          if (!entries?.[0]?.filePath) {
            continue;
          }
          for (const { filePath } of entries) {
            if (!filePath) {
              continue;
            }
            const key = new URL(filePath, this.#settings.config.root).href.toLowerCase();
            collectionsJson.entries[key] = name;
          }
        }
        await fs.writeFile(collectionsManifest, JSON.stringify(collectionsJson, null, 2));
      } catch {
        this.#logger.error("content", "Failed to regenerate collection file manifest");
      }
    }
    this.#logger.debug("content", "Regenerated collection file manifest");
  }
}
async function simpleLoader(handler, context) {
  const unsafeData = await handler();
  const parsedData = loaderReturnSchema.safeParse(unsafeData);
  if (!parsedData.success) {
    const issue = parsedData.error.issues[0];
    const parseIssue = Array.isArray(unsafeData) ? issue.unionErrors[0] : issue.unionErrors[1];
    const error = parseIssue.errors[0];
    const firstPathItem = error.path[0];
    const entry = Array.isArray(unsafeData) ? unsafeData[firstPathItem] : unsafeData[firstPathItem];
    throw new AstroError({
      ...AstroErrorData.ContentLoaderReturnsInvalidId,
      message: AstroErrorData.ContentLoaderReturnsInvalidId.message(context.collection, entry)
    });
  }
  const data = parsedData.data;
  context.store.clear();
  if (Array.isArray(data)) {
    for (const raw of data) {
      if (!raw.id) {
        throw new AstroError({
          ...AstroErrorData.ContentLoaderInvalidDataError,
          message: AstroErrorData.ContentLoaderInvalidDataError.message(
            context.collection,
            `Entry missing ID:
${JSON.stringify({ ...raw, id: void 0 }, null, 2)}`
          )
        });
      }
      const item = await context.parseData({ id: raw.id, data: raw });
      context.store.set({ id: raw.id, data: item });
    }
    return;
  }
  if (typeof data === "object") {
    for (const [id, raw] of Object.entries(data)) {
      if (raw.id && raw.id !== id) {
        throw new AstroError({
          ...AstroErrorData.ContentLoaderInvalidDataError,
          message: AstroErrorData.ContentLoaderInvalidDataError.message(
            context.collection,
            `Object key ${JSON.stringify(id)} does not match ID ${JSON.stringify(raw.id)}`
          )
        });
      }
      const item = await context.parseData({ id, data: raw });
      context.store.set({ id, data: item });
    }
    return;
  }
  throw new AstroError({
    ...AstroErrorData.ExpectedImageOptions,
    message: AstroErrorData.ContentLoaderInvalidDataError.message(
      context.collection,
      `Invalid data type: ${typeof data}`
    )
  });
}
function getDataStoreFile(settings, isDev) {
  return new URL(DATA_STORE_FILE, isDev ? settings.dotAstroDir : settings.config.cacheDir);
}
function contentLayerSingleton() {
  let instance = null;
  return {
    init: (options) => {
      instance?.dispose();
      instance = new ContentLayer(options);
      return instance;
    },
    get: () => instance,
    dispose: () => {
      instance?.dispose();
      instance = null;
    }
  };
}
const globalContentLayer = contentLayerSingleton();
export {
  getDataStoreFile,
  globalContentLayer
};
