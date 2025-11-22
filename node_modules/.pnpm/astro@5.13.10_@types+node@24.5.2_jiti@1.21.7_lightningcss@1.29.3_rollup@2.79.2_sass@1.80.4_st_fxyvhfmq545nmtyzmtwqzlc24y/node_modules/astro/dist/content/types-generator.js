import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { bold, cyan } from "kleur/colors";
import { glob } from "tinyglobby";
import { normalizePath } from "vite";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { AstroError } from "../core/errors/errors.js";
import { AstroErrorData, AstroUserError } from "../core/errors/index.js";
import { isRelativePath } from "../core/path.js";
import {
  COLLECTIONS_DIR,
  CONTENT_LAYER_TYPE,
  CONTENT_TYPES_FILE,
  LIVE_CONTENT_TYPE,
  VIRTUAL_MODULE_ID
} from "./consts.js";
import {
  getContentEntryIdAndSlug,
  getContentPaths,
  getDataEntryExts,
  getDataEntryId,
  getEntryCollectionName,
  getEntryConfigByExtMap,
  getEntrySlug,
  getEntryType,
  reloadContentConfigObserver
} from "./utils.js";
async function createContentTypesGenerator({
  contentConfigObserver,
  fs,
  logger,
  settings,
  viteServer
}) {
  const collectionEntryMap = {};
  const contentPaths = getContentPaths(settings.config, fs);
  const contentEntryConfigByExt = getEntryConfigByExtMap(settings.contentEntryTypes);
  const contentEntryExts = [...contentEntryConfigByExt.keys()];
  const dataEntryExts = getDataEntryExts(settings);
  let events = [];
  let debounceTimeout;
  const typeTemplateContent = await fs.promises.readFile(contentPaths.typesTemplate, "utf-8");
  async function init() {
    events.push({ name: "add", entry: contentPaths.config.url });
    if (settings.config.legacy.collections) {
      if (!fs.existsSync(contentPaths.contentDir)) {
        return { typesGenerated: false, reason: "no-content-dir" };
      }
      const globResult = await glob("**", {
        cwd: fileURLToPath(contentPaths.contentDir),
        absolute: true
      });
      for (const fullPath of globResult) {
        const entryURL = pathToFileURL(fullPath);
        if (entryURL.href.startsWith(contentPaths.config.url.href)) continue;
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
          events.push({ name: "add", entry: entryURL });
        } else if (stat.isDirectory()) {
          events.push({ name: "addDir", entry: entryURL });
        }
      }
    }
    await runEvents();
    return { typesGenerated: true };
  }
  async function handleEvent(event) {
    if (event.name === "addDir" || event.name === "unlinkDir") {
      const collection2 = normalizePath(
        path.relative(fileURLToPath(contentPaths.contentDir), fileURLToPath(event.entry))
      );
      const collectionKey2 = JSON.stringify(collection2);
      const isCollectionEvent = collection2.split("/").length === 1;
      if (!isCollectionEvent) return { shouldGenerateTypes: false };
      switch (event.name) {
        case "addDir":
          collectionEntryMap[collectionKey2] = {
            type: "unknown",
            entries: {}
          };
          logger.debug("content", `${cyan(collection2)} collection added`);
          break;
        case "unlinkDir":
          delete collectionEntryMap[collectionKey2];
          break;
      }
      return { shouldGenerateTypes: true };
    }
    const fileType = getEntryType(
      fileURLToPath(event.entry),
      contentPaths,
      contentEntryExts,
      dataEntryExts
    );
    if (fileType === "ignored") {
      return { shouldGenerateTypes: false };
    }
    if (fileType === "config") {
      await reloadContentConfigObserver({ fs, settings, viteServer });
      return { shouldGenerateTypes: true };
    }
    const { entry } = event;
    const { contentDir } = contentPaths;
    const collection = getEntryCollectionName({ entry, contentDir });
    if (collection === void 0) {
      logger.warn(
        "content",
        `${bold(
          normalizePath(
            path.relative(fileURLToPath(contentPaths.contentDir), fileURLToPath(event.entry))
          )
        )} must live in a ${bold("content/...")} collection subdirectory.`
      );
      return { shouldGenerateTypes: false };
    }
    if (fileType === "data") {
      const id2 = getDataEntryId({ entry, contentDir, collection });
      const collectionKey2 = JSON.stringify(collection);
      const entryKey2 = JSON.stringify(id2);
      switch (event.name) {
        case "add":
          if (!(collectionKey2 in collectionEntryMap)) {
            collectionEntryMap[collectionKey2] = { type: "data", entries: {} };
          }
          const collectionInfo2 = collectionEntryMap[collectionKey2];
          if (collectionInfo2.type === "content") {
            viteServer.hot.send({
              type: "error",
              err: new AstroError({
                ...AstroErrorData.MixedContentDataCollectionError,
                message: AstroErrorData.MixedContentDataCollectionError.message(collectionKey2),
                location: { file: entry.pathname }
              })
            });
            return { shouldGenerateTypes: false };
          }
          if (!(entryKey2 in collectionEntryMap[collectionKey2])) {
            collectionEntryMap[collectionKey2] = {
              type: "data",
              entries: { ...collectionInfo2.entries, [entryKey2]: {} }
            };
          }
          return { shouldGenerateTypes: true };
        case "unlink":
          if (collectionKey2 in collectionEntryMap && entryKey2 in collectionEntryMap[collectionKey2].entries) {
            delete collectionEntryMap[collectionKey2].entries[entryKey2];
          }
          return { shouldGenerateTypes: true };
        case "change":
          return { shouldGenerateTypes: false };
      }
    }
    const contentEntryType = contentEntryConfigByExt.get(path.extname(event.entry.pathname));
    if (!contentEntryType) return { shouldGenerateTypes: false };
    const { id, slug: generatedSlug } = getContentEntryIdAndSlug({
      entry,
      contentDir,
      collection
    });
    const collectionKey = JSON.stringify(collection);
    if (!(collectionKey in collectionEntryMap)) {
      collectionEntryMap[collectionKey] = { type: "content", entries: {} };
    }
    const collectionInfo = collectionEntryMap[collectionKey];
    if (collectionInfo.type === "data") {
      viteServer.hot.send({
        type: "error",
        err: new AstroError({
          ...AstroErrorData.MixedContentDataCollectionError,
          message: AstroErrorData.MixedContentDataCollectionError.message(collectionKey),
          location: { file: entry.pathname }
        })
      });
      return { shouldGenerateTypes: false };
    }
    const entryKey = JSON.stringify(id);
    switch (event.name) {
      case "add":
        const addedSlug = await getEntrySlug({
          generatedSlug,
          id,
          collection,
          fileUrl: event.entry,
          contentEntryType,
          fs
        });
        if (!(entryKey in collectionEntryMap[collectionKey].entries)) {
          collectionEntryMap[collectionKey] = {
            type: "content",
            entries: {
              ...collectionInfo.entries,
              [entryKey]: { slug: addedSlug }
            }
          };
        }
        return { shouldGenerateTypes: true };
      case "unlink":
        if (collectionKey in collectionEntryMap && entryKey in collectionEntryMap[collectionKey].entries) {
          delete collectionEntryMap[collectionKey].entries[entryKey];
        }
        return { shouldGenerateTypes: true };
      case "change":
        const changedSlug = await getEntrySlug({
          generatedSlug,
          id,
          collection,
          fileUrl: event.entry,
          contentEntryType,
          fs
        });
        const entryMetadata = collectionInfo.entries[entryKey];
        if (entryMetadata?.slug !== changedSlug) {
          collectionInfo.entries[entryKey].slug = changedSlug;
          return { shouldGenerateTypes: true };
        }
        return { shouldGenerateTypes: false };
    }
  }
  function queueEvent(rawEvent) {
    const event = {
      entry: pathToFileURL(rawEvent.entry),
      name: rawEvent.name
    };
    if (settings.config.legacy.collections) {
      if (!event.entry.pathname.startsWith(contentPaths.contentDir.pathname)) {
        return;
      }
    } else if (contentPaths.config.url.pathname !== event.entry.pathname) {
      return;
    }
    events.push(event);
    debounceTimeout && clearTimeout(debounceTimeout);
    const runEventsSafe = async () => {
      try {
        await runEvents();
      } catch {
      }
    };
    debounceTimeout = setTimeout(
      runEventsSafe,
      50
      /* debounce to batch chokidar events */
    );
  }
  async function runEvents() {
    const eventResponses = [];
    for (const event of events) {
      const response = await handleEvent(event);
      eventResponses.push(response);
    }
    events = [];
    const observable = contentConfigObserver.get();
    if (eventResponses.some((r) => r.shouldGenerateTypes)) {
      await writeContentFiles({
        fs,
        collectionEntryMap,
        contentPaths,
        typeTemplateContent,
        contentConfig: observable.status === "loaded" ? observable.config : void 0,
        contentEntryTypes: settings.contentEntryTypes,
        viteServer,
        logger,
        settings
      });
      invalidateVirtualMod(viteServer);
    }
  }
  return { init, queueEvent };
}
function invalidateVirtualMod(viteServer) {
  const virtualMod = viteServer.moduleGraph.getModuleById("\0" + VIRTUAL_MODULE_ID);
  if (!virtualMod) return;
  viteServer.moduleGraph.invalidateModule(virtualMod);
}
function normalizeConfigPath(from, to) {
  const configPath = path.relative(from, to).replace(/\.ts$/, ".js");
  const normalizedPath = configPath.replaceAll("\\", "/");
  return `"${isRelativePath(configPath) ? "" : "./"}${normalizedPath}"`;
}
const schemaCache = /* @__PURE__ */ new Map();
async function getContentLayerSchema(collection, collectionKey) {
  const cached = schemaCache.get(collectionKey);
  if (cached) {
    return cached;
  }
  if (collection?.type === CONTENT_LAYER_TYPE && typeof collection.loader === "object" && collection.loader.schema) {
    let schema = collection.loader.schema;
    if (typeof schema === "function") {
      schema = await schema();
    }
    if (schema) {
      schemaCache.set(collectionKey, await schema);
      return schema;
    }
  }
}
async function typeForCollection(collection, collectionKey) {
  if (collection?.schema) {
    return `InferEntrySchema<${collectionKey}>`;
  }
  if (collection?.type === CONTENT_LAYER_TYPE) {
    const schema = await getContentLayerSchema(collection, collectionKey);
    if (schema) {
      try {
        const zodToTs = await import("zod-to-ts");
        const ast = zodToTs.zodToTs(schema);
        return zodToTs.printNode(ast.node);
      } catch (err) {
        if (err.message.includes("Cannot find package 'typescript'")) {
          return "any";
        }
        throw err;
      }
    }
  }
  return "any";
}
async function writeContentFiles({
  fs,
  contentPaths,
  collectionEntryMap,
  typeTemplateContent,
  contentEntryTypes,
  contentConfig,
  viteServer,
  logger,
  settings
}) {
  let contentTypesStr = "";
  let dataTypesStr = "";
  const collectionSchemasDir = new URL(COLLECTIONS_DIR, settings.dotAstroDir);
  fs.mkdirSync(collectionSchemasDir, { recursive: true });
  for (const [collection, config] of Object.entries(contentConfig?.collections ?? {})) {
    collectionEntryMap[JSON.stringify(collection)] ??= {
      type: config.type,
      entries: {}
    };
  }
  let contentCollectionsMap = {};
  for (const collectionKey of Object.keys(collectionEntryMap).sort()) {
    const collectionConfig = contentConfig?.collections[JSON.parse(collectionKey)];
    const collection = collectionEntryMap[collectionKey];
    if (collectionConfig?.type && collection.type !== "unknown" && collectionConfig.type !== CONTENT_LAYER_TYPE && collection.type !== collectionConfig.type) {
      viteServer.hot.send({
        type: "error",
        err: new AstroError({
          ...AstroErrorData.ContentCollectionTypeMismatchError,
          message: AstroErrorData.ContentCollectionTypeMismatchError.message(
            collectionKey,
            collection.type,
            collectionConfig.type
          ),
          hint: collection.type === "data" ? "Try adding `type: 'data'` to your collection config." : void 0,
          location: {
            file: ""
          }
        })
      });
      return;
    }
    const resolvedType = collection.type === "unknown" ? (
      // Add empty / unknown collections to the data type map by default
      // This ensures `getCollection('empty-collection')` doesn't raise a type error
      collectionConfig?.type ?? "data"
    ) : collection.type;
    const collectionEntryKeys = Object.keys(collection.entries).sort();
    const dataType = await typeForCollection(collectionConfig, collectionKey);
    switch (resolvedType) {
      case LIVE_CONTENT_TYPE:
        throw new AstroUserError(
          `Invalid definition for collection ${collectionKey}: Live content collections must be defined in "src/live.config.ts"`
        );
      case "content":
        if (collectionEntryKeys.length === 0) {
          contentTypesStr += `${collectionKey}: Record<string, {
  id: string;
  slug: string;
  body: string;
  collection: ${collectionKey};
  data: ${dataType};
  render(): Render[".md"];
}>;
`;
          break;
        }
        contentTypesStr += `${collectionKey}: {
`;
        for (const entryKey of collectionEntryKeys) {
          const entryMetadata = collection.entries[entryKey];
          const renderType = `{ render(): Render[${JSON.stringify(
            path.extname(JSON.parse(entryKey))
          )}] }`;
          const slugType = JSON.stringify(entryMetadata.slug);
          contentTypesStr += `${entryKey}: {
	id: ${entryKey};
  slug: ${slugType};
  body: string;
  collection: ${collectionKey};
  data: ${dataType}
} & ${renderType};
`;
        }
        contentTypesStr += `};
`;
        break;
      case CONTENT_LAYER_TYPE:
        const legacyTypes = collectionConfig?._legacy ? 'render(): Render[".md"];\n  slug: string;\n  body: string;\n' : "body?: string;\n";
        dataTypesStr += `${collectionKey}: Record<string, {
  id: string;
  ${legacyTypes}  collection: ${collectionKey};
  data: ${dataType};
  rendered?: RenderedContent;
  filePath?: string;
}>;
`;
        break;
      case "data":
        if (collectionEntryKeys.length === 0) {
          dataTypesStr += `${collectionKey}: Record<string, {
  id: string;
  collection: ${collectionKey};
  data: ${dataType};
}>;
`;
        } else {
          dataTypesStr += `${collectionKey}: {
`;
          for (const entryKey of collectionEntryKeys) {
            dataTypesStr += `${entryKey}: {
	id: ${entryKey};
  collection: ${collectionKey};
  data: ${dataType}
};
`;
          }
          dataTypesStr += `};
`;
        }
        break;
    }
    if (collectionConfig && (collectionConfig.schema || await getContentLayerSchema(collectionConfig, collectionKey))) {
      await generateJSONSchema(fs, collectionConfig, collectionKey, collectionSchemasDir, logger);
      contentCollectionsMap[collectionKey] = collection;
    }
  }
  if (settings.config.experimental.contentIntellisense) {
    let contentCollectionManifest = {
      collections: [],
      entries: {}
    };
    Object.entries(contentCollectionsMap).forEach(([collectionKey, collection]) => {
      const collectionConfig = contentConfig?.collections[JSON.parse(collectionKey)];
      const key = JSON.parse(collectionKey);
      contentCollectionManifest.collections.push({
        hasSchema: Boolean(collectionConfig?.schema || schemaCache.has(collectionKey)),
        name: key
      });
      Object.keys(collection.entries).forEach((entryKey) => {
        const entryPath = new URL(
          JSON.parse(entryKey),
          contentPaths.contentDir + `${key}/`
        ).toString();
        contentCollectionManifest.entries[entryPath.toLowerCase()] = key;
      });
    });
    await fs.promises.writeFile(
      new URL("./collections.json", collectionSchemasDir),
      JSON.stringify(contentCollectionManifest, null, 2)
    );
  }
  const configPathRelativeToCacheDir = normalizeConfigPath(
    settings.dotAstroDir.pathname,
    contentPaths.config.url.pathname
  );
  const liveConfigPathRelativeToCacheDir = contentPaths.liveConfig?.exists ? normalizeConfigPath(settings.dotAstroDir.pathname, contentPaths.liveConfig.url.pathname) : void 0;
  for (const contentEntryType of contentEntryTypes) {
    if (contentEntryType.contentModuleTypes) {
      typeTemplateContent = contentEntryType.contentModuleTypes + "\n" + typeTemplateContent;
    }
  }
  typeTemplateContent = typeTemplateContent.replace("// @@CONTENT_ENTRY_MAP@@", contentTypesStr).replace("// @@DATA_ENTRY_MAP@@", dataTypesStr).replace(
    "'@@CONTENT_CONFIG_TYPE@@'",
    contentConfig ? `typeof import(${configPathRelativeToCacheDir})` : "never"
  ).replace(
    "'@@LIVE_CONTENT_CONFIG_TYPE@@'",
    liveConfigPathRelativeToCacheDir ? `typeof import(${liveConfigPathRelativeToCacheDir})` : "never"
  );
  if (settings.injectedTypes.some((t) => t.filename === CONTENT_TYPES_FILE)) {
    await fs.promises.writeFile(
      new URL(CONTENT_TYPES_FILE, settings.dotAstroDir),
      typeTemplateContent,
      "utf-8"
    );
  } else {
    settings.injectedTypes.push({
      filename: CONTENT_TYPES_FILE,
      content: typeTemplateContent
    });
  }
}
async function generateJSONSchema(fsMod, collectionConfig, collectionKey, collectionSchemasDir, logger) {
  let zodSchemaForJson = typeof collectionConfig.schema === "function" ? collectionConfig.schema({ image: () => z.string() }) : collectionConfig.schema;
  if (!zodSchemaForJson && collectionConfig.type === CONTENT_LAYER_TYPE) {
    zodSchemaForJson = await getContentLayerSchema(collectionConfig, collectionKey);
  }
  if (collectionConfig.type === CONTENT_LAYER_TYPE && collectionConfig.loader.name === "file-loader") {
    zodSchemaForJson = z.object({}).catchall(zodSchemaForJson);
  }
  if (zodSchemaForJson instanceof z.ZodObject) {
    zodSchemaForJson = zodSchemaForJson.extend({
      $schema: z.string().optional()
    });
  }
  try {
    await fsMod.promises.writeFile(
      new URL(`./${collectionKey.replace(/"/g, "")}.schema.json`, collectionSchemasDir),
      JSON.stringify(
        zodToJsonSchema(zodSchemaForJson, {
          name: collectionKey.replace(/"/g, ""),
          markdownDescription: true,
          errorMessages: true,
          // Fix for https://github.com/StefanTerdell/zod-to-json-schema/issues/110
          dateStrategy: ["format:date-time", "format:date", "integer"]
        }),
        null,
        2
      )
    );
  } catch (err) {
    logger.warn(
      "content",
      `An error was encountered while creating the JSON schema for the ${collectionKey} collection. Proceeding without it. Error: ${err}`
    );
  }
}
export {
  createContentTypesGenerator
};
