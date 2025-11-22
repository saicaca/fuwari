import { z } from 'astro/zod';
export declare const rssSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    pubDate: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodDate]>, Date, string | number | Date>, Date, string | number | Date>>;
    customData: z.ZodOptional<z.ZodString>;
    categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    author: z.ZodOptional<z.ZodString>;
    commentsUrl: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodObject<{
        url: z.ZodString;
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        url: string;
    }, {
        title: string;
        url: string;
    }>>;
    enclosure: z.ZodOptional<z.ZodObject<{
        url: z.ZodString;
        length: z.ZodNumber;
        type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        length: number;
        type: string;
        url: string;
    }, {
        length: number;
        type: string;
        url: string;
    }>>;
    link: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    description?: string | undefined;
    pubDate?: Date | undefined;
    customData?: string | undefined;
    categories?: string[] | undefined;
    author?: string | undefined;
    commentsUrl?: string | undefined;
    source?: {
        title: string;
        url: string;
    } | undefined;
    enclosure?: {
        length: number;
        type: string;
        url: string;
    } | undefined;
    link?: string | undefined;
    content?: string | undefined;
}, {
    title?: string | undefined;
    description?: string | undefined;
    pubDate?: string | number | Date | undefined;
    customData?: string | undefined;
    categories?: string[] | undefined;
    author?: string | undefined;
    commentsUrl?: string | undefined;
    source?: {
        title: string;
        url: string;
    } | undefined;
    enclosure?: {
        length: number;
        type: string;
        url: string;
    } | undefined;
    link?: string | undefined;
    content?: string | undefined;
}>;
