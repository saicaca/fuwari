import { create } from './base';
import fs from 'fs';

export function openSync(filename, postscriptName) {
  let buffer = fs.readFileSync(filename);
  return create(buffer, postscriptName);
}

export async function open(filename, postscriptName, callback) {
  if (typeof postscriptName === 'function') {
    callback = postscriptName;
    postscriptName = null;
  }

  let buffer = await fs.promises.readFile(filename);
  return create(buffer, postscriptName);
}
