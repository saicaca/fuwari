import { PluginTexts, ExpressiveCodePlugin } from '@expressive-code/core';

declare const frameTypes: readonly ["code", "terminal", "none", "auto"];
type FrameType = (typeof frameTypes)[number];
declare const LanguageGroups: {
    code: string[];
    terminal: string[];
    data: string[];
    styles: string[];
    textContent: string[];
};
declare const LanguagesWithFencedFrontmatter: string[];

interface FramesStyleSettings {
    /**
     * The color to use for the shadow of the frame.
     * @default
     * ({ theme, resolveSetting }) => theme.colors['widget.shadow'] || multiplyAlpha(resolveSetting('borderColor'), 0.75)
     */
    shadowColor: string;
    /**
     * The CSS value for the box shadow of the frame.
     * @default
     * ({ resolveSetting }) => `0.1rem 0.1rem 0.2rem ${resolveSetting('frames.shadowColor')}`
     */
    frameBoxShadowCssValue: string;
    /**
     * The CSS `background` value for the active editor tab.
     * @default
     * ({ theme }) => theme.colors['tab.activeBackground']
     */
    editorActiveTabBackground: string;
    /**
     * The foreground color of the active editor tab.
     * @default
     * ({ theme }) => theme.colors['tab.activeForeground']
     */
    editorActiveTabForeground: string;
    /**
     * The border color of the active editor tab.
     * @default 'transparent'
     */
    editorActiveTabBorderColor: string;
    /**
     * The height of the indicator lines highlighting the active editor tab.
     * These are colorful lines that appear at the top and/or bottom of the active tab.
     *
     * The individual line colors can be set in {@link editorActiveTabIndicatorTopColor} and
     * {@link editorActiveTabIndicatorBottomColor}.
     *
     * @default
     * ({ resolveSetting }) => resolveSetting('borderWidth')
     */
    editorActiveTabIndicatorHeight: string;
    /**
     * The color of the indicator line displayed at the top border of the active editor tab.
     * @default
     * ({ theme }) => theme.colors['tab.activeBorderTop']
     */
    editorActiveTabIndicatorTopColor: string;
    /**
     * The color of the indicator line displayed at the bottom border of the active editor tab.
     * @default
     * ({ theme }) => theme.colors['tab.activeBorder']
     */
    editorActiveTabIndicatorBottomColor: string;
    /**
     * The inline margin (= left margin in horizontal writing mode) to apply inside the tab bar
     * before the first editor tab.
     * @default '0'
     */
    editorTabsMarginInlineStart: string;
    /**
     * The block margin (= top margin in horizontal writing mode) to apply inside the tab bar
     * before the editor tabs.
     * @default '0'
     */
    editorTabsMarginBlockStart: string;
    /**
     * The border radius to apply to the outer corners of editor tabs.
     * @default
     * ({ resolveSetting }) => resolveSetting('borderRadius')
     */
    editorTabBorderRadius: string;
    /**
     * The CSS `background` value of the editor tab bar.
     * @default
     * ({ theme }) => theme.colors['editorGroupHeader.tabsBackground']
     */
    editorTabBarBackground: string;
    /**
     * The border color of the editor tab bar.
     * @default
     * ({ resolveSetting }) => resolveSetting('borderColor')
     */
    editorTabBarBorderColor: string;
    /**
     * The color of the bottom border of the editor tab bar. This is an additional border
     * that can be used to display a line between the editor tab bar and the code contents.
     * @default
     * ({ theme }) => theme.colors['editorGroupHeader.tabsBorder'] || 'transparent'
     */
    editorTabBarBorderBottomColor: string;
    /**
     * The background color of the code editor.
     * This color is used for the "code" frame type.
     * @default
     * ({ resolveSetting }) => resolveSetting('codeBackground')
     */
    editorBackground: string;
    /**
     * The color of the three dots in the terminal title bar.
     * @default
     * ({ resolveSetting }) => resolveSetting('frames.terminalTitlebarForeground')
     */
    terminalTitlebarDotsForeground: string;
    /**
     * The opacity of the three dots in the terminal title bar.
     * @default '0.15'
     */
    terminalTitlebarDotsOpacity: string;
    /**
     * The background color of the terminal title bar.
     * @default
     * ({ theme }) => theme.colors['titleBar.activeBackground'] || theme.colors['editorGroupHeader.tabsBackground']
     */
    terminalTitlebarBackground: string;
    /**
     * The foreground color of the terminal title bar.
     * @default
     * ({ theme }) => theme.colors['titleBar.activeForeground']
     */
    terminalTitlebarForeground: string;
    /**
     * The color of the border between the terminal title bar and the terminal contents.
     * @default
     * ({ theme, resolveSetting }) =>
     *   theme.colors['titleBar.border'] ||
     *   onBackground(resolveSetting('borderColor'), theme.type === 'dark' ? '#000000bf' : '#ffffffbf')
     */
    terminalTitlebarBorderBottomColor: string;
    /**
     * The background color of the terminal window.
     * This color is used for the "terminal" frame type.
     * @default
     * ({ theme }) => theme.colors['terminal.background']
     */
    terminalBackground: string;
    /**
     * The background color of the copy button.
     * This color is modified by the state-dependent opacity values specified in
     * {@link inlineButtonBackgroundIdleOpacity}, {@link inlineButtonBackgroundHoverOrFocusOpacity}
     * and {@link inlineButtonBackgroundActiveOpacity}.
     * @default
     * ({ resolveSetting }) => resolveSetting('frames.inlineButtonForeground')
     */
    inlineButtonBackground: string;
    /**
     * The opacity of the copy button background when idle.
     * @default '0'
     */
    inlineButtonBackgroundIdleOpacity: string;
    /**
     * The opacity of the copy button background when hovered or focused.
     * @default '0.2'
     */
    inlineButtonBackgroundHoverOrFocusOpacity: string;
    /**
     * The opacity of the copy button background when pressed.
     * @default '0.3'
     */
    inlineButtonBackgroundActiveOpacity: string;
    /**
     * The foreground color of the copy button.
     * @default
     * ({ resolveSetting }) => resolveSetting('codeForeground')
     */
    inlineButtonForeground: string;
    /**
     * The border color of the copy button.
     * @default
     * ({ resolveSetting }) => resolveSetting('frames.inlineButtonForeground')
     */
    inlineButtonBorder: string;
    /**
     * The opacity of the copy button border.
     * @default '0.4'
     */
    inlineButtonBorderOpacity: string;
    /**
     * The background color of the tooltip shown after successfully copying the code.
     * @default
     * ({ theme }) => setLuminance(theme.colors['terminal.ansiGreen'] || '#0dbc79', 0.18)
     */
    tooltipSuccessBackground: string;
    /**
     * The foreground color of the tooltip shown after successfully copying the code.
     * @default 'white'
     */
    tooltipSuccessForeground: string;
    /**
     * An inline SVG URL for the copy to clipboard icon.
     *
     * Expects a string in the format `url("data:image/svg+xml,...")`, which can
     * be generated from the contents of an SVG file using {@link createInlineSvgUrl}.
     */
    copyIcon: string;
    /**
     * An inline SVG URL for the terminal icon.
     *
     * Expects a string in the format `url("data:image/svg+xml,...")`, which can
     * be generated from the contents of an SVG file using {@link createInlineSvgUrl}.
     *
     * Defaults to three dots in a row.
     */
    terminalIcon: string;
}
declare module '@expressive-code/core' {
    interface StyleSettings {
        frames: FramesStyleSettings;
    }
}

