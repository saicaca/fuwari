import type { Schema } from '../../schema/Schema.js';
import { Pair } from '../../nodes/Pair.js';
import { Scalar } from '../../nodes/Scalar.js';
import { ToJSContext } from '../../nodes/toJS.js';
import { YAMLMap } from '../../nodes/YAMLMap.js';
import type { StringifyContext } from '../../stringify/stringify.js';
import type { CollectionTag } from '../types.js';
export declare class YAMLSet<T = unknown> extends YAMLMap<T, Scalar<null> | null> {
    static tag: string;
    constructor(schema?: Schema);
    add(key: T | Pair<T, Scalar<null> | null> | {
        key: T;
        value: Scalar<null> | null;
    }): void;
    /**
     * If `keepPair` is `true`, returns the Pair matching `key`.
     * Otherwise, returns the value of that Pair's key.
     */
    get(key: unknown, keepPair?: boolean): any;
    set(key: T, value: boolean): void;
    /** @deprecated Will throw; `value` must be boolean */
    set(key: T, value: null): void;
    toJSON(_?: unknown, ctx?: ToJSContext): any;
    toString(ctx?: StringifyContext, onComment?: () => void, onChompKeep?: () => void): string;
}
export declare const set: CollectionTag;
