'use strict';

const defaults = require('@iconify/utils/lib/icon/defaults');

const maxIteration = 5;
function findMatchingIcon(iconSet, icon) {
  const body = icon.body;
  let hiddenMatch = null;
  function isMatching(data) {
    for (const key in defaults.defaultIconProps) {
      const attr = key;
      if (data[attr] !== icon[attr]) {
        return false;
      }
    }
    return true;
  }
  function test(name, iteration) {
    const data = iconSet.resolve(name, true);
    if (!data) {
      return null;
    }
    if (isMatching(data)) {
      if (data.hidden) {
        hiddenMatch = name;
      } else {
        return name;
      }
    }
    if (iteration > maxIteration) {
      return null;
    }
    for (const key in iconSet.entries) {
      const item = iconSet.entries[key];
      if (item.type === "variation" && item.parent === name) {
        const result = test(key, iteration + 1);
        if (typeof result === "string") {
          return result;
        }
      }
    }
    return null;
  }
  for (const key in iconSet.entries) {
    const item = iconSet.entries[key];
    if (item.type === "icon" && item.body === body) {
      const result = test(key, 0);
      if (typeof result === "string") {
        return result;
      }
    }
  }
  return hiddenMatch;
}

exports.findMatchingIcon = findMatchingIcon;
