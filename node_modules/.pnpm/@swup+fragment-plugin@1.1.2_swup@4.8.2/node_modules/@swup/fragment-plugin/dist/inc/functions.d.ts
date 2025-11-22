import Swup from 'swup';
import type { Visit, VisitScroll } from 'swup';
import type { default as FragmentPlugin } from '../SwupFragmentPlugin.js';
import type { Route, Rule, FragmentVisit, FragmentElement } from './defs.js';
import type ParsedRule from './ParsedRule.js';
import Logger from './Logger.js';
/**
 * Handles a page view. Runs on `mount` as well as on every content:replace
 */
export declare const handlePageView: (fragmentPlugin: FragmentPlugin) => void;
/**
 * Get all containers that should be replaced for a given visit's route.
 * Ignores containers that already match the current URL, if the visit can't be considered a reload.
 *
 * A visit is being considered a reload, if one of these conditions apply:
 * 	- `route.from` equal to `route.to`
 *  - all containers match the current url and swup is set to navigate on `linkToSelf`
 */
export declare const getFragmentVisitContainers: (route: Route, selectors: string[], swup: Swup, logger?: Logger) => string[];
/**
 * Checks if an element's fragment url matches a given URL
 */
export declare const elementMatchesFragmentUrl: (el: FragmentElement, url: string) => boolean;
/**
 * Normalize a URL
 *
 * - removes the trailing slash
 * - sorts query params
 */
export declare const normalizeUrl: (url: string) => string;
/**
 * Removes all fragment traces from all fragment elements
 */
export declare const cleanupFragmentElements: () => void;
/**
 * Get the route from a given visit
 */
export declare const getRoute: (visit: Visit) => Route | undefined;
/**
 * Adds or removes a rule's name class from all current fragment elements
 */
export declare const toggleFragmentVisitClass: (fragmentVisit: FragmentVisit | undefined, toggle: boolean) => void;
/**
 * Get the first matching rule for a given route
 */
export declare const getFirstMatchingRule: (route: Route, rules: ParsedRule[], visit: Visit) => ParsedRule | undefined;
/**
 * Makes sure unchanged fragment elements land in the cache of the current page
 */
export declare const cacheForeignFragmentElements: ({ swup, logger }: FragmentPlugin) => void;
/**
 * Skips the animation if all current containers are <template> elements
 */
export declare function shouldSkipAnimation(fragmentVisit?: FragmentVisit): boolean;
/**
 * Remove duplicates from an array
 */
export declare function dedupe<T>(arr: Array<T>): Array<T>;
/**
 * Adjusts visit.scroll based on given fragment visit
 */
export declare function adjustVisitScroll(fragmentVisit: FragmentVisit, scroll: VisitScroll): VisitScroll;
/**
 * Queries a fragment element. Needs to be either:
 *
 * - one of swup's default containers
 * - inside of one of swup's default containers
 */
export declare function queryFragmentElement(fragmentSelector: string, swup: Swup): FragmentElement | undefined;
/**
 * Clone fragment rules (replacement for `structuredClone`)
 */
export declare function cloneRules(rules: Rule[]): Rule[];
/**
 * Create a visit object for tests
 */
export declare function stubVisit(options: {
    from?: string;
    to: string;
}): Visit;
//# sourceMappingURL=functions.d.ts.map