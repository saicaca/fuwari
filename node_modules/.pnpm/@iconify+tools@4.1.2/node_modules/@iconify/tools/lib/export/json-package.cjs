'use strict';

const fs = require('fs');
const defaults = require('@iconify/utils/lib/icon/defaults');
const export_helpers_prepare = require('./helpers/prepare.cjs');
const misc_writeJson = require('../misc/write-json.cjs');
const export_helpers_customFiles = require('./helpers/custom-files.cjs');
require('pathe');

const exportTypes = {
  icons: "IconifyJSON",
  info: "IconifyInfo",
  metadata: "IconifyMetaData",
  chars: "IconifyChars"
};
const iconsKeys = ["aliases", "lastModified"].concat(
  Object.keys(defaults.defaultIconDimensions)
);
const metadataKeys = [
  "categories",
  "themes",
  "prefixes",
  "suffixes"
];
async function exportJSONPackage(iconSet, options) {
  const files = /* @__PURE__ */ new Set();
  const dir = await export_helpers_prepare.prepareDirectoryForExport(options);
  const exportedJSON = iconSet.export(true);
  const icons = {
    prefix: exportedJSON.prefix,
    icons: exportedJSON.icons
  };
  iconsKeys.forEach((attr) => {
    if (exportedJSON[attr] !== void 0) {
      icons[attr] = exportedJSON[attr];
    }
  });
  const metadata = {};
  let hasMetadata = false;
  metadataKeys.forEach((attr) => {
    if (exportedJSON[attr]) {
      metadata[attr] = exportedJSON[attr];
      hasMetadata = true;
    }
  });
  const info = exportedJSON.info ? {
    prefix: iconSet.prefix,
    ...exportedJSON.info
  } : void 0;
  const contents = {
    icons,
    info,
    metadata: hasMetadata ? metadata : void 0,
    chars: exportedJSON.chars
  };
  const { name, description, version, dependencies, ...customPackageProps } = options.package || {};
  const packageJSONIconSet = {};
  const packageJSONExports = {
    "./*": "./*",
    ".": {
      types: "./index.d.ts",
      require: "./index.js",
      import: "./index.mjs"
    }
  };
  const packageJSON = {
    name: name || `@iconify-json/${iconSet.prefix}`,
    description: description || `${info ? info.name : iconSet.prefix} icon set in Iconify JSON format`,
    version,
    iconSetVersion: info?.version,
    main: "index.js",
    module: "index.mjs",
    types: "index.d.ts",
    ...customPackageProps,
    exports: packageJSONExports,
    iconSet: packageJSONIconSet,
    dependencies: dependencies || {
      "@iconify/types": "*"
      // '^' + (await getTypesVersion()),
    }
  };
  const dtsContent = [];
  const cjsImports = [];
  const cjsExports = [];
  const mjsImports = [];
  const mjsConsts = [];
  const mjsExports = [];
  for (const key in contents) {
    const attr = key;
    const data = contents[attr];
    const type = exportTypes[attr];
    const jsonFilename = attr + ".json";
    const relativeFile = `./${jsonFilename}`;
    dtsContent.push(`export declare const ${attr}: ${type};`);
    cjsExports.push(`exports.${attr} = ${attr};`);
    mjsExports.push(attr);
    if (data !== void 0) {
      await misc_writeJson.writeJSONFile(`${dir}/${jsonFilename}`, data);
      cjsImports.push(`const ${attr} = require('${relativeFile}');`);
      mjsImports.push(
        `import ${attr} from '${relativeFile}' with { type: 'json' };`
      );
      packageJSONIconSet[attr] = attr + ".json";
      packageJSONExports[relativeFile] = relativeFile;
    } else {
      await misc_writeJson.writeJSONFile(`${dir}/${jsonFilename}`, {});
      cjsImports.push(`const ${attr} = {};`);
      mjsConsts.push(`const ${attr} = {};`);
    }
    files.add(jsonFilename);
  }
  const cjsContent = cjsImports.concat([""], cjsExports);
  await fs.promises.writeFile(dir + "/index.js", cjsContent.join("\n") + "\n", "utf8");
  files.add("index.js");
  const mjsContent = mjsImports.concat([""], mjsConsts, [
    `export { ${mjsExports.join(", ")} };`
  ]);
  await fs.promises.writeFile(
    dir + "/index.mjs",
    mjsContent.join("\n") + "\n",
    "utf8"
  );
  files.add("index.mjs");
  const usedTypes = Object.values(exportTypes);
  const typesData = [
    `import type { ${usedTypes.join(", ")} } from '@iconify/types';`,
    "",
    `export { ${usedTypes.join(", ")} };`,
    ""
  ].concat(dtsContent);
  await fs.promises.writeFile(
    dir + "/index.d.ts",
    typesData.join("\n") + "\n",
    "utf8"
  );
  files.add("index.d.ts");
  await export_helpers_customFiles.exportCustomFiles(dir, options, files);
  options.customisePackage?.(packageJSON);
  await misc_writeJson.writeJSONFile(dir + "/package.json", packageJSON);
  files.add("package.json");
  return Array.from(files);
}

exports.exportJSONPackage = exportJSONPackage;
