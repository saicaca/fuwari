import { fileURLToPath } from "node:url";
import { resolveEntrypoint } from "../utils.js";
function createRequireLocalProviderUrlResolver({
  root,
  intercept
}) {
  return {
    resolve(input) {
      const path = fileURLToPath(resolveEntrypoint(root, input));
      intercept?.(path);
      return path;
    }
  };
}
export {
  createRequireLocalProviderUrlResolver
};
