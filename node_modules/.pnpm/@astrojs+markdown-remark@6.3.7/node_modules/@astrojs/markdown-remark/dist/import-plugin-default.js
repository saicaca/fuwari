import path from "node:path";
import { pathToFileURL } from "node:url";
import { resolve as importMetaResolve } from "import-meta-resolve";
let cwdUrlStr;
async function importPlugin(p) {
  try {
    const importResult2 = await import(
      /* @vite-ignore */
      p
    );
    return importResult2.default;
  } catch {
  }
  cwdUrlStr ??= pathToFileURL(path.join(process.cwd(), "package.json")).toString();
  const resolved = importMetaResolve(p, cwdUrlStr);
  const importResult = await import(
    /* @vite-ignore */
    resolved
  );
  return importResult.default;
}
export {
  importPlugin
};
