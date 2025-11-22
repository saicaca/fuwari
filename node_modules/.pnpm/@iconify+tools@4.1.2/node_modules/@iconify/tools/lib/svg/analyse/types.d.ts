import { CheerioElement } from '../../misc/cheerio.js';
import 'domhandler';
import 'cheerio';

/**
 * Options
 */
interface AnalyseSVGStructureOptions {
    fixErrors?: boolean;
}
/**
 * Extended properties for element
 */
/**
 * Link to element
 */
interface LinkToElementWithID {
    id: string;
    usedAsMask: boolean;
    usedByIndex: number;
}
/**
 * How element is used by parent elements
 */
interface ExtendedTagElementUses {
    _usedAsMask: boolean;
    _usedAsPaint: boolean;
}
/**
 * Definition: mask, clip path, symbol, etc...
 */
interface ReusableElement {
    id: string;
    isMask: boolean;
    index: number;
}
/**
 * Element with id
 *
 * Similar to ReusableElement, but not necessary a definition - any element with id. Also contains list of child elements
 */
interface ElementWithID {
    id: string;
    isMask: boolean;
    indexes: Set<number>;
}
/**
 * Parent and child elements. Unlike standard tree, this tree is for elements that inherit attributes from parent element
 */
interface ExtendedTagElementRelations {
    _parentElement?: number;
    _childElements?: number[];
}
/**
 * Extended tag
 */
interface ExtendedTagElement extends CheerioElement, ExtendedTagElementUses, ExtendedTagElementRelations {
    _index: number;
    _id?: string;
    _belongsTo?: ElementWithID[];
    _reusableElement?: ReusableElement;
    _linksTo?: LinkToElementWithID[];
}
/**
 * Additional stuff for <svg>
 */
interface ExtendedRootTagElement extends ExtendedTagElement {
    _parsed?: boolean;
}
/**
 * Tree
 */
interface ElementsTreeItem {
    index: number;
    usedAsMask: boolean;
    parent?: ElementsTreeItem;
    children: ElementsTreeItem[];
}
/**
 * Elements map
 */
type ElementsMap = Map<number, ExtendedTagElement>;
/**
 * Result
 */
interface AnalyseSVGStructureResult {
    elements: ElementsMap;
    ids: Record<string, number>;
    links: LinkToElementWithID[];
    tree: ElementsTreeItem;
}

export type { AnalyseSVGStructureOptions, AnalyseSVGStructureResult, ElementWithID, ElementsMap, ElementsTreeItem, ExtendedRootTagElement, ExtendedTagElement, ExtendedTagElementUses, LinkToElementWithID };
