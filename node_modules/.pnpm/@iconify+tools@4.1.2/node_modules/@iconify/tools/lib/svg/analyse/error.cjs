'use strict';

function analyseTagError(element) {
  let result = "<" + element.tagName;
  if (element._id) {
    result += ' id="' + element._id + '"';
  }
  const attribs = element.attribs;
  if (attribs["d"]) {
    const value = attribs["d"];
    result += ' d="' + (value.length > 16 ? value.slice(0, 12) + "..." : value) + '"';
  }
  return result + ">";
}

exports.analyseTagError = analyseTagError;
