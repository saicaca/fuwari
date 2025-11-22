'use strict';

const fs = require('fs');
const export_helpers_prepare = require('../export/helpers/prepare.cjs');
const misc_scan = require('./scan.cjs');
require('pathe');

const textFileExtensions = [
  "json",
  "ts",
  "js",
  "mjs",
  "cjs",
  "jsx",
  "tsx",
  "vue",
  "svelte",
  "svg",
  "txt",
  "md"
];
async function compareDirectories(dir1, dir2, options) {
  dir1 = export_helpers_prepare.normalizeDir(dir1);
  dir2 = export_helpers_prepare.normalizeDir(dir2);
  const files1 = await misc_scan.scanDirectory(dir1);
  const files2 = await misc_scan.scanDirectory(dir2);
  if (files1.length !== files2.length) {
    return false;
  }
  options = options || {};
  const ignoreNewLine = options.ignoreNewLine !== false;
  const ignoreVersions = options.ignoreVersions !== false;
  const textExtensions = new Set(
    (options.textExtensions || []).concat(textFileExtensions)
  );
  for (let i = 0; i < files1.length; i++) {
    const file = files1[i];
    if (!files2.includes(file)) {
      return false;
    }
    const ext = file.split(".").pop().toLowerCase();
    const isText = textExtensions.has(ext);
    if (!isText) {
      const content12 = await fs.promises.readFile(dir1 + "/" + file);
      const content22 = await fs.promises.readFile(dir2 + "/" + file);
      if (Buffer.compare(content12, content22) !== 0) {
        return false;
      }
      continue;
    }
    let content1 = await fs.promises.readFile(dir1 + "/" + file, "utf8");
    let content2 = await fs.promises.readFile(dir2 + "/" + file, "utf8");
    if (content1 === content2) {
      continue;
    }
    if (ignoreNewLine) {
      content1 = content1.replace(/\s+\n/g, "\n").trimEnd();
      content2 = content2.replace(/\s+\n/g, "\n").trimEnd();
    }
    if (ignoreVersions && file.split("/").pop() === "package.json") {
      const data1 = JSON.parse(content1);
      const data2 = JSON.parse(content2);
      delete data1.version;
      delete data2.version;
      content1 = JSON.stringify(data1);
      content2 = JSON.stringify(data2);
    }
    if (content1 !== content2) {
      return false;
    }
  }
  return true;
}

exports.compareDirectories = compareDirectories;
