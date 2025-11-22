import { x } from 'tar';

async function untar(file, path) {
  await x({
    file,
    C: path
  });
}

export { untar };
