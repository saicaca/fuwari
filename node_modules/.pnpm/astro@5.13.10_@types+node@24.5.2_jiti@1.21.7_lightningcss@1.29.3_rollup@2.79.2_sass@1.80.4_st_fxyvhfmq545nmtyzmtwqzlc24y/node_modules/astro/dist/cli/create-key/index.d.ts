import { type Flags } from '../flags.js';
interface CreateKeyOptions {
    flags: Flags;
}
export declare function createKey({ flags }: CreateKeyOptions): Promise<0 | 1>;
export {};
