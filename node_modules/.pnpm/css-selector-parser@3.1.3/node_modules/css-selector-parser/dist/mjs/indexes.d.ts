export interface MulticharIndex {
    [key: string]: MulticharIndexChar;
}
export interface MulticharIndexChar {
    chars: MulticharIndex;
    self?: string;
}
type RegularIndex = Record<string, boolean>;
export declare const emptyMulticharIndex: MulticharIndex;
export declare const emptyRegularIndex: RegularIndex;
export declare function createMulticharIndex(items: string[]): MulticharIndex;
export declare function createRegularIndex(items: string[]): RegularIndex;
export {};
