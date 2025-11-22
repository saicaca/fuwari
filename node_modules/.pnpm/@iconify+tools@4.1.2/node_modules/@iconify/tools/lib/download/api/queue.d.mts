/**
 * Default parameters
 */
declare const defaultQueueParams: ConcurrentQueriesCommonParams<unknown>;
/**
 * Callback to get query
 */
type GetConcurrentQueryCallback<T> = (index: number) => Promise<T>;
/**
 * Parameters
 */
interface ConcurrentQueriesCommonParams<T> {
    limit?: number;
    retries?: number;
    onError?: (index: number, error: unknown, params: ConcurrentQueriesParams<T>) => void | Promise<void>;
    onSuccess?: (index: number, params: ConcurrentQueriesParams<T>, result: T) => void;
    onStart?: (index: number, params: ConcurrentQueriesParams<T>) => void;
}
interface ConcurrentQueriesParamsWithCount<T> extends ConcurrentQueriesCommonParams<T> {
    total: number;
    callback: (index: number) => Promise<T>;
}
interface ConcurrentQueriesParamsWithPromises<T> extends ConcurrentQueriesCommonParams<T> {
    promises: Promise<T>[];
}
type ConcurrentQueriesParams<T> = ConcurrentQueriesParamsWithCount<T> | ConcurrentQueriesParamsWithPromises<T>;
/**
 * Runs concurrent async operations
 */
declare function runConcurrentQueries<T>(params: ConcurrentQueriesParams<T>): Promise<T[]>;

export { type ConcurrentQueriesCommonParams, type ConcurrentQueriesParams, type ConcurrentQueriesParamsWithCount, type ConcurrentQueriesParamsWithPromises, type GetConcurrentQueryCallback, defaultQueueParams, runConcurrentQueries };
