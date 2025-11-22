import { CheerioElement, WrappedCheerioElement } from '../misc/cheerio.cjs';
import { SVG } from './index.cjs';
import 'domhandler';
import 'cheerio';
import '@iconify/types';
import '@iconify/utils/lib/customisations/defaults';

/**
 * Item in callback
 */
interface ParseSVGCallbackItem {
    tagName: string;
    element: CheerioElement;
    $element: WrappedCheerioElement;
    svg: SVG;
    parents: ParseSVGCallbackItem[];
    testChildren: boolean;
    removeNode: boolean;
}
/**
 * Callback function
 */
type ParseSVGCallback = (item: ParseSVGCallbackItem) => void;
/**
 * Parse SVG
 *
 * This function finds all elements in SVG and calls callback for each element.
 */
declare function parseSVG(svg: SVG, callback: ParseSVGCallback): void;

export { type ParseSVGCallback, type ParseSVGCallbackItem, parseSVG };
