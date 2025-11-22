import { promises } from 'fs';
import { normalizeDir, prepareDirectoryForExport } from '../../export/helpers/prepare.mjs';
import { downloadFile } from '../api/download.mjs';
import { untar } from '../helpers/untar.mjs';
import { getNPMVersion, getPackageVersion } from './version.mjs';
import 'pathe';
import 'axios';
import 'fs/promises';
import '../api/config.mjs';
import 'tar';
import '../../misc/exec.mjs';
import 'child_process';

async function downloadNPMPackage(options) {
  const rootDir = options.target = normalizeDir(options.target);
  const contentsDir = rootDir + "/package";
  const versionInfo = await getNPMVersion(options);
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
        expectedVersion = ifModifiedSince === true ? await getPackageVersion(contentsDir) : ifModifiedSince;
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
  await prepareDirectoryForExport(options);
  let archiveExists = false;
  try {
    const stat = await promises.stat(archiveTarget);
    archiveExists = stat.isFile();
  } catch (err) {
  }
  if (!archiveExists) {
    if (options.log) {
      console.log(`Downloading ${archiveURL}`);
    }
    await downloadFile(
      {
        uri: archiveURL,
        headers: {
          Accept: "application/tar+gzip"
        }
      },
      archiveTarget
    );
  }
  await prepareDirectoryForExport({
    target: contentsDir,
    cleanup: true
  });
  if (options.log) {
    console.log(`Unpacking ${archiveTarget}`);
  }
  await untar(archiveTarget, rootDir);
  return {
    downloadType: "npm",
    rootDir,
    contentsDir,
    version
  };
}

export { downloadNPMPackage };
