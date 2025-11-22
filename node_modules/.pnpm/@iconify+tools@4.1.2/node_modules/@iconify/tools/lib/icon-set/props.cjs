'use strict';

const objects = require('@iconify/utils/lib/misc/objects');
const utils = require('@iconify/utils');

const defaultCommonProps = Object.freeze({
  ...utils.defaultIconProps,
  hidden: false
});
function filterProps(data, reference, compareDefaultValues) {
  const result = objects.commonObjectProps(data, reference);
  return compareDefaultValues ? objects.unmergeObjects(result, reference) : result;
}

exports.defaultCommonProps = defaultCommonProps;
exports.filterProps = filterProps;
