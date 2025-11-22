/// <reference types="node" />
import { SpawnOptions } from 'child_process';
export declare type Options = SpawnOptions & {
    async?: boolean;
    fatal?: boolean;
    silent?: boolean;
};
export declare type Callback = (status: number | null) => void;
export declare function parseCommand(command: string | string[]): [string, string[], boolean];
export declare function buildErrorMessage(command0: string, status: number | null): string;
