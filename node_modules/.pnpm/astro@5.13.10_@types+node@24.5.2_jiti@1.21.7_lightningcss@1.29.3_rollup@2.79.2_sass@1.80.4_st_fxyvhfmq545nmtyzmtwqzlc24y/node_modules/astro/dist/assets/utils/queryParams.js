function getOrigQueryParams(params) {
  const width = params.get("origWidth");
  const height = params.get("origHeight");
  const format = params.get("origFormat");
  if (!width || !height || !format) {
    return void 0;
  }
  return {
    width: parseInt(width),
    height: parseInt(height),
    format
  };
}
export {
  getOrigQueryParams
};
