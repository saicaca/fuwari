/**
 * This list is highly opinionated. It is designed to handle icons that can be safely embedded in HTML and linked as external source.
 * Icons cannot have anything that requires external resources, anything that renders inconsistently.
 */
/**
 * Bad tags
 *
 * Parser should throw error if one of these tags is found
 *
 * List includes text tags because:
 * - it usuaully uses custom font, which makes things much more complex
 * - it renders differently on different operating systems and browsers
 *
 * View tag is not allowed because it requires targeting view by id from external source, making it unusable in embedded icons.
 */
declare const badTags: Set<string>;
/**
 * Deprecated or irrelevant tags
 *
 * Tags that are quietly removed
 */
declare const unsupportedTags: Set<string>;
/**
 * Style
 */
declare const styleTag: Set<string>;
/**
 * Definitions: reusable elements inside
 */
declare const defsTag: Set<string>;
/**
 * Masks: colors are ignored, elements must have id
 */
declare const maskTags: Set<string>;
/**
 * Symbol
 */
declare const symbolTag: Set<string>;
/**
 * SVG shapes
 */
declare const shapeTags: Set<string>;
/**
 * Use
 */
declare const useTag: Set<string>;
/**
 * Groups
 */
declare const groupTag: Set<string>;
/**
 * Marker, should be inside <defs>
 */
declare const markerTag: Set<string>;
/**
 * SVG animations
 */
declare const animateTags: Set<string>;
declare const animateMotionChildTags: Set<string>;
/**
 * Gradients, should be inside <defs>
 */
declare const gradientTags: Set<string>;
/**
 * Gradient color, must be inside one of gradientTags
 */
declare const gradientChildTags: Set<string>;
/**
 * Pattern, should be inside <defs>
 */
declare const patternTag: Set<string>;
/**
 * Filters
 */
declare const filterTag: Set<string>;
declare const feLightningTags: Set<string>;
declare const filterChildTags: Set<string>;
declare const feComponentTransferChildTag: Set<string>;
declare const feLightningChildTags: Set<string>;
declare const feMergeChildTags: Set<string>;
/***** Combination of tags *****/
/**
 * Reusable elements that use colors
 *
 * Most are used via color attributes like `fill`
 * Some are used via custom attributes like `marker-start`
 * Filter is used via `filter`
 */
declare const reusableElementsWithPalette: Set<string>;
/**
 * All supported tags
 */
declare const allValidTags: Set<string>;

export { allValidTags, animateMotionChildTags, animateTags, badTags, defsTag, feComponentTransferChildTag, feLightningChildTags, feLightningTags, feMergeChildTags, filterChildTags, filterTag, gradientChildTags, gradientTags, groupTag, markerTag, maskTags, patternTag, reusableElementsWithPalette, shapeTags, styleTag, symbolTag, unsupportedTags, useTag };
