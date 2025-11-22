type Awaitable$1<T> = T | Promise<T>;
type StorageValue = string | Record<string, unknown>;
interface Storage {
    getItem: (key: string) => Awaitable$1<any | null>;
    setItem: <T extends StorageValue = StorageValue>(key: string, value: T) => Awaitable$1<void>;
}

type Awaitable<T> = T | Promise<T>;
interface ProviderContext {
    storage: {
        getItem: {
            <T = unknown>(key: string): Promise<T | null>;
            <T = unknown>(key: string, init: () => Awaitable<T>): Promise<T>;
        };
        setItem: (key: string, value: unknown) => Awaitable<void>;
    };
}
type FontStyles = 'normal' | 'italic' | 'oblique';
interface ResolveFontOptions {
    weights: string[];
    styles: FontStyles[];
    subsets: string[];
    fallbacks?: string[];
}
interface RemoteFontSource {
    url: string;
    originalURL?: string;
    format?: string;
    tech?: string;
}
interface LocalFontSource {
    name: string;
}
interface FontFaceMeta {
    /** The priority of the font face, usually used to indicate fallbacks. Smaller is more prioritized. */
    priority?: number;
    /**
     * A `RequestInit` object that should be used when fetching this font. This can be useful for
     * adding authorization headers and other metadata required for a font request.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/RequestInit
     */
    init?: RequestInit;
}
interface FontFaceData {
    src: Array<LocalFontSource | RemoteFontSource>;
    /**
     * The font-display descriptor.
     * @default 'swap'
     */
    display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
    /** A font-weight value. */
    weight?: string | number | [number, number];
    /** A font-stretch value. */
    stretch?: string;
    /** A font-style value. */
    style?: string;
    /** The range of Unicode code points to be used from the font. */
    unicodeRange?: string[];
    /** Allows control over advanced typographic features in OpenType fonts. */
    featureSettings?: string;
    /** Allows low-level control over OpenType or TrueType font variations, by specifying the four letter axis names of the features to vary, along with their variation values. */
    variationSettings?: string;
    /** Metadata for the font face used by unifont */
    meta?: FontFaceMeta;
}
interface ResolveFontResult {
    /**
     * Return data used to generate @font-face declarations.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face
     */
    fonts: FontFaceData[];
    fallbacks?: string[];
}
interface InitializedProvider {
    resolveFont: (family: string, options: ResolveFontOptions) => Awaitable<ResolveFontResult | undefined>;
    listFonts?: (() => Awaitable<string[] | undefined>) | undefined;
}
interface ProviderDefinition<T = unknown> {
    (options: T, ctx: ProviderContext): Awaitable<InitializedProvider | undefined>;
}
interface Provider {
    _name: string;
    (ctx: ProviderContext): Awaitable<InitializedProvider | undefined>;
}
type ProviderFactory<T = unknown> = unknown extends T ? () => Provider : Partial<T> extends T ? (options?: T) => Provider : (options: T) => Provider;

interface ProviderOption$2 {
    id: string[] | string;
}
declare const _default$5: (options: ProviderOption$2) => Provider;

declare const _default$4: () => Provider;

declare const _default$3: () => Provider;

declare const _default$2: () => Provider;

type VariableAxis = 'opsz' | 'slnt' | 'wdth' | (string & {});
interface ProviderOption$1 {
    experimental?: {
        /**
         * Experimental: Setting variable axis configuration on a per-font basis.
         */
        variableAxis?: {
            [key: string]: Partial<Record<VariableAxis, ([string, string] | string)[]>>;
        };
        /**
         * Experimental: Specifying a list of glyphs to be included in the font for each font family.
         * This can reduce the size of the font file.
         */
        glyphs?: {
            [fontFamily: string]: string[];
        };
    };
}
declare const _default$1: (options?: ProviderOption$1 | undefined) => Provider;

interface ProviderOption {
    experimental?: {
        /**
         * Experimental: Specifying a list of icons to be included in the font for each font family.
         * This can reduce the size of the font file.
         *
         * **Only available when resolving the new `Material Symbols` icons.**
         */
        glyphs?: {
            [fontFamily: string]: string[];
        };
    };
}
declare const _default: (options?: ProviderOption | undefined) => Provider;

declare namespace providers {
  export {
    _default$5 as adobe,
    _default$4 as bunny,
    _default$3 as fontshare,
    _default$2 as fontsource,
    _default$1 as google,
    _default as googleicons,
  };
}

declare function defineFontProvider<T = unknown>(name: string, provider: ProviderDefinition<T>): ProviderFactory<T>;

interface UnifontOptions {
    storage?: Storage;
}
interface Unifont {
    resolveFont: (fontFamily: string, options?: Partial<ResolveFontOptions>, providers?: string[]) => Promise<ResolveFontResult & {
        provider?: string;
    }>;
    /** @deprecated use `resolveFont` */
    resolveFontFace: (fontFamily: string, options?: Partial<ResolveFontOptions>, providers?: string[]) => Promise<ResolveFontResult & {
        provider?: string;
    }>;
    listFonts: (providers?: string[]) => Promise<string[] | undefined>;
}
declare const defaultResolveOptions: ResolveFontOptions;
declare function createUnifont(providers: Provider[], options?: UnifontOptions): Promise<Unifont>;

export { createUnifont, defaultResolveOptions, defineFontProvider, providers };
export type { FontFaceData, FontFaceMeta, FontStyles, LocalFontSource, Provider, ProviderContext, ProviderDefinition, ProviderFactory, RemoteFontSource, ResolveFontOptions, Unifont, UnifontOptions };
