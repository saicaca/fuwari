import { extname } from "node:path";
import { isFontType } from "../utils.js";
function createFontTypeExtractor({
  errorHandler
}) {
  return {
    extract(url) {
      const extension = extname(url).slice(1);
      if (!isFontType(extension)) {
        throw errorHandler.handle({
          type: "cannot-extract-font-type",
          data: { url },
          cause: `Unexpected extension, got "${extension}"`
        });
      }
      return extension;
    }
  };
}
export {
  createFontTypeExtractor
};
