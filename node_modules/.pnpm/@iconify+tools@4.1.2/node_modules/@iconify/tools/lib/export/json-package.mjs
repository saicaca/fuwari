import { promises } from 'fs';
import { defaultIconDimensions } from '@iconify/utils/lib/icon/defaults';
import { prepareDirectoryForExport } from './helpers/prepare.mjs';
import { writeJSONFile } from '../misc/write-json.mjs';
import { exportCustomFiles } from './helpers/custom-files.mjs';
import 'pathe';

const exportTypes = {
  icons: "IconifyJSON",
  info: "IconifyInfo",
  metadata: "IconifyMetaData",
  chars: "IconifyChars"
};
const iconsKeys = ["aliases", "lastModified"].concat(
  Object.keys(defaultIconDimensions)
);
const metadataKeys = [
  "categories",
  "themes",
  "prefixes",
  "suffixes"
];
async function exportJSONPackage(iconSet, options) {
  const files = /* @__PURE__ */ new Set();
  const dir = await prepareDirectoryForExport(options);
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
      await writeJSONFile(`${dir}/${jsonFilename}`, data);
      cjsImports.push(`const ${attr} = require('${relativeFile}');`);
      mjsImports.push(
        `import ${attr} from '${relativeFile}' with { type: 'json' };`
      );
      packageJSONIconSet[attr] = attr + ".json";
      packageJSONExports[relativeFile] = relativeFile;
    } else {
      await writeJSONFile(`${dir}/${jsonFilename}`, {});
      cjsImports.push(`const ${attr} = {};`);
      mjsConsts.push(`const ${attr} = {};`);
    }
    files.add(jsonFilename);
  }
  const cjsContent = cjsImports.concat([""], cjsExports);
  await promises.writeFile(dir + "/index.js", cjsContent.join("\n") + "\n", "utf8");
  files.add("index.js");
  const mjsContent = mjsImports.concat([""], mjsConsts, [
    `export { ${mjsExports.join(", ")} };`
  ]);
  await promises.writeFile(
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
  await promises.writeFile(
    dir + "/index.d.ts",
    typesData.join("\n") + "\n",
    "utf8"
  );
  files.add("index.d.ts");
  await exportCustomFiles(dir, options, files);
  options.customisePackage?.(packageJSON);
  await writeJSONFile(dir + "/package.json", packageJSON);
  files.add("package.json");
  return Array.from(files);
}

export { exportJSONPackage };
