import { readFileSync } from "node:fs";
function createLocalUrlProxyContentResolver({
  errorHandler
}) {
  return {
    resolve(url) {
      try {
        return url + readFileSync(url, "utf-8");
      } catch (cause) {
        throw errorHandler.handle({
          type: "unknown-fs-error",
          data: {},
          cause
        });
      }
    }
  };
}
function createRemoteUrlProxyContentResolver() {
  return {
    // Passthrough, the remote provider URL is enough
    resolve: (url) => url
  };
}
export {
  createLocalUrlProxyContentResolver,
  createRemoteUrlProxyContentResolver
};
