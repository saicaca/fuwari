export interface HistoryState {
    url: string;
    source: 'swup';
    random: number;
    index?: number;
    [key: string]: unknown;
}
type HistoryData = Record<string, unknown>;
/** Create a new history record with a custom swup identifier. */
export declare const createHistoryRecord: (url: string, data?: HistoryData) => void;
/** Update the current history record with a custom swup identifier. */
export declare const updateHistoryRecord: (url?: string | null, data?: HistoryData) => void;
export {};
//# sourceMappingURL=history.d.ts.map