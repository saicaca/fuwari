import { commonObjectProps, unmergeObjects } from '@iconify/utils/lib/misc/objects';
import { defaultIconProps } from '@iconify/utils';

const defaultCommonProps = Object.freeze({
  ...defaultIconProps,
  hidden: false
});
function filterProps(data, reference, compareDefaultValues) {
  const result = commonObjectProps(data, reference);
  return compareDefaultValues ? unmergeObjects(result, reference) : result;
}

export { defaultCommonProps, filterProps };
