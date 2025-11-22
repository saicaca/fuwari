'use strict';

function bumpVersion(version) {
  const versionParts = version.split(".");
  const lastPart = versionParts.pop();
  const num = parseInt(lastPart);
  if (isNaN(num) || num.toString() !== lastPart) {
    versionParts.push(lastPart + ".1");
  } else {
    versionParts.push((num + 1).toString());
  }
  return versionParts.join(".");
}

exports.bumpVersion = bumpVersion;
