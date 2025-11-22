import Swup, { Location } from 'swup';
import type { Visit, VisitScroll } from 'swup';
import type { default as FragmentPlugin } from '../SwupFragmentPlugin.js';
import type { Route, Rule, FragmentVisit, FragmentElement } from './defs.js';
import type ParsedRule from './ParsedRule.js';
import Logger, { highlight } from './Logger.js';

import { __DEV__ } from './env.js';

/**
 * Handles a page view. Runs on `mount` as well as on every content:replace
 */
export const handlePageView = (fragmentPlugin: FragmentPlugin): void => {
	prepareFragmentElements(fragmentPlugin);
	handleLinksToFragments(fragmentPlugin);
	showDialogs(fragmentPlugin);
};

/**
 * Run `showModal` for all `<dialog[data-swup-fragment][open]>` elements
 * This puts them on the top layer and makes them ignore css transforms on parent elements
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Top_layer
 */
function showDialogs({ logger }: FragmentPlugin): void {
	document
		.querySelectorAll<HTMLDialogElement & FragmentElement>('dialog[data-swup-fragment][open]')
		.forEach((el) => {
			if (!el.__swupFragment) {
				if (__DEV__) logger?.warn(`fragment properties missing on element:`, el);
				return;
			}
			if (el.__swupFragment.modalShown) return;
			el.__swupFragment.modalShown = true;
			el.removeAttribute('open');
			/** don't assume showModal exists – otherwise unit tests will fail */
			el.showModal?.();
			el.addEventListener('keydown', (e) => e.key === 'Escape' && e.preventDefault());
		});
}

/**
 * Updates the `href` of links matching [data-swup-link-to-fragment="#my-fragment"]
 */
function handleLinksToFragments({ logger, swup }: FragmentPlugin): void {
	const targetAttribute = 'data-swup-link-to-fragment';
	const links = document.querySelectorAll<HTMLAnchorElement>(`a[${targetAttribute}]`);

	links.forEach((el) => {
		const selector = el.getAttribute(targetAttribute);
		if (!selector) {
			// prettier-ignore
			if (__DEV__) logger?.warn(`[${targetAttribute}] needs to contain a valid fragment selector`);
			return;
		}

		const fragment = queryFragmentElement(selector, swup);
		if (!fragment) {
			if (__DEV__) {
				logger?.log(
					// prettier-ignore
					`ignoring ${highlight(`[${targetAttribute}="${selector}"]`)} as ${highlight(selector)} is missing`
				);
			}
			return;
		}

		const fragmentUrl = fragment.__swupFragment?.url;
		if (!fragmentUrl) {
			if (__DEV__) logger?.warn(`no fragment infos found on ${selector}`);
			return;
		}

		// Help finding suspicious fragment urls
		if (isEqualUrl(fragmentUrl, swup.getCurrentUrl())) {
			// prettier-ignore
			if (__DEV__) logger?.warn(`The fragment URL of ${selector} is identical to the current URL. This could mean that [data-swup-fragment-url] needs to be provided by the server.`);
		}

		el.href = fragmentUrl;
	});
}

/**
 * Adds attributes and properties to fragment elements
 */
function prepareFragmentElements({ parsedRules, swup, logger }: FragmentPlugin): void {
	const currentUrl = swup.getCurrentUrl();

	parsedRules
		.filter((rule) => rule.matchesFrom(currentUrl) || rule.matchesTo(currentUrl))
		.forEach((rule) => {
			rule.containers.forEach((selector) => {
				const el = queryFragmentElement(`${selector}:not([data-swup-fragment])`, swup);

				// No element
				if (!el) return;

				// Parse a provided fragment URL
				const providedFragmentUrl = el.getAttribute('data-swup-fragment-url');
				if (providedFragmentUrl) {
					if (__DEV__) {
						// prettier-ignore
						logger?.log(`fragment url ${highlight(providedFragmentUrl)} for ${highlight(selector)} provided by server`);
					}
				}

				// Get the fragment URL
				const { url } = Location.fromUrl(providedFragmentUrl || currentUrl);

				// Mark the element as a fragment
				el.setAttribute('data-swup-fragment', '');

				// Augment the element with the necessary properties
				el.__swupFragment = { url, selector };
			});
		});
}

/**
 * Get all containers that should be replaced for a given visit's route.
 * Ignores containers that already match the current URL, if the visit can't be considered a reload.
 *
 * A visit is being considered a reload, if one of these conditions apply:
 * 	- `route.from` equal to `route.to`
 *  - all containers match the current url and swup is set to navigate on `linkToSelf`
 */
