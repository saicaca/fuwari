import { IconifyInfo, IconifyJSON } from '@iconify/types';
import { IconifyIconCustomisations } from '@iconify/utils/lib/customisations/defaults';
import { IconSetIconEntry, IconCategory, IconSetIconType, IconSetAsyncForEachCallback, IconSetSyncForEachCallback, ResolvedIconifyIcon, CommonIconProps, CheckThemeResult } from './types.cjs';
import { SVG } from '../svg/index.cjs';
import { ParentIconsTree } from '@iconify/utils/lib/icon-set/tree';
import 'cheerio';

/**
 * Sort theme keys: long keys first
 *
 * Applies changes to parameter, but also returns it
 */
declare function sortThemeKeys(keys: string[]): string[];
/**
 * Export icon set
 */
declare class IconSet {
    /**
     * Properties. You can write directly to almost any property, but avoid writing to
     * 'entries' and 'categories' properties, there are functions for that.
     */
    prefix: string;
    lastModified: number;
    entries: Record<string, IconSetIconEntry>;
    info: IconifyInfo | undefined;
    categories: Set<IconCategory>;
    prefixes: Record<string, string>;
    suffixes: Record<string, string>;
    /**
     * Load icon set
     */
    constructor(data: IconifyJSON);
    /**
     * Load icon set
     */
    load(data: IconifyJSON): void;
    /**
     * Update last modification time
     */
    updateLastModified(value?: number): void;
    /**
     * List icons
     */
    list(types?: IconSetIconType[]): string[];
    /**
     * forEach function to loop through all entries.
     * Supports asynchronous callbacks.
     *
     * Callback should return false to stop loop.
     */
    forEach(callback: IconSetAsyncForEachCallback, types?: IconSetIconType[]): Promise<void>;
    /**
     * Synchronous version of forEach function to loop through all entries.
     *
     * Callback should return false to stop loop.
     */
    forEachSync(callback: IconSetSyncForEachCallback, types?: IconSetIconType[]): void;
    /**
     * Get parent icons tree
     *
     * Returns parent icons list for each icon, null if failed to resolve.
     * In parent icons list, first element is a direct parent, last is icon. Does not include item.
     *
     * Examples:
     *   'alias3': ['alias2', 'alias1', 'icon']
     * 	 'icon': []
     * 	 'bad-icon': null
     */
    getTree(names?: string[]): ParentIconsTree;
    /**
     * Resolve icon
     */
    resolve(name: string, full: false): ResolvedIconifyIcon | null;
    resolve(name: string): ResolvedIconifyIcon | null;
    resolve(name: string, full: true): Required<ResolvedIconifyIcon> | null;
    /**
     * Generate HTML
     */
    toString(name: string, customisations?: IconifyIconCustomisations): string | null;
    /**
     * Get SVG instance for icon
     */
    toSVG(name: string): SVG | null;
    /**
     * Export icon set
     */
    export(validate?: boolean): IconifyJSON;
    /**
     * Get characters map
     */
    chars(names?: string[]): Record<string, string>;
    /**
     * Filter icons
     */
    _filter(callback: (name: string, item: IconSetIconEntry, icon?: ResolvedIconifyIcon) => boolean): string[];
    /**
     * Count icons
     */
    count(): number;
    /**
     * Find category by title
     */
    findCategory(title: string, add: boolean): IconCategory | null;
    /**
     * Count icons in category, remove category if empty
     *
     * Hidden icons and aliases do not count
     */
    listCategory(category: IconCategory | string): string[] | null;
    /**
     * Check if icon exists
     */
    exists(name: string): boolean;
    /**
     * Remove icons. Returns number of removed icons
     *
     * If removeDependencies is a string, it represents new parent for all aliases of removed icon. New parent cannot be alias or variation.
     */
    remove(name: string, removeDependencies?: boolean | string): number;
    /**
     * Rename icon
     */
    rename(oldName: string, newName: string): boolean;
    /**
     * Add/update item
     */
    setItem(name: string, item: IconSetIconEntry): boolean;
    /**
     * Add/update icon
     */
    setIcon(name: string, icon: ResolvedIconifyIcon): boolean;
    /**
     * Add/update alias without props
     */
    setAlias(name: string, parent: string): boolean;
    /**
     * Add/update alias with props
     */
    setVariation(name: string, parent: string, props: CommonIconProps): boolean;
    /**
     * Icon from SVG. Updates old icon if it exists
     */
    fromSVG(name: string, svg: SVG): boolean;
    /**
     * Add or remove character for icon
     */
    toggleCharacter(iconName: string, char: string, add: boolean): boolean;
    /**
     * Add or remove category for icon
     */
    toggleCategory(iconName: string, category: string, add: boolean): boolean;
    /**
     * Find icons that belong to theme
     */
    checkTheme(prefix: boolean): CheckThemeResult;
}
/**
 * Create blank icon set
 */
declare function blankIconSet(prefix: string): IconSet;

export { IconSet, blankIconSet, sortThemeKeys };
