import { ExpressiveCodePlugin } from '@expressive-code/core';

interface LineNumbersStyleSettings {
    /**
     * Allows overriding the foreground color to use for line numbers.
     *
     * By default, line numbers inherit the gutter foreground color defined by the
     * `gutterForeground` core style setting.
     *
     * @default 'inherit'
     */
    foreground: string;
    /**
     * Allows overriding the foreground color to use for highlighted line numbers.
     *
     * By default, highlighted line numbers inherit the gutter highlighted foreground color
     * defined by the `gutterHighlightForeground` core style setting.
     *
     * @default 'inherit'
     */
    highlightForeground: string;
}
declare module '@expressive-code/core' {
    interface StyleSettings {
        lineNumbers: LineNumbersStyleSettings;
    }
}

interface PluginLineNumbersProps {
    /**
     * Whether to show line numbers on the current code block.
     *
     * The default value of this prop can be changed using the `defaultProps` option
     * in your Expressive Code configuration. You can also change the default value by language
     * using `defaultProps.overridesByLang`.
     *
     * @default true
     */
    showLineNumbers: boolean;
    /**
     * The line number to start counting from.
     *
     * @default 1
     */
    startLineNumber: number;
}
declare module '@expressive-code/core' {
    interface ExpressiveCodeBlockProps extends PluginLineNumbersProps {
    }
}
declare function pluginLineNumbers(): ExpressiveCodePlugin;

export { LineNumbersStyleSettings, PluginLineNumbersProps, pluginLineNumbers };
