import { Color } from '@iconify/utils/lib/colors/types';

/**
 * Color attributes
 */
type CommonColorAttributes = 'color';
declare const commonColorAttributes: CommonColorAttributes[];
type ShapeColorAttributes = 'fill' | 'stroke';
declare const shapeColorAttributes: ShapeColorAttributes[];
type SpecialColorAttributes = 'stop-color' | 'flood-color';
declare const specialColorAttributes: SpecialColorAttributes[];
type ColorAttributes = CommonColorAttributes | ShapeColorAttributes | SpecialColorAttributes;
/**
 * Default values
 */
declare const defaultBlackColor: Color;
declare const defaultColorValues: Record<ColorAttributes, Color>;
/**
 * Ignore default color for some tags:
 * - If value is true, allow default color
 * - If value is attribute name, allow default color if attribute is set
 *
 * Parent elements are not checked for these tags!
 */
declare const allowDefaultColorValue: Partial<Record<ColorAttributes, string | true>>;

export { type ColorAttributes, type CommonColorAttributes, type ShapeColorAttributes, type SpecialColorAttributes, allowDefaultColorValue, commonColorAttributes, defaultBlackColor, defaultColorValues, shapeColorAttributes, specialColorAttributes };
