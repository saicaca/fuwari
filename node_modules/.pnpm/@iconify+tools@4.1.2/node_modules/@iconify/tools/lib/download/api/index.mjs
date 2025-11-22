import axios from 'axios';
import { apiCacheKey, getAPICache, storeAPICache } from './cache.mjs';
import { fetchCallbacks, axiosConfig } from './config.mjs';
import 'fs';
import 'crypto';
import '../../misc/scan.mjs';

async function sendAPIQuery(query, cache) {
  const cacheKey = cache ? apiCacheKey(query) : "";
  if (cache) {
    const cached = await getAPICache(cache.dir, cacheKey);
    if (cached) {
      return cached;
    }
  }
  const result = await sendQuery(query);
  if (cache && typeof result !== "number") {
    try {
      await storeAPICache(cache, cacheKey, result);
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
  fetchCallbacks.onStart?.(url, query);
  function fail(value) {
    fetchCallbacks.onError?.(url, query, value);
    return value ?? 404;
  }
  try {
    const response = await axios.get(url, {
      ...axiosConfig,
      headers,
      responseType: "text"
    });
    if (response.status !== 200) {
      return fail(response.status);
    }
    if (typeof response.data !== "string") {
      return fail();
    }
    fetchCallbacks.onSuccess?.(url, query);
    return response.data;
  } catch (err) {
    return fail();
  }
}

export { sendAPIQuery };
