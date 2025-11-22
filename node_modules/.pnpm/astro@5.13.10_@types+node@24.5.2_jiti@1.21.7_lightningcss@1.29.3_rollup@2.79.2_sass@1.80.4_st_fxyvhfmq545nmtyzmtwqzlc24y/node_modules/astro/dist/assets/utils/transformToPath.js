import { basename, dirname, extname } from "node:path";
import { deterministicString } from "deterministic-object-hash";
import { removeQueryString } from "../../core/path.js";
import { shorthash } from "../../runtime/server/shorthash.js";
import { isESMImportedImage } from "./imageKind.js";
const INVALID_CHAR_REGEX = /[\u0000-\u001F"#$%&*+,:;<=>?[\]^`{|}\u007F]/g;
function propsToFilename(filePath, transform, hash) {
  let filename = decodeURIComponent(removeQueryString(filePath));
  const ext = extname(filename);
  if (filePath.startsWith("data:")) {
    filename = shorthash(filePath);
  } else {
    filename = basename(filename, ext).replace(INVALID_CHAR_REGEX, "_");
  }
  const prefixDirname = isESMImportedImage(transform.src) ? dirname(filePath) : "";
  let outputExt = transform.format ? `.${transform.format}` : ext;
  return `${prefixDirname}/${filename}_${hash}${outputExt}`;
}
function hashTransform(transform, imageService, propertiesToHash) {
  const hashFields = propertiesToHash.reduce(
    (acc, prop) => {
      acc[prop] = transform[prop];
      return acc;
    },
    { imageService }
  );
  return shorthash(deterministicString(hashFields));
}
export {
  hashTransform,
  propsToFilename
};
