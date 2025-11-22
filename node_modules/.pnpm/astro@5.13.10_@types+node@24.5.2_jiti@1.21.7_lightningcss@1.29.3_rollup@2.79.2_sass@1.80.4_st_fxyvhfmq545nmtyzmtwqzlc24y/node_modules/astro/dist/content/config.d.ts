import type { ZodLiteral, ZodNumber, ZodObject, ZodString, ZodType, ZodUnion } from 'zod';
import type { LiveLoader, Loader } from './loaders/types.js';
export type ImageFunction = () => ZodObject<{
    src: ZodString;
    width: ZodNumber;
    height: ZodNumber;
    format: ZodUnion<[
        ZodLiteral<'png'>,
        ZodLiteral<'jpg'>,
        ZodLiteral<'jpeg'>,
        ZodLiteral<'tiff'>,
        ZodLiteral<'webp'>,
        ZodLiteral<'gif'>,
        ZodLiteral<'svg'>,
        ZodLiteral<'avif'>
    ]>;
}>;
export interface DataEntry {
    id: string;
    data: Record<string, unknown>;
    filePath?: string;
    body?: string;
}
export interface DataStore {
    get: (key: string) => DataEntry;
    entries: () => Array<[id: string, DataEntry]>;
    set: (key: string, data: Record<string, unknown>, body?: string, filePath?: string) => void;
    values: () => Array<DataEntry>;
    keys: () => Array<string>;
    delete: (key: string) => void;
    clear: () => void;
    has: (key: string) => boolean;
}
export interface MetaStore {
    get: (key: string) => string | undefined;
    set: (key: string, value: string) => void;
    delete: (key: string) => void;
    has: (key: string) => boolean;
}
export type BaseSchema = ZodType;
export type SchemaContext = {
    image: ImageFunction;
};
type ContentLayerConfig<S extends BaseSchema, TData extends {
    id: string;
} = {
    id: string;
}> = {
    type?: 'content_layer';
    schema?: S | ((context: SchemaContext) => S);
    loader: Loader | (() => Array<TData> | Promise<Array<TData>> | Record<string, Omit<TData, 'id'> & {
        id?: string;
    }> | Promise<Record<string, Omit<TData, 'id'> & {
        id?: string;
    }>>);
};
type DataCollectionConfig<S extends BaseSchema> = {
    type: 'data';
    schema?: S | ((context: SchemaContext) => S);
};
type ContentCollectionConfig<S extends BaseSchema> = {
    type?: 'content';
    schema?: S | ((context: SchemaContext) => S);
    loader?: never;
};
export type LiveCollectionConfig<L extends LiveLoader, S extends BaseSchema | undefined = undefined> = {
    type?: 'live';
    schema?: S;
    loader: L;
};
export type CollectionConfig<S extends BaseSchema> = ContentCollectionConfig<S> | DataCollectionConfig<S> | ContentLayerConfig<S>;
export declare function defineLiveCollection<L extends LiveLoader, S extends BaseSchema | undefined = undefined>(config: LiveCollectionConfig<L, S>): LiveCollectionConfig<L, S>;
export declare function defineCollection<S extends BaseSchema>(config: CollectionConfig<S>): CollectionConfig<S>;
export {};
