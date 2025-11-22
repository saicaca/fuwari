'use strict';

const fs = require('fs');
const export_helpers_prepare = require('../../export/helpers/prepare.cjs');
const download_github_hash = require('./hash.cjs');
const download_api_download = require('../api/download.cjs');
const download_helpers_unzip = require('../helpers/unzip.cjs');
require('pathe');
require('../api/index.cjs');
require('axios');
require('../api/cache.cjs');
require('crypto');
require('../../misc/scan.cjs');
require('../api/config.cjs');
require('fs/promises');
require('extract-zip');

async function findMatchingDirs(rootDir, hash) {
  const matches = [];
  const files = await fs.promises.readdir(rootDir);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const lastChunk = file.split("-").pop();
    if (lastChunk.length < 4 || lastChunk !== hash.slice(0, lastChunk.length)) {
      continue;
    }
    const stat = await fs.promises.stat(rootDir + "/" + file);
    if (stat.isDirectory()) {
      matches.push(file);
    }
  }
  return matches;
}
async function downloadGitHubRepo(options) {
  const hash = await download_github_hash.getGitHubRepoHash(options);
  const ifModifiedSince = options.ifModifiedSince;
  if (ifModifiedSince) {
    const expectedHash = typeof ifModifiedSince === "string" ? ifModifiedSince : ifModifiedSince.downloadType === "github" ? ifModifiedSince.hash : null;
    if (hash === expectedHash) {
      return "not_modified";
    }
  }
  options.target = options.target.replace("{hash}", hash);
  const rootDir = options.target = await export_helpers_prepare.prepareDirectoryForExport(options);
  const archiveTarget = rootDir + "/" + hash + ".zip";
  let exists = false;
  try {
    const stat = await fs.promises.stat(archiveTarget);
    exists = stat.isFile();
  } catch (err) {
  }
  if (!exists) {
    const uri = `https://api.github.com/repos/${options.user}/${options.repo}/zipball/${hash}`;
    await download_api_download.downloadFile(
      {
        uri,
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: "token " + options.token
        }
      },
      archiveTarget
    );
  }
  const files = await fs.promises.readdir(rootDir);
  const hashSearch = "-" + hash;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file === hash + ".zip") {
      continue;
    }
    const filename = rootDir + "/" + files[i];
    const stat = await fs.promises.lstat(filename);
    const isDir = stat.isDirectory();
    if (
      // Remove symbolic links
      stat.isSymbolicLink() || // Remove if directory matches hash to avoid errors extracting zip
      isDir && filename.slice(0 - hashSearch.length) === hashSearch || // Remove if directory and cleanupOldDirectories is not disabled
      isDir && options.cleanupOldDirectories !== false || // Remove if file and cleanupOldFiles is enabled
      !isDir && options.cleanupOldFiles
    ) {
      try {
        await fs.promises.rm(filename, {
          force: true,
          recursive: true
        });
      } catch (err) {
      }
    }
  }
  await download_helpers_unzip.unzip(archiveTarget, rootDir);
  const matchingDirs = await findMatchingDirs(rootDir, hash);
  if (matchingDirs.length !== 1) {
    throw new Error(`Error unpacking ${hash}.zip`);
  }
  const contentsDir = rootDir + "/" + matchingDirs[0];
  return {
    downloadType: "github",
    rootDir,
    contentsDir,
    hash
  };
}

exports.downloadGitHubRepo = downloadGitHubRepo;
