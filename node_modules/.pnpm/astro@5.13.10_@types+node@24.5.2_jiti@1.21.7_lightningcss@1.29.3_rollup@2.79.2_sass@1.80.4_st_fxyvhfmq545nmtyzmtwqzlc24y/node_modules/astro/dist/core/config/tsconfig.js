import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  find,
  parse,
  TSConfckParseError,
  toJson
} from "tsconfck";
const defaultTSConfig = { extends: "astro/tsconfigs/base" };
const presets = /* @__PURE__ */ new Map([
  [
    "vue",
    // Settings needed for template intellisense when using Volar
    {
      compilerOptions: {
        jsx: "preserve"
      }
    }
  ],
  [
    "react",
    // Default TypeScript settings, but we need to redefine them in case the users changed them previously
    {
      compilerOptions: {
        jsx: "react-jsx",
        jsxImportSource: "react"
      }
    }
  ],
  [
    "preact",
    // https://preactjs.com/guide/v10/typescript/#typescript-configuration
    {
      compilerOptions: {
        jsx: "react-jsx",
        jsxImportSource: "preact"
      }
    }
  ],
  [
    "solid-js",
    // https://www.solidjs.com/guides/typescript#configuring-typescript
    {
      compilerOptions: {
        jsx: "preserve",
        jsxImportSource: "solid-js"
      }
    }
  ]
]);
async function loadTSConfig(root, findUp = false) {
  const safeCwd = root ?? process.cwd();
  const [jsconfig, tsconfig] = await Promise.all(
    ["jsconfig.json", "tsconfig.json"].map(
      (configName) => (
        // `tsconfck` expects its first argument to be a file path, not a directory path, so we'll fake one
        find(join(safeCwd, "./dummy.txt"), {
          root: findUp ? void 0 : root,
          configName
        })
      )
    )
  );
  if (tsconfig) {
    const parsedConfig = await safeParse(tsconfig, { root });
    if (typeof parsedConfig === "string") {
      return parsedConfig;
    }
    const rawConfig = await readFile(tsconfig, "utf-8").then(toJson).then((content) => JSON.parse(content));
    return { ...parsedConfig, rawConfig };
  }
  if (jsconfig) {
    const parsedConfig = await safeParse(jsconfig, { root });
    if (typeof parsedConfig === "string") {
      return parsedConfig;
    }
    const rawConfig = await readFile(jsconfig, "utf-8").then(toJson).then((content) => JSON.parse(content));
    return { ...parsedConfig, rawConfig };
  }
  return "missing-config";
}
async function safeParse(tsconfigPath, options = {}) {
  try {
    const parseResult = await parse(tsconfigPath, options);
    if (parseResult.tsconfig == null) {
      return "missing-config";
    }
    return parseResult;
  } catch (e) {
    if (e instanceof TSConfckParseError) {
      return "invalid-config";
    }
    return "unknown-error";
  }
}
function updateTSConfigForFramework(target, framework) {
  if (!presets.has(framework)) {
    return target;
  }
  return deepMergeObjects(target, presets.get(framework));
}
function deepMergeObjects(a, b) {
  const merged = { ...a };
  for (const key in b) {
    const value = b[key];
    if (a[key] == null) {
      merged[key] = value;
      continue;
    }
    if (typeof a[key] === "object" && typeof value === "object") {
      merged[key] = deepMergeObjects(a[key], value);
      continue;
    }
    merged[key] = value;
  }
  return merged;
}
export {
  defaultTSConfig,
  loadTSConfig,
  presets,
  updateTSConfigForFramework
};