export const getFragmentVisitContainers = (
	route: Route,
	selectors: string[],
	swup: Swup,
	logger?: Logger
): string[] => {
	let fragments: { selector: string; el: FragmentElement }[] = selectors
		.map((selector) => {
			const el = document.querySelector<FragmentElement>(selector);

			if (!el) {
				if (__DEV__) logger?.log(`${highlight(selector)} missing in current document`);
				return false;
			}

			const fragmentElement = queryFragmentElement(selector, swup);

			if (!fragmentElement) {
				if (__DEV__) {
					// prettier-ignore
					logger?.error(`${highlight(selector)} is outside of swup's default containers`);
				}
				return false;
			}

			return {
				selector,
				el
			};
		})
		.filter((record): record is { selector: string; el: FragmentElement } => !!record);

	const isLinkToSelf = fragments.every((fragment) =>
		elementMatchesFragmentUrl(fragment.el, route.to)
	);

	const isReload =
		isEqualUrl(route.from, route.to) ||
		(isLinkToSelf && swup.options.linkToSelf === 'navigate');

	/**
	 * If this is NOT a reload, ignore fragments that already match `route.to`
	 */
	if (!isReload) {
		fragments = fragments.filter((fragment) => {
			if (elementMatchesFragmentUrl(fragment.el, route.to)) {
				if (__DEV__) {
					// prettier-ignore
					logger?.log(`ignoring fragment ${highlight(fragment.selector)} as it already matches the current URL`);
				}
				return false;
			}
			return true;
		});
	}

	return fragments.map((fragment) => fragment.selector);
};

/**
 * Checks if an element's fragment url matches a given URL
 */
export const elementMatchesFragmentUrl = (el: FragmentElement, url: string): boolean => {
	const fragmentUrl = el.__swupFragment?.url;
	if (!fragmentUrl) return false;
	return isEqualUrl(fragmentUrl, url);
};

/**
 * Checks if two URLs should be considered equal:
 *
 * - ignores trailing slashes
 * - ignores query string order
 *
 * Example: /test?foo=bar&baz=boo === /test/?baz=boo&foo=bar
 */
const isEqualUrl = (url1: string, url2: string) => {
	return normalizeUrl(url1) === normalizeUrl(url2);
};

/**
 * Normalize a URL
 *
 * - removes the trailing slash
 * - sorts query params
 */
export const normalizeUrl = (url: string) => {
	if (!url.trim()) return url;

	const removeTrailingSlash = (str: string) => str.replace(/\/+$/g, '');

	const location = Location.fromUrl(url);
	location.searchParams.sort();

	return removeTrailingSlash(location.pathname) + location.search;
};

/**
 * Removes all fragment traces from all fragment elements
 */
export const cleanupFragmentElements = () => {
	document.querySelectorAll<FragmentElement>('[data-swup-fragment]').forEach((el) => {
		el.removeAttribute('data-swup-fragment-url');
		delete el.__swupFragment;
	});
};

/**
 * Get the route from a given visit
 */
export const getRoute = (visit: Visit): Route | undefined => {
	const from = visit.from.url;
	const to = visit.to.url;
	if (!from || !to) return;
	return { from, to };
};

/**
 * Adds or removes a rule's name class from all current fragment elements
 */
export const toggleFragmentVisitClass = (
	fragmentVisit: FragmentVisit | undefined,
	toggle: boolean
): void => {
	if (!fragmentVisit?.name) return;

	const { name, containers } = fragmentVisit;

	containers.forEach((selector) => {
		document.querySelector(selector)?.classList.toggle(`to-${name}`, toggle);
	});
};

/**
 * Get the first matching rule for a given route
 */
export const getFirstMatchingRule = (
	route: Route,
	rules: ParsedRule[],
	visit: Visit
): ParsedRule | undefined => {
	return rules.find((rule) => rule.matches(route, visit));
};

/**
 * Makes sure unchanged fragment elements land in the cache of the current page
 */
