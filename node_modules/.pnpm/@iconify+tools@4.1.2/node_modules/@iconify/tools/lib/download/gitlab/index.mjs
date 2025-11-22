import { promises } from 'fs';
import { prepareDirectoryForExport } from '../../export/helpers/prepare.mjs';
import { getGitLabRepoHash } from './hash.mjs';
import { defaultGitLabBaseURI } from './types.mjs';
import { downloadFile } from '../api/download.mjs';
import { unzip } from '../helpers/unzip.mjs';
import 'pathe';
import '../api/index.mjs';
import 'axios';
import '../api/cache.mjs';
import 'crypto';
import '../../misc/scan.mjs';
import '../api/config.mjs';
import 'fs/promises';
import 'extract-zip';

async function findMatchingDirs(rootDir, hash) {
  const matches = [];
  const files = await promises.readdir(rootDir);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const lastChunk = file.split("-").pop();
    if (lastChunk.length < 4 || lastChunk !== hash.slice(0, lastChunk.length)) {
      continue;
    }
    const stat = await promises.stat(rootDir + "/" + file);
    if (stat.isDirectory()) {
      matches.push(file);
    }
  }
  return matches;
}
async function downloadGitLabRepo(options) {
  const hash = await getGitLabRepoHash(options);
  const ifModifiedSince = options.ifModifiedSince;
  if (ifModifiedSince) {
    const expectedHash = typeof ifModifiedSince === "string" ? ifModifiedSince : ifModifiedSince.downloadType === "gitlab" ? ifModifiedSince.hash : null;
    if (hash === expectedHash) {
      return "not_modified";
    }
  }
  options.target = options.target.replace("{hash}", hash);
  const rootDir = options.target = await prepareDirectoryForExport(options);
  const archiveTarget = rootDir + "/" + hash + ".zip";
  let exists = false;
  try {
    const stat = await promises.stat(archiveTarget);
    exists = stat.isFile();
  } catch (err) {
  }
  if (!exists) {
    const uri = `${options.uri || defaultGitLabBaseURI}/${options.project}/repository/archive.zip?sha=${hash}`;
    await downloadFile(
      {
        uri,
        headers: {
          Authorization: "token " + options.token
        }
      },
      archiveTarget
    );
  }
  const files = await promises.readdir(rootDir);
  const hashSearch = "-" + hash;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file === hash + ".zip") {
      continue;
    }
    const filename = rootDir + "/" + files[i];
    const stat = await promises.lstat(filename);
    const isDir = stat.isDirectory();
    if (
      // Remove symbolic links
      stat.isSymbolicLink() || // Remove if directory matches hash to avoid errors extracting zip
      isDir && filename.slice(0 - hashSearch.length) === hashSearch || // Remove if directory and cleanupOldDirectories is not disabled
      isDir && options.cleanupOldDirectories !== false || // Remove if file and cleanupOldFiles is enabled
      !isDir && options.cleanupOldFiles
    ) {
      try {
        await promises.rm(filename, {
          force: true,
          recursive: true
        });
      } catch (err) {
      }
    }
  }
  await unzip(archiveTarget, rootDir);
  const matchingDirs = await findMatchingDirs(rootDir, hash);
  if (matchingDirs.length !== 1) {
    throw new Error(`Error unpacking ${hash}.zip`);
  }
  const contentsDir = rootDir + "/" + matchingDirs[0];
  return {
    downloadType: "gitlab",
    rootDir,
    contentsDir,
    hash
  };
}

export { downloadGitLabRepo };
