'use strict';

const fs = require('fs');
const misc_writeJson = require('../../misc/write-json.cjs');

async function exportCustomFiles(dir, options, result) {
  const customFiles = options.customFiles || {};
  for (const filename in customFiles) {
    const content = customFiles[filename];
    if (content === null) {
      try {
        await fs.promises.unlink(dir + "/" + filename);
      } catch (err) {
      }
      continue;
    }
    if (typeof content === "string") {
      await fs.promises.writeFile(dir + "/" + filename, content, "utf8");
    } else if (typeof content === "object") {
      await misc_writeJson.writeJSONFile(dir + "/" + filename, content);
    }
    result?.add(filename);
  }
}

exports.exportCustomFiles = exportCustomFiles;
