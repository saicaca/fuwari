import { promises } from 'fs';
import { normalize } from 'pathe';

function normalizeDir(dir) {
  dir = normalize(dir);
  if (dir.slice(-1) === "/") {
    dir = dir.slice(0, -1);
  }
  return dir;
}
async function prepareDirectoryForExport(options) {
  const dir = normalizeDir(options.target);
  if (options.cleanup) {
    try {
      await promises.rm(dir, {
        recursive: true,
        force: true
      });
    } catch (err) {
    }
  }
  try {
    await promises.mkdir(dir, {
      recursive: true
    });
  } catch (err) {
  }
  return dir;
}

export { normalizeDir, prepareDirectoryForExport };
