import type { AttributeNode, Point } from '@astrojs/compiler';
import { Position as LSPPosition } from '@volar/language-server';
/**
 * Transform a Point from the Astro compiler to an LSP Position
 */
export declare function PointToPosition(point: Point): LSPPosition;
type WithRequired<T, K extends keyof T> = T & {
    [P in K]-?: T[P];
};
export type AttributeNodeWithPosition = WithRequired<AttributeNode, 'position'>;
export {};
