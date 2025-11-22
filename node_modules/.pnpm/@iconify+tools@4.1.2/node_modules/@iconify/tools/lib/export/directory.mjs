import { promises } from 'fs';
import { prepareDirectoryForExport } from './helpers/prepare.mjs';
import 'pathe';

async function exportToDirectory(iconSet, options) {
  const dir = await prepareDirectoryForExport(options);
  const storedFiles = /* @__PURE__ */ new Set();
  const customisations = options.autoHeight === false ? {
    height: "1em"
  } : {
    width: "auto",
    height: "auto"
  };
  const store = async (name, target) => {
    const svg = iconSet.toString(name, customisations);
    if (!svg) {
      return;
    }
    await promises.writeFile(target, svg, "utf8");
    storedFiles.add(target);
    if (options.log) {
      console.log(`Saved ${target} (${svg.length} bytes)`);
    }
  };
  if (options.includeChars) {
    const chars = iconSet.chars();
    for (const char in chars) {
      const name = chars[char];
      await store(name, `${dir}/${char}.svg`);
    }
  }
  await iconSet.forEach(async (name, type) => {
    if (type === "alias" && options.includeAliases === false) {
      return;
    }
    await store(name, `${dir}/${name}.svg`);
  });
  return Array.from(storedFiles);
}

export { exportToDirectory };
