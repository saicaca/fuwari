'use strict';

const fs = require('fs');
const pathe = require('pathe');

function normalizeDir(dir) {
  dir = pathe.normalize(dir);
  if (dir.slice(-1) === "/") {
    dir = dir.slice(0, -1);
  }
  return dir;
}
async function prepareDirectoryForExport(options) {
  const dir = normalizeDir(options.target);
  if (options.cleanup) {
    try {
      await fs.promises.rm(dir, {
        recursive: true,
        force: true
      });
    } catch (err) {
    }
  }
  try {
    await fs.promises.mkdir(dir, {
      recursive: true
    });
  } catch (err) {
  }
  return dir;
}

exports.normalizeDir = normalizeDir;
exports.prepareDirectoryForExport = prepareDirectoryForExport;
