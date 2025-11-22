'use strict';

const fs = require('fs');
const export_helpers_prepare = require('../../export/helpers/prepare.cjs');
const download_api_download = require('../api/download.cjs');
const download_helpers_untar = require('../helpers/untar.cjs');
const download_npm_version = require('./version.cjs');
require('pathe');
require('axios');
require('fs/promises');
require('../api/config.cjs');
require('tar');
require('../../misc/exec.cjs');
require('child_process');

async function downloadNPMPackage(options) {
  const rootDir = options.target = export_helpers_prepare.normalizeDir(options.target);
  const contentsDir = rootDir + "/package";
  const versionInfo = await download_npm_version.getNPMVersion(options);
  const version = versionInfo.version;
  const ifModifiedSince = options.ifModifiedSince;
  if (ifModifiedSince) {
    try {
      let expectedVersion;
      if (typeof ifModifiedSince === "object") {
        if (ifModifiedSince.downloadType === "npm" && ifModifiedSince.rootDir === rootDir && ifModifiedSince.contentsDir === contentsDir) {
          expectedVersion = ifModifiedSince.version;
        } else {
          expectedVersion = null;
        }
      } else {
        expectedVersion = ifModifiedSince === true ? await download_npm_version.getPackageVersion(contentsDir) : ifModifiedSince;
      }
      if (version === expectedVersion) {
        return "not_modified";
      }
    } catch (err) {
      options.cleanup = true;
    }
  }
  const archiveURL = versionInfo.file;
  if (!archiveURL) {
    throw new Error(
      `NPM registry did not provide link to package archive.`
    );
  }
  const archiveTarget = rootDir + "/" + version + ".tgz";
  await export_helpers_prepare.prepareDirectoryForExport(options);
  let archiveExists = false;
  try {
    const stat = await fs.promises.stat(archiveTarget);
    archiveExists = stat.isFile();
  } catch (err) {
  }
  if (!archiveExists) {
    if (options.log) {
      console.log(`Downloading ${archiveURL}`);
    }
    await download_api_download.downloadFile(
      {
        uri: archiveURL,
        headers: {
          Accept: "application/tar+gzip"
        }
      },
      archiveTarget
    );
  }
  await export_helpers_prepare.prepareDirectoryForExport({
    target: contentsDir,
    cleanup: true
  });
  if (options.log) {
    console.log(`Unpacking ${archiveTarget}`);
  }
  await download_helpers_untar.untar(archiveTarget, rootDir);
  return {
    downloadType: "npm",
    rootDir,
    contentsDir,
    version
  };
}

exports.downloadNPMPackage = downloadNPMPackage;
