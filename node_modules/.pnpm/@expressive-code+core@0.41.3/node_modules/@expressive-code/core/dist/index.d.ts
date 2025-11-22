import * as hast from 'hast';
import { Element, Parents } from 'hast';
import { ThemeRegistration } from 'shiki';
import { TinyColor } from '@ctrl/tinycolor';
import { addClassName as addClassName$1, getClassNames as getClassNames$1, getInlineStyles as getInlineStyles$1, removeClassName as removeClassName$1, setInlineStyle as setInlineStyle$1, setInlineStyles as setInlineStyles$1, setProperty as setProperty$1 } from './hast.js';
import 'hast-util-to-html';
import 'hast-util-to-text';
import 'hast-util-select';
import 'unist-util-visit';
import 'unist-util-visit-parents';
import 'hastscript';

declare class MetaOptions {
    #private;
    constructor(input: string);
    /**
     * A list of error messages that occurred when parsing the meta string,
     * or `undefined` if no errors occurred.
     */
    get errors(): string[] | undefined;
    /**
     * Returns a list of meta options, optionally filtered by their key and/or {@link MetaOptionKind}.
     *
     * @param keyOrKeys
     * Allows to filter the options by key. An empty string will return options without a key.
     * A non-empty string will return options with a matching key (case-insensitive).
     * An array of strings will return options with any of the matching keys.
     * If omitted, no key-based filtering will be applied.
     *
     * @param kind
     * Allows to filter the options by {@link MetaOptionKind}.
     * If omitted, no kind-based filtering will be applied.
     */
    list<K extends MetaOptionKind | undefined = undefined>(keyOrKeys?: string | string[], kind?: K): K extends "string" | "boolean" | "range" | "regexp" ? (Extract<MetaOptionString, {
        kind: K;
    }> | Extract<MetaOptionRange, {
        kind: K;
    }> | Extract<MetaOptionRegExp, {
        kind: K;
    }> | Extract<MetaOptionBoolean, {
        kind: K;
    }>)[] : MetaOption[];
    value<K extends MetaOptionKind | undefined = undefined>(key: string, kind?: K): (K extends "string" | "boolean" | "range" | "regexp" ? Extract<MetaOptionString, {
        kind: K;
    }> | Extract<MetaOptionRange, {
        kind: K;
    }> | Extract<MetaOptionRegExp, {
        kind: K;
    }> | Extract<MetaOptionBoolean, {
        kind: K;
    }> : MetaOption)["value"] | undefined;
    /**
     * Returns the last string value with the given key (case-insensitive),
     * or without a key by passing an empty string.
     */
    getString(key: string): string | undefined;
    /**
     * Returns an array of all string values with the given keys (case-insensitive),
     * or without a key by passing an empty string.
     */
    getStrings(keyOrKeys?: string | string[]): string[];
    /**
     * Returns the last range value (`{value}`) with the given key (case-insensitive),
     * or without a key by passing an empty string.
     */
    getRange(key: string): string | undefined;
    /**
     * Returns an array of all range values (`{value}`) with the given keys (case-insensitive),
     * or without a key by passing an empty string.
     */
    getRanges(keyOrKeys?: string | string[]): string[];
    /**
     * Returns the last integer value with the given key (case-insensitive),
     * or without a key by passing an empty string.
     */
    getInteger(key: string): number | undefined;
    /**
     * Returns an array of all integer values with the given keys (case-insensitive),
     * or without a key by passing an empty string.
     */
    getIntegers(keyOrKeys?: string | string[]): number[];
    /**
     * Returns the last RegExp value (`/value/`) with the given key (case-insensitive),
     * or without a key by passing an empty string.
     */
    getRegExp(key: string): RegExp | undefined;
    /**
     * Returns an array of all RegExp values (`/value/`) with the given keys (case-insensitive),
     * or without a key by passing an empty string.
     */
    getRegExps(keyOrKeys?: string | string[]): RegExp[];
    /**
     * Returns the last boolean value with the given key (case-insensitive).
     */
    getBoolean(key: string): boolean | undefined;
}
type MetaOptionBase = {
    index: number;
    raw: string;
    key: string | undefined;
    valueStartDelimiter: string;
    valueEndDelimiter: string;
};
type MetaOptionString = MetaOptionBase & {
    kind: 'string';
    value: string;
};
type MetaOptionRange = MetaOptionBase & {
    kind: 'range';
    value: string;
};
type MetaOptionRegExp = MetaOptionBase & {
    kind: 'regexp';
    value: RegExp;
};
type MetaOptionBoolean = MetaOptionBase & {
    kind: 'boolean';
    value: boolean;
};
type MetaOption = MetaOptionString | MetaOptionRange | MetaOptionRegExp | MetaOptionBoolean;
type MetaOptionKind = MetaOption['kind'];

type PluginStyles = {
    pluginName: string;
    styles: string;
};

/**
 * A union of VS Code colors that we know the default values for. The default values are required
 * because VS Code themes do not need to define all colors, only the ones they want to change.
 *
 * This is not an exhaustive list of all VS Code colors and does not need to be. If a color is
 * missing here, it can still be set by themes and used by plugins - it will just have no defaults.
 */
type VSCodeDefaultColorKey = 'focusBorder' | 'foreground' | 'disabledForeground' | 'descriptionForeground' | 'errorForeground' | 'icon.foreground' | 'contrastActiveBorder' | 'contrastBorder' | 'textBlockQuote.background' | 'textBlockQuote.border' | 'textCodeBlock.background' | 'textLink.activeForeground' | 'textLink.foreground' | 'textPreformat.foreground' | 'textSeparator.foreground' | 'editor.background' | 'editor.foreground' | 'editorLineNumber.foreground' | 'editorLineNumber.activeForeground' | 'editorActiveLineNumber.foreground' | 'editor.selectionBackground' | 'editor.inactiveSelectionBackground' | 'editor.selectionHighlightBackground' | 'editorError.foreground' | 'editorWarning.foreground' | 'editorInfo.foreground' | 'editorHint.foreground' | 'problemsErrorIcon.foreground' | 'problemsWarningIcon.foreground' | 'problemsInfoIcon.foreground' | 'editor.findMatchBackground' | 'editor.findMatchHighlightBackground' | 'editor.findRangeHighlightBackground' | 'editorLink.activeForeground' | 'editorLightBulb.foreground' | 'editorLightBulbAutoFix.foreground' | 'diffEditor.insertedTextBackground' | 'diffEditor.insertedTextBorder' | 'diffEditor.removedTextBackground' | 'diffEditor.removedTextBorder' | 'diffEditor.insertedLineBackground' | 'diffEditor.removedLineBackground' | 'editorStickyScroll.background' | 'editorStickyScrollHover.background' | 'editorInlayHint.background' | 'editorInlayHint.foreground' | 'editorInlayHint.typeForeground' | 'editorInlayHint.typeBackground' | 'editorInlayHint.parameterForeground' | 'editorInlayHint.parameterBackground' | 'editorPane.background' | 'editorGroup.emptyBackground' | 'editorGroup.focusedEmptyBorder' | 'editorGroupHeader.tabsBackground' | 'editorGroupHeader.tabsBorder' | 'editorGroupHeader.noTabsBackground' | 'editorGroupHeader.border' | 'editorGroup.border' | 'editorGroup.dropBackground' | 'editorGroup.dropIntoPromptForeground' | 'editorGroup.dropIntoPromptBackground' | 'editorGroup.dropIntoPromptBorder' | 'sideBySideEditor.horizontalBorder' | 'sideBySideEditor.verticalBorder' | 'scrollbar.shadow' | 'scrollbarSlider.background' | 'scrollbarSlider.hoverBackground' | 'scrollbarSlider.activeBackground' | 'panel.background' | 'panel.border' | 'panelTitle.activeBorder' | 'panelTitle.activeForeground' | 'panelTitle.inactiveForeground' | 'panelSectionHeader.background' | 'terminal.background' | 'widget.shadow' | 'editorWidget.background' | 'editorWidget.foreground' | 'editorWidget.border' | 'quickInput.background' | 'quickInput.foreground' | 'quickInputTitle.background' | 'pickerGroup.foreground' | 'pickerGroup.border' | 'editor.hoverHighlightBackground' | 'editorHoverWidget.background' | 'editorHoverWidget.foreground' | 'editorHoverWidget.border' | 'editorHoverWidget.statusBarBackground' | 'titleBar.activeBackground' | 'titleBar.activeForeground' | 'titleBar.inactiveBackground' | 'titleBar.inactiveForeground' | 'titleBar.border' | 'toolbar.hoverBackground' | 'toolbar.activeBackground' | 'tab.activeBackground' | 'tab.unfocusedActiveBackground' | 'tab.inactiveBackground' | 'tab.unfocusedInactiveBackground' | 'tab.activeForeground' | 'tab.inactiveForeground' | 'tab.unfocusedActiveForeground' | 'tab.unfocusedInactiveForeground' | 'tab.hoverBackground' | 'tab.unfocusedHoverBackground' | 'tab.hoverForeground' | 'tab.unfocusedHoverForeground' | 'tab.border' | 'tab.lastPinnedBorder' | 'tab.activeBorder' | 'tab.unfocusedActiveBorder' | 'tab.activeBorderTop' | 'tab.unfocusedActiveBorderTop' | 'tab.hoverBorder' | 'tab.unfocusedHoverBorder' | 'tab.activeModifiedBorder' | 'tab.inactiveModifiedBorder' | 'tab.unfocusedActiveModifiedBorder' | 'tab.unfocusedInactiveModifiedBorder' | 'badge.background' | 'badge.foreground' | 'button.background' | 'button.foreground' | 'button.border' | 'button.separator' | 'button.hoverBackground' | 'button.secondaryBackground' | 'button.secondaryForeground' | 'button.secondaryHoverBackground' | 'dropdown.background' | 'dropdown.foreground' | 'dropdown.border' | 'list.activeSelectionBackground' | 'list.activeSelectionForeground' | 'tree.indentGuidesStroke' | 'input.background' | 'input.foreground' | 'input.placeholderForeground' | 'inputOption.activeBorder' | 'inputOption.hoverBackground' | 'inputOption.activeBackground' | 'inputOption.activeForeground' | 'inputValidation.infoBackground' | 'inputValidation.infoBorder' | 'inputValidation.warningBackground' | 'inputValidation.warningBorder' | 'inputValidation.errorBackground' | 'inputValidation.errorBorder' | 'keybindingLabel.background' | 'keybindingLabel.foreground' | 'keybindingLabel.border' | 'keybindingLabel.bottomBorder' | 'menu.foreground' | 'menu.background' | 'menu.selectionForeground' | 'menu.selectionBackground' | 'menu.separatorBackground' | 'editor.snippetTabstopHighlightBackground' | 'editor.snippetFinalTabstopHighlightBorder' | 'terminal.ansiBlack' | 'terminal.ansiRed' | 'terminal.ansiGreen' | 'terminal.ansiYellow' | 'terminal.ansiBlue' | 'terminal.ansiMagenta' | 'terminal.ansiCyan' | 'terminal.ansiWhite' | 'terminal.ansiBrightBlack' | 'terminal.ansiBrightRed' | 'terminal.ansiBrightGreen' | 'terminal.ansiBrightYellow' | 'terminal.ansiBrightBlue' | 'terminal.ansiBrightMagenta' | 'terminal.ansiBrightCyan' | 'terminal.ansiBrightWhite';
type VSCodeThemeType = 'dark' | 'light';
type VSCodeWorkbenchColors = {
    [key in VSCodeDefaultColorKey]: string;
} & {
    [key: string]: string;
};

