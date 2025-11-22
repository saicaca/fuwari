import type { ZodError } from 'zod';
export declare class LiveCollectionError extends Error {
    readonly collection: string;
    readonly message: string;
    readonly cause?: Error | undefined;
    constructor(collection: string, message: string, cause?: Error | undefined);
    static is(error: unknown): error is LiveCollectionError;
}
export declare class LiveEntryNotFoundError extends LiveCollectionError {
    constructor(collection: string, entryFilter: string | Record<string, unknown>);
    static is(error: unknown): error is LiveEntryNotFoundError;
}
export declare class LiveCollectionValidationError extends LiveCollectionError {
    constructor(collection: string, entryId: string, error: ZodError);
    static is(error: unknown): error is LiveCollectionValidationError;
}
export declare class LiveCollectionCacheHintError extends LiveCollectionError {
    constructor(collection: string, entryId: string | undefined, error: ZodError);
    static is(error: unknown): error is LiveCollectionCacheHintError;
}
