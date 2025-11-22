import extract from 'extract-zip';
import { promises } from 'fs';

async function unzip(source, path) {
  const dir = await promises.realpath(path);
  await extract(source, {
    dir
  });
}

export { unzip };
