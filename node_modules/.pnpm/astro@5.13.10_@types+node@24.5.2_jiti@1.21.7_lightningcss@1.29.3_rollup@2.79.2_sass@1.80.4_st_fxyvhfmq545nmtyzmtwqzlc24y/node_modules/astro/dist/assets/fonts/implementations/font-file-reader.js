import { readFileSync } from "node:fs";
import { fontace } from "fontace";
function createFontaceFontFileReader({
  errorHandler
}) {
  return {
    extract({ family, url }) {
      try {
        const data = fontace(readFileSync(url));
        return {
          weight: data.weight,
          style: data.style
        };
      } catch (cause) {
        throw errorHandler.handle({
          type: "cannot-extract-data",
          data: { family, url },
          cause
        });
      }
    }
  };
}
export {
  createFontaceFontFileReader
};
