/// <reference types="node" />
import { BinaryToTextEncoding, webcrypto } from "node:crypto";
/** Creates a deterministic hash for all inputs. */
export default function deterministicHash(input: unknown, algorithm?: Parameters<typeof webcrypto.subtle.digest>[0], output?: BinaryToTextEncoding): Promise<string>;
export declare function deterministicString(input: unknown): string;
