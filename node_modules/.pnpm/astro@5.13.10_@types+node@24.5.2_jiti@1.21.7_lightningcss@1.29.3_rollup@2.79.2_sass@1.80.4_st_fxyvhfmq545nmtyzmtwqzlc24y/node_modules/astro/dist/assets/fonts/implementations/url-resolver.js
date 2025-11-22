import { fileExtension, joinPaths, prependForwardSlash } from "../../../core/path.js";
import { getAssetsPrefix } from "../../utils/getAssetsPrefix.js";
function createDevUrlResolver({ base }) {
  let resolved = false;
  return {
    resolve(hash) {
      resolved ||= true;
      return prependForwardSlash(joinPaths(base, hash));
    },
    getCspResources() {
      return resolved ? ["'self'"] : [];
    }
  };
}
function createBuildUrlResolver({
  base,
  assetsPrefix
}) {
  const resources = /* @__PURE__ */ new Set();
  return {
    resolve(hash) {
      const prefix = assetsPrefix ? getAssetsPrefix(fileExtension(hash), assetsPrefix) : void 0;
      if (prefix) {
        resources.add(prefix);
        return joinPaths(prefix, base, hash);
      }
      resources.add("'self'");
      return prependForwardSlash(joinPaths(base, hash));
    },
    getCspResources() {
      return Array.from(resources);
    }
  };
}
export {
  createBuildUrlResolver,
  createDevUrlResolver
};
