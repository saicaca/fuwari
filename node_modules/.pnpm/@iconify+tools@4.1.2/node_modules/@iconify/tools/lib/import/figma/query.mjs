import { sendAPIQuery } from '../../download/api/index.mjs';
import { apiCacheKey, getAPICache, clearAPICache } from '../../download/api/cache.mjs';
import { runConcurrentQueries } from '../../download/api/queue.mjs';
import 'axios';
import '../../download/api/config.mjs';
import 'fs';
import 'crypto';
import '../../misc/scan.mjs';

function identicalDates(actual, expected) {
  if (typeof actual !== "string") {
    return false;
  }
  if (actual === expected) {
    return true;
  }
  return new Date(actual).toString() === new Date(expected).toString();
}
async function figmaFilesQuery(options, cache) {
  if (!options.token) {
    throw new Error("Missing Figma API token");
  }
  const params = new URLSearchParams();
  if (options.ids) {
    params.set("ids", options.ids.join(","));
  }
  if (options.version) {
    params.set("version", options.version);
  }
  if (options.depth) {
    params.set("depth", options.depth.toString());
  }
  const queryParams = {
    uri: "https://api.figma.com/v1/files/" + options.file,
    params,
    headers: {
      "X-FIGMA-TOKEN": options.token
    }
  };
  const isModified = async () => {
    if (!cache || !options.ifModifiedSince) {
      return true;
    }
    const cacheKey = apiCacheKey(queryParams);
    const cachedData = await getAPICache(cache.dir, cacheKey);
    if (!cachedData) {
      return true;
    }
    let ifModifiedSince;
    if (options.ifModifiedSince === true) {
      try {
        const parsedData2 = JSON.parse(cachedData);
        if (typeof parsedData2.lastModified !== "string") {
          await clearAPICache(cache.dir);
          return true;
        }
        ifModifiedSince = parsedData2.lastModified;
      } catch (err) {
        await clearAPICache(cache.dir);
        return true;
      }
    } else {
      ifModifiedSince = options.ifModifiedSince;
    }
    const versionCheckParams = {
      ...queryParams,
      params: new URLSearchParams(params)
    };
    versionCheckParams.params.set("depth", "1");
    const data2 = await sendAPIQuery(versionCheckParams);
    try {
      if (typeof data2 === "string") {
        const parsedData2 = JSON.parse(data2);
        if (identicalDates(parsedData2.lastModified, ifModifiedSince)) {
          return false;
        }
      }
    } catch (err) {
    }
    await clearAPICache(cache.dir);
    return true;
  };
  if (!await isModified()) {
    return "not_modified";
  }
  const data = await sendAPIQuery(queryParams, cache);
  if (typeof data === "number") {
    throw new Error(`Error retrieving document from API: ${data}`);
  }
  let parsedData;
  try {
    parsedData = JSON.parse(data);
  } catch (err) {
    throw new Error(`Error retrieving document from API: invalid data`);
  }
  if (typeof parsedData.status === "number") {
    const figmaError = parsedData;
    throw new Error(
      `Error retrieving document from API: ${figmaError.err}`
    );
  }
  const document = parsedData;
  if (document.editorType !== "figma") {
    throw new Error(
      `Error retrieving document from API: document is for ${document.editorType}`
    );
  }
  if (identicalDates(options.ifModifiedSince, document.lastModified)) {
    return "not_modified";
  }
  return document;
}
async function figmaImagesQuery(options, nodes, cache) {
  const uri = "https://api.figma.com/v1/images/" + options.file;
  const maxLength = 2048 - uri.length;
  const svgOptions = options.svgOptions || {};
  const query = (ids2) => {
    return new Promise((resolve, reject) => {
      const params = new URLSearchParams({
        ids: ids2.join(","),
        format: "svg"
      });
      if (options.version) {
        params.set("version", options.version);
      }
      params.set(
        "svg_include_id",
        svgOptions.includeID ? "true" : "false"
      );
      params.set(
        "svg_simplify_stroke",
        svgOptions.simplifyStroke ? "true" : "false"
      );
      params.set(
        "use_absolute_bounds",
        svgOptions.useAbsoluteBounds ? "true" : "false"
      );
      sendAPIQuery(
        {
          uri,
          params,
          headers: {
            "X-FIGMA-TOKEN": options.token
          }
        },
        cache
      ).then((data) => {
        if (typeof data === "number") {
          reject(data);
          return;
        }
        let parsedData;
        try {
          parsedData = JSON.parse(data);
        } catch {
          reject("Bad API response");
          return;
        }
        resolve(parsedData);
      }).catch(reject);
    });
  };
  let ids = [];
  let idsLength = 0;
  const allKeys = Object.keys(nodes.icons);
  const queue = [];
  for (let i = 0; i < allKeys.length; i++) {
    const id = allKeys[i];
    ids.push(id);
    idsLength += id.length + 1;
    if (idsLength >= maxLength) {
      queue.push(ids.slice(0));
      ids = [];
      idsLength = 0;
    }
  }
  if (idsLength) {
    queue.push(ids.slice(0));
  }
  const queryParams = {
    // Params
    total: queue.length,
    callback: (index) => query(queue[index]),
    // Payload to identify failed items in onfail callback
    function: "figmaImagesQuery",
    payload: queue
  };
  const results = await runConcurrentQueries(queryParams);
  let found = 0;
  results.forEach((data) => {
    if (!data) {
      return;
    }
    const images = data.images;
    for (const id in images) {
      const node = nodes.icons[id];
      const target = images[id];
      if (node && target) {
        node.url = target;
        found++;
      }
    }
  });
  if (!found) {
    throw new Error("No valid icon layers were found");
  }
  nodes.generatedIconsCount = found;
  return nodes;
}
async function figmaDownloadImages(nodes, cache) {
  const icons = nodes.icons;
  const ids = Object.keys(icons);
  let count = 0;
  const filtered = [];
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const item = icons[id];
    if (item.url) {
      filtered.push(item);
    }
  }
  const params = {
    // Params
    total: filtered.length,
    callback: (index) => {
      return new Promise((resolve, reject) => {
        const item = filtered[index];
        sendAPIQuery(
          {
            uri: item.url
          },
          cache
        ).then((data) => {
          if (typeof data === "string") {
            count++;
            item.content = data;
            resolve(void 0);
          } else {
            reject(data);
          }
        }).catch(reject);
      });
    },
    // Payload to identify failed items in onfail callback
    function: "figmaDownloadImages",
    payload: filtered
  };
  await runConcurrentQueries(params);
  if (!count) {
    throw new Error("Error retrieving images");
  }
  nodes.downloadedIconsCount = count;
  return nodes;
}

export { figmaDownloadImages, figmaFilesQuery, figmaImagesQuery };
