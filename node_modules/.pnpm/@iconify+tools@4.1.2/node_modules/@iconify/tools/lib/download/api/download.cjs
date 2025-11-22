'use strict';

const axios = require('axios');
const promises = require('fs/promises');
const download_api_config = require('./config.cjs');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e.default : e; }

const axios__default = /*#__PURE__*/_interopDefaultCompat(axios);

async function downloadFile(query, target) {
  const params = query.params ? query.params.toString() : "";
  const url = query.uri + (params ? "?" + params : "");
  const headers = query.headers;
  download_api_config.fetchCallbacks.onStart?.(url, query);
  const response = await axios__default.get(url, {
    ...download_api_config.axiosConfig,
    headers,
    responseType: "arraybuffer"
  });
  if (response.status !== 200) {
    download_api_config.fetchCallbacks.onError?.(url, query, response.status);
    throw new Error(`Error downloading ${url}: ${response.status}`);
  }
  const data = response.data;
  download_api_config.fetchCallbacks.onSuccess?.(url, query);
  await promises.writeFile(target, Buffer.from(data));
}

exports.downloadFile = downloadFile;
