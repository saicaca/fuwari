function createCanonicalURL(url, trailingSlash, base) {
  let pathname = url.replace(/\/index.html$/, "");
  if (!getUrlExtension(url)) {
    pathname = pathname.replace(/\/*$/, "/");
  }
  pathname = pathname.replace(/\/+/g, "/");
  const canonicalUrl = new URL(pathname, base).href;
  if (trailingSlash === false) {
    return canonicalUrl.replace(/\/*$/, "");
  }
  return canonicalUrl;
}
function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
  }
  return false;
}
function getUrlExtension(url) {
  const lastDot = url.lastIndexOf(".");
  const lastSlash = url.lastIndexOf("/");
  return lastDot > lastSlash ? url.slice(lastDot + 1) : "";
}
const flattenErrorPath = (errorPath) => errorPath.join(".");
const errorMap = (error, ctx) => {
  if (error.code === "invalid_type") {
    const badKeyPath = JSON.stringify(flattenErrorPath(error.path));
    if (error.received === "undefined") {
      return { message: `${badKeyPath} is required.` };
    } else {
      return { message: `${badKeyPath} should be ${error.expected}, not ${error.received}.` };
    }
  }
  return { message: ctx.defaultError };
};
export {
  createCanonicalURL,
  errorMap,
  isValidURL
};
