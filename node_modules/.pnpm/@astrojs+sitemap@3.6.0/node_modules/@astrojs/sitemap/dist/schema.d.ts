import { EnumChangefreq as ChangeFreq } from 'sitemap';
import { z } from 'zod';
export declare const SitemapOptionsSchema: z.ZodDefault<z.ZodObject<{
    filenameBase: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    filter: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodString], z.ZodUnknown>, z.ZodBoolean>>;
    customSitemaps: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    customPages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    canonicalURL: z.ZodOptional<z.ZodString>;
    xslURL: z.ZodOptional<z.ZodString>;
    i18n: z.ZodOptional<z.ZodEffects<z.ZodObject<{
        defaultLocale: z.ZodString;
        locales: z.ZodRecord<z.ZodString, z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        defaultLocale: string;
        locales: Record<string, string>;
    }, {
        defaultLocale: string;
        locales: Record<string, string>;
    }>, {
        defaultLocale: string;
        locales: Record<string, string>;
    }, {
        defaultLocale: string;
        locales: Record<string, string>;
    }>>;
    entryLimit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    serialize: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodAny], z.ZodUnknown>, z.ZodAny>>;
    changefreq: z.ZodOptional<z.ZodNativeEnum<typeof ChangeFreq>>;
    lastmod: z.ZodOptional<z.ZodDate>;
    priority: z.ZodOptional<z.ZodNumber>;
    namespaces: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        news: z.ZodOptional<z.ZodBoolean>;
        xhtml: z.ZodOptional<z.ZodBoolean>;
        image: z.ZodOptional<z.ZodBoolean>;
        video: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        news?: boolean | undefined;
        xhtml?: boolean | undefined;
        image?: boolean | undefined;
        video?: boolean | undefined;
    }, {
        news?: boolean | undefined;
        xhtml?: boolean | undefined;
        image?: boolean | undefined;
        video?: boolean | undefined;
    }>>>;
}, "strict", z.ZodTypeAny, {
    filenameBase: string;
    entryLimit: number;
    namespaces: {
        news?: boolean | undefined;
        xhtml?: boolean | undefined;
        image?: boolean | undefined;
        video?: boolean | undefined;
    };
    changefreq?: ChangeFreq | undefined;
    priority?: number | undefined;
    lastmod?: Date | undefined;
    i18n?: {
        defaultLocale: string;
        locales: Record<string, string>;
    } | undefined;
    filter?: ((args_0: string, ...args: unknown[]) => boolean) | undefined;
    customSitemaps?: string[] | undefined;
    customPages?: string[] | undefined;
    canonicalURL?: string | undefined;
    xslURL?: string | undefined;
    serialize?: ((args_0: any, ...args: unknown[]) => any) | undefined;
}, {
    changefreq?: ChangeFreq | undefined;
    priority?: number | undefined;
    lastmod?: Date | undefined;
    i18n?: {
        defaultLocale: string;
        locales: Record<string, string>;
    } | undefined;
    filter?: ((args_0: string, ...args: unknown[]) => boolean) | undefined;
    filenameBase?: string | undefined;
    entryLimit?: number | undefined;
    customSitemaps?: string[] | undefined;
    customPages?: string[] | undefined;
    canonicalURL?: string | undefined;
    xslURL?: string | undefined;
    serialize?: ((args_0: any, ...args: unknown[]) => any) | undefined;
    namespaces?: {
        news?: boolean | undefined;
        xhtml?: boolean | undefined;
        image?: boolean | undefined;
        video?: boolean | undefined;
    } | undefined;
}>>;