/**
 * Represents a strongly typed set of style settings provided by a plugin (or core).
 *
 * The constructor expects an object with a `defaultSettings` property. This property must contain
 * the default values for all settings and will be made available as a public instance property.
 * Allowed default value types are plain values (e.g. strings), an array of two values
 * to provide a dark and light variant, or resolver functions that return one of these types.
 *
 * If you are writing a plugin that provides style overrides, please merge your style overrides
 * into the `StyleSettings` interface declaration provided by the `@expressive-code/core` module.
 * You can see an example of this below.
 *
 * As a plugin author, you should also assign an instance of this class to your plugin's
 * `styleSettings` property. This allows the engine to automatically declare CSS variables
 * for your style settings in all theme variants defined in the config.
 *
 * To consume the CSS variables in your plugin's `baseStyles` or anywhere else, see the
 * {@link cssVar} method to get a CSS variable reference to any style setting.
 *
 * If CSS variables should not be generated for some of your style settings, you can exclude them
 * using the `cssVarExclusions` property of the object passed to the constructor.
 *
 * If you want to provide descriptive names for your style settings, but keep the generated
 * CSS variable names short, you can pass an array of search and replace string pairs to the
 * `cssVarReplacements` property of the object passed to the constructor. The replacements
 * will be applied to all generated CSS variable names.
 *
 * If you want to prevent unitless values for specific style settings (e.g. because you intend
 * to use them in CSS calculations), you can pass an array of style setting paths to the
 * `preventUnitlessValues` property of the object passed to the constructor. If the user passes
 * a unitless value to one of these settings, the engine will automatically add `px` to the value.
 *
 * @example
 * // When using TypeScript: Declare the types of your style settings
 * interface FramesStyleSettings {
 *   fontFamily: string
 *   fontSize: string
 *   minContrast: string
 *   titleBarForeground: string
 * }
 *
 * // When using TypeScript: Merge your style settings into the core module's `StyleSettings`
 * declare module '@expressive-code/core' {
 *   export interface StyleSettings {
 *     frames: FramesStyleSettings
 *   }
 * }
 *
 * const framesStyleSettings = new PluginStyleSettings({
 *   defaultValues: {
 *     frames: {
 *       fontFamily: 'sans-serif',
 *       fontSize: '1rem',
 *       minContrast: '5',
 *       titleBarForeground: ({ theme }) => theme.colors['editor.foreground'],
 *     }
 *   },
 *   cssVarExclusions: ['frames.minContrast'],
 * })
 *
 * // ↓↓↓
 *
 * framesStyleSettings.defaultValues.frames.fontFamily         // 'sans-serif'
 * framesStyleSettings.defaultValues.frames.fontSize           // '1rem'
 * framesStyleSettings.defaultValues.frames.minContrast        // '5'
 * framesStyleSettings.defaultValues.frames.titleBarForeground // ({ theme }) => theme.colors['editor.foreground']
 */
declare class PluginStyleSettings {
    readonly defaultValues: Partial<UnresolvedStyleSettings>;
    readonly cssVarExclusions: StyleSettingPath[];
    readonly cssVarReplacements: [string, string][];
    readonly preventUnitlessValues: StyleSettingPath[];
    constructor({ defaultValues, cssVarExclusions, cssVarReplacements, preventUnitlessValues, }: {
        defaultValues: Partial<UnresolvedStyleSettings>;
        cssVarExclusions?: StyleSettingPath[] | undefined;
        cssVarReplacements?: [string, string][] | undefined;
        preventUnitlessValues?: StyleSettingPath[] | undefined;
    });
}

interface CoreStyleSettings {
    /**
     * Border radius of code blocks.
     * @default '0.3rem'
     */
    borderRadius: string;
    /**
     * Border width of code blocks.
     * @default '1.5px'
     */
    borderWidth: string;
    /**
     * Border color of code blocks.
     * @default
     * ({ theme }) => theme.colors['titleBar.border'] || lighten(theme.colors['editor.background'], theme.type === 'dark' ? 0.5 : -0.15) || 'transparent'
     */
    borderColor: string;
    /**
     * Font family of code content.
     * @default "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
     */
    codeFontFamily: string;
    /**
     * Font size of code content.
     * @default '0.85rem'
     */
    codeFontSize: string;
    /**
     * Font weight of code content.
     * @default '400'
     */
    codeFontWeight: string;
    /**
     * Font line height of code content.
     * @default '1.65'
     */
    codeLineHeight: string;
    /**
     * Block-level padding (= top and bottom padding in horizontal writing mode)
     * around the code content inside code blocks.
     * @default '1rem'
     */
    codePaddingBlock: string;
    /**
     * Inline-level padding (= left and right padding in horizontal writing mode)
     * around the code content inside code blocks.
     * @default '1.35rem'
     */
    codePaddingInline: string;
    /**
     * Background color of code blocks.
     * @default
     * ({ theme }) => theme.colors['editor.background']
     */
    codeBackground: string;
    /**
     * Foreground color of code, unless overwritten by syntax highlighting.
     * @default
     * ({ theme }) => theme.colors['editor.foreground']
     */
    codeForeground: string;
    /**
     * Background color of selected code, unless selection color customization is disabled
     * by the option `useThemedSelectionColors`.
     * @default
     * ({ theme }) => theme.colors['editor.selectionBackground']
     */
    codeSelectionBackground: string;
    /**
     * Default color of the border between the gutter and code content,
     * unless overwritten by a line-level annotation.
     *
     * Only visible if a gutter is present (e.g. to display line numbers).
     *
     * @default
     * ({ theme }) => lighten(theme.colors['editor.background'], theme.type === 'dark' ? 0.2 : -0.15)
     */
    gutterBorderColor: string;
    /**
     * Width of the border between the gutter and code content.
     *
     * @default '1.5px'
     */
    gutterBorderWidth: string;
    /**
     * Default foreground color of gutter elements.
     *
     * @default
     * ({ theme, resolveSetting }) => ensureColorContrastOnBackground(theme.colors['editorLineNumber.foreground'] || resolveSetting('codeForeground'), resolveSetting('codeBackground'), 3.3, 3.6)
     */
    gutterForeground: string;
    /**
     * Default foreground color of gutter elements in highlighted lines.
     *
     * @default
     * ({ theme, resolveSetting }) => ensureColorContrastOnBackground(theme.colors['editorLineNumber.activeForeground'] || theme.colors['editorLineNumber.foreground'] || resolveSetting('codeForeground'), resolveSetting('codeBackground'), 4.5, 5)
     */
    gutterHighlightForeground: string;
    /**
     * Font family of UI elements.
     * @default "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'"
     */
    uiFontFamily: string;
    /**
     * Font size of UI elements.
     * @default '0.9rem'
     */
    uiFontSize: string;
    /**
     * Font weight of UI elements.
     * @default '400'
     */
    uiFontWeight: string;
    /**
     * Font line height of UI elements.
     * @default '1.65'
     */
    uiLineHeight: string;
    /**
     * Block-level padding (= top and bottom padding in horizontal writing mode)
     * of UI elements like tabs, buttons etc.
     * @default '0.25rem'
     */
    uiPaddingBlock: string;
    /**
     * Inline-level padding (= left and right padding in horizontal writing mode)
     * of UI elements like tabs, buttons etc.
     * @default '1rem'
     */
    uiPaddingInline: string;
    /**
     * Background color of selected UI elements, unless selection color customization is disabled
     * by the option `useThemedSelectionColors`.
     * @default
     * ({ theme }) => theme.colors['menu.selectionBackground']
     */
    uiSelectionBackground: string;
    /**
     * Foreground color of selected UI elements, unless selection color customization is disabled
     * by the option `useThemedSelectionColors`.
     * @default
     * ({ theme }) => theme.colors['menu.selectionForeground']
     */
    uiSelectionForeground: string;
    /**
     * Color of the focus border around focused elements.
     * @default
     * ({ theme }) => theme.colors['focusBorder']
     */
    focusBorder: string;
    /**
     * Color of the scrollbar thumb, unless scrollbar color customization is disabled
     * by the option `useThemedScrollbars`.
     * @default
     * ({ theme }) => theme.colors['scrollbarSlider.background']
     */
    scrollbarThumbColor: string;
    /**
     * Color of the scrollbar thumb when hovered, unless scrollbar color customization is disabled
     * by the option `useThemedScrollbars`.
     * @default
     * ({ theme }) => theme.colors['scrollbarSlider.hoverBackground']
     */
    scrollbarThumbHoverColor: string;
}

interface StyleSettings extends CoreStyleSettings {
}
/**
 * The value of a single style setting. You can either set it to a string,
 * or an array of two strings.
 *
 * If you use the array form, the first value will be used for dark themes,
 * and the second value for light themes.
 */
type StyleValueOrValues = string | [dark: string, light: string];
/**
 * A function that resolves a single style setting to a {@link StyleValueOrValues}.
 *
 * You can assign this to any style setting to dynamically generate style values
 * based on the current theme.
 *
 * This function is called once for each style variant in the engine's `styleVariants` array,
 * which includes one entry per theme in the engine's `themes` configuration option.
 */
type StyleResolverFn = (context: {
    theme: ExpressiveCodeTheme;
    /** The index in the engine's `styleVariants` array that's currently being resolved. */
    styleVariantIndex: number;
    resolveSetting: (settingPath: StyleSettingPath) => string;
}) => StyleValueOrValues;
/**
 * This is the value type for all style overrides.
 * It allows either static style values or a resolver function.
 */
