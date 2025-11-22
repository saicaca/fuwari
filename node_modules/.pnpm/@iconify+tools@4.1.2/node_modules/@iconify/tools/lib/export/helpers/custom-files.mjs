import { promises } from 'fs';
import { writeJSONFile } from '../../misc/write-json.mjs';

async function exportCustomFiles(dir, options, result) {
  const customFiles = options.customFiles || {};
  for (const filename in customFiles) {
    const content = customFiles[filename];
    if (content === null) {
      try {
        await promises.unlink(dir + "/" + filename);
      } catch (err) {
      }
      continue;
    }
    if (typeof content === "string") {
      await promises.writeFile(dir + "/" + filename, content, "utf8");
    } else if (typeof content === "object") {
      await writeJSONFile(dir + "/" + filename, content);
    }
    result?.add(filename);
  }
}

export { exportCustomFiles };
