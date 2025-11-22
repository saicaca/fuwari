/**
 * This list is highly opinionated. It is designed to handle icons that can be safely embedded in HTML and linked as external source.
 * Icons cannot have anything that requires external resources, anything that renders inconsistently.
 */
/***** Attributes that are not part of tag specific stuff *****/
/**
 * Attributes that icons should not mess with or that are irrelevant. They should be removed
 */
declare const badAttributes: Set<string>;
/**
 * Attributes for SVG element that should be removed
 */
declare const junkSVGAttributes: Set<string>;
/**
 * Attributes and styles often added by bad software to wrong tags, such as Adobe Illustrator and Inkscape
 */
declare const badSoftwareAttributes: Set<string>;
declare const badAttributePrefixes: Set<string>;
/**
 * Common attributes that can exist on any element
 */
declare const commonAttributes: Set<string>;
declare const stylingAttributes: Set<string>;
/**
 * Attributes that exist only on child elements of <clipPath>
 */
declare const insideClipPathAttributes: Set<string>;
/***** Other attributes, added to tagSpecificAttributes variable below *****/
/**
 * Presentational attributes
 */
declare const fillPresentationalAttributes: Set<string>;
declare const strokePresentationalAttributes: Set<string>;
declare const urlPresentationalAttributes: Set<string>;
declare const visibilityPresentationalAttributes: Set<string>;
declare const commonColorPresentationalAttributes: Set<string>;
declare const otherPresentationalAttributes: Set<string>;
declare const presentationalAttributes: Set<string>;
/**
 * Markers
 *
 * Presentational attributes
 */
declare const markerAttributes: Set<string>;
/**
 * Shapes
 *
 * Not presentational
 */
declare const otherShapeAttributes: Set<string>;
/**
 * Animations
 */
declare const animationTimingAttributes: Set<string>;
declare const animationValueAttributes: Set<string>;
declare const otherAnimationAttributes: Set<string>;
/**
 * Gradients
 */
declare const commonGradientAttributes: Set<string>;
/**
 * Filters
 */
declare const commonFeAttributes: Set<string>;
declare const feFuncAttributes: Set<string>;
/**
 * Tag specific attributes
 */
declare const tagSpecificAnimatedAttributes: Record<string, Set<string>>;
declare const tagSpecificPresentationalAttributes: Record<string, Set<string>>;
declare const tagSpecificNonPresentationalAttributes: Record<string, Set<string>>;
/**
 * Styles to keep in tags
 */
declare const tagSpecificInlineStyles: Record<string, Set<string>>;

export { animationTimingAttributes, animationValueAttributes, badAttributePrefixes, badAttributes, badSoftwareAttributes, commonAttributes, commonColorPresentationalAttributes, commonFeAttributes, commonGradientAttributes, feFuncAttributes, fillPresentationalAttributes, insideClipPathAttributes, junkSVGAttributes, markerAttributes, otherAnimationAttributes, otherPresentationalAttributes, otherShapeAttributes, presentationalAttributes, strokePresentationalAttributes, stylingAttributes, tagSpecificAnimatedAttributes, tagSpecificInlineStyles, tagSpecificNonPresentationalAttributes, tagSpecificPresentationalAttributes, urlPresentationalAttributes, visibilityPresentationalAttributes };