type UnresolvedStyleValue = StyleValueOrValues | StyleResolverFn;
type UnresolvedPluginStyleSettings<T> = {
    [SettingName in keyof T]: UnresolvedStyleValue;
};
type Keys<T> = Exclude<keyof T, symbol>;
type FlattenKeys<T> = {
    [K in Keys<T>]: T[K] extends object ? `${K}.${Keys<T[K]>}` : K;
}[Keys<T>];
type StyleSettingPath = FlattenKeys<StyleSettings>;
type UnresolvedStyleSettings = {
    [K in keyof StyleSettings]: StyleSettings[K] extends object ? UnresolvedPluginStyleSettings<StyleSettings[K]> : UnresolvedStyleValue;
};
type StyleOverrides = Partial<{
    [K in keyof StyleSettings]: StyleSettings[K] extends object ? Partial<UnresolvedPluginStyleSettings<StyleSettings[K]>> : UnresolvedStyleValue;
}>;
type ResolvedStyleSettingsByPath = Map<StyleSettingPath, string>;
/**
 * Generates a CSS variable name for a given style setting path.
 *
 * Performs the following transformations on the path:
 * - To avoid name collisions, the name is prefixed with `--ec-`.
 * - All dots in the path are replaced with dashes.
 * - Various common terms are replaced with shorter alternatives to reduce CSS size
 *   (see {@link cssVarReplacements}).
 */
declare function getCssVarName(styleSetting: StyleSettingPath): string;
declare const codeLineClass = "ec-line";

type StyleVariant = {
    theme: ExpressiveCodeTheme;
    resolvedStyleSettings: ResolvedStyleSettingsByPath;
    cssVarDeclarations: Map<string, string>;
};
/**
 * Maps the given `themes` to an array of {@link StyleVariant `StyleVariant`} objects,
 * doing the following per theme:
 * - Resolving all style settings contributed by core & plugins,
 *   respecting both theme and global `styleOverrides` (theme overrides take precedence)
 * - Generating CSS variable declarations for the resolved style settings
 */
declare function resolveStyleVariants({ themes, plugins, styleOverrides, cssVarName, }: {
    themes: ExpressiveCodeTheme[];
    plugins: readonly ExpressiveCodePlugin[];
    styleOverrides: StyleOverrides;
    cssVarName: ResolverContext['cssVarName'];
}): StyleVariant[];

/**
 * Overrides the alpha value of a color with the given value.
 * Values should be between 0 and 1.
 */
declare function setAlpha(input: string, newAlpha: number): string;
/**
 * Multiplies the existing alpha value of a color with the given factor.
 * Automatically limits the resulting alpha value to the range 0 to 1.
 */
declare function multiplyAlpha(input: string, factor: number): string;
/**
 * Returns the luminance of a color.
 * Luminance values are between 0 and 1.
 */
declare function getLuminance(input: string): number;
/**
 * Mixes a color with white or black to achieve the desired luminance.
 * Luminance values should be between 0 and 1.
 */
declare function setLuminance(input: string, targetLuminance: number): string;
/**
 * Lightens a color by the given amount.
 * Automatically limits the resulting lightness value to the range 0 to 1.
 */
declare function lighten(input: string, amount: number): string;
/**
 * Darkens a color by the given amount.
 * Automatically limits the resulting lightness value to the range 0 to 1.
 */
declare function darken(input: string, amount: number): string;
/**
 * Mixes the second color into the first color by the given amount.
 * Amount should be between 0 and 1.
 */
declare function mix(input: string, mixinInput: string, amount: number): string;
/**
 * Computes how the first color would look on top of the second color.
 */
declare function onBackground(input: string, background: string): string;
declare function getColorContrast(color1: string, color2: string): number;
declare function getColorContrastOnBackground(input: string, background: string): number;
/**
 * Modifies the luminance and/or the alpha value of a color to ensure its color contrast
 * on the given background color is within the given range.
 *
 * - If the contrast is too low, the luminance is either increased or decreased first,
 *   and then the alpha value is increased (if required).
 * - If the contrast is too high, only the alpha value is decreased.
 *
 * If the target contrast cannot be reached, the function will try to get as close as possible.
 */
declare function ensureColorContrastOnBackground(input: string, background: string, minContrast?: number, maxContrast?: number): string;
declare function changeLuminanceToReachColorContrast(input1: string, input2: string, minContrast?: number): string;
declare function changeAlphaToReachColorContrast(input: string, background: string, minContrast?: number, maxContrast?: number): string;
/**
 * Given any number of input colors, which may include CSS variables with optional fallbacks,
 * returns the first static color.
 *
 * Returns `undefined` if no parseable static color can be found.
 */
declare function getFirstStaticColor(...inputs: (string | undefined)[]): string | undefined;
/**
 * Determine a static background color based on the given style variant,
 * trying to resolve fallback values of CSS variables if necessary.
 *
 * This color is intended to be used for contrast calculations, not as an actual background color.
 */
declare function getStaticBackgroundColor(styleVariant: StyleVariant): string;
type ChromaticRecolorTarget = {
    /**
     * The target hue in degrees (0 – 360).
     */
    hue: number;
    /**
     * The target chroma (0 – 0.4).
     *
     * If the input color's lightness is very high, the resulting chroma may be lower
     * than this value. This avoids results that appear too saturated in comparison
     * to the input color.
     */
    chroma: number;
    /**
     * The lightness (0 – 1) that the target chroma was measured at.
     *
     * If given, the chroma will be adjusted relative to this lightness
     * before applying it to the input color.
     */
    chromaMeasuredAtLightness?: number | undefined;
};
/**
 * Adjusts the input color based on the given target color while keeping
 * the input lightness unchanged. Uses the OKLCH color space to ensure
 * the resulting color is perceptually similar to the input color.
 *
 * The target color can either be defined as a string (e.g. a hex color),
 * or as an object with `hue` and `chroma`.
 *
 * Note that the resulting color's chroma may be lower than the target value
 * for input colors with very high lightness. This avoids results
 * that appear too saturated in comparison to the input color.
 */
declare function chromaticRecolor(input: string, target: string | ChromaticRecolorTarget): string;
declare function toHexColor(input: TinyColor | string): string;
declare function toRgbaString(input: string): string;

declare class ExpressiveCodeTheme implements Omit<ThemeRegistration, 'type' | 'colors' | 'settings'> {
    name: string;
    type: VSCodeThemeType;
    colors: VSCodeWorkbenchColors;
    fg: string;
    bg: string;
    semanticHighlighting: boolean;
    settings: ThemeSetting[];
    styleOverrides: StyleOverrides;
    /**
     * Loads the given theme for use with Expressive Code. Supports both Shiki and VS Code themes.
     *
     * You can also pass an existing `ExpressiveCodeTheme` instance to create a copy of it.
     *
     * Note: To save on bundle size, this constructor does not support loading themes
     * bundled with Shiki by name (e.g. `dracula`). Instead, import Shiki's `loadTheme`
     * function yourself, use it to load its bundled theme (e.g. `themes/dracula.json`),
     * and pass the result to this constructor.
     */
    constructor(theme: ExpressiveCodeThemeInput);
    /**
     * Applies chromatic adjustments to entire groups of theme colors while keeping their
     * relative lightness and alpha components intact. This can be used to quickly create
     * theme variants that fit the color scheme of any website or brand.
     *
     * Adjustments can either be defined as hue and chroma values in the OKLCH color space
     * (range 0–360 for hue, 0–0.4 for chroma), or these values can be extracted from
     * hex color strings (e.g. `#3b82f6`).
     *
     * You can target predefined groups of theme colors (e.g. `backgrounds`, `accents`)
     * and/or use the `custom` property to define your own groups of theme colors to be adjusted.
     * Each custom group must contain a `themeColorKeys` property with an array of VS Code
     * theme color keys (e.g. `['panel.background', 'panel.border']`) and a `targetHueAndChroma`
     * property that accepts the same adjustment target values as `backgrounds` and `accents`.
     * Custom groups will be applied in the order they are defined.
     *
     * Returns the same `ExpressiveCodeTheme` instance to allow chaining.
     */
    applyHueAndChromaAdjustments(adjustments: {
        backgrounds?: string | ChromaticRecolorTarget | undefined;
        accents?: string | ChromaticRecolorTarget | undefined;
        custom?: {
            themeColorKeys: string[];
            targetHueAndChroma: string | ChromaticRecolorTarget;
        }[] | undefined;
    }): this;
    /**
     * Processes the theme's syntax highlighting colors to ensure a minimum contrast ratio
     * between foreground and background colors.
     *
     * The default value of 5.5 ensures optimal accessibility with a contrast ratio of 5.5:1.
     *
     * You can optionally pass a custom background color to use for the contrast checks.
     * By default, the theme's background color will be used.
     *
     * Returns the same `ExpressiveCodeTheme` instance to allow chaining.
     */
    ensureMinSyntaxHighlightingColorContrast(minContrast?: number, backgroundColor?: string): this;
    /**
     * Parses the given theme settings into a properly typed format
     * that can be used by both Expressive Code and Shiki.
     *
     * As theme scopes can be defined as either a comma-separated string, or an array of strings,
     * they will always be converted to their array form to simplify further processing.
     *
     * Also recreates known object properties to prevent accidental mutation
     * of the original settings when copying a theme.
     */
    private parseThemeSettings;
    /**
     * Attempts to parse the given JSON string as a theme.
     *
     * As some themes follow the JSONC format and may contain comments and trailing commas,
     * this method will attempt to strip them before parsing the result.
     */
    static fromJSONString(json: string): ExpressiveCodeTheme;
}
type ExpressiveCodeThemeInput = Partial<Omit<ExpressiveCodeTheme | ThemeRegistration, 'type'>> & {
    type?: VSCodeThemeType | string | undefined;
    tokenColors?: unknown | undefined;
    semanticHighlighting?: boolean | undefined;
    styleOverrides?: StyleOverrides | undefined;
};
type ThemeSetting = {
    name?: string | undefined;
    scope?: string[] | undefined;
    settings: {
        foreground?: string | undefined;
        fontStyle?: string | undefined;
    };
};

interface ExpressiveCodeLoggerOptions {
    label: string;
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}
declare class ExpressiveCodeLogger implements ExpressiveCodeLoggerOptions {
    readonly label: string;
    readonly logger: Partial<ExpressiveCodeLoggerOptions>;
    constructor(logger?: Partial<ExpressiveCodeLoggerOptions>);
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}

