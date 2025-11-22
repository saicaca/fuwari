import { CommonIconProps } from './types.mjs';
import '@iconify/types';

/**
 * Common properties for icon and alias
 */
declare const defaultCommonProps: Required<CommonIconProps>;
/**
 * Filter icon props: copies properties, removing undefined and default entries
 */
declare function filterProps(data: CommonIconProps, reference: CommonIconProps, compareDefaultValues: boolean): CommonIconProps;

export { defaultCommonProps, filterProps };