export const cacheForeignFragmentElements = ({ swup, logger }: FragmentPlugin): void => {
	const currentUrl = swup.getCurrentUrl();
	const cache = swup.cache;

	// Get the cache entry for the current URL
	const currentCache = cache.get(currentUrl);
	if (!currentCache) return;
	const currentCachedDocument = new DOMParser().parseFromString(currentCache.html, 'text/html');

	// debug info
	const updatedFragments: FragmentElement[] = [];

	/**
	 * We only want to handle fragment elements that
	 *  - are not templates
	 *  - don't fit the current URL
	 */
	const foreignFragmentElements = Array.from(
		document.querySelectorAll<FragmentElement>('[data-swup-fragment]')
	).filter((el) => {
		if (el.matches('template')) return false;
		if (elementMatchesFragmentUrl(el, currentUrl)) return false;
		return true;
	});

	// Bail early if there are no foreign fragment elements
	if (!foreignFragmentElements.length) return;

	if (!swup.options.cache) {
		if (__DEV__) logger?.warn(`can't cache foreign fragment elements without swup's cache`);
		return;
	}

	foreignFragmentElements.forEach((el) => {
		// Don't cache the fragment if it contains fragment elements
		const containsFragments = el.querySelector('[data-swup-fragment]') != null;
		if (containsFragments) return;

		const fragmentUrl = el.__swupFragment?.url;
		if (!fragmentUrl) {
			if (__DEV__) logger?.warn(`no fragment url found:`, el);
			return;
		}

		const fragmentSelector = el.__swupFragment?.selector;
		if (!fragmentSelector) {
			if (__DEV__) logger?.warn(`no fragment selector found:`, el);
			return;
		}

		// Get the cache entry for the fragment URL, bail early if it doesn't exist
		const fragmentCache = cache.get(fragmentUrl);
		if (!fragmentCache) return;

		// Check if the fragment exists in the current cached document
		const currentFragment = currentCachedDocument.querySelector(fragmentSelector);
		if (!currentFragment) return;

		// Get a fresh copy of the fragment from it's original cache
		const unchangedFragment = new DOMParser()
			.parseFromString(fragmentCache.html, 'text/html')
			.querySelector(fragmentSelector);
		if (!unchangedFragment) return;

		// Make sure the dynamic fragment url makes it to the cache
		unchangedFragment.setAttribute('data-swup-fragment-url', fragmentUrl);

		// Replace the current fragment with the unchanged fragment
		currentFragment.replaceWith(unchangedFragment);

		// For debugging
		updatedFragments.push(el);
	});

	if (!updatedFragments.length) return;

	// Update the cache of the current page with the updated html
	cache.update(currentUrl, {
		fragmentHtml: currentCachedDocument.documentElement.outerHTML
	});

	updatedFragments.forEach((el) => {
		const url = el.__swupFragment?.url || '';
		const selector = el.__swupFragment?.selector || '';
		// prettier-ignore
		if (__DEV__) logger?.log(`updated cache with ${highlight(selector)} from ${highlight(url)}`);
	});
};

/**
 * Skips the animation if all current containers are <template> elements
 */
export function shouldSkipAnimation(fragmentVisit?: FragmentVisit): boolean {
	if (!fragmentVisit) return false;

	return fragmentVisit.containers.every((selector) => {
		return (
			document.querySelector<FragmentElement>(selector)?.tagName?.toLowerCase() === 'template'
		);
	});
}

/**
 * Remove duplicates from an array
 */
export function dedupe<T>(arr: Array<T>): Array<T> {
	return [...new Set<T>(arr)];
}

/**
 * Adjusts visit.scroll based on given fragment visit
 */
export function adjustVisitScroll(fragmentVisit: FragmentVisit, scroll: VisitScroll): VisitScroll {
	if (typeof fragmentVisit.scroll === 'boolean') {
		return { ...scroll, reset: fragmentVisit.scroll };
	}
	if (typeof fragmentVisit.scroll === 'string' && !scroll.target) {
		return { ...scroll, target: fragmentVisit.scroll };
	}
	return scroll;
}

/**
 * Queries a fragment element. Needs to be either:
 *
 * - one of swup's default containers
 * - inside of one of swup's default containers
 */
export function queryFragmentElement(
	fragmentSelector: string,
	swup: Swup
): FragmentElement | undefined {
	for (const containerSelector of swup.options.containers) {
		const container = document.querySelector(containerSelector);
		if (container?.matches(fragmentSelector)) return container as FragmentElement;

		const fragment = container?.querySelector<FragmentElement>(fragmentSelector);
		if (fragment) return fragment;
	}
	return;
}

/**
 * Clone fragment rules (replacement for `structuredClone`)
 */
export function cloneRules(rules: Rule[]): Rule[] {
	if (!Array.isArray(rules)) throw new Error(`cloneRules() expects an array of rules`);

	return rules.map((rule) => ({
		...rule,
		from: Array.isArray(rule.from) ? [...rule.from] : rule.from,
		to: Array.isArray(rule.to) ? [...rule.to] : rule.to,
		containers: [...rule.containers]
	}));
}

/**
 * Create a visit object for tests
 */
export function stubVisit(options: { from?: string; to: string }) {
	const swup = new Swup();
	// @ts-expect-error swup.createVisit is protected
	return swup.createVisit(options);
}