interface ExpressiveCodeEngineConfig {
    /**
     * The color themes that should be available for your code blocks.
     *
     * CSS variables will be generated for all themes, allowing to select the theme to display
     * using CSS. If you specify one dark and one light theme, a `prefers-color-scheme` media query
     * will also be generated by default. You can customize this to match your site's needs
     * through the `useDarkModeMediaQuery` and `themeCssSelector` options.
     *
     * Defaults to the `github-dark` and `github-light` themes.
     */
    themes?: ExpressiveCodeTheme[] | undefined;
    /**
     * Determines if Expressive Code should process the syntax highlighting colors of all themes
     * to ensure an accessible minimum contrast ratio between foreground and background colors.
     *
     * Defaults to `5.5`, which ensures a contrast ratio of at least 5.5:1.
     * You can change the desired contrast ratio by providing another value,
     * or turn the feature off by setting this option to `0`.
     */
    minSyntaxHighlightingColorContrast?: number | undefined;
    /**
     * Determines if CSS code is generated that uses a `prefers-color-scheme` media query
     * to automatically switch between light and dark themes based on the user's system preferences.
     *
     * Defaults to `true` if your `themes` option is set to one dark and one light theme
     * (which is the default), and `false` otherwise.
     */
    useDarkModeMediaQuery?: boolean | undefined;
    /**
     * Allows to customize the base selector used to scope theme-dependent CSS styles.
     *
     * By default, this selector is `:root`, which ensures that all required CSS variables
     * are globally available.
     */
    themeCssRoot?: string | undefined;
    /**
     * Allows to customize the selectors used to manually switch between multiple themes.
     *
     * These selectors are useful if you want to allow your users to choose a theme
     * instead of relying solely on the media query generated by `useDarkModeMediaQuery`.
     *
     * Default value:
     * ```js
     * (theme) => `[data-theme='${theme.name}']`
     * ```
     *
     * You can add a theme selector either to your `<html>` element (which is targeted
     * by the `themeCssRoot` default value of `:root`), and/or any individual code block wrapper.
     *
     * For example, when using the default settings, selecting the theme `github-light`
     * for the entire page would look like this:
     * ```html
     * <html data-theme="github-light">
     * ```
     *
     * If your site's theme switcher requires a different approach, you can customize the selectors
     * using this option. For example, if you want to use class names instead of a data attribute,
     * you could set this option to a function that returns `.theme-${theme.name}` instead.
     *
     * If you want to prevent the generation of theme-specific CSS rules altogether,
     * you can set this to `false` or return it from the function.
     */
    themeCssSelector?: ((theme: ExpressiveCodeTheme, context: {
        styleVariants: StyleVariant[];
    }) => string | false) | false | undefined;
    /**
     * Allows to specify a CSS cascade layer name that should be used for all generated CSS.
     *
     * If you are using [cascade layers](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Cascade_layers)
     * on your site to control the order in which CSS rules are applied, set this option to
     * a non-empty string, and Expressive Code will wrap all of its generated CSS styles
     * in a `@layer` rule with the given name.
     */
    cascadeLayer?: string | undefined;
    /**
     * Determines if code blocks should be protected against influence from site-wide styles.
     *
     * Defaults to `true`, which causes Expressive Code to use the declaration `all: revert`
     * to revert all CSS properties to the values they would have had without any site-wide styles.
     * This ensures the most predictable results out of the box.
     *
     * You can set this to `false` if you want your site-wide styles to influence the code blocks.
     */
    useStyleReset?: boolean | undefined;
    /**
     * This optional function is called once per theme during engine initialization
     * with the loaded theme as its only argument.
     *
     * It allows customizing the loaded theme and can be used for various purposes:
     * - You can change a theme's `name` property to influence the CSS needed to select it
     *   (e.g., when using the default settings for `themeCssRoot` and `themeCssSelector`,
     *   setting `theme.name = 'dark'` will allow theme selection using `<html data-theme="dark">`).
     * - You can create color variations of themes by using `theme.applyHueAndChromaAdjustments()`.
     *
     * You can optionally return an `ExpressiveCodeTheme` instance from this function to replace
     * the theme provided in the configuration. This allows you to create a copy of the theme
     * and modify it without affecting the original instance.
     */
    customizeTheme?: ((theme: ExpressiveCodeTheme) => ExpressiveCodeTheme | void) | undefined;
    /**
     * Whether the themes are allowed to style the scrollbars. Defaults to `true`.
     *
     * If set to `false`, scrollbars will be rendered using the browser's default style.
     *
     * Note that you can override the individual scrollbar colors defined by the theme
     * using the `styleOverrides` option.
     */
    useThemedScrollbars?: boolean | undefined;
    /**
     * Whether the themes are allowed to style selected text. Defaults to `false`.
     *
     * By default, Expressive Code renders selected text in code blocks using the browser's
     * default style to maximize accessibility. If you want your selections to be more colorful,
     * you can set this option to `true` to allow using theme selection colors instead.
     *
     * Note that you can override the individual selection colors defined by the theme
     * using the `styleOverrides` option.
     */
    useThemedSelectionColors?: boolean | undefined;
    /**
     * An optional set of style overrides that can be used to customize the appearance of
     * the rendered code blocks without having to write custom CSS.
     *
     * The root level of this nested object contains core styles like colors, fonts, paddings
     * and more. Plugins can contribute their own style settings to this object as well.
     * For example, if the `frames` plugin is enabled, you can override its `shadowColor` by
     * setting `styleOverrides.frames.shadowColor` to a color value.
     *
     * If any of the settings are not given, default values will be used or derived from the theme.
     *
     * **Tip:** If your site uses CSS variables for styling, you can also use these overrides
     * to replace any core style with a CSS variable reference, e.g. `var(--your-css-var)`.
     */
    styleOverrides?: StyleOverrides | undefined;
    /**
     * The locale that should be used for text content. Defaults to `en-US`.
     */
    defaultLocale?: string | undefined;
    /**
     * An optional set of default props for all code blocks in your project.
     *
     * For example, setting this to `{ wrap: true }` enables word wrapping on all code blocks
     * by default, saving you from having to manually set this option on every single code block.
     */
    defaultProps?: (ExpressiveCodeBlock['props'] & {
        /**
         * Allows to override the default props based on a code block's
         * syntax highlighting language.
         *
         * Use the language IDs as keys and an object containing the props as values.
         * The keys also support specifying multiple language IDs separated by commas
         * to apply the same props to multiple languages.
         *
         * @example
         * ```js
         * defaultProps: {
         *   wrap: true,
         *   overridesByLang: {
         *     'bash,sh,zsh': { wrap: false }
         *   }
         * }
         * ```
         */
        overridesByLang?: Record<string, ExpressiveCodeBlock['props']> | undefined;
    }) | undefined;
    /**
     * An optional array of plugins that should be used when rendering code blocks.
     *
     * To add a plugin, import its initialization function and call it inside this array.
     *
     * If the plugin has any configuration options, you can pass them to the initialization
     * function as an object containing your desired property values.
     *
     * If any nested arrays are found inside the `plugins` array, they will be flattened
     * before processing.
     */
    plugins?: (ExpressiveCodePlugin | ExpressiveCodePlugin[])[] | undefined;
    logger?: Partial<ExpressiveCodeLoggerOptions> | undefined;
    /**
     * @deprecated Efficient multi-theme support is now a core feature, so the `theme` option
     * was deprecated in favor of the new array `themes`. Please migrate your existing config
     * to use `themes` and ensure it is an array. If you only need a single theme, your `themes`
     * array can contain just this one theme. However, please consider the benefits of providing
     * multiple themes. See the `themes` option for more details.
     */
    theme?: ExpressiveCodeTheme | undefined;
}
type ResolvedExpressiveCodeEngineConfig = {
    [P in keyof Omit<ExpressiveCodeEngineConfig, 'customizeTheme' | 'plugins' | 'theme' | 'logger'>]-?: Exclude<ExpressiveCodeEngineConfig[P], undefined>;
} & {
    customizeTheme: ExpressiveCodeEngineConfig['customizeTheme'];
    plugins: readonly ExpressiveCodePlugin[];
    logger: ExpressiveCodeLogger;
};
/**
 * The Expressive Code engine is responsible for rendering code blocks to a
 * [Hypertext Abstract Syntax Tree (HAST)](https://github.com/syntax-tree/hast)
 * that can be serialized to HTML, as well as generating the required CSS styles
 * and JS modules.
 *
 * It also provides read-only access to all resolved configuration options
 * through its public properties.
 */
declare class ExpressiveCodeEngine implements ResolvedExpressiveCodeEngineConfig {
    /**
     * Creates a new instance of the Expressive Code engine.
     *
     * To minimize overhead caused by loading plugins, you can create a single instance
     * for your application and keep using it to render all your code blocks.
     */
    constructor(config: ExpressiveCodeEngineConfig);
    /**
     * Renders the given code block(s) and returns the rendered group & block ASTs,
     * the rendered code block contents after all transformations have been applied,
     * and a set of non-global CSS styles required by the rendered code blocks.
     *
     * In Expressive Code, all processing of your code blocks and their metadata
     * is performed by plugins. To render markup around lines or inline ranges of characters,
     * the `render` method calls the hook functions registered by all added plugins.
     *
     * @param input
     * The code block(s) to render. Can either be an `ExpressiveCodeBlockOptions` object
     * containing the properties required to create a new `ExpressiveCodeBlock` internally,
     * an existing `ExpressiveCodeBlock`, or an array containing any combination of these.
     *
     * @param options
     * Optional configuration options for the rendering process.
     */
    render(input: RenderInput, options?: RenderOptions): Promise<{
        renderedGroupAst: hast.Element;
        renderedGroupContents: RenderedGroupContents;
        styles: Set<string>;
    }>;
    /**
     * Returns a string containing all CSS styles that should be added to every page
     * using Expressive Code. These styles are static base styles which do not depend
     * on the configured theme(s).
     *
     * The calling code must take care of actually adding the returned styles to the page.
     *
     * Please note that the styles contain references to CSS variables, which must also
     * be added to the page. These can be obtained by calling {@link getThemeStyles}.
     */
    getBaseStyles(): Promise<string>;
    /**
     * Returns a string containing theme-dependent styles that should be added to every page
     * using Expressive Code. These styles contain CSS variable declarations that are generated
     * automatically based on the configured {@link ExpressiveCodeEngineConfig.themes themes},
     * {@link ExpressiveCodeEngineConfig.useDarkModeMediaQuery useDarkModeMediaQuery} and
     * {@link ExpressiveCodeEngineConfig.themeCssSelector themeCssSelector} config options.
     *
     * The first theme defined in the `themes` option is considered the "base theme",
     * for which a full set of CSS variables is declared and scoped to the selector
     * defined by the `themeCssRoot` option (defaults to `:root`).
     *
     * For all alternate themes, a differential set of CSS variables is declared for cases where
     * their values differ from the base theme, and scoped to theme-specific selectors that are
     * generated by combining `themeCssRoot` with the theme selector specified by this option.
     *
     * The calling code must take care of actually adding the returned styles to the page.
     *
     * Please note that these styles must be added to the page together with the base styles
     * returned by {@link getBaseStyles}.
     */
    getThemeStyles(): Promise<string>;
    /**
     * Returns an array of JavaScript modules (pure code without any wrapping `script` tags)
     * that should be added to every page containing code blocks.
     *
     * The contents are collected from the `jsModules` property of all registered plugins.
     * Any duplicates are removed.
     *
     * The calling code must take care of actually adding the collected scripts to the page.
     * For example, it could create site-wide JavaScript files from the returned modules
     * and refer to them in a script tag with `type="module"`, or it could insert them
     * into inline `<script type="module">` elements.
     */
    getJsModules(): Promise<string[]>;
    private cssVar;
    private getResolverContext;
    readonly themes: ExpressiveCodeTheme[];
    readonly minSyntaxHighlightingColorContrast: number;
    readonly useDarkModeMediaQuery: boolean;
    readonly themeCssRoot: string;
    readonly themeCssSelector: NonNullable<ExpressiveCodeEngineConfig['themeCssSelector']>;
    readonly cascadeLayer: string;
    readonly useStyleReset: boolean;
    readonly customizeTheme: ExpressiveCodeEngineConfig['customizeTheme'];
    readonly useThemedScrollbars: boolean;
    readonly useThemedSelectionColors: boolean;
    readonly styleOverrides: StyleOverrides;
    readonly styleVariants: StyleVariant[];
    readonly defaultLocale: string;
    readonly defaultProps: NonNullable<ExpressiveCodeEngineConfig['defaultProps']>;
    readonly plugins: readonly ExpressiveCodePlugin[];
    readonly logger: ExpressiveCodeLogger;
}

