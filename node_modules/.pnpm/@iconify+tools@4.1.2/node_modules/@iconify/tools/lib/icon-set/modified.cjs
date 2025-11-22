'use strict';

function hasIconDataBeenModified(set1, set2) {
  const entries1 = set1.entries;
  const entries2 = set2.entries;
  const keys1 = Object.keys(entries1);
  const keys2 = Object.keys(entries2);
  if (keys1.length !== keys2.length) {
    return true;
  }
  for (let i = 0; i < keys1.length; i++) {
    if (!entries2[keys1[i]]) {
      return true;
    }
  }
  for (let i = 0; i < keys1.length; i++) {
    const name = keys1[i];
    if (set1.toString(name) !== set2.toString(name)) {
      return true;
    }
  }
  return false;
}

exports.hasIconDataBeenModified = hasIconDataBeenModified;