interface PluginFramesOptions {
    /**
     * If `true`, and no title was found in the code block's meta string,
     * the plugin will try to find and extract a comment line containing the code block file name
     * from the first 4 lines of the code.
     *
     * @default true
     */
    extractFileNameFromCode?: boolean | undefined;
    /**
     * If `true`, a "Copy to clipboard" button will be shown for each code block.
     *
     * @default true
     */
    showCopyToClipboardButton?: boolean | undefined;
    /**
     * If `true`, the "Copy to clipboard" button of terminal window frames
     * will remove comment lines starting with `#` from the copied text.
     *
     * This is useful to reduce the copied text to the actual commands users need to run,
     * instead of also copying explanatory comments or instructions.
     *
     * @default true
     */
    removeCommentsWhenCopyingTerminalFrames?: boolean | undefined;
}
interface PluginFramesProps {
    /**
     * The code block's title. For terminal frames, this is displayed as the terminal window title,
     * and for code frames, it's displayed as the file name in an open file tab.
     *
     * If no title is given, the plugin will try to automatically extract a title from a
     * [file name comment](https://expressive-code.com/key-features/frames/#file-name-comments)
     * inside your code, unless disabled by the `extractFileNameFromCode` option.
     */
    title: string;
    /**
     * Allows you to override the automatic frame type detection for a code block.
     *
     * The supported values are `code`, `terminal`, `none` and `auto`.
     *
     * @default `auto`
     */
    frame: FrameType;
}
declare module '@expressive-code/core' {
    interface ExpressiveCodeBlockProps extends PluginFramesProps {
    }
}
declare const pluginFramesTexts: PluginTexts<{
    terminalWindowFallbackTitle: string;
    copyButtonTooltip: string;
    copyButtonCopied: string;
}>;
declare function pluginFrames(options?: PluginFramesOptions): ExpressiveCodePlugin;

export { FramesStyleSettings, LanguageGroups, LanguagesWithFencedFrontmatter, PluginFramesOptions, PluginFramesProps, pluginFrames, pluginFramesTexts };
