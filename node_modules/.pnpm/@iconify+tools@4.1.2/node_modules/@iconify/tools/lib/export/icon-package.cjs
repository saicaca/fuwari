'use strict';

const fs = require('fs');
const export_helpers_prepare = require('./helpers/prepare.cjs');
const misc_writeJson = require('../misc/write-json.cjs');
const export_helpers_customFiles = require('./helpers/custom-files.cjs');
require('pathe');

const defaultTypesContent = `import type { IconifyIcon } from '@iconify/types';
declare const data: IconifyIcon;
export default data;
`;
async function exportIconPackage(iconSet, options) {
  const files = /* @__PURE__ */ new Set();
  const esm = options.module !== false;
  const dir = await export_helpers_prepare.prepareDirectoryForExport(options);
  const typesContent = options.typesContent || defaultTypesContent;
  await iconSet.forEach(async (name2) => {
    const data = iconSet.resolve(name2, false);
    if (!data) {
      return;
    }
    const typesFilename = name2 + ".d.ts";
    await fs.promises.writeFile(`${dir}/${typesFilename}`, typesContent, "utf8");
    files.add(typesFilename);
    let content = `const data = ` + JSON.stringify(data, null, "	") + ";\n";
    if (!esm) {
      content += "exports.__esModule = true;\nexports.default = data;\n";
    } else {
      content += "export default data;\n";
    }
    const contentFilename = name2 + ".js";
    await fs.promises.writeFile(`${dir}/${contentFilename}`, content, "utf8");
    files.add(contentFilename);
  });
  await export_helpers_customFiles.exportCustomFiles(dir, options, files);
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
  await misc_writeJson.writeJSONFile(dir + "/package.json", packageJSON);
  files.add("package.json");
  return Array.from(files);
}

exports.exportIconPackage = exportIconPackage;
