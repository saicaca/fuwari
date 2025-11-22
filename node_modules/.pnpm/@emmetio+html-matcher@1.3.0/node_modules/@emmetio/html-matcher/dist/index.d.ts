import { ScannerOptions } from './utils';
import scan from './scan';
import attributes, { AttributeToken } from './attributes';
export { scan, attributes, AttributeToken };
export { createOptions, ScannerOptions, ElementType, FastScanCallback } from './utils';
declare type TagRange = [number, number];
export interface MatchedTag {
    /** Name of matched tag */
    name: string;
    /** List of tag attributes */
    attributes: AttributeToken[];
    /** Range of opening tag */
    open: TagRange;
    /** Range of closing tag. If absent, tag is self-closing */
    close?: TagRange;
}
export interface BalancedTag {
    /** Name of balanced tag */
    name: string;
    /** Range of opening tag */
    open: TagRange;
    /** Range of closing tag. If absent, tag is self-closing */
    close?: TagRange;
}
/**
 * Finds matched tag for given `pos` location in XML/HTML `source`
 */
export default function match(source: string, pos: number, opt?: Partial<ScannerOptions>): MatchedTag | null;
/**
 * Returns balanced tag model: a list of all XML/HTML tags that could possibly match
 * given location when moving in outward direction
 */
export declare function balancedOutward(source: string, pos: number, opt?: Partial<ScannerOptions>): BalancedTag[];
/**
 * Returns balanced tag model: a list of all XML/HTML tags that could possibly match
 * given location when moving in inward direction
 */
export declare function balancedInward(source: string, pos: number, opt?: Partial<ScannerOptions>): BalancedTag[];