type RenderInput = ExpressiveCodeBlockOptions | ExpressiveCodeBlock | (ExpressiveCodeBlockOptions | ExpressiveCodeBlock)[];
interface RenderOptions {
    /**
     * An optional handler function that can initialize plugin data for the
     * code block group before processing starts.
     *
     * Plugins can provide access to their data by exporting a const
     * set to a `new AttachedPluginData(...)` instance (e.g. `myPluginData`).
     *
     * You can then import the const and set `onInitGroup` to a function that
     * calls `myPluginData.setFor(group, { ...data... })`.
     */
    onInitGroup?: ((groupContents: GroupContents) => void) | undefined;
}
type GroupContents = readonly {
    codeBlock: ExpressiveCodeBlock;
}[];
type RenderedGroupContents = readonly {
    codeBlock: ExpressiveCodeBlock;
    renderedBlockAst: Element;
}[];

interface GutterElement {
    /**
     * When rendering code lines, the engine goes through all gutter elements registered by
     * the installed plugins and calls this function to render the gutter element for that line.
     *
     * It is expected to return a HAST node that represents the gutter element. For example,
     * the line numbers plugin uses the `hastscript` library here to create an HTML element
     * containing the current line number.
     *
     * After rendering all gutter elements registered by the installed plugins, the engine adds
     * the returned HAST nodes as children to the line's gutter container.
     *
     * Please ensure (e.g. through CSS defined in your plugin's base styles) that your gutter
     * element has a fixed width across all lines, even if you don't render any content inside
     * your element for some lines. As each line's gutter container is immediately followed
     * by the line's code contents, the combined width of all gutter elements must stay constant
     * to ensure that the code contents of all lines are aligned.
     */
    renderLine(context: GutterRenderContext): Element;
    /**
     * Some plugins may render lines that are not part of the original code, e.g. to display
     * the expected output of a call right inside the code block.
     *
     * To properly align such lines with the original code, plugins can request an empty line
     * from the engine using the `renderEmptyLine` context function.
     *
     * When called, the engine goes through all gutter elements registered by the installed plugins
     * and calls their `renderPlaceholder` function to render the placeholder gutter contents.
     */
    renderPlaceholder(): Element;
    /**
     * Determines the phase in which this gutter element should be rendered.
     * Rendering is done in phases, from `earliest` to `latest`.
     * Elements with the same phase are rendered in the order they were added.
     *
     * The earlier a gutter element is rendered, the further to the beginning of the line
     * it will be placed. For example, the line numbers plugin renders its gutter elements
     * in the `earlier` phase to ensure that they are placed before most other gutter elements.
     *
     * The default phase is `normal`.
     */
    renderPhase?: AnnotationRenderPhase | undefined;
}
type GutterRenderContext = ExpressiveCodeHookContextBase & {
    line: ExpressiveCodeLine;
    lineIndex: number;
};

interface ExpressiveCodeHookContextBase extends ResolverContext {
    codeBlock: ExpressiveCodeBlock;
    groupContents: GroupContents;
    locale: string;
    /**
     * The Expressive Code engine configuration, with all optional properties
     * resolved to their default values.
     */
    config: ResolvedExpressiveCodeEngineConfig;
}
interface ExpressiveCodeHookContext extends ExpressiveCodeHookContextBase {
    /**
     * Adds CSS styles to the document that contains the rendered code.
     *
     * All styles are scoped to Expressive Code by default, so they will not affect
     * the rest of the page. SASS-like nesting is supported. If you want to add global styles,
     * you can use the `@at-root` rule or target `:root`, `html` or `body` in your selectors.
     *
     * The engine's `render` function returns all added styles in a string array along with
     * the rendered group and block ASTs. The calling code must take care of actually adding
     * these styles to the page. For example, it could insert them into a `<style>` element
     * before the rendered code block.
     *
     * **Note for integration authors:** If you are rendering multiple code block groups on the
     * same HTML page, you should deduplicate the returned styles at the page level.
     * Expressive Code deduplicates styles added to the same group before returning them,
     * but is not aware which styles are already present on the page.
     *
     * **Note for plugin authors:** If you are adding the same styles to every block,
     * consider using the `baseStyles` property of the plugin instead. This allows integrations
     * to optionally extract these styles into a separate CSS file.
     */
    addStyles: (css: string) => void;
    /**
     * Registers a gutter element for the current code block.
     *
     * The engine calls the {@link GutterElement.renderLine `renderLine`} function
     * of the gutter elements registered by all plugins for every line of the code block.
     * The returned elements are then added as children to the line's gutter container.
     */
    addGutterElement: (element: GutterElement) => void;
}
/**
 * A context object that the engine passes to the `postprocessRenderedLine` hook function.
 *
 * In addition to the properties made available by {@link ExpressiveCodeHookContext},
 * it provides access to information about the line currently being rendered,
 * and allows modifying the rendered output.
 */
interface PostprocessRenderedLineContext extends Omit<ExpressiveCodeHookContext, 'addGutterElement'> {
    /**
     * A reference to the line that is currently being rendered. It is read-only at this point,
     * but you can access all line properties, including its source code and annotations.
     */
    line: ExpressiveCodeLine;
    /**
     * The 0-based index of the line inside the code block.
     */
    lineIndex: number;
    /**
     * Allows modifying the line's rendered output. The `lineAst` property of this object contains
     * the [Hypertext Abstract Syntax Tree (HAST)](https://github.com/syntax-tree/hast) node
     * representing the rendered line.
     *
     * You have full control over the `lineAst` property to modify the rendered output.
     * For example, you could add a class name to the line's root element, or you could wrap
     * the entire line in a custom element.
     *
     * There is a wide range of existing utility packages that you can use to manipulate
     * HAST elements. For more information, see the
     * [list of utilities](https://github.com/syntax-tree/hast#list-of-utilities) in the
     * HAST documentation.
     */
    renderData: {
        lineAst: Element;
    };
    /**
     * Allows rendering an empty line that is not part of the original code.
     *
     * Some plugins may need to render lines that are not part of the original code, e.g. to display
     * the expected output of a call right inside the code block. To align such lines with the
     * original code, plugins can request an empty line from the engine using this function.
     */
    renderEmptyLine: RenderEmptyLineFn;
}
/**
 * A context object that the engine passes to the `postprocessRenderedBlock` hook function.
 *
 * In addition to the properties made available by {@link ExpressiveCodeHookContext},
 * it provides access to render data of the code block currently being rendered,
 * and allows modifying the rendered output.
 */
interface PostprocessRenderedBlockContext extends Omit<ExpressiveCodeHookContext, 'addGutterElement'> {
    /**
     * Allows modifying the block's rendered output. The `blockAst` property of this object contains
     * the [Hypertext Abstract Syntax Tree (HAST)](https://github.com/syntax-tree/hast) node
     * representing the rendered block.
     *
     * You have full control over the `blockAst` property to modify the rendered output.
     * For example, you could add a class name to the block's root element,
     * wrap the entire block in a custom element, or traverse its children
     * to find specific elements and modify them.
     *
     * There is a wide range of existing utility packages that you can use to manipulate
     * HAST elements. For more information, see the
     * [list of utilities](https://github.com/syntax-tree/hast#list-of-utilities) in the
     * HAST documentation.
     */
    renderData: {
        blockAst: Element;
    };
    /**
     * Allows rendering an empty line that is not part of the original code.
     *
     * Some plugins may need to render lines that are not part of the original code, e.g. to display
     * the expected output of a call right inside the code block. To align such lines with the
     * original code, plugins can request an empty line from the engine using this function.
     */
    renderEmptyLine: RenderEmptyLineFn;
}
type RenderEmptyLineFn = () => {
    lineAst: Element;
    gutterWrapper: Element | undefined;
    codeWrapper: Element;
};
/**
 * A context object that the engine passes to the `postprocessRenderedBlockGroup` hook function.
 *
 * It provides access to information about the code block group currently being rendered,
 * and allows modifying the rendered output.
 */
interface PostprocessRenderedBlockGroupContext {
    /**
     * An array of objects, each containing a reference to the code block,
     * and its rendered HAST output. This is the same HAST element per block that is also available
     * in the `renderData` property of the `postprocessRenderedBlock` hook context.
     */
    renderedGroupContents: RenderedGroupContents;
    /**
     * A list of styles that plugins added to the current code block group using the `addStyles`
     * hook context function. Each item contains the plugin name and the styles it added.
     * You have full control over the styles at this point and can add, modify or remove them
     * as needed.
     */
    pluginStyles: PluginStyles[];
    /**
     * See {@link ExpressiveCodeHookContext.addStyles}.
     */
    addStyles: (css: string) => void;
    /**
     * Allows modifying the rendered output of a group of code blocks. The `groupAst` property of this object contains
     * the [Hypertext Abstract Syntax Tree (HAST)](https://github.com/syntax-tree/hast) parent node
     * surrounding all rendered blocks.
     *
     * This is the only property that allows you to modify the wrapper element of the entire group.
     * You have full control over it to modify the rendered output.
     * For example, you could add a class name to the group’s root element,
     * or you could wrap the entire group in a custom element.
     */
    renderData: {
        groupAst: Element;
    };
}
/**
 * The base type of all hooks. It is a function that gets called by the engine
 * and receives a context object. The context type defaults to {@link ExpressiveCodeHookContext},
 * but can vary by hook, so see the list of available hooks for the correct type.
 */
