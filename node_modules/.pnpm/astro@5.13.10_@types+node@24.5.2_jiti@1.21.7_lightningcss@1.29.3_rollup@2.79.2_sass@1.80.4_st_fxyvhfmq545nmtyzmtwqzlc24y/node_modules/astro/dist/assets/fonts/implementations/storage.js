import { fileURLToPath } from "node:url";
import { createStorage } from "unstorage";
import fsLiteDriver from "unstorage/drivers/fs-lite";
function createFsStorage({ base }) {
  return createStorage({
    // Types are weirly exported
    driver: fsLiteDriver({
      base: fileURLToPath(base)
    })
  });
}
export {
  createFsStorage
};
