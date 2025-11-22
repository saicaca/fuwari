'use strict';

const axios = require('axios');
const download_api_cache = require('./cache.cjs');
const download_api_config = require('./config.cjs');
require('fs');
require('crypto');
require('../../misc/scan.cjs');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e.default : e; }

const axios__default = /*#__PURE__*/_interopDefaultCompat(axios);

async function sendAPIQuery(query, cache) {
  const cacheKey = cache ? download_api_cache.apiCacheKey(query) : "";
  if (cache) {
    const cached = await download_api_cache.getAPICache(cache.dir, cacheKey);
    if (cached) {
      return cached;
    }
  }
  const result = await sendQuery(query);
  if (cache && typeof result !== "number") {
    try {
      await download_api_cache.storeAPICache(cache, cacheKey, result);
    } catch (err) {
      console.error("Error writing API cache");
    }
  }
  return result;
}
async function sendQuery(query) {
  const params = query.params ? query.params.toString() : "";
  const url = query.uri + (params ? "?" + params : "");
  const headers = query.headers;
  download_api_config.fetchCallbacks.onStart?.(url, query);
  function fail(value) {
    download_api_config.fetchCallbacks.onError?.(url, query, value);
    return value ?? 404;
  }
  try {
    const response = await axios__default.get(url, {
      ...download_api_config.axiosConfig,
      headers,
      responseType: "text"
    });
    if (response.status !== 200) {
      return fail(response.status);
    }
    if (typeof response.data !== "string") {
      return fail();
    }
    download_api_config.fetchCallbacks.onSuccess?.(url, query);
    return response.data;
  } catch (err) {
    return fail();
  }
}

exports.sendAPIQuery = sendAPIQuery;
