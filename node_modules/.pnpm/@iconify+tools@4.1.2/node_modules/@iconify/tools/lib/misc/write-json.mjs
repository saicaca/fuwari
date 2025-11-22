import { promises } from 'fs';

async function writeJSONFile(filename, data) {
  return promises.writeFile(filename, JSON.stringify(data, null, "	") + "\n");
}

export { writeJSONFile };
