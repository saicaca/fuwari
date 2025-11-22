import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
const isValidIdentifierRe = /^[_$a-zA-Z][\w$]*$/;
function getPrivateEnv({
  fullEnv,
  viteConfig,
  useStatic
}) {
  let envPrefixes = ["PUBLIC_"];
  if (viteConfig.envPrefix) {
    envPrefixes = Array.isArray(viteConfig.envPrefix) ? viteConfig.envPrefix : [viteConfig.envPrefix];
  }
  const privateEnv = {};
  for (const key in fullEnv) {
    if (!isValidIdentifierRe.test(key) || envPrefixes.some((prefix) => key.startsWith(prefix))) {
      continue;
    }
    if (!useStatic && typeof process.env[key] !== "undefined") {
      let value = process.env[key];
      if (typeof value !== "string") {
        value = `${value}`;
      }
      if (value === "0" || value === "1" || value === "true" || value === "false") {
        privateEnv[key] = value;
      } else {
        privateEnv[key] = `process.env.${key}`;
      }
    } else {
      privateEnv[key] = JSON.stringify(fullEnv[key]);
    }
  }
  return privateEnv;
}
function getEnv({ mode, config, useStatic }) {
  const loaded = loadEnv(mode, config.vite.envDir ?? fileURLToPath(config.root), "");
  const privateEnv = getPrivateEnv({ fullEnv: loaded, viteConfig: config.vite, useStatic });
  return { loaded, privateEnv };
}
const createEnvLoader = (options) => {
  let { loaded, privateEnv } = getEnv(options);
  return {
    get: () => {
      ({ loaded, privateEnv } = getEnv(options));
      return loaded;
    },
    getPrivateEnv: () => privateEnv
  };
};
export {
  createEnvLoader
};
