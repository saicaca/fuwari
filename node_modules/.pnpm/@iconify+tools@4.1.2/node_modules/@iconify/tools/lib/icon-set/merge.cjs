'use strict';

const iconSet_index = require('./index.cjs');
const iconSet_match = require('./match.cjs');
const iconSet_modified = require('./modified.cjs');
require('@iconify/utils/lib/icon/defaults');
require('@iconify/utils/lib/svg/build');
require('@iconify/utils/lib/icon-set/minify');
require('@iconify/utils/lib/icon-set/convert-info');
require('./props.cjs');
require('@iconify/utils/lib/misc/objects');
require('@iconify/utils');
require('../svg/index.cjs');
require('cheerio');

function mergeIconSets(oldIcons, newIcons) {
  const mergedIcons = new iconSet_index.IconSet(newIcons.export());
  const oldEntries = oldIcons.entries;
  const entries = mergedIcons.entries;
  function add(name) {
    if (entries[name]) {
      return true;
    }
    const item = oldEntries[name];
    switch (item.type) {
      case "icon": {
        const fullIcon = oldIcons.resolve(name, true);
        const parent = fullIcon ? iconSet_match.findMatchingIcon(mergedIcons, fullIcon) : null;
        if (parent !== null) {
          mergedIcons.setAlias(name, parent);
          return true;
        }
        const props = item.props;
        mergedIcons.setItem(name, {
          ...item,
          props: {
            ...props,
            hidden: true
          },
          categories: /* @__PURE__ */ new Set()
        });
        return true;
      }
      case "variation":
      case "alias": {
        let parent = item.parent;
        if (!add(parent)) {
          return false;
        }
        const parentItem = entries[parent];
        if (parentItem.type === "alias") {
          parent = parentItem.parent;
        }
        if (item.type === "variation") {
          const props = item.props;
          mergedIcons.setItem(name, {
            ...item,
            parent,
            props: {
              ...props,
              hidden: true
            }
          });
        } else {
          mergedIcons.setItem(name, {
            ...item,
            parent
          });
        }
        return true;
      }
      default:
        return false;
    }
  }
  for (const name in oldEntries) {
    add(name);
  }
  if (oldIcons.lastModified && !iconSet_modified.hasIconDataBeenModified(oldIcons, mergedIcons)) {
    mergedIcons.updateLastModified(oldIcons.lastModified);
  } else if (newIcons.lastModified && !iconSet_modified.hasIconDataBeenModified(newIcons, mergedIcons)) {
    mergedIcons.updateLastModified(newIcons.lastModified);
  }
  return mergedIcons;
}

exports.mergeIconSets = mergeIconSets;
