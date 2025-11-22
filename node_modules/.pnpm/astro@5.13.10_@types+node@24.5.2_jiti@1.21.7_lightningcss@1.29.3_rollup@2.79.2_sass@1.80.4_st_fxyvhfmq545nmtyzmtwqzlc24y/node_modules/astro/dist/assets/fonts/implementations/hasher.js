import xxhash from "xxhash-wasm";
import { sortObjectByKey } from "../utils.js";
async function createXxHasher() {
  const { h64ToString: hashString } = await xxhash();
  return {
    hashString,
    hashObject(input) {
      return hashString(JSON.stringify(sortObjectByKey(input)));
    }
  };
}
export {
  createXxHasher
};
