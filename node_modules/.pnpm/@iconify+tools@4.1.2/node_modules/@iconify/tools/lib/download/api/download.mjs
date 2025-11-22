import axios from 'axios';
import { writeFile } from 'fs/promises';
import { fetchCallbacks, axiosConfig } from './config.mjs';

async function downloadFile(query, target) {
  const params = query.params ? query.params.toString() : "";
  const url = query.uri + (params ? "?" + params : "");
  const headers = query.headers;
  fetchCallbacks.onStart?.(url, query);
  const response = await axios.get(url, {
    ...axiosConfig,
    headers,
    responseType: "arraybuffer"
  });
  if (response.status !== 200) {
    fetchCallbacks.onError?.(url, query, response.status);
    throw new Error(`Error downloading ${url}: ${response.status}`);
  }
  const data = response.data;
  fetchCallbacks.onSuccess?.(url, query);
  await writeFile(target, Buffer.from(data));
}

export { downloadFile };
