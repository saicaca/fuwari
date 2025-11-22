import { isAbsolute } from "node:path";
import { cache } from "../utils.js";
function createCachedFontFetcher({
  storage,
  errorHandler,
  fetch,
  readFile
}) {
  return {
    async fetch({ hash, url, init }) {
      return await cache(storage, hash, async () => {
        try {
          if (isAbsolute(url)) {
            return await readFile(url);
          }
          const response = await fetch(url, init ?? void 0);
          if (!response.ok) {
            throw new Error(`Response was not successful, received status code ${response.status}`);
          }
          return Buffer.from(await response.arrayBuffer());
        } catch (cause) {
          throw errorHandler.handle({
            type: "cannot-fetch-font-file",
            data: { url },
            cause
          });
        }
      });
    }
  };
}
export {
  createCachedFontFetcher
};
