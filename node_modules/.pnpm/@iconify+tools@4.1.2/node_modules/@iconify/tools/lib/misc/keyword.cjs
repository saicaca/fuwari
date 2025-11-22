'use strict';

function cleanupIconKeyword(keyword, convertCamelCase = false) {
  if (convertCamelCase) {
    keyword = keyword.replace(
      /[A-Z]+/g,
      (chars) => "_" + chars.toLowerCase()
    );
  }
  keyword = keyword.toLowerCase().trim().replace(/[\s_.:/\\]/g, "-").replace(/[^a-z0-9-]/g, "").replace(/[-]+/g, "-");
  if (keyword.slice(0, 1) === "-") {
    keyword = keyword.slice(1);
  }
  if (keyword.slice(-1) === "-") {
    keyword = keyword.slice(0, -1);
  }
  return keyword;
}

exports.cleanupIconKeyword = cleanupIconKeyword;
