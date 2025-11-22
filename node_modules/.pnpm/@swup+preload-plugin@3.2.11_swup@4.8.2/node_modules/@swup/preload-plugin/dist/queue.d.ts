type QueueFunction = {
    (): void;
    __queued?: boolean;
};
export type Queue = {
    add: (fn: QueueFunction, highPriority?: boolean) => void;
    next: () => void;
};
export default function createQueue(limit?: number): Queue;
export {};
