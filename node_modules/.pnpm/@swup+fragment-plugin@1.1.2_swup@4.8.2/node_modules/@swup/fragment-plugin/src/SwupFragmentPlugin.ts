import PluginBase from '@swup/plugin';
import ParsedRule from './inc/ParsedRule.js';
import Logger from './inc/Logger.js';
import {
	handlePageView,
	cleanupFragmentElements,
	getFirstMatchingRule,
	getFragmentVisitContainers,
	cloneRules
} from './inc/functions.js';
import type { Options, Rule, Route, FragmentVisit } from './inc/defs.js';
import * as handlers from './inc/handlers.js';
import { __DEV__ } from './inc/env.js';
import type { Visit } from 'swup';

type RequireKeys<T, K extends keyof T> = Partial<T> & Pick<T, K>;
type InitOptions = RequireKeys<Options, 'rules'>;

/**
 * The main plugin class
 */
export default class SwupFragmentPlugin extends PluginBase {
	readonly name = 'SwupFragmentPlugin';
	readonly requires = { swup: '>=4.6' };

	protected _rawRules: Rule[] = [];
	protected _parsedRules: ParsedRule[] = [];

	get parsedRules() {
		return this._parsedRules;
	}

	options: Options;

	protected defaults: Options = {
		rules: [],
		debug: false
	};

	logger?: Logger;

	/**
	 * Plugin Constructor
	 * The options are NOT optional and need to contain at least a `rules` property
	 */
	constructor(options: InitOptions) {
		super();
		this.options = { ...this.defaults, ...options };
	}

	/**
	 * Runs when the plugin is being mounted
	 */
	mount() {
		const swup = this.swup;

		this.setRules(this.options.rules);
		if (__DEV__) {
			if (this.options.debug) this.logger = new Logger();
		}

		this.before('link:self', handlers.onLinkToSelf);
		this.on('visit:start', handlers.onVisitStart);
		this.before('animation:out:await', handlers.maybeSkipOutAnimation);
		this.before('animation:in:await', handlers.maybeSkipInAnimation);
		this.before('content:replace', handlers.beforeContentReplace);
		this.on('content:replace', handlers.onContentReplace);
		this.on('visit:end', handlers.onVisitEnd);

		if (__DEV__) {
			this.logger?.warnIf(
				!swup.options.cache,
				`fragment caching will only work with swup's cache being active`
			);
		}

		handlePageView(this);
	}

	/**
	 * Runs when the plugin is being unmounted
	 */
	unmount() {
		super.unmount();
		cleanupFragmentElements();
	}

	/**
	 * Set completely new rules
	 *
	 * @access public
	 */
	setRules(rules: Rule[]) {
		this._rawRules = cloneRules(rules);
		this._parsedRules = rules.map((rule) => this.parseRule(rule));
		if (__DEV__) this.logger?.log('Updated fragment rules', this.getRules());
	}

	/**
	 * Get a clone of the current rules
	 *
	 * @access public
	 */
	getRules() {
		return cloneRules(this._rawRules);
	}

	/**
	 * Prepend a rule to the existing rules
	 *
	 * @access public
	 */
	prependRule(rule: Rule) {
		this.setRules([rule, ...this.getRules()]);
	}

	/**
	 * Append a rule to the existing rules
	 *
	 * @access public
	 */
	appendRule(rule: Rule) {
		this.setRules([...this.getRules(), rule]);
	}

	/**
	 * Parse a rule (for e.g. debugging)
	 *
	 * @access public
	 */
	parseRule(rule: Rule): ParsedRule {
		return new ParsedRule({
			...rule,
			logger: this.logger,
			swup: this.swup
		});
	}

	/**
	 * Get the fragment visit object for a given route
	 *
	 * @access public
	 */
	getFragmentVisit(route: Route, visit?: Visit): FragmentVisit | undefined {
		const rule = getFirstMatchingRule(
			route,
			this.parsedRules,
			// @ts-expect-error createVisit is protected
			visit || this.swup.createVisit(route)
		);

		// Bail early if no rule matched
		if (!rule) return;

		// Get containers that should be replaced for this visit
		const containers = getFragmentVisitContainers(
			route,
			rule.containers,
			this.swup,
			this.logger
		);

		/** Bail early if there are no fragment elements found for this visit */
		if (!containers.length) {
			return;
		}

		// Pick properties from the current rule that should be projected into the fragmentVisit object
		const { name, scroll, focus } = rule;

		const fragmentVisit: FragmentVisit = {
			containers,
			name,
			scroll,
			focus
		};

		return fragmentVisit;
	}
}
