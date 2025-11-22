import { matchPath, classify, Location } from 'swup';
import type { Swup, Path, Visit } from 'swup';
import type { Route, Rule, Predicate } from './defs.js';
import { dedupe, queryFragmentElement } from './functions.js';
import Logger, { highlight } from './Logger.js';
import { __DEV__ } from './env.js';

type Options = Rule & {
	swup: Swup;
	logger?: Logger;
};

/**
 * Represents a Rule
 */
export default class ParsedRule {
	readonly matchesFrom: ReturnType<typeof matchPath>;
	readonly matchesTo: ReturnType<typeof matchPath>;

	swup: Swup;
	from: Path;
	to: Path;
	containers: string[];
	name?: string;
	scroll: boolean | string = false;
	focus?: boolean | string;
	logger?: Logger;
	if: Predicate = () => true;

	constructor(options: Options) {
		this.swup = options.swup;
		this.logger = options.logger;
		this.from = options.from || '';
		this.to = options.to || '';

		if (options.name) this.name = classify(options.name);
		if (typeof options.scroll !== 'undefined') this.scroll = options.scroll;
		if (typeof options.focus !== 'undefined') this.focus = options.focus;
		if (typeof options.if === 'function') this.if = options.if;

		this.containers = this.parseContainers(options.containers);

		if (__DEV__) {
			this.logger?.errorIf(!this.to, `Every fragment rule must contain a 'to' path`, this);
			this.logger?.errorIf(!this.from, `Every fragment rule must contain a 'from' path`, this); // prettier-ignore
		}

		this.matchesFrom = matchPath(this.from);
		this.matchesTo = matchPath(this.to);
	}

	/**
	 * Parse provided fragment containers
	 */
	parseContainers(rawContainers: string[]): string[] {
		if (!Array.isArray(rawContainers) || !rawContainers.length) {
			// prettier-ignore
			if (__DEV__) this.logger?.error(`Every fragment rule must contain an array of containers`, this.getDebugInfo());
			return [];
		}
		// trim selectors
		const containers = dedupe(rawContainers.map((selector) => selector.trim()));
		return containers.filter((selector) => {
			const result = this.validateSelector(selector);
			this.logger?.errorIf(result instanceof Error, result);
			return result === true;
		});
	}

	/**
	 * Validate a fragment selector
	 *
	 * - only IDs are allowed
	 * - no nested selectors
	 */
	validateSelector(selector: string): true | Error {
		if (!selector.startsWith('#')) {
			return new Error(`fragment selectors must be IDs: ${selector}`);
		}

		if (selector.match(/\s|>/)) {
			return new Error(`fragment selectors must not be nested: ${selector}`);
		}
		return true;
	}

	/**
	 * Get debug info for logging
	 */
	getDebugInfo() {
		const { from, to, containers } = this;
		return {
			from: String(from),
			to: String(to),
			containers: String(containers)
		};
	}

	/**
	 * Checks if a given route matches this rule
	 */
	public matches(route: Route, visit: Visit): boolean {
		if (!this.if(visit)) {
			if (__DEV__) {
				this.logger?.log(`ignoring fragment rule due to custom rule.if:`, this);
			}
			return false;
		}

		const { url: fromUrl } = Location.fromUrl(route.from);
		const { url: toUrl } = Location.fromUrl(route.to);

		const matchesRoute = !!this.matchesFrom(fromUrl) && !!this.matchesTo(toUrl);
		if (!matchesRoute) return false;

		for (const selector of this.containers) {
			const result = this.validateFragmentSelectorForMatch(selector);
			if (result instanceof Error) {
				if (__DEV__) this.logger?.error(result, this.getDebugInfo());
				return false;
			}
		}

		return true;
	}

	/**
	 * Validates a fragment element at runtime when this rule's route matches
	 */
	validateFragmentSelectorForMatch(selector: string): true | Error {
		if (!document.querySelector(selector)) {
			// prettier-ignore
			return new Error(`skipping rule since ${highlight(selector)} doesn't exist in the current document`);
		}
		if (!queryFragmentElement(selector, this.swup)) {
			// prettier-ignore
			return new Error(`skipping rule since ${highlight(selector)} is outside of swup's default containers`);
		}
		return true;
	}
}
