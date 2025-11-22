import type { CssProperties, CssRenderer } from '../definitions.js';
export declare function renderFontFace(properties: CssProperties, minify: boolean): string;
export declare function renderCssVariable(key: string, values: Array<string>, minify: boolean): string;
export declare function withFamily(family: string, properties: CssProperties): CssProperties;
/** If the value contains spaces (which would be incorrectly interpreted), we wrap it in quotes. */
export declare function handleValueWithSpaces(value: string): string;
export declare function createMinifiableCssRenderer({ minify }: {
    minify: boolean;
}): CssRenderer;