type ExpressiveCodeHook<ContextType = ExpressiveCodeHookContext> = (context: ContextType) => void | Promise<void>;
/** @internal */
interface ExpressiveCodePluginHooks_BeforeRendering {
    /**
     * Allows preprocessing the code block's {@link ExpressiveCodeBlock.language language}
     * identifier before loading language-specific defaults into
     * {@link ExpressiveCodeBlock.props props}.
     *
     * The Text Markers plugin uses this hook to override the `diff` language identifier
     * with the language specified in the `lang` meta option (if given) to allow using diff syntax
     * to mark inserted and deleted lines while using another language for syntax highlighting.
     */
    preprocessLanguage?: ExpressiveCodeHook | undefined;
    /**
     * Allows preprocessing the meta string and the props before any plugins can
     * modify the code.
     *
     * Instead of accessing the raw meta string, plugins are recommended to use the parsed version
     * of the contained options through the {@link ExpressiveCodeBlock.metaOptions} property.
     *
     * As the code still matches the plaintext in the containing Markdown/MDX document at this
     * point, this hook can be used to apply annotations by line numbers.
     */
    preprocessMetadata?: ExpressiveCodeHook | undefined;
    /**
     * Allows preprocessing the code before any language-specific hooks are run.
     *
     * Plugins are expected to use this hook to remove any of their syntax that could disturb
     * annotation plugins like syntax highlighters. Removed information can either be stored
     * internally or used to create annotations.
     *
     * Plugins can also use this hook to insert new code, e.g. to add type information for
     * syntax highlighters, or to provide functionality to include external files into the
     * code block.
     */
    preprocessCode?: ExpressiveCodeHook | undefined;
    /**
     * Allows analyzing the preprocessed code and collecting language-specific syntax annotations.
     *
     * This hook is used by syntax highlighting plugins to run the code through `Shiki` or
     * `Shiki-Twoslash` and to create annotations from their highlighted tokens.
     *
     * These annotations are then available to the following hooks and will be used during
     * rendering.
     */
    performSyntaxAnalysis?: ExpressiveCodeHook | undefined;
    /**
     * Allows postprocessing the code plaintext after collecting syntax annotations.
     *
     * Plugins are expected to use this hook to remove any parts from the code
     * that should not be contained in the output. For example, if a plugin added declarations
     * or type information during the `preprocessCode` hook to provide information to the
     * syntax highlighter, the declarations could now be removed again.
     *
     * After this hook has finished processing, the plaintext of all code lines becomes read-only.
     */
    postprocessAnalyzedCode?: ExpressiveCodeHook | undefined;
    /**
     * Allows annotating the final code plaintext.
     *
     * As the code is read-only at this point, plugins can use this hook to create annotations
     * on lines or inline ranges matching a specific search term.
     */
    annotateCode?: ExpressiveCodeHook | undefined;
    /**
     * Allows applying final changes to annotations before rendering.
     *
     * After this hook has finished processing, all annotations become read-only.
     */
    postprocessAnnotations?: ExpressiveCodeHook | undefined;
}
/** @internal */
interface ExpressiveCodePluginHooks_Rendering {
    /**
     * Allows editing the AST of a single line of code after all annotations were rendered.
     */
    postprocessRenderedLine?: ExpressiveCodeHook<PostprocessRenderedLineContext> | undefined;
    /**
     * Allows editing the AST of the entire code block after all annotations were rendered
     * and all lines were postprocessed.
     */
    postprocessRenderedBlock?: ExpressiveCodeHook<PostprocessRenderedBlockContext> | undefined;
    /**
     * Allows editing the ASTs of all code blocks that were rendered as part of the same group,
     * as well as the AST of the group root element that contains all group blocks.
     *
     * Groups are defined by the calling code. For example, a rehype plugin using Expressive Code
     * to render code blocks could provide authors with a way to group related code blocks together.
     *
     * This hook is used by the frames plugin to display multiple code blocks as editor file tabs.
     *
     * Note: Even if a code block is not part of any group, this hook will still be called.
     * Standalone code blocks are treated like a group containing only a single block.
     */
    postprocessRenderedBlockGroup?: ExpressiveCodeHook<PostprocessRenderedBlockGroupContext> | undefined;
}
interface ExpressiveCodePluginHooks extends ExpressiveCodePluginHooks_BeforeRendering, ExpressiveCodePluginHooks_Rendering {
}
type ExpressiveCodePluginHookName = keyof ExpressiveCodePluginHooks;
/**
 * Runs the given `runner` function for every hook that was registered by plugins
 * for the given hook type.
 *
 * The runner function is called with an object containing the hook name, the hook function
 * registered by the plugin, and the plugin that registered it.
 *
 * Errors occuring in the runner function are caught and rethrown with information about the
 * plugin and hook that caused the error.
 */
declare function runHooks<HookType extends keyof ExpressiveCodePluginHooks>(key: HookType, context: {
    plugins: readonly ExpressiveCodePlugin[];
    config: ResolvedExpressiveCodeEngineConfig;
}, runner: (hook: {
    hookName: HookType;
    hookFn: NonNullable<ExpressiveCodePluginHooks[HookType]>;
    plugin: ExpressiveCodePlugin;
}) => void | Promise<void>): Promise<void>;

/**
 * An interface that defines an Expressive Code plugin. To add a custom plugin,
 * you pass an object matching this interface into the `plugins` array property
 * of the engine configuration.
 */
interface ExpressiveCodePlugin {
    /**
     * The display name of the plugin. This is the only required property.
     * It is used by the engine to display messages concerning the plugin,
     * e.g. when it encounters an error.
     */
    name: string;
    /**
     * An instance of `PluginStyleSettings` that is used to define the plugin's CSS variables.
     */
    styleSettings?: PluginStyleSettings | undefined;
    /**
     * The CSS styles that should be added to every page containing code blocks.
     *
     * All styles are scoped to Expressive Code by default, so they will not affect
     * the rest of the page. SASS-like nesting is supported. If you want to add global styles,
     * you can use the `@at-root` rule or target `:root`, `html` or `body` in your selectors.
     *
     * The engine's `getBaseStyles` function goes through all registered plugins
     * and collects their base styles.
     *
     * If you provide a function instead of a string, it is called with an object argument
     * of type {@link ResolverContext}, and is expected to return a string or a string promise.
     *
     * The calling code must take care of actually adding the collected styles to the page.
     * For example, it could create a site-wide CSS stylesheet from the base styles
     * and insert a link to it, or it could insert the base styles into a `<style>` element.
     */
    baseStyles?: string | BaseStylesResolverFn | undefined;
    /**
     * JavaScript modules (pure code without any wrapping `script` tags) that should be added
     * to every page containing code blocks.
     *
     * The engine's `getJsModules` function goes through all registered plugins,
     * collects their JS modules and deduplicates them.
     *
     * If you provide a function instead of a string, it is called with an object argument
     * of type {@link ResolverContext}, and is expected to return a string or a string promise.
     *
     * The calling code must take care of actually adding the collected scripts to the page.
     * For example, it could create site-wide JavaScript files from the returned modules
     * and refer to them in a script tag with `type="module"`, or it could insert them
     * into inline `<script type="module">` elements.
     */
    jsModules?: string[] | JsModulesResolverFn | undefined;
    /**
     * A set of functions that should be called by the engine at specific points in the
     * rendering process. See {@link ExpressiveCodePluginHooks} for a list of available hooks.
     */
    hooks?: ExpressiveCodePluginHooks | undefined;
}
type BaseStylesResolverFn = (context: ResolverContext) => string | Promise<string>;
type JsModulesResolverFn = (context: ResolverContext) => string[] | Promise<string[]>;
/**
 * A context object that the engine passes to most hook functions.
 *
 * It provides access to theme-dependent CSS variables, all resolved style variants
 * based on the configured themes and settings, and the config-dependent wrapper class name.
 */
type ResolverContext = {
    /**
     * Returns a CSS variable reference for the given style setting. The CSS variable name is
     * automatically generated based on the setting path.
     *
     * You can optionally pass a fallback value that will be added to the CSS `var()` function call
     * (e.g. `var(--ec-xyz, fallbackValue)`) in case the referenced variable is not defined or
     * unsupported. However, this should rarely be the case as the engine automatically generates
     * CSS variables for all style settings if the plugin's `styleSettings` property is set.
     *
     * @example
     * cssVar('frames.fontSize')
     * // ↓↓↓
     * 'var(--ec-frames-fontSize)'
     *
     * cssVar('frames.fontSize', '2rem')
     * // ↓↓↓
     * 'var(--ec-frames-fontSize, 2rem)'
     */
    cssVar: (styleSetting: StyleSettingPath, fallbackValue?: string) => string;
    /**
     * Returns the CSS variable name for the given style setting. The CSS variable name is
     * automatically generated based on the setting path.
     *
     * @example
     * cssVarName('frames.fontSize')
     * // ↓↓↓
     * '--ec-frames-fontSize'
     */
    cssVarName: (styleSetting: StyleSettingPath) => string;
    styleVariants: StyleVariant[];
};
/**
 * A utility function that helps you define an Expressive Code plugin.
 *
 * Using this function is recommended, but not required. It just passes through the given object,
 * but it also provides type information for your editor's auto-completion and type checking.
 *
 * @example
 * ```js
 * // your-plugin.mjs
 * import { definePlugin } from '@expressive-code/core'
 *
 * export function myCustomPlugin() {
 *   return definePlugin({
 *     name: 'My custom plugin',
 *     hooks: {
 *       // ...
 *     }
 *   })
 * }
 * ```
 */
declare function definePlugin(plugin: ExpressiveCodePlugin): ExpressiveCodePlugin;

interface ExpressiveCodeProcessingState {
    canEditCode: boolean;
    canEditLanguage: boolean;
    canEditMetadata: boolean;
    canEditAnnotations: boolean;
}

