import type { MarkdownHeading } from '@astrojs/markdown-remark';
import { z } from 'zod';
import { type AstroComponentFactory } from '../runtime/server/index.js';
import type { LiveDataCollectionResult, LiveDataEntryResult } from '../types/public/content.js';
import { type LIVE_CONTENT_TYPE } from './consts.js';
import { type DataEntry } from './data-store.js';
import { LiveCollectionCacheHintError, LiveCollectionError, LiveCollectionValidationError, LiveEntryNotFoundError } from './loaders/errors.js';
import type { LiveLoader } from './loaders/types.js';
import type { ContentLookupMap } from './utils.js';
export { LiveCollectionError, LiveCollectionCacheHintError, LiveEntryNotFoundError, LiveCollectionValidationError, };
type LazyImport = () => Promise<any>;
type GlobResult = Record<string, LazyImport>;
type CollectionToEntryMap = Record<string, GlobResult>;
type GetEntryImport = (collection: string, lookupId: string) => Promise<LazyImport>;
type LiveCollectionConfigMap = Record<string, {
    loader: LiveLoader;
    type: typeof LIVE_CONTENT_TYPE;
    schema?: z.ZodType;
}>;
export declare function createCollectionToGlobResultMap({ globResult, contentDir, }: {
    globResult: GlobResult;
    contentDir: string;
}): CollectionToEntryMap;
export declare function createGetCollection({ contentCollectionToEntryMap, dataCollectionToEntryMap, getRenderEntryImport, cacheEntriesByCollection, liveCollections, }: {
    contentCollectionToEntryMap: CollectionToEntryMap;
    dataCollectionToEntryMap: CollectionToEntryMap;
    getRenderEntryImport: GetEntryImport;
    cacheEntriesByCollection: Map<string, any[]>;
    liveCollections: LiveCollectionConfigMap;
}): (collection: string, filter?: ((entry: any) => unknown) | Record<string, unknown>) => Promise<any[]>;
export declare function createGetEntryBySlug({ getEntryImport, getRenderEntryImport, collectionNames, getEntry, }: {
    getEntryImport: GetEntryImport;
    getRenderEntryImport: GetEntryImport;
    collectionNames: Set<string>;
    getEntry: ReturnType<typeof createGetEntry>;
}): (collection: string, slug: string) => Promise<{
    id: any;
    slug: any;
    body: any;
    collection: any;
    data: any;
    render(): Promise<RenderResult>;
} | undefined>;
export declare function createGetDataEntryById({ getEntryImport, collectionNames, getEntry, }: {
    getEntryImport: GetEntryImport;
    collectionNames: Set<string>;
    getEntry: ReturnType<typeof createGetEntry>;
}): (collection: string, id: string) => Promise<ContentEntryResult | {
    id: any;
    collection: any;
    data: any;
} | undefined>;
type ContentEntryResult = {
    id: string;
    slug: string;
    body: string;
    collection: string;
    data: Record<string, any>;
    render(): Promise<RenderResult>;
};
type DataEntryResult = {
    id: string;
    collection: string;
    data: Record<string, any>;
};
type EntryLookupObject = {
    collection: string;
    id: string;
} | {
    collection: string;
    slug: string;
};
export declare function createGetEntry({ getEntryImport, getRenderEntryImport, collectionNames, liveCollections, }: {
    getEntryImport: GetEntryImport;
    getRenderEntryImport: GetEntryImport;
    collectionNames: Set<string>;
    liveCollections: LiveCollectionConfigMap;
}): (collectionOrLookupObject: string | EntryLookupObject, lookup?: string | Record<string, unknown>) => Promise<ContentEntryResult | DataEntryResult | undefined>;
export declare function createGetEntries(getEntry: ReturnType<typeof createGetEntry>): (entries: {
    collection: string;
    id: string;
}[] | {
    collection: string;
    slug: string;
}[]) => Promise<(ContentEntryResult | DataEntryResult | undefined)[]>;
export declare function createGetLiveCollection({ liveCollections, }: {
    liveCollections: LiveCollectionConfigMap;
}): (collection: string, filter?: Record<string, unknown>) => Promise<LiveDataCollectionResult>;
export declare function createGetLiveEntry({ liveCollections, }: {
    liveCollections: LiveCollectionConfigMap;
}): (collection: string, lookup: string | Record<string, unknown>) => Promise<LiveDataEntryResult>;
type RenderResult = {
    Content: AstroComponentFactory;
    headings: MarkdownHeading[];
    remarkPluginFrontmatter: Record<string, any>;
};
export declare function renderEntry(entry: DataEntry | {
    render: () => Promise<{
        Content: AstroComponentFactory;
    }>;
} | (DataEntry & {
    render: () => Promise<{
        Content: AstroComponentFactory;
    }>;
})): Promise<{
    Content: AstroComponentFactory;
}>;
export declare function createReference({ lookupMap }: {
    lookupMap: ContentLookupMap;
}): (collection: string) => z.ZodEffects<z.ZodUnion<[z.ZodString, z.ZodObject<{
    id: z.ZodString;
    collection: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    collection: string;
}, {
    id: string;
    collection: string;
}>, z.ZodObject<{
    slug: z.ZodString;
    collection: z.ZodString;
}, "strip", z.ZodTypeAny, {
    slug: string;
    collection: string;
}, {
    slug: string;
    collection: string;
}>]>, {
    id: string;
    collection: string;
} | {
    slug: string;
    collection: string;
} | undefined, string | {
    id: string;
    collection: string;
} | {
    slug: string;
    collection: string;
}>;
export declare function defineCollection(config: any): import("./config.js").CollectionConfig<import("./config.js").BaseSchema>;
export declare function defineLiveCollection(): void;
