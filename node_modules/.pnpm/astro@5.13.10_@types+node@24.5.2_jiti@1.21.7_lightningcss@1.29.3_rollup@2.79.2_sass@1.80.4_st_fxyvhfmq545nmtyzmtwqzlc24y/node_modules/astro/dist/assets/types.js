const isESMImport = Symbol("#isESM");
function isImageMetadata(src) {
  return src.fsPath && !("fsPath" in src);
}
export {
  isImageMetadata
};
