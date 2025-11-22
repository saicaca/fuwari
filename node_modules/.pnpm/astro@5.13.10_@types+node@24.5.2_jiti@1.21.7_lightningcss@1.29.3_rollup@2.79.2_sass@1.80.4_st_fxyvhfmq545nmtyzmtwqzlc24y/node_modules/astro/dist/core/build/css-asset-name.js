import crypto from "node:crypto";
import npath from "node:path";
import { fileURLToPath } from "node:url";
import { viteID } from "../util.js";
import { normalizePath } from "../viteUtils.js";
import { getTopLevelPageModuleInfos } from "./graph.js";
const confusingBaseNames = ["404", "500"];
function shortHashedName(settings) {
  return function(id, ctx) {
    const parents = getTopLevelPageModuleInfos(id, ctx);
    return createNameHash(
      getFirstParentId(parents),
      parents.map((page) => page.id),
      settings
    );
  };
}
function createNameHash(baseId, hashIds, settings) {
  const baseName = baseId ? prettifyBaseName(npath.parse(baseId).name) : "index";
  const hash = crypto.createHash("sha256");
  const root = fileURLToPath(settings.config.root);
  for (const id of hashIds) {
    const relativePath = npath.relative(root, id);
    hash.update(normalizePath(relativePath), "utf-8");
  }
  const h = hash.digest("hex").slice(0, 8);
  const proposedName = baseName + "." + h;
  return proposedName;
}
function createSlugger(settings) {
  const pagesDir = viteID(new URL("./pages", settings.config.srcDir));
  const indexPage = viteID(new URL("./pages/index", settings.config.srcDir));
  const map = /* @__PURE__ */ new Map();
  const sep = "-";
  return function(id, ctx) {
    const parents = Array.from(getTopLevelPageModuleInfos(id, ctx));
    const allParentsKey = parents.map((page) => page.id).sort().join("-");
    const firstParentId = getFirstParentId(parents) || indexPage;
    let dir = firstParentId;
    let key = "";
    let i = 0;
    while (i < 2) {
      if (dir === pagesDir) {
        break;
      }
      const name2 = prettifyBaseName(npath.parse(npath.basename(dir)).name);
      key = key.length ? name2 + sep + key : name2;
      dir = npath.dirname(dir);
      i++;
    }
    let name = key;
    if (!map.has(key)) {
      map.set(key, /* @__PURE__ */ new Map([[allParentsKey, 0]]));
    } else {
      const inner = map.get(key);
      if (inner.has(allParentsKey)) {
        const num = inner.get(allParentsKey);
        if (num > 0) {
          name = name + sep + num;
        }
      } else {
        const num = inner.size;
        inner.set(allParentsKey, num);
        name = name + sep + num;
      }
    }
    return name;
  };
}
function getFirstParentId(parents) {
  for (const parent of parents) {
    const id = parent.id;
    const baseName = npath.parse(id).name;
    if (!confusingBaseNames.includes(baseName)) {
      return id;
    }
  }
  return parents[0]?.id;
}
const charsToReplaceRe = /[.[\]]/g;
const underscoresRe = /_+/g;
function prettifyBaseName(str) {
  return str.replace(charsToReplaceRe, "_").replace(underscoresRe, "_");
}
export {
  createNameHash,
  createSlugger,
  shortHashedName
};
