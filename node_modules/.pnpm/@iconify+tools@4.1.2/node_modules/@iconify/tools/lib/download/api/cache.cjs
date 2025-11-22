'use strict';

const fs = require('fs');
const crypto = require('crypto');
const misc_scan = require('../../misc/scan.cjs');

const cacheVersion = 1;
const storedFiles = /* @__PURE__ */ Object.create(null);
function apiCacheKey(query) {
  const item = JSON.stringify({
    uri: query.uri,
    params: query.params?.toString(),
    headers: query.headers
  });
  return crypto.createHash("md5").update(item).digest("hex");
}
async function storeAPICache(options, key, data) {
  const expires = Date.now() + options.ttl * 1e3;
  const filename = options.dir + "/" + key + "." + expires.toString() + ".json";
  if (!storedFiles[options.dir]) {
    await getStoredFiles(options.dir);
  }
  const content = {
    version: cacheVersion,
    expires,
    data
  };
  await fs.promises.writeFile(filename, JSON.stringify(content, null, 4), "utf8");
  storedFiles[options.dir][key] = {
    filename,
    expires
  };
}
async function getAPICache(dir, key) {
  if (!storedFiles[dir]) {
    await getStoredFiles(dir);
  }
  const item = storedFiles[dir][key];
  if (!item) {
    return null;
  }
  const time = Date.now();
  try {
    const content = JSON.parse(
      await fs.promises.readFile(item.filename, "utf8")
    );
    return content.version === cacheVersion && content.expires > time ? content.data : null;
  } catch (err) {
    return null;
  }
}
function clearAPICache(dir) {
  return getStoredFiles(dir, true);
}
async function getStoredFiles(dir, clear = false) {
  const storage = !clear && storedFiles[dir] || /* @__PURE__ */ Object.create(null);
  const time = Date.now();
  storedFiles[dir] = storage;
  try {
    await fs.promises.mkdir(dir, {
      recursive: true
    });
  } catch (err) {
  }
  await misc_scan.scanDirectory(
    dir,
    async (ext, file, subdir, path) => {
      if (ext !== ".json") {
        return false;
      }
      const filename = path + subdir + file + ext;
      const parts = file.split(".");
      const expires = parseInt(parts.pop());
      if (clear || expires < time || parts.length !== 1) {
        await fs.promises.unlink(filename);
        return false;
      }
      const cacheKey = parts[0];
      storage[cacheKey] = {
        filename,
        expires
      };
    },
    false
  );
}

exports.apiCacheKey = apiCacheKey;
exports.clearAPICache = clearAPICache;
exports.getAPICache = getAPICache;
exports.storeAPICache = storeAPICache;
