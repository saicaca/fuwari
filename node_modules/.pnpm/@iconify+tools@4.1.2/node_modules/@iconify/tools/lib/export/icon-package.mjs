import { promises } from 'fs';
import { prepareDirectoryForExport } from './helpers/prepare.mjs';
import { writeJSONFile } from '../misc/write-json.mjs';
import { exportCustomFiles } from './helpers/custom-files.mjs';
import 'pathe';

const defaultTypesContent = `import type { IconifyIcon } from '@iconify/types';
declare const data: IconifyIcon;
export default data;
`;
async function exportIconPackage(iconSet, options) {
  const files = /* @__PURE__ */ new Set();
  const esm = options.module !== false;
  const dir = await prepareDirectoryForExport(options);
  const typesContent = options.typesContent || defaultTypesContent;
  await iconSet.forEach(async (name2) => {
    const data = iconSet.resolve(name2, false);
    if (!data) {
      return;
    }
    const typesFilename = name2 + ".d.ts";
    await promises.writeFile(`${dir}/${typesFilename}`, typesContent, "utf8");
    files.add(typesFilename);
    let content = `const data = ` + JSON.stringify(data, null, "	") + ";\n";
    if (!esm) {
      content += "exports.__esModule = true;\nexports.default = data;\n";
    } else {
      content += "export default data;\n";
    }
    const contentFilename = name2 + ".js";
    await promises.writeFile(`${dir}/${contentFilename}`, content, "utf8");
    files.add(contentFilename);
  });
  await exportCustomFiles(dir, options, files);
  const info = iconSet.info;
  const { name, description, version, dependencies, ...customPackageProps } = options.package || {};
  const packageJSON = {
    name: name || (esm ? `@iconify-icons/${iconSet.prefix}` : `@iconify/icons-${iconSet.prefix}`),
    description: description || `Iconify icon components for ${info ? info.name : iconSet.prefix}`,
    version,
    type: esm ? "module" : void 0,
    iconSetInfo: info,
    ...customPackageProps,
    dependencies: dependencies || {
      "@iconify/types": "*"
      // '^' + (await getTypesVersion()),
    }
  };
  await writeJSONFile(dir + "/package.json", packageJSON);
  files.add("package.json");
  return Array.from(files);
}

export { exportIconPackage };
