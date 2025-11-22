import { z } from 'zod';
export declare const styleSchema: z.ZodEnum<["normal", "italic", "oblique"]>;
export declare const fontProviderSchema: z.ZodObject<{
    /**
     * URL, path relative to the root or package import.
     */
    entrypoint: z.ZodUnion<[z.ZodString, z.ZodType<URL, z.ZodTypeDef, URL>]>;
    /**
     * Optional serializable object passed to the unifont provider.
     */
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strict", z.ZodTypeAny, {
    entrypoint: string | URL;
    config?: Record<string, any> | undefined;
}, {
    entrypoint: string | URL;
    config?: Record<string, any> | undefined;
}>;
export declare const localFontFamilySchema: z.ZodObject<{
    /**
     * The font family name, as identified by your font provider.
     */
    name: z.ZodString;
    /**
     * A valid [ident](https://developer.mozilla.org/en-US/docs/Web/CSS/ident) in the form of a CSS variable (i.e. starting with `--`).
     */
    cssVariable: z.ZodString;
} & {
    /**
     * @default `["sans-serif"]`
     *
     * An array of fonts to use when your chosen font is unavailable, or loading. Fallback fonts will be chosen in the order listed. The first available font will be used:
     *
     * ```js
     * fallbacks: ["CustomFont", "serif"]
     * ```
     *
     * To disable fallback fonts completely, configure an empty array:
     *
     * ```js
     * fallbacks: []
     * ```
     *

     * If the last font in the `fallbacks` array is a [generic family name](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family#generic-name), Astro will attempt to generate [optimized fallbacks](https://developer.chrome.com/blog/font-fallbacks) using font metrics will be generated. To disable this optimization, set `optimizedFallbacks` to false.
     */
    fallbacks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    /**
     * @default `true`
     *
     * Whether or not to enable optimized fallback generation. You may disable this default optimization to have full control over `fallbacks`.
     */
    optimizedFallbacks: z.ZodOptional<z.ZodBoolean>;
} & {
    /**
     * The source of your font files. Set to `"local"` to use local font files.
     */
    provider: z.ZodLiteral<"local">;
    /**
     * Each variant represents a [`@font-face` declaration](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/).
     */
    variants: z.ZodArray<z.ZodObject<{
        /**
         * A [font weight](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight). If the associated font is a [variable font](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_fonts/Variable_fonts_guide), you can specify a range of weights:
         *
         * ```js
         * weight: "100 900"
         * ```
         */
        weight: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        /**
         * A [font style](https://developer.mozilla.org/en-US/docs/Web/CSS/font-style).
         */
        style: z.ZodOptional<z.ZodEnum<["normal", "italic", "oblique"]>>;
        /**
         * @default `"swap"`
         *
         * A [font display](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display).
         */
        display: z.ZodOptional<z.ZodEnum<["auto", "block", "swap", "fallback", "optional"]>>;
        /**
         * A [font stretch](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-stretch).
         */
        stretch: z.ZodOptional<z.ZodString>;
        /**
         * Font [feature settings](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-feature-settings).
         */
        featureSettings: z.ZodOptional<z.ZodString>;
        /**
         * Font [variation settings](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-variation-settings).
         */
        variationSettings: z.ZodOptional<z.ZodString>;
    } & {
        /**
         * Font [sources](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/src). It can be a path relative to the root, a package import or a URL. URLs are particularly useful if you inject local fonts through an integration.
         */
        src: z.ZodArray<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodType<URL, z.ZodTypeDef, URL>]>, z.ZodObject<{
            url: z.ZodUnion<[z.ZodString, z.ZodType<URL, z.ZodTypeDef, URL>]>;
            tech: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            url: string | URL;
            tech?: string | undefined;
        }, {
            url: string | URL;
            tech?: string | undefined;
        }>]>, "atleastone">;
        /**
         * A [unicode range](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range).
         */
        unicodeRange: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
    }, "strict", z.ZodTypeAny, {
        src: [string | URL | {
            url: string | URL;
            tech?: string | undefined;
        }, ...(string | URL | {
            url: string | URL;
            tech?: string | undefined;
        })[]];
        weight?: string | number | undefined;
        style?: "normal" | "italic" | "oblique" | undefined;
        display?: "auto" | "block" | "swap" | "fallback" | "optional" | undefined;
        stretch?: string | undefined;
        featureSettings?: string | undefined;
        variationSettings?: string | undefined;
        unicodeRange?: [string, ...string[]] | undefined;
    }, {
        src: [string | URL | {
            url: string | URL;
            tech?: string | undefined;
        }, ...(string | URL | {
            url: string | URL;
            tech?: string | undefined;
        })[]];
        weight?: string | number | undefined;
        style?: "normal" | "italic" | "oblique" | undefined;
        display?: "auto" | "block" | "swap" | "fallback" | "optional" | undefined;
        stretch?: string | undefined;
        featureSettings?: string | undefined;
        variationSettings?: string | undefined;
        unicodeRange?: [string, ...string[]] | undefined;
    }>, "atleastone">;
}, "strict", z.ZodTypeAny, {
    name: string;
    cssVariable: string;
    provider: "local";
    variants: [{
        src: [string | URL | {
            url: string | URL;
            tech?: string | undefined;
        }, ...(string | URL | {
            url: string | URL;
            tech?: string | undefined;
        })[]];
        weight?: string | number | undefined;
        style?: "normal" | "italic" | "oblique" | undefined;
        display?: "auto" | "block" | "swap" | "fallback" | "optional" | undefined;
        stretch?: string | undefined;
        featureSettings?: string | undefined;
        variationSettings?: string | undefined;
        unicodeRange?: [string, ...string[]] | undefined;
    }, ...{
        src: [string | URL | {
            url: string | URL;
            tech?: string | undefined;
        }, ...(string | URL | {
            url: string | URL;
            tech?: string | undefined;
        })[]];
        weight?: string | number | undefined;
        style?: "normal" | "italic" | "oblique" | undefined;
        display?: "auto" | "block" | "swap" | "fallback" | "optional" | undefined;
        stretch?: string | undefined;
        featureSettings?: string | undefined;
        variationSettings?: string | undefined;
        unicodeRange?: [string, ...string[]] | undefined;
    }[]];
    fallbacks?: string[] | undefined;
    optimizedFallbacks?: boolean | undefined;
}, {
    name: string;
    cssVariable: string;
    provider: "local";
    variants: [{
        src: [string | URL | {
            url: string | URL;
            tech?: string | undefined;
        }, ...(string | URL | {
            url: string | URL;
            tech?: string | undefined;
        })[]];
        weight?: string | number | undefined;
        style?: "normal" | "italic" | "oblique" | undefined;
        display?: "auto" | "block" | "swap" | "fallback" | "optional" | undefined;
        stretch?: string | undefined;
        featureSettings?: string | undefined;
        variationSettings?: string | undefined;
        unicodeRange?: [string, ...string[]] | undefined;
    }, ...{
        src: [string | URL | {
            url: string | URL;
            tech?: string | undefined;
        }, ...(string | URL | {
            url: string | URL;
            tech?: string | undefined;
        })[]];
        weight?: string | number | undefined;
        style?: "normal" | "italic" | "oblique" | undefined;
        display?: "auto" | "block" | "swap" | "fallback" | "optional" | undefined;
        stretch?: string | undefined;
        featureSettings?: string | undefined;
        variationSettings?: string | undefined;
        unicodeRange?: [string, ...string[]] | undefined;
    }[]];
    fallbacks?: string[] | undefined;
    optimizedFallbacks?: boolean | undefined;
}>;
export declare const remoteFontFamilySchema: z.ZodObject<{
    /**
     * The font family name, as identified by your font provider.
     */
    name: z.ZodString;
    /**
     * A valid [ident](https://developer.mozilla.org/en-US/docs/Web/CSS/ident) in the form of a CSS variable (i.e. starting with `--`).
     */
    cssVariable: z.ZodString;
} & Omit<{
    /**
     * A [font weight](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight). If the associated font is a [variable font](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_fonts/Variable_fonts_guide), you can specify a range of weights:
     *
     * ```js
     * weight: "100 900"
     * ```
     */
    weight: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
    /**
     * A [font style](https://developer.mozilla.org/en-US/docs/Web/CSS/font-style).
     */
    style: z.ZodOptional<z.ZodEnum<["normal", "italic", "oblique"]>>;
    /**
     * @default `"swap"`
     *
     * A [font display](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display).
     */
    display: z.ZodOptional<z.ZodEnum<["auto", "block", "swap", "fallback", "optional"]>>;
    /**
     * A [font stretch](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-stretch).
     */
    stretch: z.ZodOptional<z.ZodString>;
    /**
     * Font [feature settings](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-feature-settings).
     */
    featureSettings: z.ZodOptional<z.ZodString>;
    /**
     * Font [variation settings](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-variation-settings).
     */
    variationSettings: z.ZodOptional<z.ZodString>;
}, "weight" | "style"> & {
    /**
     * @default `["sans-serif"]`
     *
     * An array of fonts to use when your chosen font is unavailable, or loading. Fallback fonts will be chosen in the order listed. The first available font will be used:
     *
     * ```js
     * fallbacks: ["CustomFont", "serif"]
     * ```
     *
     * To disable fallback fonts completely, configure an empty array:
     *
     * ```js
     * fallbacks: []
     * ```
     *

     * If the last font in the `fallbacks` array is a [generic family name](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family#generic-name), Astro will attempt to generate [optimized fallbacks](https://developer.chrome.com/blog/font-fallbacks) using font metrics will be generated. To disable this optimization, set `optimizedFallbacks` to false.
     */
    fallbacks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    /**
     * @default `true`
     *
     * Whether or not to enable optimized fallback generation. You may disable this default optimization to have full control over `fallbacks`.
     */
    optimizedFallbacks: z.ZodOptional<z.ZodBoolean>;
} & {
    /**
     * The source of your font files. You can use a built-in provider or write your own custom provider.
     */
    provider: z.ZodObject<{
        /**
         * URL, path relative to the root or package import.
         */
        entrypoint: z.ZodUnion<[z.ZodString, z.ZodType<URL, z.ZodTypeDef, URL>]>;
        /**
         * Optional serializable object passed to the unifont provider.
         */
        config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strict", z.ZodTypeAny, {
        entrypoint: string | URL;
        config?: Record<string, any> | undefined;
    }, {
        entrypoint: string | URL;
        config?: Record<string, any> | undefined;
    }>;
    /**
     * @default `[400]`
     *
     * An array of [font weights](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight). If the associated font is a [variable font](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_fonts/Variable_fonts_guide), you can specify a range of weights:
     *
     * ```js
     * weight: "100 900"
     * ```
     */
    weights: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber]>, "atleastone">>;
    /**
     * @default `["normal", "italic"]`
     *
     * An array of [font styles](https://developer.mozilla.org/en-US/docs/Web/CSS/font-style).
     */
    styles: z.ZodOptional<z.ZodArray<z.ZodEnum<["normal", "italic", "oblique"]>, "atleastone">>;
    /**
     * @default `["cyrillic-ext", "cyrillic", "greek-ext", "greek", "vietnamese", "latin-ext", "latin"]`
     *
     * An array of [font subsets](https://knaap.dev/posts/font-subsetting/):
     */
    subsets: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
    /**
     * A [unicode range](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range).
     */
    unicodeRange: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
}, "strict", z.ZodTypeAny, {
    name: string;
    cssVariable: string;
    provider: {
        entrypoint: string | URL;
        config?: Record<string, any> | undefined;
    };
    weights?: [string | number, ...(string | number)[]] | undefined;
    styles?: ["normal" | "italic" | "oblique", ...("normal" | "italic" | "oblique")[]] | undefined;
    subsets?: [string, ...string[]] | undefined;
    fallbacks?: string[] | undefined;
    optimizedFallbacks?: boolean | undefined;
    display?: "auto" | "block" | "swap" | "fallback" | "optional" | undefined;
    stretch?: string | undefined;
    featureSettings?: string | undefined;
    variationSettings?: string | undefined;
    unicodeRange?: [string, ...string[]] | undefined;
}, {
    name: string;
    cssVariable: string;
    provider: {
        entrypoint: string | URL;
        config?: Record<string, any> | undefined;
    };
    weights?: [string | number, ...(string | number)[]] | undefined;
    styles?: ["normal" | "italic" | "oblique", ...("normal" | "italic" | "oblique")[]] | undefined;
    subsets?: [string, ...string[]] | undefined;
    fallbacks?: string[] | undefined;
    optimizedFallbacks?: boolean | undefined;
    display?: "auto" | "block" | "swap" | "fallback" | "optional" | undefined;
    stretch?: string | undefined;
    featureSettings?: string | undefined;
    variationSettings?: string | undefined;
    unicodeRange?: [string, ...string[]] | undefined;
}>;
