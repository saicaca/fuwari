import { ExpressiveCodePlugin } from '@expressive-code/core';

interface TextMarkersStyleSettings {
    /**
     * The margin between the code block border and the line marker accent bar
     * displayed on the left side of a full-line text marker.
     * @default '0rem'
     */
    lineMarkerAccentMargin: string;
    /**
     * The width of the line marker accent bar. This is the vertical border-like bar
     * displayed on the left side of a full-line text marker.
     * @default '0.15rem'
     */
    lineMarkerAccentWidth: string;
    /**
     * The inline padding (= left & right padding in horizontal writing mode)
     * around line marker labels.
     *
     * @note If your line marker labels overlap with the code content,
     * consider increasing the root style setting `codePaddingInline`.
     *
     * @default '0.2rem'
     */
    lineMarkerLabelPaddingInline: string;
    /**
     * The text color of the optional labels that can be displayed on the left side
     * of a full-line text marker.
     * @default 'white'
     */
    lineMarkerLabelColor: string;
    /**
     * The margin between the code block border and the diff indicator (e.g. `+` or `-`)
     * displayed on the left side of a full-line text marker.
     * @default '0.3rem'
     */
    lineDiffIndicatorMarginLeft: string;
    /**
     * The width of the border around inline text markers, rendered in a way
     * that does not cause marked code to shift.
     * @default '1.5px'
     */
    inlineMarkerBorderWidth: string;
    /**
     * The border radius of inline text markers.
     * @default '0.2rem'
     */
    inlineMarkerBorderRadius: string;
    /**
     * The inline padding of inline text markers. Keep this low to prevent marked code
     * from shifting too much compared to the original text.
     * @default '0.15rem'
     */
    inlineMarkerPadding: string;
    /**
     * The LCH hue to be used for marked text (text marker type `mark`).
     * @default '284' (a blue hue)
     */
    markHue: string;
    /**
     * The LCH hue to be used for inserted text (text marker type `ins`).
     * @default '136' (a green hue)
     */
    insHue: string;
    /**
     * The LCH hue to be used for deleted text (text marker type `del`).
     * @default '33' (a red hue)
     */
    delHue: string;
    /**
     * The LCH chroma to be used for all text marker types.
     *
     * The chroma value defines the saturation of the color. Higher values lead to
     * more saturated colors, lower values lead to less saturated colors.
     *
     * @default '40'
     */
    defaultChroma: string;
    /**
     * The LCH luminance to be used for all text marker types.
     * @default
     * ['32%', '75%'] // 32% for dark themes, 75% for light themes
     */
    defaultLuminance: string;
    /**
     * The opacity of the background color of all text marker types.
     * @default '50%'
     */
    backgroundOpacity: string;
    /**
     * The LCH luminance to be used for the border color of all text marker types.
     * @default '48%'
     */
    borderLuminance: string;
    /**
     * The opacity of the border color of all text marker types.
     * @default '81.6%'
     */
    borderOpacity: string;
    /**
     * The LCH luminance to be used for the diff indicator (e.g. `+` or `-`).
     * @default
     * ['67%', '40%'] // 67% for dark themes, 40% for light themes
     */
    indicatorLuminance: string;
    /**
     * The opacity of the diff indicator (e.g. `+` or `-`).
     * @default '81.6%'
     */
    indicatorOpacity: string;
    /**
     * The content to be displayed inside the diff indicator of inserted lines.
     *
     * Note that this is used as the `content` value in a CSS pseudo-element,
     * so you need to wrap any text in additional quotes.
     *
     * @default "'+'"
     */
    insDiffIndicatorContent: string;
    /**
     * The content to be displayed inside the diff indicator of deleted lines.
     *
     * Note that this is used as the `content` value in a CSS pseudo-element,
     * so you need to wrap any text in additional quotes.
     *
     * @default "'-'"
     */
    delDiffIndicatorContent: string;
    /**
     * The background color of marked text (text marker type `mark`).
     * @default
     * lch(<defaultLuminance> <defaultChroma> <markHue> / <backgroundOpacity>)
     */
    markBackground: string;
    /**
     * The border color of marked text (text marker type `mark`).
     * @default
     * lch(<borderLuminance> <defaultChroma> <markHue> / <borderOpacity>)
     */
    markBorderColor: string;
    /**
     * The background color of inserted text (text marker type `ins`).
     * @default
     * lch(<defaultLuminance> <defaultChroma> <insHue> / <backgroundOpacity>)
     */
    insBackground: string;
    /**
     * The border color of inserted text (text marker type `ins`).
     * @default
     * lch(<borderLuminance> <defaultChroma> <insHue> / <borderOpacity>)
     */
    insBorderColor: string;
    /**
     * The color of the diff indicator (e.g. `+` or `-`) of inserted lines.
     * @default
     * lch(<indicatorLuminance> <defaultChroma> <insHue> / <indicatorOpacity>)
     */
    insDiffIndicatorColor: string;
    /**
     * The background color of deleted text (text marker type `del`).
     * @default
     * lch(<defaultLuminance> <defaultChroma> <delHue> / <backgroundOpacity>)
     */
    delBackground: string;
    /**
     * The border color of deleted text (text marker type `del`).
     * @default
     * lch(<borderLuminance> <defaultChroma> <delHue> / <borderOpacity>)
     */
    delBorderColor: string;
    /**
     * The color of the diff indicator (e.g. `+` or `-`) of deleted lines.
     * @default
     * lch(<indicatorLuminance> <defaultChroma> <delHue> / <indicatorOpacity>)
     */
    delDiffIndicatorColor: string;
}
declare module '@expressive-code/core' {
    interface StyleSettings {
        textMarkers: TextMarkersStyleSettings;
    }
}

type MarkerLineOrRange = number | {
    range: string;
    label?: string | undefined;
};
/**
 * A single text marker definition that can be used in the `mark`, `ins`, and `del` props
 * to define text and line markers.
 */
type MarkerDefinition = string | RegExp | MarkerLineOrRange;
interface PluginTextMarkersProps {
    /**
     * Defines the code block's [text & line markers](https://expressive-code.com/key-features/text-markers/)
     * of the default neutral type.
     *
     * You can either pass a single marker definition or an array of them.
     */
    mark: MarkerDefinition | MarkerDefinition[];
    /**
     * Defines the code block's [text & line markers](https://expressive-code.com/key-features/text-markers/)
     * of the "inserted" type.
     *
     * You can either pass a single marker definition or an array of them.
     */
    ins: MarkerDefinition | MarkerDefinition[];
    /**
     * Defines the code block's [text & line markers](https://expressive-code.com/key-features/text-markers/)
     * of the "deleted" type.
     *
     * You can either pass a single marker definition or an array of them.
     */
    del: MarkerDefinition | MarkerDefinition[];
    /**
     * Allows you to enable processing of diff syntax for non-diff languages.
     *
     * If set to `true`, you can prefix lines with `+` or `-`, no matter what the language of
     * the code block is. The prefixes will be removed and the lines will be highlighted as
     * inserted or deleted lines.
     */
    useDiffSyntax: boolean;
}
declare module '@expressive-code/core' {
    interface ExpressiveCodeBlockProps extends PluginTextMarkersProps {
    }
}
declare function pluginTextMarkers(): ExpressiveCodePlugin;

export { MarkerDefinition, MarkerLineOrRange, PluginTextMarkersProps, TextMarkersStyleSettings, pluginTextMarkers };
