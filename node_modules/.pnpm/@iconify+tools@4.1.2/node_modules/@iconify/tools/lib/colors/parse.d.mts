import { Color } from '@iconify/utils/lib/colors/types';
import { SVG } from '../svg/index.mjs';
import { ColorAttributes } from './attribs.mjs';
import { ElementsTreeItem, AnalyseSVGStructureResult, AnalyseSVGStructureOptions, ExtendedTagElement } from '../svg/analyse/types.mjs';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';
import '../misc/cheerio.mjs';
import 'domhandler';

/**
 * Result
 */
interface FindColorsResult {
    colors: (Color | string)[];
    hasUnsetColor: boolean;
    hasGlobalStyle: boolean;
}
/**
 * Callback to call for each found color
 *
 * Callback should return:
 * - new color value to change color
 * - first parameter to keep old value
 * - 'unset' to delete old value
 * - 'remove' to remove shape or rule
 */
type ParseColorsCallbackResult = Color | string | 'remove' | 'unset';
type ParseColorsCallback = (attr: ColorAttributes, colorString: string, parsedColor: Color | null, tagName?: string, item?: ExtendedTagElementWithColors) => ParseColorsCallbackResult;
/**
 * Callback for default color
 */
type ParseColorOptionsDefaultColorCallback = (prop: string, item: ExtendedTagElementWithColors, treeItem: ElementsTreeItem, iconData: AnalyseSVGStructureResult) => Color;
/**
 * Options
 */
interface ParseColorsOptions extends AnalyseSVGStructureOptions {
    callback?: ParseColorsCallback;
    defaultColor?: Color | string | ParseColorOptionsDefaultColorCallback;
}
/**
 * Extend properties for element
 */
type ItemColors = Partial<Record<ColorAttributes, Color | string>>;
interface ExtendedTagElementWithColors extends ExtendedTagElement {
    _colors?: ItemColors;
    _removed?: boolean;
}
/**
 * Find colors in icon
 *
 * Clean up icon before running this function to convert style to attributes using
 * cleanupInlineStyle() or cleanupSVG(), otherwise results might be inaccurate
 */
declare function parseColors(svg: SVG, options?: ParseColorsOptions): FindColorsResult;
/**
 * Check if color is empty, such as 'none' or 'transparent'
 */
declare function isEmptyColor(color: Color): boolean;

export { type ExtendedTagElementWithColors, type FindColorsResult, type ParseColorOptionsDefaultColorCallback, type ParseColorsOptions, isEmptyColor, parseColors };
