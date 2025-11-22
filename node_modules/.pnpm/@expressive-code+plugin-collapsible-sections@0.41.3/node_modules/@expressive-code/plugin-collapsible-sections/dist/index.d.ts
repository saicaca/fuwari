import { ExpressiveCodeLine, PluginTexts, ExpressiveCodePlugin, AttachedPluginData } from '@expressive-code/core';

type Section = {
    from: number;
    to: number;
    lines: ExpressiveCodeLine[];
};
declare const collapseStyles: readonly ["github", "collapsible-start", "collapsible-end", "collapsible-auto"];
type CollapseStyle = (typeof collapseStyles)[number];

interface CollapsibleSectionsStyleSettings {
    /**
     * The border width of the summary line.
     *
     * Note: Despite the setting prefix `closed`, summary lines are also visible
     * while the section is open when using any of the `collapsible-*` styles.
     * This is the same for all `closed*` settings.
     * @default '0'
     */
    closedBorderWidth: string;
    /**
     * The block padding of the summary line.
     * @default '4px'
     */
    closedPaddingBlock: string;
    /**
     * The margin around the summary line.
     * @default '0'
     */
    closedMargin: string;
    /**
     * The font family of the section summary line.
     * @default 'inherit'
     */
    closedFontFamily: string;
    /**
     * The font size of the section summary line.
     * @default 'inherit'
     */
    closedFontSize: string;
    /**
     * The line height of the section summary line.
     * @default 'inherit'
     */
    closedLineHeight: string;
    /**
     * The text color of the section summary line.
     * @default 'inherit'
     */
    closedTextColor: string;
    /**
     * The background color of the summary line.
     * @default
     * ({ theme }) => setAlpha(theme.colors['editor.foldBackground'], 0.2) || 'rgb(84 174 255 / 20%)'
     */
    closedBackgroundColor: string;
    /**
     * The border color of the summary line.
     * @default
     * ({ theme }) => setAlpha(theme.colors['editor.foldBackground'], 0.5) || 'rgb(84 174 255 / 50%)'
     */
    closedBorderColor: string;
    /**
     * The width of the border around expanded code lines.
     * @default '1px'
     */
    openBorderWidth: string;
    /**
     * The color of the border around expanded code lines.
     * @default 'transparent'
     */
    openBorderColor: string;
    /**
     * The padding of open sections.
     * @default '0'
     */
    openPadding: string;
    /**
     * The margin around open sections.
     * @default '0'
     */
    openMargin: string;
    /**
     * The background color of expanded code lines when using the default `github` style.
     * @default 'transparent'
     */
    openBackgroundColor: string;
    /**
     * The background color of expanded code lines when using any of the `collapsible-*` styles.
     * @default
     * ({ theme }) => setAlpha(theme.colors['editor.foldBackground'], 0.1) || 'rgb(84 174 255 / 10%)'
     */
    openBackgroundColorCollapsible: string;
    /**
     * An inline SVG URL for the expand icon.
     *
     * Expects a string in the format `url("data:image/svg+xml,...")`, which can
     * be generated from the contents of an SVG file using {@link createInlineSvgUrl}.
     */
    expandIcon: string;
    /**
     * An inline SVG URL for the collapse icon.
     *
     * Expects a string in the format `url("data:image/svg+xml,...")`, which can
     * be generated from the contents of an SVG file using {@link createInlineSvgUrl}.
     */
    collapseIcon: string;
}

interface PluginCollapsibleSectionsProps {
    /**
     * Collapses the given line range or ranges.
     */
    collapse: string | string[];
    /**
     * Determines if the summary line content of collapsible sections should be indented
     * to match the minimum indent level of the contained code lines.
     *
     * @default true
     */
    collapsePreserveIndent: boolean;
    /**
     * Allows to select one of the following collapsible section styles:
     *
     * - `github`: The default style, similar to the one used by GitHub.
     *   A summary line with an expand icon and the default text `X collapsed lines` is shown.
     *   When expanded, the summary line is replaced by the section's code lines.
     *   It is not possible to re-collapse the section.
     * - `collapsible-start`: When collapsed, the summary line looks like the `github` style.
     *   However, when expanded, it remains visible above the expanded code lines,
     *   making it possible to re-collapse the section.
     * - `collapsible-end`: Same as `collapsible-start`, but the summary line remains visible
     *   below the expanded code lines.
     * - `collapsible-auto`: Automatically selects `collapsible-start` or `collapsible-end`
     *   based on the location of the collapsible section in the code block.
     *   Uses `collapsible-start` unless the section ends at the bottom of the code block,
     *   in which case `collapsible-end` is used.
     *
     * @default 'github'
     */
    collapseStyle: CollapseStyle;
}
declare module '@expressive-code/core' {
    interface StyleSettings {
        collapsibleSections: CollapsibleSectionsStyleSettings;
    }
}
declare module '@expressive-code/core' {
    interface ExpressiveCodeBlockProps extends PluginCollapsibleSectionsProps {
    }
}
declare const pluginCollapsibleSectionsTexts: PluginTexts<{
    collapsedLines: string;
}>;
declare function pluginCollapsibleSections(): ExpressiveCodePlugin;
declare const pluginCollapsibleSectionsData: AttachedPluginData<{
    sections: Section[];
}>;

export { CollapsibleSectionsStyleSettings, PluginCollapsibleSectionsProps, pluginCollapsibleSections, pluginCollapsibleSectionsData, pluginCollapsibleSectionsTexts };