interface ExpressiveCodeBlockOptions {
    /**
     * The plaintext contents of the code block.
     */
    code: string;
    /**
     * The code block's language.
     *
     * Please use a valid [language identifier](https://expressive-code.com/key-features/syntax-highlighting/#supported-languages)
     * to ensure proper syntax highlighting.
     */
    language: string;
    /**
     * An optional meta string. In markdown or MDX documents, this is the part of the
     * code block's opening fence that comes after the language name.
     */
    meta?: string | undefined;
    /**
     * Optional props that can be used to influence the rendering of this code block.
     *
     * Plugins can add their own props to this type. To allow users to set these props through
     * the meta string, plugins can use the `preprocessMetadata` hook to read `metaOptions`
     * and update the `props` object accordingly.
     */
    props?: PartialAllowUndefined<ExpressiveCodeBlockProps> | undefined;
    /**
     * The code block's locale (e.g. `en-US` or `de-DE`). This is used by plugins to display
     * localized strings depending on the language of the containing page.
     *
     * If no locale is defined here, most Expressive Code integrations will attempt to auto-detect
     * the block locale using the configured
     * [`getBlockLocale`](https://expressive-code.com/reference/configuration/#getblocklocale)
     * function, and finally fall back to the configured
     * [`defaultLocale`](https://expressive-code.com/reference/configuration/#defaultlocale).
     */
    locale?: string | undefined;
    /**
     * Optional data about the parent document the code block is located in.
     *
     * Integrations like `rehype-expressive-code` can provide this information based on the
     * source document being processed. There may be cases where no document is available,
     * e.g. when the code block was created dynamically.
     */
    parentDocument?: {
        /**
         * The full path to the source file containing the code block.
         */
        sourceFilePath?: string | undefined;
        /**
         * A reference to the object representing the parsed source document.
         * This reference will stay the same for all code blocks in the same document.
         *
         * For example, if you are using `rehype-expressive-code` to render code blocks
         * in a Markdown file, this would be the `hast` node representing the file's
         * root node.
         */
        documentRoot?: unknown | undefined;
        /**
         * Data about the position of the code block in the parent document.
         */
        positionInDocument?: {
            groupIndex: number;
            totalGroups?: number | undefined;
        } | undefined;
    } | undefined;
}
type PartialAllowUndefined<T> = {
    [Key in keyof T]?: T[Key] | undefined;
};
interface ExpressiveCodeBlockProps {
    /**
     * If `true`, word wrapping will be enabled for the code block, causing lines that exceed
     * the available width to wrap to the next line. You can use the `preserveIndent` option
     * to control how wrapped lines are indented.
     *
     * If `false`, lines that exceed the available width will cause a horizontal scrollbar
     * to appear.
     *
     * @note This option only affects how the code block is displayed and does not change
     * the actual code. When copied to the clipboard, the code will still contain the
     * original unwrapped lines.
     *
     * @default false
     */
    wrap: boolean;
    /**
     * If `true`, wrapped parts of long lines will be aligned with their line's
     * indentation level, making the wrapped code appear to start at the same column.
     * This increases readability of the wrapped code and can be especially useful
     * for languages where indentation is significant, e.g. Python.
     *
     * If `false`, wrapped parts of long lines will always start at column 1.
     * This can be useful to reproduce terminal output.
     *
     * @note This option only has an effect if `wrap` is `true`. It only affects how the
     * code block is displayed and does not change the actual code. When copied to the clipboard,
     * the code will still contain the original unwrapped lines.
     *
     * @default true
     */
    preserveIndent: boolean;
    /**
     * Defines the number of columns by which all wrapped lines are indented.
     *
     * This option only has an effect if `wrap` is `true`.
     *
     * If `preserveIndent` is `true`, this value is added to the indentation of the
     * original line. If `preserveIndent` is `false`, this value is used as the
     * indentation for all wrapped lines.
     *
     * @note This option only affects how the code block is displayed
     * and does not change the actual code. When copied to the clipboard,
     * the code will still contain the original unwrapped lines.
     *
     * @default 0
     */
    hangingIndent: number;
}
/**
 * Represents a single code block that can be rendered by the Expressive Code engine.
 */
declare class ExpressiveCodeBlock {
    #private;
    constructor(options: ExpressiveCodeBlockOptions);
    /**
     * This field exists to ensure that only actual class instances are accepted
     * as the type `ExpressiveCodeBlock` by TypeScript. Without this workaround,
     * plain objects with the same structure would be accepted, but fail at runtime.
     */
    private _requireInstance;
    /**
     * Provides read-only access to the code block's plaintext contents.
     */
    get code(): string;
    get language(): string;
    /**
     * Allows getting and setting the code block's language.
     *
     * Setting this property may throw an error if not allowed in the current {@link state}.
     */
    set language(value: string);
    get meta(): string;
    /**
     * Allows getting or setting the code block's meta string. In markdown or MDX documents,
     * this is the part of the code block's opening fence that comes after the language name.
     *
     * Setting this property may throw an error if not allowed in the current {@link state}.
     */
    set meta(value: string);
    /**
     * Provides read-only access to the parsed version of the block's {@link meta} string.
     */
    get metaOptions(): MetaOptions;
    /**
     * Provides access to the code block's props.
     *
     * To allow users to set these props through the meta string, plugins can use the
     * `preprocessMetadata` hook to read `metaOptions` and update their props accordingly.
     *
     * Props can be modified until rendering starts and become read-only afterwards.
     */
    get props(): NonNullable<ExpressiveCodeBlockOptions['props']>;
    /**
     * Allows getting the code block's locale (e.g. `en-US` or `de-DE`). It is used by plugins
     * to display localized strings depending on the language of the containing page.
     *
     * Integrations like `rehype-expressive-code` support multi-language sites by allowing you
     * to provide custom logic to determine a block's locale (e.g. based on its parent document).
     *
     * If no locale is defined here, `ExpressiveCodeEngine` will render the code block
     * using the `defaultLocale` provided in its configuration.
     */
    get locale(): string | undefined;
    /**
     * Provides read-only access to optional data about the parent document
     * the code block is located in.
     *
     * Integrations like `rehype-expressive-code` can provide this information based on
     * the source document being processed. There may be cases where no document is available,
     * e.g. when the code block was created dynamically.
     */
    get parentDocument(): {
        /**
         * The full path to the source file containing the code block.
         */
        sourceFilePath?: string | undefined;
        /**
         * A reference to the object representing the parsed source document.
         * This reference will stay the same for all code blocks in the same document.
         *
         * For example, if you are using `rehype-expressive-code` to render code blocks
         * in a Markdown file, this would be the `hast` node representing the file's
         * root node.
         */
        documentRoot?: unknown;
        /**
         * Data about the position of the code block in the parent document.
         */
        positionInDocument?: {
            groupIndex: number;
            totalGroups?: number | undefined;
        } | undefined;
    } | undefined;
    /**
     * Provides read-only access to the code block's processing state.
     *
     * The processing state controls which properties of the code block can be modified.
     * The engine updates it automatically during rendering.
     */
    get state(): ExpressiveCodeProcessingState | undefined;
    /**
     * @internal
     */
    set state(value: ExpressiveCodeProcessingState | undefined);
    /**
     * Returns the line at the given index, or `undefined` if the index is out of range.
     */
    getLine(index: number): ExpressiveCodeLine | undefined;
    /**
     * Returns a readonly array of lines starting at the given index and ending before
     * the given index (exclusive). The indices support the same syntax as JavaScript’s
     * `Array.slice` method.
     */
    getLines(startIndex?: number, endIndex?: number): readonly ExpressiveCodeLine[];
    /**
     * Deletes the line at the given index.
     *
     * May throw an error if not allowed in the current {@link state}.
     */
    deleteLine(index: number): void;
    /**
     * Deletes the lines at the given indices.
     *
     * This function automatically sorts the indices in descending order before deleting the lines,
     * so you do not need to worry about indices shifting after deleting a line.
     *
     * May throw an error if not allowed in the current {@link state}.
     */
    deleteLines(indices: number[]): void;
    /**
     * Inserts a new line at the given index.
     *
     * May throw an error if not allowed in the current {@link state}.
     */
    insertLine(index: number, textLine: string): ExpressiveCodeLine;
    /**
     * Inserts multiple new lines at the given index.
     *
     * May throw an error if not allowed in the current {@link state}.
     */
    insertLines(index: number, textLines: string[]): ExpressiveCodeLine[];
}

declare class ExpressiveCodeLine {
    #private;
    constructor(text: string);
    get text(): string;
    get parent(): ExpressiveCodeBlock | undefined;
    set parent(value: ExpressiveCodeBlock | undefined);
    getAnnotations(): readonly ExpressiveCodeAnnotation[];
    addAnnotation(annotation: ExpressiveCodeAnnotation): void;
    deleteAnnotation(annotation: ExpressiveCodeAnnotation): void;
    editText(columnStart: number | undefined, columnEnd: number | undefined, newText: string): string;
}
declare function validateExpressiveCodeAnnotation(annotation: ExpressiveCodeAnnotation): void;

type ExpressiveCodeInlineRange = {
    columnStart: number;
    columnEnd: number;
};
type AnnotationRenderOptions = ResolverContext & {
    nodesToTransform: Parents[];
    line: ExpressiveCodeLine;
    lineIndex: number;
};
type AnnotationRenderPhase = 'earliest' | 'earlier' | 'normal' | 'later' | 'latest';
declare const AnnotationRenderPhaseOrder: AnnotationRenderPhase[];
type AnnotationBaseOptions = {
    inlineRange?: ExpressiveCodeInlineRange | undefined;
    renderPhase?: AnnotationRenderPhase | undefined;
};
/**
 * An abstract class representing a single annotation attached to a code line.
 *
 * You can develop your own annotations by extending this class and providing
 * implementations for its abstract methods. See the implementation of the
 * {@link InlineStyleAnnotation} class for an example.
 *
 * You can also define your annotations as plain objects, as long as they have
 * the same properties as this class. This allows you to use annotations in a
 * more functional way, without the need to extend a class.
 */
