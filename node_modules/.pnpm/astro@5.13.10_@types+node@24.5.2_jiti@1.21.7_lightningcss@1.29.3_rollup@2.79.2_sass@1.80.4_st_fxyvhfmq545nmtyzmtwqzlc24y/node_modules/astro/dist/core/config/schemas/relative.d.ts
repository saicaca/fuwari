import type { OutgoingHttpHeaders } from 'node:http';
import { z } from 'zod';
export declare function createRelativeSchema(cmd: string, fileProtocolRoot: string): z.ZodEffects<z.ZodObject<{
    site: z.ZodOptional<z.ZodString>;
    base: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    trailingSlash: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"always">, z.ZodLiteral<"never">, z.ZodLiteral<"ignore">]>>>;
    output: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"static">, z.ZodLiteral<"server">]>>>;
    scopedStyleStrategy: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"where">, z.ZodLiteral<"class">, z.ZodLiteral<"attribute">]>>>;
    adapter: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        hooks: z.ZodDefault<z.ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        hooks: {} & {
            [k: string]: unknown;
        };
    }, {
        name: string;
        hooks?: z.objectInputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
    }>>;
    integrations: z.ZodEffects<z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        hooks: z.ZodDefault<z.ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        hooks: {} & {
            [k: string]: unknown;
        };
    }, {
        name: string;
        hooks?: z.objectInputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
    }>, "many">>, {
        name: string;
        hooks: {} & {
            [k: string]: unknown;
        };
    }[], unknown>;
    redirects: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodObject<{
        status: z.ZodUnion<[z.ZodLiteral<300>, z.ZodLiteral<301>, z.ZodLiteral<302>, z.ZodLiteral<303>, z.ZodLiteral<304>, z.ZodLiteral<307>, z.ZodLiteral<308>]>;
        destination: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: 301 | 302 | 303 | 307 | 308 | 300 | 304;
        destination: string;
    }, {
        status: 301 | 302 | 303 | 307 | 308 | 300 | 304;
        destination: string;
    }>]>>>;
    prefetch: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodObject<{
        prefetchAll: z.ZodOptional<z.ZodBoolean>;
        defaultStrategy: z.ZodOptional<z.ZodEnum<["tap", "hover", "viewport", "load"]>>;
    }, "strip", z.ZodTypeAny, {
        prefetchAll?: boolean | undefined;
        defaultStrategy?: "tap" | "hover" | "viewport" | "load" | undefined;
    }, {
        prefetchAll?: boolean | undefined;
        defaultStrategy?: "tap" | "hover" | "viewport" | "load" | undefined;
    }>]>>;
    image: z.ZodDefault<z.ZodObject<{
        endpoint: z.ZodDefault<z.ZodObject<{
            route: z.ZodDefault<z.ZodUnion<[z.ZodLiteral<"/_image">, z.ZodString]>>;
            entrypoint: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            route: string;
            entrypoint?: string | undefined;
        }, {
            entrypoint?: string | undefined;
            route?: string | undefined;
        }>>;
        service: z.ZodDefault<z.ZodObject<{
            entrypoint: z.ZodDefault<z.ZodUnion<[z.ZodLiteral<"astro/assets/services/sharp">, z.ZodString]>>;
            config: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            config: Record<string, any>;
            entrypoint: string;
        }, {
            config?: Record<string, any> | undefined;
            entrypoint?: string | undefined;
        }>>;
        domains: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        remotePatterns: z.ZodDefault<z.ZodArray<z.ZodObject<{
            protocol: z.ZodOptional<z.ZodString>;
            hostname: z.ZodOptional<z.ZodString>;
            port: z.ZodOptional<z.ZodString>;
            pathname: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            port?: string | undefined;
            protocol?: string | undefined;
            hostname?: string | undefined;
            pathname?: string | undefined;
        }, {
            port?: string | undefined;
            protocol?: string | undefined;
            hostname?: string | undefined;
            pathname?: string | undefined;
        }>, "many">>;
        layout: z.ZodOptional<z.ZodEnum<["constrained", "fixed", "full-width", "none"]>>;
        objectFit: z.ZodOptional<z.ZodString>;
        objectPosition: z.ZodOptional<z.ZodString>;
        breakpoints: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        responsiveStyles: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        responsiveStyles: boolean;
        endpoint: {
            route: string;
            entrypoint?: string | undefined;
        };
        service: {
            config: Record<string, any>;
            entrypoint: string;
        };
        domains: string[];
        remotePatterns: {
            port?: string | undefined;
            protocol?: string | undefined;
            hostname?: string | undefined;
            pathname?: string | undefined;
        }[];
        layout?: "fixed" | "constrained" | "full-width" | "none" | undefined;
        objectFit?: string | undefined;
        objectPosition?: string | undefined;
        breakpoints?: number[] | undefined;
    }, {
        responsiveStyles?: boolean | undefined;
        endpoint?: {
            entrypoint?: string | undefined;
            route?: string | undefined;
        } | undefined;
        service?: {
            config?: Record<string, any> | undefined;
            entrypoint?: string | undefined;
        } | undefined;
        domains?: string[] | undefined;
        remotePatterns?: {
            port?: string | undefined;
            protocol?: string | undefined;
            hostname?: string | undefined;
            pathname?: string | undefined;
        }[] | undefined;
        layout?: "fixed" | "constrained" | "full-width" | "none" | undefined;
        objectFit?: string | undefined;
        objectPosition?: string | undefined;
        breakpoints?: number[] | undefined;
    }>>;
    devToolbar: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
    }, {
        enabled?: boolean | undefined;
    }>>;
    markdown: z.ZodDefault<z.ZodObject<{
        syntaxHighlight: z.ZodDefault<z.ZodUnion<[z.ZodDefault<z.ZodObject<{
            type: z.ZodDefault<z.ZodUnion<[z.ZodLiteral<"shiki">, z.ZodLiteral<"prism">]>>;
            excludeLangs: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
        }, "strip", z.ZodTypeAny, {
            type: "shiki" | "prism";
            excludeLangs: string[];
        }, {
            type?: "shiki" | "prism" | undefined;
            excludeLangs?: string[] | undefined;
        }>>, z.ZodDefault<z.ZodUnion<[z.ZodLiteral<"shiki">, z.ZodLiteral<"prism">]>>, z.ZodLiteral<false>]>>;
        shikiConfig: z.ZodDefault<z.ZodObject<{
            langs: z.ZodDefault<z.ZodEffects<z.ZodArray<z.ZodType<import("shiki").LanguageRegistration & import("./base.js").ComplexifyUnionObj, z.ZodTypeDef, import("shiki").LanguageRegistration & import("./base.js").ComplexifyUnionObj>, "many">, (import("shiki").LanguageRegistration & import("./base.js").ComplexifyUnionObj)[], (import("shiki").LanguageRegistration & import("./base.js").ComplexifyUnionObj)[]>>;
            langAlias: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
            theme: z.ZodDefault<z.ZodUnion<[z.ZodEnum<[import("shiki").BundledTheme, ...import("shiki").BundledTheme[]]>, z.ZodType<NonNullable<import("@astrojs/markdown-remark").ThemePresets | import("shiki").ThemeRegistration | import("shiki").ThemeRegistrationRaw | undefined> & import("./base.js").ComplexifyUnionObj, z.ZodTypeDef, NonNullable<import("@astrojs/markdown-remark").ThemePresets | import("shiki").ThemeRegistration | import("shiki").ThemeRegistrationRaw | undefined> & import("./base.js").ComplexifyUnionObj>]>>;
            themes: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodEnum<[import("shiki").BundledTheme, ...import("shiki").BundledTheme[]]>, z.ZodType<NonNullable<import("@astrojs/markdown-remark").ThemePresets | import("shiki").ThemeRegistration | import("shiki").ThemeRegistrationRaw | undefined> & import("./base.js").ComplexifyUnionObj, z.ZodTypeDef, NonNullable<import("@astrojs/markdown-remark").ThemePresets | import("shiki").ThemeRegistration | import("shiki").ThemeRegistrationRaw | undefined> & import("./base.js").ComplexifyUnionObj>]>>>;
            defaultColor: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"light">, z.ZodLiteral<"dark">, z.ZodString, z.ZodLiteral<false>]>>;
            wrap: z.ZodDefault<z.ZodUnion<[z.ZodBoolean, z.ZodNull]>>;
            transformers: z.ZodDefault<z.ZodArray<z.ZodType<import("shiki").ShikiTransformer & import("./base.js").ComplexifyUnionObj, z.ZodTypeDef, import("shiki").ShikiTransformer & import("./base.js").ComplexifyUnionObj>, "many">>;
        }, "strip", z.ZodTypeAny, {
            langs: (import("shiki").LanguageRegistration & import("./base.js").ComplexifyUnionObj)[];
            theme: import("shiki").BundledTheme | (NonNullable<import("@astrojs/markdown-remark").ThemePresets | import("shiki").ThemeRegistration | import("shiki").ThemeRegistrationRaw | undefined> & import("./base.js").ComplexifyUnionObj);
            themes: Record<string, import("shiki").BundledTheme | (NonNullable<import("@astrojs/markdown-remark").ThemePresets | import("shiki").ThemeRegistration | import("shiki").ThemeRegistrationRaw | undefined> & import("./base.js").ComplexifyUnionObj)>;
            langAlias: Record<string, string>;
            wrap: boolean | null;
            transformers: (import("shiki").ShikiTransformer & import("./base.js").ComplexifyUnionObj)[];
            defaultColor?: string | false | undefined;
        }, {
            langs?: (import("shiki").LanguageRegistration & import("./base.js").ComplexifyUnionObj)[] | undefined;
            theme?: import("shiki").BundledTheme | (NonNullable<import("@astrojs/markdown-remark").ThemePresets | import("shiki").ThemeRegistration | import("shiki").ThemeRegistrationRaw | undefined> & import("./base.js").ComplexifyUnionObj) | undefined;
            themes?: Record<string, import("shiki").BundledTheme | (NonNullable<import("@astrojs/markdown-remark").ThemePresets | import("shiki").ThemeRegistration | import("shiki").ThemeRegistrationRaw | undefined> & import("./base.js").ComplexifyUnionObj)> | undefined;
            langAlias?: Record<string, string> | undefined;
            defaultColor?: string | false | undefined;
            wrap?: boolean | null | undefined;
            transformers?: (import("shiki").ShikiTransformer & import("./base.js").ComplexifyUnionObj)[] | undefined;
        }>>;
        remarkPlugins: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodTuple<[z.ZodString, z.ZodAny], null>, z.ZodType<import("@astrojs/markdown-remark").RemarkPlugin & import("./base.js").ComplexifyUnionObj, z.ZodTypeDef, import("@astrojs/markdown-remark").RemarkPlugin & import("./base.js").ComplexifyUnionObj>, z.ZodTuple<[z.ZodType<import("@astrojs/markdown-remark").RemarkPlugin & import("./base.js").ComplexifyUnionObj, z.ZodTypeDef, import("@astrojs/markdown-remark").RemarkPlugin & import("./base.js").ComplexifyUnionObj>, z.ZodAny], null>]>, "many">>;
        rehypePlugins: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodTuple<[z.ZodString, z.ZodAny], null>, z.ZodType<import("@astrojs/markdown-remark").RehypePlugin & import("./base.js").ComplexifyUnionObj, z.ZodTypeDef, import("@astrojs/markdown-remark").RehypePlugin & import("./base.js").ComplexifyUnionObj>, z.ZodTuple<[z.ZodType<import("@astrojs/markdown-remark").RehypePlugin & import("./base.js").ComplexifyUnionObj, z.ZodTypeDef, import("@astrojs/markdown-remark").RehypePlugin & import("./base.js").ComplexifyUnionObj>, z.ZodAny], null>]>, "many">>;
        remarkRehype: z.ZodDefault<z.ZodType<import("./base.js").RemarkRehype, z.ZodTypeDef, import("./base.js").RemarkRehype>>;
        gfm: z.ZodDefault<z.ZodBoolean>;
        smartypants: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        syntaxHighlight: false | "shiki" | "prism" | {
            type: "shiki" | "prism";
            excludeLangs: string[];
        };
        shikiConfig: {
            langs: (import("shiki").LanguageRegistration & import("./base.js").ComplexifyUnionObj)[];
            theme: import("shiki").BundledTheme | (NonNullable<import("@astrojs/markdown-remark").ThemePresets | import("shiki").ThemeRegistration | import("shiki").ThemeRegistrationRaw | undefined> & import("./base.js").ComplexifyUnionObj);
            themes: Record<string, import("shiki").BundledTheme | (NonNullable<import("@astrojs/markdown-remark").ThemePresets | import("shiki").ThemeRegistration | import("shiki").ThemeRegistrationRaw | undefined> & import("./base.js").ComplexifyUnionObj)>;
            langAlias: Record<string, string>;
            wrap: boolean | null;
            transformers: (import("shiki").ShikiTransformer & import("./base.js").ComplexifyUnionObj)[];
            defaultColor?: string | false | undefined;
        };
        remarkPlugins: (string | [string, any] | (import("@astrojs/markdown-remark").RemarkPlugin & import("./base.js").ComplexifyUnionObj) | [import("@astrojs/markdown-remark").RemarkPlugin & import("./base.js").ComplexifyUnionObj, any])[];
        rehypePlugins: (string | [string, any] | (import("@astrojs/markdown-remark").RehypePlugin & import("./base.js").ComplexifyUnionObj) | [import("@astrojs/markdown-remark").RehypePlugin & import("./base.js").ComplexifyUnionObj, any])[];
        remarkRehype: import("./base.js").RemarkRehype;
        gfm: boolean;
        smartypants: boolean;
    }, {
        syntaxHighlight?: false | "shiki" | "prism" | {
            type?: "shiki" | "prism" | undefined;
            excludeLangs?: string[] | undefined;
        } | undefined;
        shikiConfig?: {
            langs?: (import("shiki").LanguageRegistration & import("./base.js").ComplexifyUnionObj)[] | undefined;
            theme?: import("shiki").BundledTheme | (NonNullable<import("@astrojs/markdown-remark").ThemePresets | import("shiki").ThemeRegistration | import("shiki").ThemeRegistrationRaw | undefined> & import("./base.js").ComplexifyUnionObj) | undefined;
            themes?: Record<string, import("shiki").BundledTheme | (NonNullable<import("@astrojs/markdown-remark").ThemePresets | import("shiki").ThemeRegistration | import("shiki").ThemeRegistrationRaw | undefined> & import("./base.js").ComplexifyUnionObj)> | undefined;
            langAlias?: Record<string, string> | undefined;
            defaultColor?: string | false | undefined;
            wrap?: boolean | null | undefined;
            transformers?: (import("shiki").ShikiTransformer & import("./base.js").ComplexifyUnionObj)[] | undefined;
        } | undefined;
        remarkPlugins?: (string | [string, any] | (import("@astrojs/markdown-remark").RemarkPlugin & import("./base.js").ComplexifyUnionObj) | [import("@astrojs/markdown-remark").RemarkPlugin & import("./base.js").ComplexifyUnionObj, any])[] | undefined;
        rehypePlugins?: (string | [string, any] | (import("@astrojs/markdown-remark").RehypePlugin & import("./base.js").ComplexifyUnionObj) | [import("@astrojs/markdown-remark").RehypePlugin & import("./base.js").ComplexifyUnionObj, any])[] | undefined;
        remarkRehype?: import("./base.js").RemarkRehype | undefined;
        gfm?: boolean | undefined;
        smartypants?: boolean | undefined;
    }>>;
    vite: z.ZodDefault<z.ZodType<import("../../../types/public/config.js").ViteUserConfig, z.ZodTypeDef, import("../../../types/public/config.js").ViteUserConfig>>;
    i18n: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        defaultLocale: z.ZodString;
        locales: z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
            path: z.ZodString;
            codes: z.ZodArray<z.ZodString, "atleastone">;
        }, "strip", z.ZodTypeAny, {
            path: string;
            codes: [string, ...string[]];
        }, {
            path: string;
            codes: [string, ...string[]];
        }>]>, "many">;
        domains: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        fallback: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        routing: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"manual">, z.ZodObject<{
            prefixDefaultLocale: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            redirectToDefaultLocale: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            fallbackType: z.ZodDefault<z.ZodOptional<z.ZodEnum<["redirect", "rewrite"]>>>;
        }, "strip", z.ZodTypeAny, {
            prefixDefaultLocale: boolean;
            redirectToDefaultLocale: boolean;
            fallbackType: "redirect" | "rewrite";
        }, {
            prefixDefaultLocale?: boolean | undefined;
            redirectToDefaultLocale?: boolean | undefined;
            fallbackType?: "redirect" | "rewrite" | undefined;
        }>]>>>;
    }, "strip", z.ZodTypeAny, {
        defaultLocale: string;
        locales: (string | {
            path: string;
            codes: [string, ...string[]];
        })[];
        routing: "manual" | {
            prefixDefaultLocale: boolean;
            redirectToDefaultLocale: boolean;
            fallbackType: "redirect" | "rewrite";
        };
        fallback?: Record<string, string> | undefined;
        domains?: Record<string, string> | undefined;
    }, {
        defaultLocale: string;
        locales: (string | {
            path: string;
            codes: [string, ...string[]];
        })[];
        fallback?: Record<string, string> | undefined;
        domains?: Record<string, string> | undefined;
        routing?: "manual" | {
            prefixDefaultLocale?: boolean | undefined;
            redirectToDefaultLocale?: boolean | undefined;
            fallbackType?: "redirect" | "rewrite" | undefined;
        } | undefined;
    }>>>;
    security: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        checkOrigin: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        checkOrigin: boolean;
    }, {
        checkOrigin?: boolean | undefined;
    }>>>;
    env: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        schema: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, z.ZodIntersection<z.ZodEffects<z.ZodType<{
            context: "client";
            access: "public";
        } | {
            context: "server";
            access: "public";
        } | {
            context: "server";
            access: "secret";
        }, z.ZodTypeDef, {
            context: "client";
            access: "public";
        } | {
            context: "server";
            access: "public";
        } | {
            context: "server";
            access: "secret";
        }>, {
            context: "client";
            access: "public";
        } | {
            context: "server";
            access: "public";
        } | {
            context: "server";
            access: "secret";
        }, {
            context: "client";
            access: "public";
        } | {
            context: "server";
            access: "public";
        } | {
            context: "server";
            access: "secret";
        }>, z.ZodUnion<[z.ZodObject<{
            type: z.ZodLiteral<"string">;
            optional: z.ZodOptional<z.ZodBoolean>;
            default: z.ZodOptional<z.ZodString>;
            max: z.ZodOptional<z.ZodNumber>;
            min: z.ZodOptional<z.ZodNumber>;
            length: z.ZodOptional<z.ZodNumber>;
            url: z.ZodOptional<z.ZodBoolean>;
            includes: z.ZodOptional<z.ZodString>;
            startsWith: z.ZodOptional<z.ZodString>;
            endsWith: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "string";
            length?: number | undefined;
            includes?: string | undefined;
            endsWith?: string | undefined;
            startsWith?: string | undefined;
            optional?: boolean | undefined;
            url?: boolean | undefined;
            default?: string | undefined;
            max?: number | undefined;
            min?: number | undefined;
        }, {
            type: "string";
            length?: number | undefined;
            includes?: string | undefined;
            endsWith?: string | undefined;
            startsWith?: string | undefined;
            optional?: boolean | undefined;
            url?: boolean | undefined;
            default?: string | undefined;
            max?: number | undefined;
            min?: number | undefined;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"number">;
            optional: z.ZodOptional<z.ZodBoolean>;
            default: z.ZodOptional<z.ZodNumber>;
            gt: z.ZodOptional<z.ZodNumber>;
            min: z.ZodOptional<z.ZodNumber>;
            lt: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
            int: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            type: "number";
            optional?: boolean | undefined;
            default?: number | undefined;
            max?: number | undefined;
            min?: number | undefined;
            gt?: number | undefined;
            lt?: number | undefined;
            int?: boolean | undefined;
        }, {
            type: "number";
            optional?: boolean | undefined;
            default?: number | undefined;
            max?: number | undefined;
            min?: number | undefined;
            gt?: number | undefined;
            lt?: number | undefined;
            int?: boolean | undefined;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"boolean">;
            optional: z.ZodOptional<z.ZodBoolean>;
            default: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            type: "boolean";
            optional?: boolean | undefined;
            default?: boolean | undefined;
        }, {
            type: "boolean";
            optional?: boolean | undefined;
            default?: boolean | undefined;
        }>, z.ZodEffects<z.ZodObject<{
            type: z.ZodLiteral<"enum">;
            values: z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">;
            optional: z.ZodOptional<z.ZodBoolean>;
            default: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            values: string[];
            type: "enum";
            optional?: boolean | undefined;
            default?: string | undefined;
        }, {
            values: string[];
            type: "enum";
            optional?: boolean | undefined;
            default?: string | undefined;
        }>, {
            values: string[];
            type: "enum";
            optional?: boolean | undefined;
            default?: string | undefined;
        }, {
            values: string[];
            type: "enum";
            optional?: boolean | undefined;
            default?: string | undefined;
        }>]>>>>>;
        validateSecrets: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strict", z.ZodTypeAny, {
        validateSecrets: boolean;
        schema: Record<string, ({
            context: "client";
            access: "public";
        } | {
            context: "server";
            access: "public";
        } | {
            context: "server";
            access: "secret";
        }) & ({
            type: "string";
            length?: number | undefined;
            includes?: string | undefined;
            endsWith?: string | undefined;
            startsWith?: string | undefined;
            optional?: boolean | undefined;
            url?: boolean | undefined;
            default?: string | undefined;
            max?: number | undefined;
            min?: number | undefined;
        } | {
            type: "number";
            optional?: boolean | undefined;
            default?: number | undefined;
            max?: number | undefined;
            min?: number | undefined;
            gt?: number | undefined;
            lt?: number | undefined;
            int?: boolean | undefined;
        } | {
            type: "boolean";
            optional?: boolean | undefined;
            default?: boolean | undefined;
        } | {
            values: string[];
            type: "enum";
            optional?: boolean | undefined;
            default?: string | undefined;
        })>;
    }, {
        validateSecrets?: boolean | undefined;
        schema?: Record<string, ({
            context: "client";
            access: "public";
        } | {
            context: "server";
            access: "public";
        } | {
            context: "server";
            access: "secret";
        }) & ({
            type: "string";
            length?: number | undefined;
            includes?: string | undefined;
            endsWith?: string | undefined;
            startsWith?: string | undefined;
            optional?: boolean | undefined;
            url?: boolean | undefined;
            default?: string | undefined;
            max?: number | undefined;
            min?: number | undefined;
        } | {
            type: "number";
            optional?: boolean | undefined;
            default?: number | undefined;
            max?: number | undefined;
            min?: number | undefined;
            gt?: number | undefined;
            lt?: number | undefined;
            int?: boolean | undefined;
        } | {
            type: "boolean";
            optional?: boolean | undefined;
            default?: boolean | undefined;
        } | {
            values: string[];
            type: "enum";
            optional?: boolean | undefined;
            default?: string | undefined;
        })> | undefined;
    }>>>;
    session: z.ZodOptional<z.ZodObject<{
        driver: z.ZodOptional<z.ZodString>;
        options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        cookie: z.ZodOptional<z.ZodEffects<z.ZodUnion<[z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            domain: z.ZodOptional<z.ZodString>;
            path: z.ZodOptional<z.ZodString>;
            maxAge: z.ZodOptional<z.ZodNumber>;
            sameSite: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["strict", "lax", "none"]>, z.ZodBoolean]>>;
            secure: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            name?: string | undefined;
            path?: string | undefined;
            domain?: string | undefined;
            maxAge?: number | undefined;
            sameSite?: boolean | "strict" | "none" | "lax" | undefined;
            secure?: boolean | undefined;
        }, {
            name?: string | undefined;
            path?: string | undefined;
            domain?: string | undefined;
            maxAge?: number | undefined;
            sameSite?: boolean | "strict" | "none" | "lax" | undefined;
            secure?: boolean | undefined;
        }>, z.ZodString]>, {
            name?: string | undefined;
            path?: string | undefined;
            domain?: string | undefined;
            maxAge?: number | undefined;
            sameSite?: boolean | "strict" | "none" | "lax" | undefined;
            secure?: boolean | undefined;
        }, string | {
            name?: string | undefined;
            path?: string | undefined;
            domain?: string | undefined;
            maxAge?: number | undefined;
            sameSite?: boolean | "strict" | "none" | "lax" | undefined;
            secure?: boolean | undefined;
        }>>;
        ttl: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        options?: Record<string, any> | undefined;
        driver?: string | undefined;
        cookie?: {
            name?: string | undefined;
            path?: string | undefined;
            domain?: string | undefined;
            maxAge?: number | undefined;
            sameSite?: boolean | "strict" | "none" | "lax" | undefined;
            secure?: boolean | undefined;
        } | undefined;
        ttl?: number | undefined;
    }, {
        options?: Record<string, any> | undefined;
        driver?: string | undefined;
        cookie?: string | {
            name?: string | undefined;
            path?: string | undefined;
            domain?: string | undefined;
            maxAge?: number | undefined;
            sameSite?: boolean | "strict" | "none" | "lax" | undefined;
            secure?: boolean | undefined;
        } | undefined;
        ttl?: number | undefined;
    }>>;
    experimental: z.ZodDefault<z.ZodObject<{
        clientPrerender: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        contentIntellisense: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        headingIdCompat: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        preserveScriptOrder: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        fonts: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodObject<{
            name: z.ZodString;
            cssVariable: z.ZodString;
        } & {
            fallbacks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            optimizedFallbacks: z.ZodOptional<z.ZodBoolean>;
        } & {
            provider: z.ZodLiteral<"local">;
            variants: z.ZodArray<z.ZodObject<{
                weight: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                style: z.ZodOptional<z.ZodEnum<["normal", "italic", "oblique"]>>;
                display: z.ZodOptional<z.ZodEnum<["auto", "block", "swap", "fallback", "optional"]>>;
                stretch: z.ZodOptional<z.ZodString>;
                featureSettings: z.ZodOptional<z.ZodString>;
                variationSettings: z.ZodOptional<z.ZodString>;
            } & {
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
        }>, z.ZodObject<{
            name: z.ZodString;
            cssVariable: z.ZodString;
        } & Omit<{
            weight: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            style: z.ZodOptional<z.ZodEnum<["normal", "italic", "oblique"]>>;
            display: z.ZodOptional<z.ZodEnum<["auto", "block", "swap", "fallback", "optional"]>>;
            stretch: z.ZodOptional<z.ZodString>;
            featureSettings: z.ZodOptional<z.ZodString>;
            variationSettings: z.ZodOptional<z.ZodString>;
        }, "weight" | "style"> & {
            fallbacks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            optimizedFallbacks: z.ZodOptional<z.ZodBoolean>;
        } & {
            provider: z.ZodObject<{
                entrypoint: z.ZodUnion<[z.ZodString, z.ZodType<URL, z.ZodTypeDef, URL>]>;
                config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            }, "strict", z.ZodTypeAny, {
                entrypoint: string | URL;
                config?: Record<string, any> | undefined;
            }, {
                entrypoint: string | URL;
                config?: Record<string, any> | undefined;
            }>;
            weights: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodNumber]>, "atleastone">>;
            styles: z.ZodOptional<z.ZodArray<z.ZodEnum<["normal", "italic", "oblique"]>, "atleastone">>;
            subsets: z.ZodOptional<z.ZodArray<z.ZodString, "atleastone">>;
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
        }>]>, "many">>;
        liveContentCollections: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        csp: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodDefault<z.ZodOptional<z.ZodBoolean>>, z.ZodObject<{
            algorithm: z.ZodDefault<z.ZodOptional<z.ZodEnum<["SHA-256", "SHA-384", "SHA-512"]>>>;
            directives: z.ZodOptional<z.ZodArray<z.ZodType<`base-uri${string}` | `child-src${string}` | `connect-src${string}` | `default-src${string}` | `fenced-frame-src${string}` | `font-src${string}` | `form-action${string}` | `frame-ancestors${string}` | `frame-src${string}` | `img-src${string}` | `manifest-src${string}` | `media-src${string}` | `object-src${string}` | `referrer${string}` | `report-to${string}` | `report-uri${string}` | `require-trusted-types-for${string}` | `sandbox${string}` | `trusted-types${string}` | `upgrade-insecure-requests${string}` | `worker-src${string}`, z.ZodTypeDef, `base-uri${string}` | `child-src${string}` | `connect-src${string}` | `default-src${string}` | `fenced-frame-src${string}` | `font-src${string}` | `form-action${string}` | `frame-ancestors${string}` | `frame-src${string}` | `img-src${string}` | `manifest-src${string}` | `media-src${string}` | `object-src${string}` | `referrer${string}` | `report-to${string}` | `report-uri${string}` | `require-trusted-types-for${string}` | `sandbox${string}` | `trusted-types${string}` | `upgrade-insecure-requests${string}` | `worker-src${string}`>, "many">>;
            styleDirective: z.ZodOptional<z.ZodObject<{
                resources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                hashes: z.ZodOptional<z.ZodArray<z.ZodType<`sha256-${string}` | `sha384-${string}` | `sha512-${string}`, z.ZodTypeDef, `sha256-${string}` | `sha384-${string}` | `sha512-${string}`>, "many">>;
            }, "strip", z.ZodTypeAny, {
                resources?: string[] | undefined;
                hashes?: (`sha256-${string}` | `sha384-${string}` | `sha512-${string}`)[] | undefined;
            }, {
                resources?: string[] | undefined;
                hashes?: (`sha256-${string}` | `sha384-${string}` | `sha512-${string}`)[] | undefined;
            }>>;
            scriptDirective: z.ZodOptional<z.ZodObject<{
                resources: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                hashes: z.ZodOptional<z.ZodArray<z.ZodType<`sha256-${string}` | `sha384-${string}` | `sha512-${string}`, z.ZodTypeDef, `sha256-${string}` | `sha384-${string}` | `sha512-${string}`>, "many">>;
                strictDynamic: z.ZodOptional<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                resources?: string[] | undefined;
                hashes?: (`sha256-${string}` | `sha384-${string}` | `sha512-${string}`)[] | undefined;
                strictDynamic?: boolean | undefined;
            }, {
                resources?: string[] | undefined;
                hashes?: (`sha256-${string}` | `sha384-${string}` | `sha512-${string}`)[] | undefined;
                strictDynamic?: boolean | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            algorithm: "SHA-256" | "SHA-384" | "SHA-512";
            directives?: (`base-uri${string}` | `child-src${string}` | `connect-src${string}` | `default-src${string}` | `fenced-frame-src${string}` | `font-src${string}` | `form-action${string}` | `frame-ancestors${string}` | `frame-src${string}` | `img-src${string}` | `manifest-src${string}` | `media-src${string}` | `object-src${string}` | `referrer${string}` | `report-to${string}` | `report-uri${string}` | `require-trusted-types-for${string}` | `sandbox${string}` | `trusted-types${string}` | `upgrade-insecure-requests${string}` | `worker-src${string}`)[] | undefined;
            styleDirective?: {
                resources?: string[] | undefined;
                hashes?: (`sha256-${string}` | `sha384-${string}` | `sha512-${string}`)[] | undefined;
            } | undefined;
            scriptDirective?: {
                resources?: string[] | undefined;
                hashes?: (`sha256-${string}` | `sha384-${string}` | `sha512-${string}`)[] | undefined;
                strictDynamic?: boolean | undefined;
            } | undefined;
        }, {
            algorithm?: "SHA-256" | "SHA-384" | "SHA-512" | undefined;
            directives?: (`base-uri${string}` | `child-src${string}` | `connect-src${string}` | `default-src${string}` | `fenced-frame-src${string}` | `font-src${string}` | `form-action${string}` | `frame-ancestors${string}` | `frame-src${string}` | `img-src${string}` | `manifest-src${string}` | `media-src${string}` | `object-src${string}` | `referrer${string}` | `report-to${string}` | `report-uri${string}` | `require-trusted-types-for${string}` | `sandbox${string}` | `trusted-types${string}` | `upgrade-insecure-requests${string}` | `worker-src${string}`)[] | undefined;
            styleDirective?: {
                resources?: string[] | undefined;
                hashes?: (`sha256-${string}` | `sha384-${string}` | `sha512-${string}`)[] | undefined;
            } | undefined;
            scriptDirective?: {
                resources?: string[] | undefined;
                hashes?: (`sha256-${string}` | `sha384-${string}` | `sha512-${string}`)[] | undefined;
                strictDynamic?: boolean | undefined;
            } | undefined;
        }>]>>>;
        staticImportMetaEnv: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        chromeDevtoolsWorkspace: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strict", z.ZodTypeAny, {
        clientPrerender: boolean;
        contentIntellisense: boolean;
        headingIdCompat: boolean;
        preserveScriptOrder: boolean;
        liveContentCollections: boolean;
        csp: boolean | {
            algorithm: "SHA-256" | "SHA-384" | "SHA-512";
            directives?: (`base-uri${string}` | `child-src${string}` | `connect-src${string}` | `default-src${string}` | `fenced-frame-src${string}` | `font-src${string}` | `form-action${string}` | `frame-ancestors${string}` | `frame-src${string}` | `img-src${string}` | `manifest-src${string}` | `media-src${string}` | `object-src${string}` | `referrer${string}` | `report-to${string}` | `report-uri${string}` | `require-trusted-types-for${string}` | `sandbox${string}` | `trusted-types${string}` | `upgrade-insecure-requests${string}` | `worker-src${string}`)[] | undefined;
            styleDirective?: {
                resources?: string[] | undefined;
                hashes?: (`sha256-${string}` | `sha384-${string}` | `sha512-${string}`)[] | undefined;
            } | undefined;
            scriptDirective?: {
                resources?: string[] | undefined;
                hashes?: (`sha256-${string}` | `sha384-${string}` | `sha512-${string}`)[] | undefined;
                strictDynamic?: boolean | undefined;
            } | undefined;
        };
        staticImportMetaEnv: boolean;
        chromeDevtoolsWorkspace: boolean;
        fonts?: ({
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
        } | {
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
        })[] | undefined;
    }, {
        fonts?: ({
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
        } | {
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
        })[] | undefined;
        clientPrerender?: boolean | undefined;
        contentIntellisense?: boolean | undefined;
        headingIdCompat?: boolean | undefined;
        preserveScriptOrder?: boolean | undefined;
        liveContentCollections?: boolean | undefined;
        csp?: boolean | {
            algorithm?: "SHA-256" | "SHA-384" | "SHA-512" | undefined;
            directives?: (`base-uri${string}` | `child-src${string}` | `connect-src${string}` | `default-src${string}` | `fenced-frame-src${string}` | `font-src${string}` | `form-action${string}` | `frame-ancestors${string}` | `frame-src${string}` | `img-src${string}` | `manifest-src${string}` | `media-src${string}` | `object-src${string}` | `referrer${string}` | `report-to${string}` | `report-uri${string}` | `require-trusted-types-for${string}` | `sandbox${string}` | `trusted-types${string}` | `upgrade-insecure-requests${string}` | `worker-src${string}`)[] | undefined;
            styleDirective?: {
                resources?: string[] | undefined;
                hashes?: (`sha256-${string}` | `sha384-${string}` | `sha512-${string}`)[] | undefined;
            } | undefined;
            scriptDirective?: {
                resources?: string[] | undefined;
                hashes?: (`sha256-${string}` | `sha384-${string}` | `sha512-${string}`)[] | undefined;
                strictDynamic?: boolean | undefined;
            } | undefined;
        } | undefined;
        staticImportMetaEnv?: boolean | undefined;
        chromeDevtoolsWorkspace?: boolean | undefined;
    }>>;
    legacy: z.ZodDefault<z.ZodObject<{
        collections: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        collections: boolean;
    }, {
        collections?: boolean | undefined;
    }>>;
} & {
    root: z.ZodEffects<z.ZodDefault<z.ZodString>, import("url").URL, string | undefined>;
    srcDir: z.ZodEffects<z.ZodDefault<z.ZodString>, import("url").URL, string | undefined>;
    compressHTML: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    publicDir: z.ZodEffects<z.ZodDefault<z.ZodString>, import("url").URL, string | undefined>;
    outDir: z.ZodEffects<z.ZodDefault<z.ZodString>, import("url").URL, string | undefined>;
    cacheDir: z.ZodEffects<z.ZodDefault<z.ZodString>, import("url").URL, string | undefined>;
    build: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        format: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"file">, z.ZodLiteral<"directory">, z.ZodLiteral<"preserve">]>>>;
        client: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, import("url").URL, string | undefined>;
        server: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodString>>, import("url").URL, string | undefined>;
        assets: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        assetsPrefix: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodOptional<z.ZodIntersection<z.ZodObject<{
            fallback: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            fallback: string;
        }, {
            fallback: string;
        }>, z.ZodRecord<z.ZodString, z.ZodString>>>]>;
        serverEntry: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        redirects: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        inlineStylesheets: z.ZodDefault<z.ZodOptional<z.ZodEnum<["always", "auto", "never"]>>>;
        concurrency: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        redirects: boolean;
        assets: string;
        format: "preserve" | "file" | "directory";
        client: import("url").URL;
        server: import("url").URL;
        serverEntry: string;
        inlineStylesheets: "auto" | "never" | "always";
        concurrency: number;
        assetsPrefix?: string | ({
            fallback: string;
        } & Record<string, string>) | undefined;
    }, {
        redirects?: boolean | undefined;
        assets?: string | undefined;
        format?: "preserve" | "file" | "directory" | undefined;
        client?: string | undefined;
        server?: string | undefined;
        serverEntry?: string | undefined;
        inlineStylesheets?: "auto" | "never" | "always" | undefined;
        concurrency?: number | undefined;
        assetsPrefix?: string | ({
            fallback: string;
        } & Record<string, string>) | undefined;
    }>>>;
    server: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodObject<{
        open: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodBoolean]>>>;
        host: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodBoolean]>>>;
        port: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        headers: z.ZodOptional<z.ZodType<OutgoingHttpHeaders, z.ZodTypeDef, OutgoingHttpHeaders>>;
        streaming: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        allowedHosts: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodArray<z.ZodString, "many">, z.ZodLiteral<true>]>>>;
    }, "strip", z.ZodTypeAny, {
        host: string | boolean;
        port: number;
        allowedHosts: true | string[];
        open: string | boolean;
        streaming: boolean;
        headers?: OutgoingHttpHeaders | undefined;
    }, {
        host?: string | boolean | undefined;
        port?: number | undefined;
        allowedHosts?: true | string[] | undefined;
        headers?: OutgoingHttpHeaders | undefined;
        open?: string | boolean | undefined;
        streaming?: boolean | undefined;
    }>>>, {
        host: string | boolean;
        port: number;
        allowedHosts: true | string[];
        open: string | boolean;
        streaming: boolean;
        headers?: OutgoingHttpHeaders | undefined;
    }, unknown>;
}, "strip", z.ZodTypeAny, {
    outDir: import("url").URL;
    root: import("url").URL;
    build: {
        redirects: boolean;
        assets: string;
        format: "preserve" | "file" | "directory";
        client: import("url").URL;
        server: import("url").URL;
        serverEntry: string;
        inlineStylesheets: "auto" | "never" | "always";
        concurrency: number;
        assetsPrefix?: string | ({
            fallback: string;
        } & Record<string, string>) | undefined;
    };
    markdown: {
        syntaxHighlight: false | "shiki" | "prism" | {
            type: "shiki" | "prism";
            excludeLangs: string[];
        };
        shikiConfig: {
            langs: (import("shiki").LanguageRegistration & import("./base.js").ComplexifyUnionObj)[];
            theme: import("shiki").BundledTheme | (NonNullable<import("@astrojs/markdown-remark").ThemePresets | import("shiki").ThemeRegistration | import("shiki").ThemeRegistrationRaw | undefined> & import("./base.js").ComplexifyUnionObj);
            themes: Record<string, import("shiki").BundledTheme | (NonNullable<import("@astrojs/markdown-remark").ThemePresets | import("shiki").ThemeRegistration | import("shiki").ThemeRegistrationRaw | undefined> & import("./base.js").ComplexifyUnionObj)>;
            langAlias: Record<string, string>;
            wrap: boolean | null;
            transformers: (import("shiki").ShikiTransformer & import("./base.js").ComplexifyUnionObj)[];
            defaultColor?: string | false | undefined;
        };
        remarkPlugins: (string | [string, any] | (import("@astrojs/markdown-remark").RemarkPlugin & import("./base.js").ComplexifyUnionObj) | [import("@astrojs/markdown-remark").RemarkPlugin & import("./base.js").ComplexifyUnionObj, any])[];
        rehypePlugins: (string | [string, any] | (import("@astrojs/markdown-remark").RehypePlugin & import("./base.js").ComplexifyUnionObj) | [import("@astrojs/markdown-remark").RehypePlugin & import("./base.js").ComplexifyUnionObj, any])[];
        remarkRehype: import("./base.js").RemarkRehype;
        gfm: boolean;
        smartypants: boolean;
    };
    vite: import("../../../types/public/config.js").ViteUserConfig;
    redirects: Record<string, string | {
        status: 301 | 302 | 303 | 307 | 308 | 300 | 304;
        destination: string;
    }>;
    env: {
        validateSecrets: boolean;
        schema: Record<string, ({
            context: "client";
            access: "public";
        } | {
            context: "server";
            access: "public";
        } | {
            context: "server";
            access: "secret";
        }) & ({
            type: "string";
            length?: number | undefined;
            includes?: string | undefined;
            endsWith?: string | undefined;
            startsWith?: string | undefined;
            optional?: boolean | undefined;
            url?: boolean | undefined;
            default?: string | undefined;
            max?: number | undefined;
            min?: number | undefined;
        } | {
            type: "number";
            optional?: boolean | undefined;
            default?: number | undefined;
            max?: number | undefined;
            min?: number | undefined;
            gt?: number | undefined;
            lt?: number | undefined;
            int?: boolean | undefined;
        } | {
            type: "boolean";
            optional?: boolean | undefined;
            default?: boolean | undefined;
        } | {
            values: string[];
            type: "enum";
            optional?: boolean | undefined;
            default?: string | undefined;
        })>;
    };
    image: {
        responsiveStyles: boolean;
        endpoint: {
            route: string;
            entrypoint?: string | undefined;
        };
        service: {
            config: Record<string, any>;
            entrypoint: string;
        };
        domains: string[];
        remotePatterns: {
            port?: string | undefined;
            protocol?: string | undefined;
            hostname?: string | undefined;
            pathname?: string | undefined;
        }[];
        layout?: "fixed" | "constrained" | "full-width" | "none" | undefined;
        objectFit?: string | undefined;
        objectPosition?: string | undefined;
        breakpoints?: number[] | undefined;
    };
    server: {
        host: string | boolean;
        port: number;
        allowedHosts: true | string[];
        open: string | boolean;
        streaming: boolean;
        headers?: OutgoingHttpHeaders | undefined;
    };
    srcDir: import("url").URL;
    publicDir: import("url").URL;
    cacheDir: import("url").URL;
    compressHTML: boolean;
    base: string;
    trailingSlash: "never" | "ignore" | "always";
    output: "server" | "static";
    scopedStyleStrategy: "where" | "class" | "attribute";
    integrations: {
        name: string;
        hooks: {} & {
            [k: string]: unknown;
        };
    }[];
    devToolbar: {
        enabled: boolean;
    };
    security: {
        checkOrigin: boolean;
    };
    experimental: {
        clientPrerender: boolean;
        contentIntellisense: boolean;
        headingIdCompat: boolean;
        preserveScriptOrder: boolean;
        liveContentCollections: boolean;
        csp: boolean | {
            algorithm: "SHA-256" | "SHA-384" | "SHA-512";
            directives?: (`base-uri${string}` | `child-src${string}` | `connect-src${string}` | `default-src${string}` | `fenced-frame-src${string}` | `font-src${string}` | `form-action${string}` | `frame-ancestors${string}` | `frame-src${string}` | `img-src${string}` | `manifest-src${string}` | `media-src${string}` | `object-src${string}` | `referrer${string}` | `report-to${string}` | `report-uri${string}` | `require-trusted-types-for${string}` | `sandbox${string}` | `trusted-types${string}` | `upgrade-insecure-requests${string}` | `worker-src${string}`)[] | undefined;
            styleDirective?: {
                resources?: string[] | undefined;
                hashes?: (`sha256-${string}` | `sha384-${string}` | `sha512-${string}`)[] | undefined;
            } | undefined;
            scriptDirective?: {
                resources?: string[] | undefined;
                hashes?: (`sha256-${string}` | `sha384-${string}` | `sha512-${string}`)[] | undefined;
                strictDynamic?: boolean | undefined;
            } | undefined;
        };
        staticImportMetaEnv: boolean;
        chromeDevtoolsWorkspace: boolean;
        fonts?: ({
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
        } | {
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
        })[] | undefined;
    };
    legacy: {
        collections: boolean;
    };
    session?: {
        options?: Record<string, any> | undefined;
        driver?: string | undefined;
        cookie?: {
            name?: string | undefined;
            path?: string | undefined;
            domain?: string | undefined;
            maxAge?: number | undefined;
            sameSite?: boolean | "strict" | "none" | "lax" | undefined;
            secure?: boolean | undefined;
        } | undefined;
        ttl?: number | undefined;
    } | undefined;
    adapter?: {
        name: string;
        hooks: {} & {
            [k: string]: unknown;
        };
    } | undefined;
    site?: string | undefined;
    prefetch?: boolean | {
        prefetchAll?: boolean | undefined;
        defaultStrategy?: "tap" | "hover" | "viewport" | "load" | undefined;
    } | undefined;
    i18n?: {
        defaultLocale: string;
        locales: (string | {
            path: string;
            codes: [string, ...string[]];
        })[];
        routing: "manual" | {
            prefixDefaultLocale: boolean;
            redirectToDefaultLocale: boolean;
            fallbackType: "redirect" | "rewrite";
        };
        fallback?: Record<string, string> | undefined;
        domains?: Record<string, string> | undefined;
    } | undefined;
}, {
    outDir?: string | undefined;
    root?: string | undefined;
    build?: {
        redirects?: boolean | undefined;
        assets?: string | undefined;
        format?: "preserve" | "file" | "directory" | undefined;
        client?: string | undefined;
        server?: string | undefined;
        serverEntry?: string | undefined;
        inlineStylesheets?: "auto" | "never" | "always" | undefined;
        concurrency?: number | undefined;
        assetsPrefix?: string | ({
            fallback: string;
        } & Record<string, string>) | undefined;
    } | undefined;
    markdown?: {
        syntaxHighlight?: false | "shiki" | "prism" | {
            type?: "shiki" | "prism" | undefined;
            excludeLangs?: string[] | undefined;
        } | undefined;
        shikiConfig?: {
            langs?: (import("shiki").LanguageRegistration & import("./base.js").ComplexifyUnionObj)[] | undefined;
            theme?: import("shiki").BundledTheme | (NonNullable<import("@astrojs/markdown-remark").ThemePresets | import("shiki").ThemeRegistration | import("shiki").ThemeRegistrationRaw | undefined> & import("./base.js").ComplexifyUnionObj) | undefined;
            themes?: Record<string, import("shiki").BundledTheme | (NonNullable<import("@astrojs/markdown-remark").ThemePresets | import("shiki").ThemeRegistration | import("shiki").ThemeRegistrationRaw | undefined> & import("./base.js").ComplexifyUnionObj)> | undefined;
            langAlias?: Record<string, string> | undefined;
            defaultColor?: string | false | undefined;
            wrap?: boolean | null | undefined;
            transformers?: (import("shiki").ShikiTransformer & import("./base.js").ComplexifyUnionObj)[] | undefined;
        } | undefined;
        remarkPlugins?: (string | [string, any] | (import("@astrojs/markdown-remark").RemarkPlugin & import("./base.js").ComplexifyUnionObj) | [import("@astrojs/markdown-remark").RemarkPlugin & import("./base.js").ComplexifyUnionObj, any])[] | undefined;
        rehypePlugins?: (string | [string, any] | (import("@astrojs/markdown-remark").RehypePlugin & import("./base.js").ComplexifyUnionObj) | [import("@astrojs/markdown-remark").RehypePlugin & import("./base.js").ComplexifyUnionObj, any])[] | undefined;
        remarkRehype?: import("./base.js").RemarkRehype | undefined;
        gfm?: boolean | undefined;
        smartypants?: boolean | undefined;
    } | undefined;
    vite?: import("../../../types/public/config.js").ViteUserConfig | undefined;
    redirects?: Record<string, string | {
        status: 301 | 302 | 303 | 307 | 308 | 300 | 304;
        destination: string;
    }> | undefined;
    session?: {
        options?: Record<string, any> | undefined;
        driver?: string | undefined;
        cookie?: string | {
            name?: string | undefined;
            path?: string | undefined;
            domain?: string | undefined;
            maxAge?: number | undefined;
            sameSite?: boolean | "strict" | "none" | "lax" | undefined;
            secure?: boolean | undefined;
        } | undefined;
        ttl?: number | undefined;
    } | undefined;
    env?: {
        validateSecrets?: boolean | undefined;
        schema?: Record<string, ({
            context: "client";
            access: "public";
        } | {
            context: "server";
            access: "public";
        } | {
            context: "server";
            access: "secret";
        }) & ({
            type: "string";
            length?: number | undefined;
            includes?: string | undefined;
            endsWith?: string | undefined;
            startsWith?: string | undefined;
            optional?: boolean | undefined;
            url?: boolean | undefined;
            default?: string | undefined;
            max?: number | undefined;
            min?: number | undefined;
        } | {
            type: "number";
            optional?: boolean | undefined;
            default?: number | undefined;
            max?: number | undefined;
            min?: number | undefined;
            gt?: number | undefined;
            lt?: number | undefined;
            int?: boolean | undefined;
        } | {
            type: "boolean";
            optional?: boolean | undefined;
            default?: boolean | undefined;
        } | {
            values: string[];
            type: "enum";
            optional?: boolean | undefined;
            default?: string | undefined;
        })> | undefined;
    } | undefined;
    adapter?: {
        name: string;
        hooks?: z.objectInputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
    } | undefined;
    image?: {
        responsiveStyles?: boolean | undefined;
        endpoint?: {
            entrypoint?: string | undefined;
            route?: string | undefined;
        } | undefined;
        service?: {
            config?: Record<string, any> | undefined;
            entrypoint?: string | undefined;
        } | undefined;
        domains?: string[] | undefined;
        remotePatterns?: {
            port?: string | undefined;
            protocol?: string | undefined;
            hostname?: string | undefined;
            pathname?: string | undefined;
        }[] | undefined;
        layout?: "fixed" | "constrained" | "full-width" | "none" | undefined;
        objectFit?: string | undefined;
        objectPosition?: string | undefined;
        breakpoints?: number[] | undefined;
    } | undefined;
    server?: unknown;
    srcDir?: string | undefined;
    publicDir?: string | undefined;
    cacheDir?: string | undefined;
    site?: string | undefined;
    compressHTML?: boolean | undefined;
    base?: string | undefined;
    trailingSlash?: "never" | "ignore" | "always" | undefined;
    output?: "server" | "static" | undefined;
    scopedStyleStrategy?: "where" | "class" | "attribute" | undefined;
    integrations?: unknown;
    prefetch?: boolean | {
        prefetchAll?: boolean | undefined;
        defaultStrategy?: "tap" | "hover" | "viewport" | "load" | undefined;
    } | undefined;
    devToolbar?: {
        enabled?: boolean | undefined;
    } | undefined;
    i18n?: {
        defaultLocale: string;
        locales: (string | {
            path: string;
            codes: [string, ...string[]];
        })[];
        fallback?: Record<string, string> | undefined;
        domains?: Record<string, string> | undefined;
        routing?: "manual" | {
            prefixDefaultLocale?: boolean | undefined;
            redirectToDefaultLocale?: boolean | undefined;
            fallbackType?: "redirect" | "rewrite" | undefined;
        } | undefined;
    } | undefined;
    security?: {
        checkOrigin?: boolean | undefined;
    } | undefined;
    experimental?: {
        fonts?: ({
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
        } | {
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
        })[] | undefined;
        clientPrerender?: boolean | undefined;
        contentIntellisense?: boolean | undefined;
        headingIdCompat?: boolean | undefined;
        preserveScriptOrder?: boolean | undefined;
        liveContentCollections?: boolean | undefined;
        csp?: boolean | {
            algorithm?: "SHA-256" | "SHA-384" | "SHA-512" | undefined;
            directives?: (`base-uri${string}` | `child-src${string}` | `connect-src${string}` | `default-src${string}` | `fenced-frame-src${string}` | `font-src${string}` | `form-action${string}` | `frame-ancestors${string}` | `frame-src${string}` | `img-src${string}` | `manifest-src${string}` | `media-src${string}` | `object-src${string}` | `referrer${string}` | `report-to${string}` | `report-uri${string}` | `require-trusted-types-for${string}` | `sandbox${string}` | `trusted-types${string}` | `upgrade-insecure-requests${string}` | `worker-src${string}`)[] | undefined;
            styleDirective?: {
                resources?: string[] | undefined;
                hashes?: (`sha256-${string}` | `sha384-${string}` | `sha512-${string}`)[] | undefined;
            } | undefined;
            scriptDirective?: {
                resources?: string[] | undefined;
                hashes?: (`sha256-${string}` | `sha384-${string}` | `sha512-${string}`)[] | undefined;
                strictDynamic?: boolean | undefined;
            } | undefined;
        } | undefined;
        staticImportMetaEnv?: boolean | undefined;
        chromeDevtoolsWorkspace?: boolean | undefined;
    } | undefined;
    legacy?: {
        collections?: boolean | undefined;
    } | undefined;
}>, {
    outDir: import("url").URL;
    root: import("url").URL;
    build: {
        redirects: boolean;
        assets: string;
        format: "preserve" | "file" | "directory";
        client: import("url").URL;
        server: import("url").URL;
        serverEntry: string;
        inlineStylesheets: "auto" | "never" | "always";
        concurrency: number;
        assetsPrefix?: string | ({
            fallback: string;
        } & Record<string, string>) | undefined;
    };
    markdown: {
        syntaxHighlight: false | "shiki" | "prism" | {
            type: "shiki" | "prism";
            excludeLangs: string[];
        };
        shikiConfig: {
            langs: (import("shiki").LanguageRegistration & import("./base.js").ComplexifyUnionObj)[];
            theme: import("shiki").BundledTheme | (NonNullable<import("@astrojs/markdown-remark").ThemePresets | import("shiki").ThemeRegistration | import("shiki").ThemeRegistrationRaw | undefined> & import("./base.js").ComplexifyUnionObj);
            themes: Record<string, import("shiki").BundledTheme | (NonNullable<import("@astrojs/markdown-remark").ThemePresets | import("shiki").ThemeRegistration | import("shiki").ThemeRegistrationRaw | undefined> & import("./base.js").ComplexifyUnionObj)>;
            langAlias: Record<string, string>;
            wrap: boolean | null;
            transformers: (import("shiki").ShikiTransformer & import("./base.js").ComplexifyUnionObj)[];
            defaultColor?: string | false | undefined;
        };
        remarkPlugins: (string | [string, any] | (import("@astrojs/markdown-remark").RemarkPlugin & import("./base.js").ComplexifyUnionObj) | [import("@astrojs/markdown-remark").RemarkPlugin & import("./base.js").ComplexifyUnionObj, any])[];
        rehypePlugins: (string | [string, any] | (import("@astrojs/markdown-remark").RehypePlugin & import("./base.js").ComplexifyUnionObj) | [import("@astrojs/markdown-remark").RehypePlugin & import("./base.js").ComplexifyUnionObj, any])[];
        remarkRehype: import("./base.js").RemarkRehype;
        gfm: boolean;
        smartypants: boolean;
    };
    vite: import("../../../types/public/config.js").ViteUserConfig;
    redirects: Record<string, string | {
        status: 301 | 302 | 303 | 307 | 308 | 300 | 304;
        destination: string;
    }>;
    env: {
        validateSecrets: boolean;
        schema: Record<string, ({
            context: "client";
            access: "public";
        } | {
            context: "server";
            access: "public";
        } | {
            context: "server";
            access: "secret";
        }) & ({
            type: "string";
            length?: number | undefined;
            includes?: string | undefined;
            endsWith?: string | undefined;
            startsWith?: string | undefined;
            optional?: boolean | undefined;
            url?: boolean | undefined;
            default?: string | undefined;
            max?: number | undefined;
            min?: number | undefined;
        } | {
            type: "number";
            optional?: boolean | undefined;
            default?: number | undefined;
            max?: number | undefined;
            min?: number | undefined;
            gt?: number | undefined;
            lt?: number | undefined;
            int?: boolean | undefined;
        } | {
            type: "boolean";
            optional?: boolean | undefined;
            default?: boolean | undefined;
        } | {
            values: string[];
            type: "enum";
            optional?: boolean | undefined;
            default?: string | undefined;
        })>;
    };
    image: {
        responsiveStyles: boolean;
        endpoint: {
            route: string;
            entrypoint?: string | undefined;
        };
        service: {
            config: Record<string, any>;
            entrypoint: string;
        };
        domains: string[];
        remotePatterns: {
            port?: string | undefined;
            protocol?: string | undefined;
            hostname?: string | undefined;
            pathname?: string | undefined;
        }[];
        layout?: "fixed" | "constrained" | "full-width" | "none" | undefined;
        objectFit?: string | undefined;
        objectPosition?: string | undefined;
        breakpoints?: number[] | undefined;
    };
    server: {
        host: string | boolean;
        port: number;
        allowedHosts: true | string[];
        open: string | boolean;
        streaming: boolean;
        headers?: OutgoingHttpHeaders | undefined;
    };
    srcDir: import("url").URL;
    publicDir: import("url").URL;
    cacheDir: import("url").URL;
    compressHTML: boolean;
    base: string;
    trailingSlash: "never" | "ignore" | "always";
    output: "server" | "static";
    scopedStyleStrategy: "where" | "class" | "attribute";
    integrations: {
        name: string;
        hooks: {} & {
            [k: string]: unknown;
        };
    }[];
    devToolbar: {
        enabled: boolean;
    };
    security: {
        checkOrigin: boolean;
    };
    experimental: {
        clientPrerender: boolean;
        contentIntellisense: boolean;
        headingIdCompat: boolean;
        preserveScriptOrder: boolean;
        liveContentCollections: boolean;
        csp: boolean | {
            algorithm: "SHA-256" | "SHA-384" | "SHA-512";
            directives?: (`base-uri${string}` | `child-src${string}` | `connect-src${string}` | `default-src${string}` | `fenced-frame-src${string}` | `font-src${string}` | `form-action${string}` | `frame-ancestors${string}` | `frame-src${string}` | `img-src${string}` | `manifest-src${string}` | `media-src${string}` | `object-src${string}` | `referrer${string}` | `report-to${string}` | `report-uri${string}` | `require-trusted-types-for${string}` | `sandbox${string}` | `trusted-types${string}` | `upgrade-insecure-requests${string}` | `worker-src${string}`)[] | undefined;
            styleDirective?: {
                resources?: string[] | undefined;
                hashes?: (`sha256-${string}` | `sha384-${string}` | `sha512-${string}`)[] | undefined;
            } | undefined;
            scriptDirective?: {
                resources?: string[] | undefined;
                hashes?: (`sha256-${string}` | `sha384-${string}` | `sha512-${string}`)[] | undefined;
                strictDynamic?: boolean | undefined;
            } | undefined;
        };
        staticImportMetaEnv: boolean;
        chromeDevtoolsWorkspace: boolean;
        fonts?: ({
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
        } | {
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
        })[] | undefined;
    };
    legacy: {
        collections: boolean;
    };
    session?: {
        options?: Record<string, any> | undefined;
        driver?: string | undefined;
        cookie?: {
            name?: string | undefined;
            path?: string | undefined;
            domain?: string | undefined;
            maxAge?: number | undefined;
            sameSite?: boolean | "strict" | "none" | "lax" | undefined;
            secure?: boolean | undefined;
        } | undefined;
        ttl?: number | undefined;
    } | undefined;
    adapter?: {
        name: string;
        hooks: {} & {
            [k: string]: unknown;
        };
    } | undefined;
    site?: string | undefined;
    prefetch?: boolean | {
        prefetchAll?: boolean | undefined;
        defaultStrategy?: "tap" | "hover" | "viewport" | "load" | undefined;
    } | undefined;
    i18n?: {
        defaultLocale: string;
        locales: (string | {
            path: string;
            codes: [string, ...string[]];
        })[];
        routing: "manual" | {
            prefixDefaultLocale: boolean;
            redirectToDefaultLocale: boolean;
            fallbackType: "redirect" | "rewrite";
        };
        fallback?: Record<string, string> | undefined;
        domains?: Record<string, string> | undefined;
    } | undefined;
}, {
    outDir?: string | undefined;
    root?: string | undefined;
    build?: {
        redirects?: boolean | undefined;
        assets?: string | undefined;
        format?: "preserve" | "file" | "directory" | undefined;
        client?: string | undefined;
        server?: string | undefined;
        serverEntry?: string | undefined;
        inlineStylesheets?: "auto" | "never" | "always" | undefined;
        concurrency?: number | undefined;
        assetsPrefix?: string | ({
            fallback: string;
        } & Record<string, string>) | undefined;
    } | undefined;
    markdown?: {
        syntaxHighlight?: false | "shiki" | "prism" | {
            type?: "shiki" | "prism" | undefined;
            excludeLangs?: string[] | undefined;
        } | undefined;
        shikiConfig?: {
            langs?: (import("shiki").LanguageRegistration & import("./base.js").ComplexifyUnionObj)[] | undefined;
            theme?: import("shiki").BundledTheme | (NonNullable<import("@astrojs/markdown-remark").ThemePresets | import("shiki").ThemeRegistration | import("shiki").ThemeRegistrationRaw | undefined> & import("./base.js").ComplexifyUnionObj) | undefined;
            themes?: Record<string, import("shiki").BundledTheme | (NonNullable<import("@astrojs/markdown-remark").ThemePresets | import("shiki").ThemeRegistration | import("shiki").ThemeRegistrationRaw | undefined> & import("./base.js").ComplexifyUnionObj)> | undefined;
            langAlias?: Record<string, string> | undefined;
            defaultColor?: string | false | undefined;
            wrap?: boolean | null | undefined;
            transformers?: (import("shiki").ShikiTransformer & import("./base.js").ComplexifyUnionObj)[] | undefined;
        } | undefined;
        remarkPlugins?: (string | [string, any] | (import("@astrojs/markdown-remark").RemarkPlugin & import("./base.js").ComplexifyUnionObj) | [import("@astrojs/markdown-remark").RemarkPlugin & import("./base.js").ComplexifyUnionObj, any])[] | undefined;
        rehypePlugins?: (string | [string, any] | (import("@astrojs/markdown-remark").RehypePlugin & import("./base.js").ComplexifyUnionObj) | [import("@astrojs/markdown-remark").RehypePlugin & import("./base.js").ComplexifyUnionObj, any])[] | undefined;
        remarkRehype?: import("./base.js").RemarkRehype | undefined;
        gfm?: boolean | undefined;
        smartypants?: boolean | undefined;
    } | undefined;
    vite?: import("../../../types/public/config.js").ViteUserConfig | undefined;
    redirects?: Record<string, string | {
        status: 301 | 302 | 303 | 307 | 308 | 300 | 304;
        destination: string;
    }> | undefined;
    session?: {
        options?: Record<string, any> | undefined;
        driver?: string | undefined;
        cookie?: string | {
            name?: string | undefined;
            path?: string | undefined;
            domain?: string | undefined;
            maxAge?: number | undefined;
            sameSite?: boolean | "strict" | "none" | "lax" | undefined;
            secure?: boolean | undefined;
        } | undefined;
        ttl?: number | undefined;
    } | undefined;
    env?: {
        validateSecrets?: boolean | undefined;
        schema?: Record<string, ({
            context: "client";
            access: "public";
        } | {
            context: "server";
            access: "public";
        } | {
            context: "server";
            access: "secret";
        }) & ({
            type: "string";
            length?: number | undefined;
            includes?: string | undefined;
            endsWith?: string | undefined;
            startsWith?: string | undefined;
            optional?: boolean | undefined;
            url?: boolean | undefined;
            default?: string | undefined;
            max?: number | undefined;
            min?: number | undefined;
        } | {
            type: "number";
            optional?: boolean | undefined;
            default?: number | undefined;
            max?: number | undefined;
            min?: number | undefined;
            gt?: number | undefined;
            lt?: number | undefined;
            int?: boolean | undefined;
        } | {
            type: "boolean";
            optional?: boolean | undefined;
            default?: boolean | undefined;
        } | {
            values: string[];
            type: "enum";
            optional?: boolean | undefined;
            default?: string | undefined;
        })> | undefined;
    } | undefined;
    adapter?: {
        name: string;
        hooks?: z.objectInputType<{}, z.ZodTypeAny, "passthrough"> | undefined;
    } | undefined;
    image?: {
        responsiveStyles?: boolean | undefined;
        endpoint?: {
            entrypoint?: string | undefined;
            route?: string | undefined;
        } | undefined;
        service?: {
            config?: Record<string, any> | undefined;
            entrypoint?: string | undefined;
        } | undefined;
        domains?: string[] | undefined;
        remotePatterns?: {
            port?: string | undefined;
            protocol?: string | undefined;
            hostname?: string | undefined;
            pathname?: string | undefined;
        }[] | undefined;
        layout?: "fixed" | "constrained" | "full-width" | "none" | undefined;
        objectFit?: string | undefined;
        objectPosition?: string | undefined;
        breakpoints?: number[] | undefined;
    } | undefined;
    server?: unknown;
    srcDir?: string | undefined;
    publicDir?: string | undefined;
    cacheDir?: string | undefined;
    site?: string | undefined;
    compressHTML?: boolean | undefined;
    base?: string | undefined;
    trailingSlash?: "never" | "ignore" | "always" | undefined;
    output?: "server" | "static" | undefined;
    scopedStyleStrategy?: "where" | "class" | "attribute" | undefined;
    integrations?: unknown;
    prefetch?: boolean | {
        prefetchAll?: boolean | undefined;
        defaultStrategy?: "tap" | "hover" | "viewport" | "load" | undefined;
    } | undefined;
    devToolbar?: {
        enabled?: boolean | undefined;
    } | undefined;
    i18n?: {
        defaultLocale: string;
        locales: (string | {
            path: string;
            codes: [string, ...string[]];
        })[];
        fallback?: Record<string, string> | undefined;
        domains?: Record<string, string> | undefined;
        routing?: "manual" | {
            prefixDefaultLocale?: boolean | undefined;
            redirectToDefaultLocale?: boolean | undefined;
            fallbackType?: "redirect" | "rewrite" | undefined;
        } | undefined;
    } | undefined;
    security?: {
        checkOrigin?: boolean | undefined;
    } | undefined;
    experimental?: {
        fonts?: ({
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
        } | {
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
        })[] | undefined;
        clientPrerender?: boolean | undefined;
        contentIntellisense?: boolean | undefined;
        headingIdCompat?: boolean | undefined;
        preserveScriptOrder?: boolean | undefined;
        liveContentCollections?: boolean | undefined;
        csp?: boolean | {
            algorithm?: "SHA-256" | "SHA-384" | "SHA-512" | undefined;
            directives?: (`base-uri${string}` | `child-src${string}` | `connect-src${string}` | `default-src${string}` | `fenced-frame-src${string}` | `font-src${string}` | `form-action${string}` | `frame-ancestors${string}` | `frame-src${string}` | `img-src${string}` | `manifest-src${string}` | `media-src${string}` | `object-src${string}` | `referrer${string}` | `report-to${string}` | `report-uri${string}` | `require-trusted-types-for${string}` | `sandbox${string}` | `trusted-types${string}` | `upgrade-insecure-requests${string}` | `worker-src${string}`)[] | undefined;
            styleDirective?: {
                resources?: string[] | undefined;
                hashes?: (`sha256-${string}` | `sha384-${string}` | `sha512-${string}`)[] | undefined;
            } | undefined;
            scriptDirective?: {
                resources?: string[] | undefined;
                hashes?: (`sha256-${string}` | `sha384-${string}` | `sha512-${string}`)[] | undefined;
                strictDynamic?: boolean | undefined;
            } | undefined;
        } | undefined;
        staticImportMetaEnv?: boolean | undefined;
        chromeDevtoolsWorkspace?: boolean | undefined;
    } | undefined;
    legacy?: {
        collections?: boolean | undefined;
    } | undefined;
}>;