declare abstract class ExpressiveCodeAnnotation {
    constructor({ inlineRange, renderPhase }: AnnotationBaseOptions);
    /**
     * Renders the annotation by transforming the provided nodes.
     *
     * This function will be called with an array of AST nodes to transform, and is expected
     * to return an array containing the same number of nodes.
     *
     * For example, you could use the `hastscript` library to wrap the received nodes
     * in HTML elements.
     */
    abstract render({ nodesToTransform, line, lineIndex }: AnnotationRenderOptions): Parents[];
    /**
     * An optional name for the annotation. This can be used for debugging or logging purposes,
     * or to allow other plugins to identify the annotation.
     */
    readonly name?: string | undefined;
    /**
     * An optional range of columns within the line that this annotation applies to.
     * If not provided, the annotation will apply to the entire line.
     */
    readonly inlineRange?: ExpressiveCodeInlineRange | undefined;
    /**
     * Determines the phase in which this annotation should be rendered.
     * Rendering is done in phases, from `earliest` to `latest`.
     * Annotations with the same phase are rendered in the order they were added.
     *
     * The earlier an annotation is rendered, the more likely it is to be split, modified
     * or wrapped by later annotations. Syntax highlighting is rendered in the `earliest` phase
     * to allow other annotations to wrap and modify the highlighted code.
     *
     * The default phase is `normal`.
     */
    readonly renderPhase?: AnnotationRenderPhase | undefined;
}
type InlineStyleAnnotationOptions = AnnotationBaseOptions & {
    /**
     * The color of the annotation. This is expected to be a hex color string, e.g. `#888`.
     * Using CSS variables or other color formats is possible, but prevents automatic
     * color contrast checks from working.
     */
    color?: string | undefined;
    /**
     * The background color of the annotation. This is expected to be a hex color string,
     * e.g. `#888`. Using CSS variables or other color formats is possible, but prevents
     * automatic color contrast checks from working.
     */
    bgColor?: string | undefined;
    /**
     * Whether the annotation should be rendered in italics.
     */
    italic?: boolean | undefined;
    /**
     * Whether the annotation should be rendered in bold.
     */
    bold?: boolean | undefined;
    /**
     * Whether the annotation should be rendered with an underline.
     */
    underline?: boolean | undefined;
    /**
     * Whether the annotation should be rendered with a strikethrough.
     */
    strikethrough?: boolean | undefined;
    /**
     * Inline styles can be theme-dependent, which allows plugins like syntax highlighters to
     * style the same code differently depending on the theme.
     *
     * To support this, the engine creates a style variant for each theme given in the
     * configuration, and plugins can go through the engine's `styleVariants` array to
     * access all the themes.
     *
     * When adding an inline style annotation to a range of code, you can optionally set
     * this property to a `styleVariants` array index to indicate that this annotation
     * only applies to a specific theme. If this property is not set, the annotation will
     * apply to all themes.
     */
    styleVariantIndex?: number | undefined;
};
/**
 * A theme-dependent inline style annotation that allows changing colors, font styles and
 * decorations of the targeted code. This annotation is used by the syntax highlighting plugin
 * to apply colors and styles to syntax tokens, and you can use it in your own plugins as well.
 *
 * You can add as many inline style annotations to a line as you want, even targeting the same code
 * with multiple fully or partially overlapping annotation ranges. During rendering, these
 * annotations will be automatically optimized to avoid creating unnecessary HTML elements.
 *
 * @note
 * If you want to publish your own plugin using the `InlineStyleAnnotation` class, import it from
 * the `@expressive-code/core` package installed as a **peer dependency** of your plugin package.
 * This ensures that your plugin does not cause a version conflict if the user has a different
 * version of Expressive Code installed on their site.
 */
declare class InlineStyleAnnotation extends ExpressiveCodeAnnotation {
    name: string;
    color: string | undefined;
    bgColor: string | undefined;
    italic: boolean;
    bold: boolean;
    underline: boolean;
    strikethrough: boolean;
    styleVariantIndex: number | undefined;
    constructor({ color, bgColor, italic, bold, underline, strikethrough, styleVariantIndex, ...baseOptions }: InlineStyleAnnotationOptions);
    render({ nodesToTransform, styleVariants }: AnnotationRenderOptions): Parents[];
}
declare function isInlineStyleAnnotation(annotation: unknown): annotation is InlineStyleAnnotation;

type PluginDataTarget = ExpressiveCodeBlock | GroupContents | RenderedGroupContents;
/**
 * A class that allows plugins to attach custom data to objects like code blocks,
 * and to optionally allow external access to this data in a type-safe manner.
 */
declare class AttachedPluginData<PluginDataType> {
    private readonly dataStorage;
    private readonly getInitialValueFn;
    constructor(getInitialValueFn: () => PluginDataType);
    getOrCreateFor(target: PluginDataTarget): PluginDataType;
    setFor(target: PluginDataTarget, data: PluginDataType): void;
}

type KnownTextsByKey<T extends {
    [K: string]: string | (() => string);
}> = {
    [K in keyof T]: T[K];
};
declare class PluginTexts<Texts extends KnownTextsByKey<Texts>> {
    readonly defaultTexts: Texts;
    private readonly localizedTexts;
    private readonly overridesByLocale;
    constructor(defaultTexts: Texts);
    /**
     * Adds localized texts for a specific locale. You must provide a full set of localized texts
     * for the given locale.
     *
     * It is recommended to use two-letter language codes (e.g. `de`, `fr`, `es`) without region
     * codes to make your localized texts available to all users speaking the same language.
     * Region codes should only be added if regional differences must be taken into account.
     *
     * Plugin authors can use this to provide localized versions of their texts.
     * Users can also call this function to provide their own localizations.
     *
     * If you only want to customize a few texts of an existing localization,
     * have a look at `overrideTexts` instead.
     */
    addLocale(locale: string, localizedTexts: Texts): void;
    /**
     * Allows you to override any defined texts. This is useful if you want to customize a few
     * selected texts without having to provide a full set of localized texts.
     *
     * You can either override texts for a specific `locale`, or override the default texts
     * by setting `locale` to `undefined`.
     *
     * It is recommended to use two-letter language codes (e.g. `de`, `fr`, `es`) without region
     * codes to apply your overrides to all users speaking the same language.
     * Region codes should only be added if regional differences must be taken into account.
     */
    overrideTexts(locale: string | undefined, localeTextOverrides: Partial<Texts>): void;
    /**
     * Returns the best matching texts for the requested locale,
     * taking any available localized texts and overrides into account.
     *
     * Example for locale `de-DE`:
     * - If localized texts for `de-DE` are available, these will be returned.
     * - If `de-DE` is not available, but `de` is, these will be returned.
     * - As the final fallback, the default texts will be returned.
     */
    get(locale: string): Texts;
    private parseLocale;
    private getLocalizedTexts;
    private applyOverrides;
}

type CreateInlineSvgUrlOptions = {
    /**
     * Whether to keep the original size of the SVG image.
     *
     * By default, any `width` and `height` attributes inside the SVG tag are removed.
     *
     * @default false
     */
    keepSize?: boolean | undefined;
};
/**
 * Creates an inline SVG image data URL from the given contents of an SVG file.
 *
 * You can use it to embed SVG images directly into a plugin's styles or HAST,
 * or pass it to an existing `styleOverrides` icon setting.
 *
 * The optional `options` argument allows further customization of the generated URL.
 */
declare function createInlineSvgUrl(svgContents: string | string[], options?: CreateInlineSvgUrlOptions): string;

/** @deprecated Please import this function from the `/hast` entrypoint instead. */
declare const addClassName: typeof addClassName$1;
/** @deprecated Please import this function from the `/hast` entrypoint instead. */
declare const getClassNames: typeof getClassNames$1;
/** @deprecated Please import this function from the `/hast` entrypoint instead. */
declare const getInlineStyles: typeof getInlineStyles$1;
/** @deprecated Please import this function from the `/hast` entrypoint instead. */
declare const removeClassName: typeof removeClassName$1;
/** @deprecated Please import this function from the `/hast` entrypoint instead. */
declare const setInlineStyle: typeof setInlineStyle$1;
/** @deprecated Please import this function from the `/hast` entrypoint instead. */
declare const setInlineStyles: typeof setInlineStyles$1;
/** @deprecated Please import this function from the `/hast` entrypoint instead. */
declare const setProperty: typeof setProperty$1;

/**
 * Formats a string template by replacing all placeholders with the given variables.
 *
 * Simple placeholders are written as variable names in curly brackets, e.g. `{variableName}`.
 *
 * You can also use conditional placeholders by separating multiple choices with semicolons
 * and optionally adding a condition before each choice, e.g.
 * `{itemCount;1=item;items}` or `{variableName; 0=zero; >0=positive; negative}`.
 *
 * The first choice that matches the condition will be used. There must always be exactly
 * one catch-all choice without a condition.
 */
declare function formatTemplate(template: string, variables: {
    [key: string]: string | number;
}): string;

/**
 * Returns a JSON-like string representation of the given object that is stable,
 * meaning that keys are sorted alphabetically. This causes objects with the same keys and values
 * to always have the same string representation.
 *
 * Circular references are handled by replacing them with the string `[Circular]`.
 *
 * Functions are replaced with the string `[Function]`, unless the `includeFunctionContents`
 * option is set to `true`.
 */
declare function stableStringify(obj: unknown, options?: {
    includeFunctionContents?: boolean | undefined;
}): string;
/**
 * Returns a simple hash of the given object.
 *
 * The hash is stable, meaning that if the object has the same keys and values (in any order),
 * the hash will be the same. The hash is not cryptographically secure, but uses the simple
 * and fast `djb2a` algorithm, which is known to produce few collisions.
 */
declare function getStableObjectHash(obj: unknown, options?: {
    includeFunctionContents?: boolean | undefined;
    hashLength?: number | undefined;
}): string;

/** @deprecated Please pass a `cssVarReplacements` property to the `PluginStyleSettings` constructor instead. */
declare const cssVarReplacements: Map<string, string>;

export { AnnotationBaseOptions, AnnotationRenderOptions, AnnotationRenderPhase, AnnotationRenderPhaseOrder, AttachedPluginData, BaseStylesResolverFn, ChromaticRecolorTarget, CreateInlineSvgUrlOptions, ExpressiveCodeAnnotation, ExpressiveCodeBlock, ExpressiveCodeBlockOptions, ExpressiveCodeBlockProps, ExpressiveCodeEngine, ExpressiveCodeEngineConfig, ExpressiveCodeHook, ExpressiveCodeHookContext, ExpressiveCodeHookContextBase, ExpressiveCodeInlineRange, ExpressiveCodeLine, ExpressiveCodePlugin, ExpressiveCodePluginHookName, ExpressiveCodePluginHooks, ExpressiveCodePluginHooks_BeforeRendering, ExpressiveCodePluginHooks_Rendering, ExpressiveCodeTheme, ExpressiveCodeThemeInput, GutterElement, GutterRenderContext, InlineStyleAnnotation, InlineStyleAnnotationOptions, JsModulesResolverFn, MetaOption, MetaOptionBase, MetaOptionBoolean, MetaOptionKind, MetaOptionRange, MetaOptionRegExp, MetaOptionString, MetaOptions, PartialAllowUndefined, PluginDataTarget, PluginStyleSettings, PluginTexts, PostprocessRenderedBlockContext, PostprocessRenderedBlockGroupContext, PostprocessRenderedLineContext, RenderEmptyLineFn, ResolvedExpressiveCodeEngineConfig, ResolvedStyleSettingsByPath, ResolverContext, StyleOverrides, StyleResolverFn, StyleSettingPath, StyleSettings, StyleValueOrValues, StyleVariant, ThemeSetting, UnresolvedPluginStyleSettings, UnresolvedStyleSettings, UnresolvedStyleValue, addClassName, changeAlphaToReachColorContrast, changeLuminanceToReachColorContrast, chromaticRecolor, codeLineClass, createInlineSvgUrl, cssVarReplacements, darken, definePlugin, ensureColorContrastOnBackground, formatTemplate, getClassNames, getColorContrast, getColorContrastOnBackground, getCssVarName, getFirstStaticColor, getInlineStyles, getLuminance, getStableObjectHash, getStaticBackgroundColor, isInlineStyleAnnotation, lighten, mix, multiplyAlpha, onBackground, removeClassName, resolveStyleVariants, runHooks, setAlpha, setInlineStyle, setInlineStyles, setLuminance, setProperty, stableStringify, toHexColor, toRgbaString, validateExpressiveCodeAnnotation };
